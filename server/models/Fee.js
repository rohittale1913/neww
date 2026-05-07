import mongoose from 'mongoose';

const feeSchema = new mongoose.Schema({
  // Entity reference (supports multiple entity types)
  entityType: {
    type: String,
    enum: ['student', 'teacher', 'staff', 'accountant'],
    required: true
  },
  entityId: {
    type: mongoose.Schema.Types.ObjectId,
    refPath: 'entityType',
    required: true
  },
  
  // Legacy student reference for backward compatibility
  studentId: { type: mongoose.Schema.Types.ObjectId, ref: 'Student' },
  
  // Fee details
  feeType: {
    type: String,
    enum: ['tuition', 'transport', 'uniform', 'activities', 'exam', 'salary', 'bonus', 'advance', 'other'],
    required: true
  },
  feeDescription: String,
  amount: { type: Number, required: true },
  dueDate: Date,
  paidDate: Date,
  paymentDeadline: Date,
  
  // Payment tracking
  status: {
    type: String,
    enum: ['pending', 'paid', 'overdue', 'partially_paid', 'waived', 'cancelled'],
    default: 'pending'
  },
  paymentMethod: {
    type: String,
    enum: ['cash', 'card', 'check', 'online', 'bank_transfer', 'upi', 'pending'],
    default: null
  },
  transactionId: String,
  paymentReference: String,
  
  // Period information
  academicYear: String,
  academicTerm: String,
  month: String,
  
  // Additional details
  remarks: String,
  receipt: String,
  issuedBy: { type: mongoose.Schema.Types.ObjectId, ref: 'User' },
  appliedBy: { type: mongoose.Schema.Types.ObjectId, ref: 'User' },
  lastModifiedBy: { type: mongoose.Schema.Types.ObjectId, ref: 'User' },
  
  // Approval workflow
  approvalStatus: {
    type: String,
    enum: ['draft', 'submitted', 'approved', 'rejected'],
    default: 'approved'
  },
  approvedBy: { type: mongoose.Schema.Types.ObjectId, ref: 'User' },
  
  // Dates
  createdAt: { type: Date, default: Date.now },
  updatedAt: { type: Date, default: Date.now },
  paidAt: Date
});

// Virtual for calculating days overdue
feeSchema.virtual('daysOverdue').get(function() {
  if (this.status === 'paid' || !this.dueDate) return 0;
  const now = new Date();
  const dueDate = new Date(this.dueDate);
  if (now > dueDate) {
    return Math.floor((now - dueDate) / (1000 * 60 * 60 * 24));
  }
  return 0;
});

// Index for faster queries
feeSchema.index({ entityType: 1, entityId: 1 });
feeSchema.index({ academicYear: 1, status: 1 });
feeSchema.index({ dueDate: 1, status: 1 });

export default mongoose.model('Fee', feeSchema);
