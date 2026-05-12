import Fee from '../models/Fee.js';
import FeeTemplate from '../models/FeeTemplate.js';
import Student from '../models/Student.js';
import Class from '../models/Class.js';

// Get all fees with advanced filtering
export const getAllFees = async (req, res) => {
  try {
    const { classId, studentId, status, feeType, academicYear, page = 1, limit = 50 } = req.query;
    
    let filter = { isActive: true };
    
    if (classId) filter.classId = classId;
    if (studentId) filter.studentId = studentId;
    if (status) filter.status = status;
    if (feeType) filter.feeType = feeType;
    if (academicYear) filter.academicYear = academicYear;

    const skip = (page - 1) * limit;
    
    const fees = await Fee.find(filter)
      .populate('studentId', 'name studentId class section rollNumber')
      .populate('classId', 'className section')
      .populate('createdBy', 'name email')
      .sort({ createdAt: -1 })
      .limit(parseInt(limit))
      .skip(skip);

    const total = await Fee.countDocuments(filter);

    res.json({
      fees,
      pagination: {
        total,
        page: parseInt(page),
        pages: Math.ceil(total / limit)
      }
    });
  } catch (error) {
    res.status(500).json({ message: error.message });
  }
};

// Get fees by student
export const getStudentFees = async (req, res) => {
  try {
    const { studentId } = req.params;
    const { academicYear } = req.query;
    
    let filter = { studentId, isActive: true };
    if (academicYear) filter.academicYear = academicYear;

    const fees = await Fee.find(filter)
      .populate('studentId', 'name class section')
      .sort({ createdAt: -1 });
    
    res.json(fees);
  } catch (error) {
    res.status(500).json({ message: error.message });
  }
};

// Get pending and overdue fees
export const getPendingFees = async (req, res) => {
  try {
    const { classId, academicYear } = req.query;
    
    let filter = {
      status: { $in: ['pending', 'overdue', 'partially_paid'] },
      isActive: true
    };
    
    if (classId) filter.classId = classId;
    if (academicYear) filter.academicYear = academicYear;

    const fees = await Fee.find(filter)
      .populate('studentId', 'name studentId class section rollNumber')
      .populate('classId', 'className section')
      .sort({ dueDate: 1 });
    
    res.json(fees);
  } catch (error) {
    res.status(500).json({ message: error.message });
  }
};

// Add fee to individual student
export const addFee = async (req, res) => {
  try {
    const { studentId, classId, feeType, totalAmount, dueDate, academicYear, remarks } = req.body;
    const userId = req.user?._id;

    if (!studentId || !feeType || !totalAmount || !dueDate || !academicYear) {
      return res.status(400).json({ message: 'Missing required fields' });
    }

    // Validate that totalAmount is a positive number
    const amount = parseFloat(totalAmount);
    if (isNaN(amount) || amount <= 0) {
      return res.status(400).json({ message: 'Total amount must be a positive number' });
    }

    const student = await Student.findById(studentId);
    if (!student) {
      return res.status(404).json({ message: 'Student not found' });
    }

    const fee = new Fee({
      studentId,
      classId: classId || student.class,
      feeType,
      totalAmount: amount,
      paidAmount: 0,
      dueAmount: amount, // Explicitly set dueAmount = totalAmount for new fees
      dueDate,
      academicYear,
      remarks,
      createdBy: userId,
      status: 'pending'
    });

    await fee.save();
    await fee.populate('studentId', 'name studentId class');

    res.status(201).json({
      message: 'Fee added successfully',
      fee
    });
  } catch (error) {
    res.status(500).json({ message: error.message });
  }
};

