import mongoose from 'mongoose';

const studentSchema = new mongoose.Schema({
  studentId: { type: String, unique: true, required: true },
  userId: { type: mongoose.Schema.Types.ObjectId, ref: 'User', required: true },
  name: { type: String, required: true },
  class: { type: String, required: true },
  section: { type: String, required: true },
  rollNumber: { type: Number, required: true },
  gender: { type: String, enum: ['Male', 'Female', 'Other'], required: true },
  dateOfBirth: { type: Date, required: true },
  bloodGroup: String,
  aadharNumber: { type: String },
  nationality: { type: String, default: 'Indian' },
  category: { type: String, enum: ['General', 'OBC', 'SC', 'ST'], required: true },
  parentId: { type: mongoose.Schema.Types.ObjectId, ref: 'User' },
  parentName: { type: String, required: true },
  parentEmail: { type: String, required: true },
  parentContact: { type: String, required: true },
  emergencyContact: { type: String, required: true },
  address: { type: String, required: true },
  phone: { type: String },
  previousSchool: String,
  transportRequired: { type: Boolean, default: false },
  admissionDate: { type: Date, default: Date.now },
  documents: [String],
  isActive: { type: Boolean, default: true },
  createdAt: { type: Date, default: Date.now },
  updatedAt: { type: Date, default: Date.now }
});

export default mongoose.model('Student', studentSchema);
