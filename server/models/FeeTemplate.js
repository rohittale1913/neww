import mongoose from 'mongoose';

const feeTemplateSchema = new mongoose.Schema({
  name: { type: String, required: true },
  description: String,
  feeType: { type: String, enum: ['tuition', 'transport', 'uniform', 'activities', 'exam', 'library', 'sports', 'registration', 'other'], required: true },
  amount: { type: Number, required: true },
  academicYear: { type: String, required: true },
  applicableClasses: [String], // ['Class 10A', 'Class 10B'] - empty means applicable to all
  dueDate: { type: Date, required: true },
  isActive: { type: Boolean, default: true },
  createdBy: { type: mongoose.Schema.Types.ObjectId, ref: 'User', required: true },
  createdAt: { type: Date, default: Date.now },
  updatedAt: { type: Date, default: Date.now }
});

export default mongoose.model('FeeTemplate', feeTemplateSchema);
