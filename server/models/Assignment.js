import mongoose from 'mongoose';

const assignmentSchema = new mongoose.Schema({
  title: { type: String, required: true },
  description: { type: String, default: '' },
  teacherId: { type: mongoose.Schema.Types.ObjectId, ref: 'Teacher', required: true },
  classId: { type: mongoose.Schema.Types.ObjectId, ref: 'Class' },
  className: { type: String }, // Store class name for easier querying
  section: { type: String }, // Store section for easier querying
  subject: { type: mongoose.Schema.Types.ObjectId, ref: 'Subject' },
  subjectName: { type: String }, // Store subject name for easier display
  attachments: [String],
  dueDate: { type: Date, required: true },
  totalMarks: { type: Number, default: 100 },
  instructions: { type: String, default: '' },
  submissions: [{
    studentId: { type: mongoose.Schema.Types.ObjectId, ref: 'Student' },
    studentName: String,
    studentRollNumber: String,
    submittedAt: Date,
    submittedDate: Date,
    attachments: [{
      filename: String,
      originalName: String,
      filepath: String,
      downloadUrl: String,
      size: Number,
      mimeType: String,
      uploadedAt: { type: Date, default: Date.now }
    }],
    marksObtained: Number,
    feedback: String,
    isLate: Boolean
  }],
  createdBy: { type: mongoose.Schema.Types.ObjectId, ref: 'User' },
  createdAt: { type: Date, default: Date.now },
  updatedAt: { type: Date, default: Date.now }
});

assignmentSchema.index({ teacherId: 1, classId: 1 });
assignmentSchema.index({ className: 1, section: 1 });
assignmentSchema.index({ dueDate: 1 });

export default mongoose.model('Assignment', assignmentSchema);
