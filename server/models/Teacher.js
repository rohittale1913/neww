import mongoose from 'mongoose';

const teacherSchema = new mongoose.Schema({
  teacherId: { type: String, unique: true, required: true },
  userId: { type: mongoose.Schema.Types.ObjectId, ref: 'User', required: true },
  name: { type: String, required: true },
  subjects: {type:[String],required:true},
  classes: {type:[String],required:true},
  sections: {type:[String],default:[]},
  joiningDate: { type: Date, default: Date.now },
  qualification: { type: String, required: true },
  experience: { type: Number, required: true },
  salary: Number,
  employmentType: { type: String, enum: ['full-time', 'part-time', 'contractual'] },
  isClassTeacher: { type: Boolean, default: false },
  classTeacherOf: String,
  isActive: { type: Boolean, default: true },
  createdAt: { type: Date, default: Date.now },
  updatedAt: { type: Date, default: Date.now }
});

export default mongoose.model('Teacher', teacherSchema);
