import mongoose from 'mongoose';

const feeStructureSchema = new mongoose.Schema({
  // Entity type this structure applies to
  entityType: {
    type: String,
    enum: ['student', 'teacher', 'staff', 'accountant'],
    required: true
  },
  
  // Reference to entity (e.g., class for students, department for staff)
  entityCategory: String, // e.g., "Class 10", "Admin", "Teaching Staff"
  
  // Fee structure details
  feeName: { type: String, required: true },
  feeType: { type: String, required: true },
  description: String,
  amount: { type: Number, required: true },
  
  // Period information
  academicYear: String,
  academicTerm: String,
  isRecurring: { type: Boolean, default: false },
  recurringMonths: [String], // e.g., ['January', 'February', ...]
  
  // Configuration
  isActive: { type: Boolean, default: true },
  isOptional: { type: Boolean, default: false },
  discountAllowed: { type: Boolean, default: false },
  maxDiscount: Number,
  
  // Tax and additional charges
  taxPercentage: { type: Number, default: 0 },
  lateFeePercentage: { type: Number, default: 0 },
  lateFeeType: { type: String, enum: ['fixed', 'percentage'], default: 'percentage' },
  
  // Application rules
  applicableFrom: Date,
  applicableTo: Date,
  
  // Audit fields
  createdBy: { type: mongoose.Schema.Types.ObjectId, ref: 'User', required: true },
  updatedBy: { type: mongoose.Schema.Types.ObjectId, ref: 'User' },
  createdAt: { type: Date, default: Date.now },
  updatedAt: { type: Date, default: Date.now }
});

// Indexes
feeStructureSchema.index({ entityType: 1, academicYear: 1 });
feeStructureSchema.index({ isActive: 1, entityType: 1 });

export default mongoose.model('FeeStructure', feeStructureSchema);
