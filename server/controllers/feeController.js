import Fee from '../models/Fee.js';
import FeeStructure from '../models/FeeStructure.js';
import Student from '../models/Student.js';
import Teacher from '../models/Teacher.js';
import Accountant from '../models/Accountant.js';

// ==================== FEE MANAGEMENT ====================

// Get all fees with filtering
export const getAllFees = async (req, res) => {
  try {
    const { entityType, status, academicYear, page = 1, limit = 20 } = req.query;
    let query = {};

    if (entityType) query.entityType = entityType;
    if (status) query.status = status;
    if (academicYear) query.academicYear = academicYear;

    const skip = (page - 1) * limit;
    
    const fees = await Fee.find(query)
      .populate('entityId', 'name studentId teacherId accountantId')
      .skip(skip)
      .limit(parseInt(limit))
      .sort({ createdAt: -1 });

    const total = await Fee.countDocuments(query);

    res.json({
      fees,
      total,
      page: parseInt(page),
      pages: Math.ceil(total / limit)
    });
  } catch (error) {
    res.status(500).json({ message: error.message });
  }
};

// Get fees for a specific entity
export const getEntityFees = async (req, res) => {
  try {
    const { entityId, entityType } = req.params;
    const { status, academicYear } = req.query;

    let query = { entityId, entityType };
    if (status) query.status = status;
    if (academicYear) query.academicYear = academicYear;

    const fees = await Fee.find(query)
      .populate('entityId', 'name studentId teacherId accountantId')
      .sort({ dueDate: 1 });

    res.json(fees);
  } catch (error) {
    res.status(500).json({ message: error.message });
  }
};

// Get fees for logged-in user (students, teachers, staff)
export const getMyFees = async (req, res) => {
  try {
    const userId = req.user.id;
    const { status, academicYear } = req.query;

    // Determine entity type and ID based on user role
    let query = {};
    const role = req.user.role;

    if (role === 'student') {
      const student = await Student.findOne({ userId });
      if (!student) return res.status(404).json({ message: 'Student profile not found' });
      query = { entityId: student._id, entityType: 'student' };
    } else if (role === 'teacher') {
      const teacher = await Teacher.findOne({ userId });
      if (!teacher) return res.status(404).json({ message: 'Teacher profile not found' });
      query = { entityId: teacher._id, entityType: 'teacher' };
    } else if (role === 'staff') {
      const accountant = await Accountant.findOne({ userId });
      if (!accountant) return res.status(404).json({ message: 'Staff profile not found' });
      query = { entityId: accountant._id, entityType: 'accountant' };
    }

    if (status) query.status = status;
    if (academicYear) query.academicYear = academicYear;

    const fees = await Fee.find(query).sort({ dueDate: 1 });
    res.json(fees);
  } catch (error) {
    res.status(500).json({ message: error.message });
  }
};

// Create fee for entity
export const createFee = async (req, res) => {
  try {
    const {
      entityId,
      entityType,
      feeType,
      amount,
      dueDate,
      paymentDeadline,
      academicYear,
      feeDescription,
      remarks
    } = req.body;

    const fee = new Fee({
      entityId,
      entityType,
      feeType,
      amount,
      dueDate,
      paymentDeadline,
      academicYear,
      feeDescription,
      remarks,
      issuedBy: req.user.id,
      appliedBy: req.user.id,
      status: 'pending'
    });

    await fee.save();
    await fee.populate('entityId', 'name');

    res.status(201).json({
      message: 'Fee created successfully',
      fee
    });
  } catch (error) {
    res.status(500).json({ message: error.message });
  }
};

// Bulk create fees from structure
export const bulkCreateFeesFromStructure = async (req, res) => {
  try {
    const { feeStructureId, entityIds, academicYear } = req.body;

    const structure = await FeeStructure.findById(feeStructureId);
    if (!structure) {
      return res.status(404).json({ message: 'Fee structure not found' });
    }

    const fees = [];
    for (const entityId of entityIds) {
      const fee = new Fee({
        entityId,
        entityType: structure.entityType,
        feeType: structure.feeType,
        amount: structure.amount,
        dueDate: structure.applicableTo,
        paymentDeadline: new Date(Date.now() + 30 * 24 * 60 * 60 * 1000), // 30 days from now
        academicYear,
        feeDescription: structure.feeName,
        remarks: structure.description,
        issuedBy: req.user.id,
        appliedBy: req.user.id,
        status: 'pending'
      });
      fees.push(fee);
    }

    await Fee.insertMany(fees);

    res.status(201).json({
      message: `${fees.length} fees created successfully`,
      count: fees.length
    });
  } catch (error) {
    res.status(500).json({ message: error.message });
  }
};

