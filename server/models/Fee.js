import mongoose from 'mongoose';

const paymentHistorySchema = new mongoose.Schema({
  amount: { type: Number, required: true },
  paymentMethod: { type: String, enum: ['cash', 'card', 'check', 'online', 'transfer'], required: true },
  transactionId: String,
  paidDate: { type: Date, default: Date.now },
  remarks: String,
  recordedBy: { type: mongoose.Schema.Types.ObjectId, ref: 'User' }
}, { _id: true });

const feeSchema = new mongoose.Schema({
  studentId: { type: mongoose.Schema.Types.ObjectId, ref: 'Student', required: true },
  classId: { type: mongoose.Schema.Types.ObjectId, ref: 'Class' },
  feeType: { type: String, enum: ['tuition', 'transport', 'uniform', 'activities', 'exam', 'library', 'sports', 'registration', 'other'], required: true },
  totalAmount: { type: Number, required: true },
  paidAmount: { type: Number, default: 0 },
  dueAmount: { type: Number, default: 0 },
  dueDate: { type: Date, required: true },
  status: { type: String, enum: ['pending', 'paid', 'overdue', 'partially_paid'], default: 'pending' },
  paymentHistory: [paymentHistorySchema],
  academicYear: { type: String, required: true },
  remarks: String,
  isActive: { type: Boolean, default: true },
  createdBy: { type: mongoose.Schema.Types.ObjectId, ref: 'User' },
  createdAt: { type: Date, default: Date.now },
  updatedAt: { type: Date, default: Date.now }
});

// Virtual to calculate due amount
feeSchema.virtual('dueAmountCalc').get(function() {
  return this.totalAmount - this.paidAmount;
});

// Middleware to update status based on payment
feeSchema.pre('save', function(next) {
  if (this.paidAmount >= this.totalAmount) {
    this.status = 'paid';
  } else if (this.paidAmount > 0) {
    this.status = 'partially_paid';
  } else if (this.dueDate < new Date() && this.status === 'pending') {
    this.status = 'overdue';
  }
  
  this.dueAmount = this.totalAmount - this.paidAmount;
  this.updatedAt = Date.now();
  next();
});

export default mongoose.model('Fee', feeSchema);
