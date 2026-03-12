import mongoose from 'mongoose';

const feeSchema = new mongoose.Schema({
  studentId: { type: mongoose.Schema.Types.ObjectId, ref: 'Student', required: true },
  feeType: { type: String, enum: ['tuition', 'transport', 'uniform', 'activities', 'exam', 'other'], required: true },
  amount: { type: Number, required: true },
  dueDate: Date,
  paidDate: Date,
  status: { type: String, enum: ['pending', 'paid', 'overdue', 'partially_paid'], default: 'pending' },
  paymentMethod: { type: String, enum: ['cash', 'card', 'check', 'online'], default: null },
  transactionId: String,
  academicYear: String,
  remarks: String,
  createdAt: { type: Date, default: Date.now },
  updatedAt: { type: Date, default: Date.now }
});

export default mongoose.model('Fee', feeSchema);
