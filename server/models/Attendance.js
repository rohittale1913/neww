import mongoose from 'mongoose';

const attendanceSchema = new mongoose.Schema({
  studentId: { type: mongoose.Schema.Types.ObjectId, ref: 'Student', required: true },
  classId: { type: mongoose.Schema.Types.ObjectId, ref: 'Class' },
  className: { type: String }, // Store class name directly for easier querying
  section: { type: String }, // Store section for easier filtering
  date: { type: Date, required: true },
  status: { type: String, enum: ['present', 'absent', 'leave', 'late'], default: 'absent' },
  remarks: String,
  markedBy: { type: mongoose.Schema.Types.ObjectId, ref: 'User' },
  teacherId: { type: mongoose.Schema.Types.ObjectId, ref: 'Teacher' },
  createdAt: { type: Date, default: Date.now },
  updatedAt: { type: Date, default: Date.now }
});

export default mongoose.model('Attendance', attendanceSchema);
