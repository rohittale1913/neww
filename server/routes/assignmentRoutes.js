import express from 'express';
import { createAssignment, getAllAssignments, getAssignmentsByClass, submitAssignment, gradeAssignment, deleteAssignment, getStudentSubmissions, downloadSubmissionFile } from '../controllers/assignmentController.js';
import authMiddleware from '../middleware/authMiddleware.js';
import { roleMiddleware } from '../middleware/roleMiddleware.js';
import assignmentUpload from '../middleware/uploadMiddleware.js';

const router = express.Router();

// More specific routes first
router.post('/submit/:assignmentId', 
  authMiddleware, 
  roleMiddleware('student'),
  (req, res, next) => {
    console.log('📝 [SUBMIT] Request received for assignment:', req.params.assignmentId);
    console.log('   Content-Type:', req.headers['content-type']);
    next();
  },
  assignmentUpload.array('files', 5),
  (req, res, next) => {
    console.log('✓ [MULTER] Files parsed:', req.files?.length || 0, 'files');
    if (req.files && req.files.length > 0) {
      req.files.forEach((f, i) => {
        console.log(`   [${i}] ${f.originalname} - ${(f.size/1024).toFixed(2)}KB`);
      });
    }
    next();
  },
  submitAssignment
);
router.post('/grade', authMiddleware, roleMiddleware('teacher', 'admin'), gradeAssignment);
router.get('/download/:filename', authMiddleware, downloadSubmissionFile);
router.delete('/:assignmentId', authMiddleware, roleMiddleware('teacher', 'admin'), deleteAssignment);

// General routes after specific ones
router.post('/', authMiddleware, roleMiddleware('teacher', 'admin'), createAssignment);
router.get('/', authMiddleware, getAllAssignments);
router.get('/class/:classId', authMiddleware, getAssignmentsByClass);
router.get('/student/:studentId', authMiddleware, getStudentSubmissions);

// Error handler for multer
router.use((err, req, res, next) => {
  if (err.code === 'LIMIT_FILE_SIZE') {
    return res.status(400).json({ message: 'File size exceeds 10MB limit' });
  }
  if (err.code === 'LIMIT_FILE_COUNT') {
    return res.status(400).json({ message: 'Cannot upload more than 5 files' });
  }
  if (err.code === 'LIMIT_UNEXPECTED_FILE') {
    return res.status(400).json({ message: 'Unexpected file field' });
  }
  if (err.message && err.message.includes('File type')) {
    return res.status(400).json({ message: err.message });
  }
  next(err);
});

export default router;
