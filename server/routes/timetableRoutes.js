import express from 'express';
import {
  getAllTimetables,
  getClassTimetable,
  getTeacherTimetable,
  getMyTimetable,
  getStudentTimetable,
  createTimetableEntry,
  updateTimetableEntry,
  deleteTimetableEntry,
  deleteClassTimetable
} from '../controllers/timetableController.js';
import authMiddleware from '../middleware/authMiddleware.js';
import { roleMiddleware } from '../middleware/roleMiddleware.js';

const router = express.Router();

// Admin routes - manage all timetables
router.get('/', authMiddleware, roleMiddleware('admin'), getAllTimetables);
router.post('/', authMiddleware, roleMiddleware('admin'), createTimetableEntry);
router.put('/:id', authMiddleware, roleMiddleware('admin'), updateTimetableEntry);
router.delete('/:id', authMiddleware, roleMiddleware('admin'), deleteTimetableEntry);
router.delete('/class/:classId', authMiddleware, roleMiddleware('admin'), deleteClassTimetable);

// Public routes - get timetables
router.get('/class/:classId', authMiddleware, getClassTimetable);
router.get('/teacher/:teacherId', authMiddleware, getTeacherTimetable);

// Teacher personal timetable
router.get('/teacher-portal/my-timetable', authMiddleware, roleMiddleware('teacher'), getMyTimetable);

// Student personal timetable
router.get('/student-portal/my-timetable', authMiddleware, roleMiddleware('student'), getStudentTimetable);

export default router;