// Bulk add fees for entire class from template or direct data
export const bulkAddFees = async (req, res) => {
  try {
    const { classId, feeTemplateId, feeType, totalAmount, dueDate, students, academicYear } = req.body;
    const userId = req.user?._id;

    if (!classId && !students?.length) {
      return res.status(400).json({ message: 'Provide classId or student list' });
    }

    let studentList = students || [];
    
    // If classId provided, get all students from class
    if (classId && !students?.length) {
      const classData = await Class.findById(classId).populate('students');
      if (!classData) {
        return res.status(404).json({ message: 'Class not found' });
      }
      studentList = classData.students.map(s => s._id);
    }

    let feeData = { academicYear, createdBy: userId };

    // If template provided, use template data
    if (feeTemplateId) {
      const template = await FeeTemplate.findById(feeTemplateId);
      if (!template) {
        return res.status(404).json({ message: 'Fee template not found' });
      }
      feeData = {
        ...feeData,
        feeType: template.feeType,
        totalAmount: template.amount,
        dueDate: template.dueDate
      };
    } else if (feeType && totalAmount && dueDate) {
      // Use direct data from request body
      const amount = parseFloat(totalAmount);
      if (isNaN(amount) || amount <= 0) {
        return res.status(400).json({ message: 'Total amount must be a positive number' });
      }
      feeData = {
        ...feeData,
        feeType,
        totalAmount: amount,
        dueDate
      };
    } else {
      return res.status(400).json({ message: 'Provide either feeTemplateId or feeType, totalAmount, dueDate' });
    }

    // Validate totalAmount is positive
    if (feeData.totalAmount <= 0) {
      return res.status(400).json({ message: 'Total amount must be greater than 0' });
    }

    // Create fees for each student
    const createdFees = [];
    const errors = [];

    for (const sid of studentList) {
      try {
        const student = await Student.findById(sid);
        if (!student) {
          errors.push(`Student ${sid} not found`);
          continue;
        }

        // Check if fee already exists for this student and type
        const existingFee = await Fee.findOne({
          studentId: sid,
          classId: classId || student.class,
          feeType: feeData.feeType,
          academicYear
        });

        if (existingFee) {
          errors.push(`Fee already exists for ${student.name}`);
          continue;
        }

        const fee = new Fee({
          studentId: sid,
          classId: classId,
          ...feeData,
          paidAmount: 0,
          dueAmount: feeData.totalAmount, // Explicitly set dueAmount = totalAmount for new fees
          status: 'pending'
        });

        await fee.save();
        createdFees.push(fee);
      } catch (err) {
        errors.push(`Error creating fee for student ${sid}: ${err.message}`);
      }
    }

    res.status(201).json({
      message: 'Bulk fees created',
      createdCount: createdFees.length,
      createdFees,
      errors: errors.length > 0 ? errors : undefined
    });
  } catch (error) {
    res.status(500).json({ message: error.message });
  }
};

// Record payment for a fee
export const recordPayment = async (req, res) => {
  try {
    const { feeId, amountPaid, paymentMethod, transactionId, remarks } = req.body;
    const userId = req.user?._id;

    if (!feeId || !amountPaid || !paymentMethod) {
      return res.status(400).json({ message: 'Missing required fields' });
    }

    const fee = await Fee.findById(feeId);
    if (!fee) {
      return res.status(404).json({ message: 'Fee not found' });
    }

    // Validate payment amount
    if (amountPaid <= 0) {
      return res.status(400).json({ message: 'Payment amount must be greater than 0' });
    }

    if (amountPaid > fee.dueAmount) {
      return res.status(400).json({ 
        message: `Payment amount exceeds due amount. Due: $${fee.dueAmount}` 
      });
    }

    // Add to payment history
    fee.paymentHistory.push({
      amount: amountPaid,
      paymentMethod,
      transactionId: transactionId || `TXN-${Date.now()}`,
      paidDate: new Date(),
      remarks,
      recordedBy: userId
    });

    // Update paid amount
    fee.paidAmount += amountPaid;
    
    // Update status
    if (fee.paidAmount >= fee.totalAmount) {
      fee.status = 'paid';
    } else {
      fee.status = 'partially_paid';
    }

    await fee.save();
    await fee.populate('studentId', 'name studentId class');

    res.json({
      message: 'Payment recorded successfully',
      fee,
      paymentDetails: {
        amountPaid,
        previousDue: fee.dueAmount,
        newDue: fee.totalAmount - fee.paidAmount,
        totalPaid: fee.paidAmount,
        status: fee.status
      }
    });
  } catch (error) {
    res.status(500).json({ message: error.message });
  }
};