// Update fee
export const updateFee = async (req, res) => {
  try {
    const { id } = req.params;
    const updateData = req.body;

    const fee = await Fee.findByIdAndUpdate(
      id,
      { ...updateData, lastModifiedBy: req.user.id, updatedAt: Date.now() },
      { new: true }
    ).populate('entityId', 'name');

    if (!fee) {
      return res.status(404).json({ message: 'Fee not found' });
    }

    res.json({
      message: 'Fee updated successfully',
      fee
    });
  } catch (error) {
    res.status(500).json({ message: error.message });
  }
};

// Record payment
export const recordPayment = async (req, res) => {
  try {
    const { feeId, amountPaid, paymentMethod, transactionId, paymentReference } = req.body;

    const fee = await Fee.findById(feeId);
    if (!fee) {
      return res.status(404).json({ message: 'Fee not found' });
    }

    const paidAmount = amountPaid || fee.amount;

    if (paidAmount >= fee.amount) {
      fee.status = 'paid';
      fee.paidDate = Date.now();
    } else {
      fee.status = 'partially_paid';
      fee.amount -= paidAmount;
    }

    fee.paymentMethod = paymentMethod;
    fee.transactionId = transactionId;
    fee.paymentReference = paymentReference;
    fee.paidAt = Date.now();

    await fee.save();

    res.json({
      message: 'Payment recorded successfully',
      fee
    });
  } catch (error) {
    res.status(500).json({ message: error.message });
  }
};

// Delete fee
export const deleteFee = async (req, res) => {
  try {
    const { id } = req.params;

    const fee = await Fee.findByIdAndDelete(id);
    if (!fee) {
      return res.status(404).json({ message: 'Fee not found' });
    }

    res.json({
      message: 'Fee deleted successfully'
    });
  } catch (error) {
    res.status(500).json({ message: error.message });
  }
};

// Waive fee
export const waiveFee = async (req, res) => {
  try {
    const { id } = req.params;
    const { reason } = req.body;

    const fee = await Fee.findByIdAndUpdate(
      id,
      {
        status: 'waived',
        remarks: reason || 'Fee waived',
        lastModifiedBy: req.user.id
      },
      { new: true }
    );

    if (!fee) {
      return res.status(404).json({ message: 'Fee not found' });
    }

    res.json({
      message: 'Fee waived successfully',
      fee
    });
  } catch (error) {
    res.status(500).json({ message: error.message });
  }
};

// Get pending fees
export const getPendingFees = async (req, res) => {
  try {
    const { entityType, limit = 100 } = req.query;
    let query = { status: { $in: ['pending', 'overdue', 'partially_paid'] } };

    if (entityType) query.entityType = entityType;

    const fees = await Fee.find(query)
      .populate('entityId', 'name studentId teacherId')
      .limit(parseInt(limit))
      .sort({ dueDate: 1 });

    res.json(fees);
  } catch (error) {
    res.status(500).json({ message: error.message });
  }
};

// Get overdue fees
export const getOverdueFees = async (req, res) => {
  try {
    const { entityType } = req.query;
    const now = new Date();

    let query = {
      dueDate: { $lt: now },
      status: { $in: ['pending', 'partially_paid'] }
    };

    if (entityType) query.entityType = entityType;

    const fees = await Fee.find(query)
      .populate('entityId', 'name studentId teacherId')
      .sort({ dueDate: 1 });

    res.json(fees);
  } catch (error) {
    res.status(500).json({ message: error.message });
  }
};

// ==================== FEE STATISTICS ====================

