import express from 'express';
import { getAllStudents, getStudentById, createStudent, updateStudent, deleteStudent, getStudentByUserId, getStudentProfileWithClassTeacher, getMySubjects, getMyAttendance, getMyAssignments, getMyAssignmentDetail, submitMyAssignment, getMyExams, getMyResults, getMyFees } from '../controllers/studentController.js';
import authMiddleware from '../middleware/authMiddleware.js';
import { roleMiddleware } from '../middleware/roleMiddleware.js';

const router = express.Router();

// Student profile endpoints
router.get('/profile/current', authMiddleware, getStudentByUserId);
router.get('/profile/with-teacher', authMiddleware, getStudentProfileWithClassTeacher);
router.get('/profile/with-teacher/:userId', authMiddleware, getStudentProfileWithClassTeacher);
router.get('/my-subjects', authMiddleware, getMySubjects);
router.get('/my-attendance', authMiddleware, getMyAttendance);
router.get('/my-assignments', authMiddleware, getMyAssignments);
router.get('/my-assignments/:assignmentId', authMiddleware, getMyAssignmentDetail);
router.post('/my-assignments/:assignmentId/submit', authMiddleware, submitMyAssignment);
router.get('/my-exams', authMiddleware, getMyExams);
router.get('/my-results', authMiddleware, getMyResults);
router.get('/my-fees', authMiddleware, getMyFees);

// Standard CRUD endpoints
router.get('/', authMiddleware, getAllStudents);
router.get('/:id', authMiddleware, getStudentById);
router.post('/', authMiddleware, roleMiddleware('admin'), createStudent);
router.put('/:id', authMiddleware, roleMiddleware('admin'), updateStudent);
router.delete('/:id', authMiddleware, roleMiddleware('admin'), deleteStudent);

export default router;
