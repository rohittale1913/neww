import express from 'express';
import { getAllAttendance, getAttendanceByDate, getStudentAttendance, markAttendance, bulkMarkAttendance, getAttendanceReport } from '../controllers/attendanceController.js';
import authMiddleware from '../middleware/authMiddleware.js';
import { roleMiddleware } from '../middleware/roleMiddleware.js';

const router = express.Router();

// Admin: Get all attendance records with teacher info
router.get('/all', authMiddleware, roleMiddleware('admin'), getAllAttendance);

router.get('/', authMiddleware, getAttendanceByDate);
router.get('/student/:studentId', authMiddleware, getStudentAttendance);
router.post('/', authMiddleware, roleMiddleware('teacher', 'admin'), markAttendance);
router.post('/bulk', authMiddleware, roleMiddleware('teacher', 'admin'), bulkMarkAttendance);
router.get('/report', authMiddleware, getAttendanceReport);

export default router;
