import express from 'express';
import { getAttendanceByDate, getStudentAttendance, markAttendance, bulkMarkAttendance, getAttendanceReport } from '../controllers/attendanceController.js';
import authMiddleware from '../middleware/authMiddleware.js';
import { roleMiddleware } from '../middleware/roleMiddleware.js';

const router = express.Router();

router.get('/', authMiddleware, getAttendanceByDate);
router.get('/student/:studentId', authMiddleware, getStudentAttendance);
router.post('/', authMiddleware, roleMiddleware('teacher', 'admin'), markAttendance);
router.post('/bulk', authMiddleware, roleMiddleware('teacher', 'admin'), bulkMarkAttendance);
router.get('/report', authMiddleware, getAttendanceReport);

export default router;
