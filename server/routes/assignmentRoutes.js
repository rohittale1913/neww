import express from 'express';
import { createAssignment, getAllAssignments, getAssignmentsByClass, submitAssignment, gradeAssignment, getStudentSubmissions } from '../controllers/assignmentController.js';
import authMiddleware from '../middleware/authMiddleware.js';
import { roleMiddleware } from '../middleware/roleMiddleware.js';

const router = express.Router();

router.post('/', authMiddleware, roleMiddleware('teacher', 'admin'), createAssignment);
router.get('/', authMiddleware, getAllAssignments);
router.get('/class/:classId', authMiddleware, getAssignmentsByClass);
router.post('/submit', authMiddleware, roleMiddleware('student'), submitAssignment);
router.post('/grade', authMiddleware, roleMiddleware('teacher', 'admin'), gradeAssignment);
router.get('/student/:studentId', authMiddleware, getStudentSubmissions);

export default router;
