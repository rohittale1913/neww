import mongoose from 'mongoose';

const teacherSchema = new mongoose.Schema({
  teacherId: { type: String, unique: true, required: true },
  userId: { type: mongoose.Schema.Types.ObjectId, ref: 'User', required: true },
  name: { type: String, required: true },
  subjects: [String],
  classes: [String],
  phone: String,
  email: String,
  joiningDate: { type: Date, default: Date.now },
  qualification: String,
  experience: Number,
  salary: Number,
  employmentType: { type: String, enum: ['full-time', 'part-time', 'contractual'] },
  isClassTeacher: { type: Boolean, default: false },
  classTeacherOf: String,
  isActive: { type: Boolean, default: true },
  createdAt: { type: Date, default: Date.now },
  updatedAt: { type: Date, default: Date.now }
});

export default mongoose.model('Teacher', teacherSchema);
