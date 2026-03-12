import mongoose from 'mongoose';

const examSchema = new mongoose.Schema({
  examName: { type: String, required: true },
  examType: { type: String, enum: ['unit_test', 'midterm', 'final', 'quiz', 'practical'], required: true },
  classId: { type: mongoose.Schema.Types.ObjectId, ref: 'Class', required: true },
  subjects: [{ type: mongoose.Schema.Types.ObjectId, ref: 'Subject' }],
  startDate: { type: Date, required: true },
  endDate: { type: Date, required: true },
  totalMarks: Number,
  passingMarks: Number,
  academicYear: String,
  description: String,
  createdAt: { type: Date, default: Date.now },
  updatedAt: { type: Date, default: Date.now }
});

export default mongoose.model('Exam', examSchema);
