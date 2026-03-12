import mongoose from 'mongoose';

const studentSchema = new mongoose.Schema({
  studentId: { type: String, unique: true, required: true },
  userId: { type: mongoose.Schema.Types.ObjectId, ref: 'User', required: true },
  name: { type: String, required: true },
  class: { type: String, required: true },
  section: { type: String, required: true },
  rollNumber: { type: Number, required: true },
  dateOfBirth: Date,
  parentId: { type: mongoose.Schema.Types.ObjectId, ref: 'User' },
  parentContact: String,
  address: String,
  phone: String,
  admissionDate: { type: Date, default: Date.now },
  bloodGroup: String,
  documents: [String],
  isActive: { type: Boolean, default: true },
  createdAt: { type: Date, default: Date.now },
  updatedAt: { type: Date, default: Date.now }
});

export default mongoose.model('Student', studentSchema);
