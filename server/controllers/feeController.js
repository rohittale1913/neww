import Fee from '../models/Fee.js';
import Student from '../models/Student.js';

// Get all fees
export const getAllFees = async (req, res) => {
  try {
    const fees = await Fee.find().populate('studentId', 'name studentId');
    res.json(fees);
  } catch (error) {
    res.status(500).json({ message: error.message });
  }
};

// Get fees by student
export const getStudentFees = async (req, res) => {
  try {
    const { studentId } = req.params;
    const fees = await Fee.find({ studentId }).populate('studentId', 'name class');
    res.json(fees);
  } catch (error) {
    res.status(500).json({ message: error.message });
  }
};

// Get pending fees
export const getPendingFees = async (req, res) => {
  try {
    const fees = await Fee.find({ status: { $in: ['pending', 'overdue', 'partially_paid'] } })
      .populate('studentId', 'name studentId class');
    res.json(fees);
  } catch (error) {
    res.status(500).json({ message: error.message });
  }
};

// Add fee
export const addFee = async (req, res) => {
  try {
    const { studentId, feeType, amount, dueDate, academicYear } = req.body;

    const fee = new Fee({
      studentId,
      feeType,
      amount,
      dueDate,
      academicYear,
      status: 'pending'
    });

    await fee.save();

    res.status(201).json({
      message: 'Fee added successfully',
      fee
    });
  } catch (error) {
    res.status(500).json({ message: error.message });
  }
};

// Record payment
export const recordPayment = async (req, res) => {
  try {
    const { feeId, amountPaid, paymentMethod, transactionId } = req.body;

    const fee = await Fee.findById(feeId);

    if (!fee) {
      return res.status(404).json({ message: 'Fee not found' });
    }

    if (amountPaid >= fee.amount) {
      fee.status = 'paid';
      fee.paidDate = Date.now();
    } else {
      fee.status = 'partially_paid';
      fee.amount -= amountPaid;
    }

    fee.paymentMethod = paymentMethod;
    fee.transactionId = transactionId;

    await fee.save();

    res.json({
      message: 'Payment recorded successfully',
      fee
    });
  } catch (error) {
    res.status(500).json({ message: error.message });
  }
};

// Get fee statistics
export const getFeeStatistics = async (req, res) => {
  try {
    const total = await Fee.countDocuments();
    const paid = await Fee.countDocuments({ status: 'paid' });
    const pending = await Fee.countDocuments({ status: 'pending' });
    const overdue = await Fee.countDocuments({ status: 'overdue' });
    const partiallyPaid = await Fee.countDocuments({ status: 'partially_paid' });

    const totalAmount = await Fee.aggregate([{ $group: { _id: null, total: { $sum: '$amount' } } }]);
    const paidAmount = await Fee.aggregate([{ $match: { status: 'paid' } }, { $group: { _id: null, total: { $sum: '$amount' } } }]);

    res.json({
      total,
      paid,
      pending,
      overdue,
      partiallyPaid,
      totalAmount: totalAmount[0]?.total || 0,
      paidAmount: paidAmount[0]?.total || 0
    });
  } catch (error) {
    res.status(500).json({ message: error.message });
  }
};

export default { getAllFees, getStudentFees, getPendingFees, addFee, recordPayment, getFeeStatistics };