// Get payment history for a fee
export const getPaymentHistory = async (req, res) => {
  try {
    const { feeId } = req.params;

    const fee = await Fee.findById(feeId)
      .populate('paymentHistory.recordedBy', 'name email')
      .populate('studentId', 'name studentId');

    if (!fee) {
      return res.status(404).json({ message: 'Fee not found' });
    }

    res.json({
      fee: {
        _id: fee._id,
        studentId: fee.studentId,
        feeType: fee.feeType,
        totalAmount: fee.totalAmount,
        paidAmount: fee.paidAmount,
        dueAmount: fee.dueAmount,
        status: fee.status,
        paymentHistory: fee.paymentHistory
      }
    });
  } catch (error) {
    res.status(500).json({ message: error.message });
  }
};

// Get fee statistics with filters
export const getFeeStatistics = async (req, res) => {
  try {
    const { classId, academicYear } = req.query;
    
    let filter = { isActive: true };
    if (classId) filter.classId = classId;
    if (academicYear) filter.academicYear = academicYear;

    const stats = await Fee.aggregate([
      { $match: filter },
      {
        $group: {
          _id: null,
          totalRecords: { $sum: 1 },
          paidRecords: { $sum: { $cond: [{ $eq: ['$status', 'paid'] }, 1, 0] } },
          pendingRecords: { $sum: { $cond: [{ $eq: ['$status', 'pending'] }, 1, 0] } },
          overdueRecords: { $sum: { $cond: [{ $eq: ['$status', 'overdue'] }, 1, 0] } },
          partiallyPaidRecords: { $sum: { $cond: [{ $eq: ['$status', 'partially_paid'] }, 1, 0] } },
          totalAmount: { $sum: '$totalAmount' },
          paidAmount: { $sum: '$paidAmount' },
          dueAmount: { $sum: '$dueAmount' }
        }
      }
    ]);

    const statsByType = await Fee.aggregate([
      { $match: filter },
      {
        $group: {
          _id: '$feeType',
          count: { $sum: 1 },
          total: { $sum: '$totalAmount' },
          paid: { $sum: '$paidAmount' },
          due: { $sum: '$dueAmount' }
        }
      }
    ]);

    res.json({
      overall: stats[0] || {
        totalRecords: 0,
        paidRecords: 0,
        pendingRecords: 0,
        overdueRecords: 0,
        partiallyPaidRecords: 0,
        totalAmount: 0,
        paidAmount: 0,
        dueAmount: 0
      },
      byType: statsByType
    });
  } catch (error) {
    res.status(500).json({ message: error.message });
  }
};

// Create fee template
export const createFeeTemplate = async (req, res) => {
  try {
    const { name, description, feeType, amount, academicYear, applicableClasses, dueDate } = req.body;
    const userId = req.user?._id;

    if (!name || !feeType || !amount || !academicYear || !dueDate) {
      return res.status(400).json({ message: 'Missing required fields' });
    }

    const template = new FeeTemplate({
      name,
      description,
      feeType,
      amount,
      academicYear,
      applicableClasses: applicableClasses || [],
      dueDate,
      createdBy: userId
    });

    await template.save();
    await template.populate('createdBy', 'name email');

    res.status(201).json({
      message: 'Fee template created successfully',
      template
    });
  } catch (error) {
    res.status(500).json({ message: error.message });
  }
};

// Get all fee templates
export const getFeeTemplates = async (req, res) => {
  try {
    const { academicYear } = req.query;
    
    let filter = { isActive: true };
    if (academicYear) filter.academicYear = academicYear;

    const templates = await FeeTemplate.find(filter)
      .populate('createdBy', 'name email')
      .sort({ createdAt: -1 });

    res.json(templates);
  } catch (error) {
    res.status(500).json({ message: error.message });
  }
};

