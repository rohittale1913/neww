import express from 'express';
import { 
  getAllTeachers, 
  getTeacherById, 
  createTeacher, 
  updateTeacher, 
  deleteTeacher,
  getMyProfile,
  getMyClasses,
  getClassStudents,
  markAttendance,
  getAttendance,
  getMyAssignments,
  getAssignmentDetail,
  gradeAssignment,
  getMyExams,
  getExamDetail
} from '../controllers/teacherController.js';
import authMiddleware from '../middleware/authMiddleware.js';
import { roleMiddleware } from '../middleware/roleMiddleware.js';

const router = express.Router();

// Teacher-specific routes (require authentication)
router.get('/my-profile', authMiddleware, getMyProfile);
router.get('/my-classes', authMiddleware, getMyClasses);
router.get('/class/:className/students', authMiddleware, getClassStudents);
router.post('/attendance/mark', authMiddleware, markAttendance);
router.get('/attendance', authMiddleware, getAttendance);
router.get('/my-assignments', authMiddleware, getMyAssignments);
router.get('/my-assignments/:assignmentId', authMiddleware, getAssignmentDetail);
router.post('/my-assignments/:assignmentId/grade', authMiddleware, gradeAssignment);
router.get('/my-exams', authMiddleware, getMyExams);
router.get('/my-exams/:examId', authMiddleware, getExamDetail);

// Admin-only routes (existing CRUD operations)
router.get('/', authMiddleware, getAllTeachers);
router.get('/:id', authMiddleware, getTeacherById);
router.post('/', authMiddleware, roleMiddleware('admin'), createTeacher);
router.put('/:id', authMiddleware, roleMiddleware('admin'), updateTeacher);
router.delete('/:id', authMiddleware, roleMiddleware('admin'), deleteTeacher);

export default router;