export const getFeeStatistics = async (req, res) => {
  try {
    const { entityType, academicYear } = req.query;
    let query = {};

    if (entityType) query.entityType = entityType;
    if (academicYear) query.academicYear = academicYear;

    const [
      total,
      paid,
      pending,
      overdue,
      partiallyPaid,
      waived,
      cancelled
    ] = await Promise.all([
      Fee.countDocuments(query),
      Fee.countDocuments({ ...query, status: 'paid' }),
      Fee.countDocuments({ ...query, status: 'pending' }),
      Fee.countDocuments({ ...query, status: 'overdue' }),
      Fee.countDocuments({ ...query, status: 'partially_paid' }),
      Fee.countDocuments({ ...query, status: 'waived' }),
      Fee.countDocuments({ ...query, status: 'cancelled' })
    ]);

    const totalAmount = await Fee.aggregate([
      { $match: query },
      { $group: { _id: null, total: { $sum: '$amount' } } }
    ]);

    const paidAmount = await Fee.aggregate([
      { $match: { ...query, status: 'paid' } },
      { $group: { _id: null, total: { $sum: '$amount' } } }
    ]);

    const pendingAmount = await Fee.aggregate([
      { $match: { ...query, status: { $in: ['pending', 'overdue', 'partially_paid'] } } },
      { $group: { _id: null, total: { $sum: '$amount' } } }
    ]);

    res.json({
      summary: {
        total,
        paid,
        pending,
        overdue,
        partiallyPaid,
        waived,
        cancelled
      },
      amounts: {
        totalAmount: totalAmount[0]?.total || 0,
        paidAmount: paidAmount[0]?.total || 0,
        pendingAmount: pendingAmount[0]?.total || 0,
        collectionRate: totalAmount[0]?.total ? ((paidAmount[0]?.total || 0) / totalAmount[0]?.total * 100).toFixed(2) : 0
      }
    });
  } catch (error) {
    res.status(500).json({ message: error.message });
  }
};

// Get entity-wise fee statistics
export const getEntityFeeStatistics = async (req, res) => {
  try {
    const { entityId, entityType } = req.params;
    const { academicYear } = req.query;

    let query = { entityId, entityType };
    if (academicYear) query.academicYear = academicYear;

    const stats = await Fee.aggregate([
      { $match: query },
      {
        $group: {
          _id: '$status',
          count: { $sum: 1 },
          totalAmount: { $sum: '$amount' }
        }
      }
    ]);

    res.json(stats);
  } catch (error) {
    res.status(500).json({ message: error.message });
  }
};

// ==================== FEE STRUCTURE MANAGEMENT ====================

// Get all fee structures
export const getFeeStructures = async (req, res) => {
  try {
    const { entityType, isActive = true, academicYear } = req.query;
    let query = {};

    if (entityType) query.entityType = entityType;
    if (isActive !== 'false') query.isActive = true;
    if (academicYear) query.academicYear = academicYear;

    const structures = await FeeStructure.find(query)
      .populate('createdBy', 'name')
      .populate('updatedBy', 'name')
      .sort({ createdAt: -1 });

    res.json(structures);
  } catch (error) {
    res.status(500).json({ message: error.message });
  }
};

// Create fee structure
export const createFeeStructure = async (req, res) => {
  try {
    const {
      entityType,
      entityCategory,
      feeName,
      feeType,
      amount,
      academicYear,
      description
    } = req.body;

    const structure = new FeeStructure({
      entityType,
      entityCategory,
      feeName,
      feeType,
      amount,
      academicYear,
      description,
      createdBy: req.user.id,
      isActive: true
    });

    await structure.save();

    res.status(201).json({
      message: 'Fee structure created successfully',
      structure
    });
  } catch (error) {
    res.status(500).json({ message: error.message });
  }
};

// Update fee structure
export const updateFeeStructure = async (req, res) => {
  try {
    const { id } = req.params;
    const updateData = { ...req.body, updatedBy: req.user.id };

    const structure = await FeeStructure.findByIdAndUpdate(
      id,
      updateData,
      { new: true }
    ).populate('createdBy', 'name').populate('updatedBy', 'name');

    if (!structure) {
      return res.status(404).json({ message: 'Fee structure not found' });
    }

    res.json({
      message: 'Fee structure updated successfully',
      structure
    });
  } catch (error) {
    res.status(500).json({ message: error.message });
  }
};

// Delete fee structure
export const deleteFeeStructure = async (req, res) => {
  try {
    const { id } = req.params;

    const structure = await FeeStructure.findByIdAndDelete(id);
    if (!structure) {
      return res.status(404).json({ message: 'Fee structure not found' });
    }

    res.json({
      message: 'Fee structure deleted successfully'
    });
  } catch (error) {
    res.status(500).json({ message: error.message });
  }
};

export default {
  getAllFees,
  getEntityFees,
  getMyFees,
  createFee,
  bulkCreateFeesFromStructure,
  updateFee,
  recordPayment,
  deleteFee,
  waiveFee,
  getPendingFees,
  getOverdueFees,
  getFeeStatistics,
  getEntityFeeStatistics,
  getFeeStructures,
  createFeeStructure,
  updateFeeStructure,
  deleteFeeStructure
};