// Update fee template
export const updateFeeTemplate = async (req, res) => {
  try {
    const { templateId } = req.params;
    const updates = req.body;

    const template = await FeeTemplate.findByIdAndUpdate(
      templateId,
      { ...updates, updatedAt: Date.now() },
      { new: true, runValidators: true }
    ).populate('createdBy', 'name email');

    if (!template) {
      return res.status(404).json({ message: 'Template not found' });
    }

    res.json({
      message: 'Fee template updated successfully',
      template
    });
  } catch (error) {
    res.status(500).json({ message: error.message });
  }
};

// Delete fee template
export const deleteFeeTemplate = async (req, res) => {
  try {
    const { templateId } = req.params;

    const template = await FeeTemplate.findByIdAndUpdate(
      templateId,
      { isActive: false },
      { new: true }
    );

    if (!template) {
      return res.status(404).json({ message: 'Template not found' });
    }

    res.json({ message: 'Fee template deleted successfully' });
  } catch (error) {
    res.status(500).json({ message: error.message });
  }
};

// Get student fee summary
export const getStudentFeeSummary = async (req, res) => {
  try {
    const { studentId } = req.params;
    const { academicYear } = req.query;

    let filter = { studentId, isActive: true };
    if (academicYear) filter.academicYear = academicYear;

    const fees = await Fee.find(filter).sort({ createdAt: -1 });

    const summary = {
      student: null,
      academicYear: academicYear || 'All',
      totalFees: fees.length,
      totalAmount: 0,
      paidAmount: 0,
      dueAmount: 0,
      paidCount: 0,
      pendingCount: 0,
      overdueCount: 0,
      fees: []
    };

    for (const fee of fees) {
      summary.totalAmount += fee.totalAmount;
      summary.paidAmount += fee.paidAmount;
      summary.dueAmount += fee.dueAmount;
      
      if (fee.status === 'paid') summary.paidCount++;
      else if (fee.status === 'pending') summary.pendingCount++;
      else if (fee.status === 'overdue') summary.overdueCount++;

      summary.fees.push({
        _id: fee._id,
        feeType: fee.feeType,
        totalAmount: fee.totalAmount,
        paidAmount: fee.paidAmount,
        dueAmount: fee.dueAmount,
        status: fee.status,
        dueDate: fee.dueDate,
        paymentCount: fee.paymentHistory.length
      });
    }

    const student = await Student.findById(studentId, 'name studentId class section');
    summary.student = student;

    res.json(summary);
  } catch (error) {
    res.status(500).json({ message: error.message });
  }
};

// Update fee details (admin only)
export const updateFee = async (req, res) => {
  try {
    const { feeId } = req.params;
    const { feeType, totalAmount, dueDate, remarks } = req.body;

    const fee = await Fee.findById(feeId);
    if (!fee) {
      return res.status(404).json({ message: 'Fee not found' });
    }

    // Only allow update if no payments made
    if (fee.paidAmount > 0) {
      return res.status(400).json({ message: 'Cannot update fee after payment has been made' });
    }

    if (feeType) fee.feeType = feeType;
    if (totalAmount) fee.totalAmount = totalAmount;
    if (dueDate) fee.dueDate = dueDate;
    if (remarks) fee.remarks = remarks;

    await fee.save();
    res.json({
      message: 'Fee updated successfully',
      fee
    });
  } catch (error) {
    res.status(500).json({ message: error.message });
  }
};

export default {
  getAllFees,
  getStudentFees,
  getPendingFees,
  addFee,
  bulkAddFees,
  recordPayment,
  getPaymentHistory,
  getFeeStatistics,
  createFeeTemplate,
  getFeeTemplates,
  updateFeeTemplate,
  deleteFeeTemplate,
  getStudentFeeSummary,
  updateFee
};
