import express from 'express';
import { 
  getAllStudents, 
  getStudentById, 
  createStudent, 
  updateStudent, 
  deleteStudent, 
  getStudentByUserId, 
  getStudentProfileWithClassTeacher,
  getMyAttendance,
  getMyAssignments,
  getAssignmentDetail,
  submitMyAssignment,
  getMyExams,
  getExamDetail,
  getMyResults,
  getMyFees,
  getMySubjects
} from '../controllers/studentController.js';
import authMiddleware from '../middleware/authMiddleware.js';
import { roleMiddleware } from '../middleware/roleMiddleware.js';

const router = express.Router();

// Student profile endpoints - MUST be first (specific routes before parameterized)
router.get('/my-profile', authMiddleware, getStudentByUserId);
router.get('/profile/current', authMiddleware, getStudentByUserId);
router.get('/profile/with-teacher', authMiddleware, getStudentProfileWithClassTeacher);
router.get('/profile/with-teacher/:userId', authMiddleware, getStudentProfileWithClassTeacher);

// Student module endpoints (specific routes before parameterized)
router.get('/my-attendance', authMiddleware, getMyAttendance);
router.get('/my-assignments', authMiddleware, getMyAssignments);
router.get('/my-assignments/:assignmentId', authMiddleware, getAssignmentDetail);
router.post('/my-assignments/:assignmentId/submit', authMiddleware, submitMyAssignment);
router.get('/my-exams', authMiddleware, getMyExams);
router.get('/my-exams/:examId', authMiddleware, getExamDetail);
router.get('/my-results', authMiddleware, getMyResults);
router.get('/my-fees', authMiddleware, getMyFees);
router.get('/my-subjects', authMiddleware, getMySubjects);

// Standard CRUD endpoints - MUST be last (generic routes after specific routes)
router.get('/', authMiddleware, getAllStudents);
router.get('/:id', authMiddleware, getStudentById);
router.post('/', authMiddleware, roleMiddleware('admin'), createStudent);
router.put('/:id', authMiddleware, roleMiddleware('admin'), updateStudent);
router.delete('/:id', authMiddleware, roleMiddleware('admin'), deleteStudent);

export default router;
