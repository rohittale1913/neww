import mongoose from 'mongoose';

const classSubjectTeacherSchema = new mongoose.Schema({
  // Class and Section Reference
  className: { type: String, required: true }, // e.g., "9", "10"
  section: { type: String, required: true },   // e.g., "A", "B"
  
  // Teacher Reference
  teacherId: { type: mongoose.Schema.Types.ObjectId, ref: 'Teacher', required: true },
  teacherName: { type: String, required: true },
  
  // Subject(s) to teach
  subjects: [{ type: String, required: true }],
  
  // Assignment metadata
  assignmentType: { 
    type: String, 
    enum: ['class_teacher', 'subject_teacher'], 
    required: true 
  }, // class_teacher or subject_teacher
  
  // Connected references
  classId: { type: mongoose.Schema.Types.ObjectId, ref: 'Class' },
  assignedByAdminId: { type: mongoose.Schema.Types.ObjectId, ref: 'User', required: true },
  
  // Status
  isActive: { type: Boolean, default: true },
  
  // Timestamps
  assignedAt: { type: Date, default: Date.now },
  updatedAt: { type: Date, default: Date.now },
  
  // Optional notes
  notes: { type: String, default: '' }
});

// Index for faster queries
classSubjectTeacherSchema.index({ className: 1, section: 1 });
classSubjectTeacherSchema.index({ teacherId: 1 });
classSubjectTeacherSchema.index({ className: 1, section: 1, assignmentType: 1 });

export default mongoose.model('ClassSubjectTeacher', classSubjectTeacherSchema);
