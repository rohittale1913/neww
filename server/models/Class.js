import mongoose from 'mongoose';

const classSchema = new mongoose.Schema({
  className: { type: String, required: true },
  section: { type: String, required: true },
  classTeacher: { type: mongoose.Schema.Types.ObjectId, ref: 'Teacher' },
  subjects: [{ type: mongoose.Schema.Types.ObjectId, ref: 'Subject' }],
  students: [{ type: mongoose.Schema.Types.ObjectId, ref: 'Student' }],
  capacity: Number,
  room: String,
  academicYear: String,
  createdAt: { type: Date, default: Date.now },
  updatedAt: { type: Date, default: Date.now }
});

export default mongoose.model('Class', classSchema);
