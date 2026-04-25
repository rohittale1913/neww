import express from 'express';
import { getAllExams, createExam, updateExam, deleteExam, addMarks, getStudentResults, getExamResults, generateReportCard } from '../controllers/examController.js';
import authMiddleware from '../middleware/authMiddleware.js';
import { roleMiddleware } from '../middleware/roleMiddleware.js';

const router = express.Router();

router.get('/', authMiddleware, getAllExams);
router.post('/', authMiddleware, roleMiddleware('admin', 'teacher'), createExam);
router.put('/:examId', authMiddleware, roleMiddleware('admin', 'teacher'), updateExam);
router.delete('/:examId', authMiddleware, roleMiddleware('admin'), deleteExam);
router.post('/marks', authMiddleware, roleMiddleware('teacher', 'admin'), addMarks);
router.get('/student/:studentId', authMiddleware, getStudentResults);
router.get('/exam/:examId', authMiddleware, getExamResults);
router.get('/report-card', authMiddleware, generateReportCard);

export default router;
