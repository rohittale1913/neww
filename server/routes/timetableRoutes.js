import express from 'express';
import {
  getAllTimetables,
  getClassTimetable,
  getStudentTimetable,
  getTeacherTimetable,
  createTimetable,
  updateTimetable,
  deleteTimetable,
  bulkCreateTimetable
} from '../controllers/timetableController.js';
import authMiddleware from '../middleware/authMiddleware.js';
import roleMiddleware from '../middleware/roleMiddleware.js';

const router = express.Router();

// Public routes (authenticated users)
router.get('/my-schedule', authMiddleware, getStudentTimetable);
router.get('/teacher/schedule', authMiddleware, getTeacherTimetable);

// Admin routes
router.get('/', authMiddleware, roleMiddleware(['admin']), getAllTimetables);
router.get('/class/:classId', authMiddleware, getClassTimetable);
router.post('/', authMiddleware, roleMiddleware(['admin']), createTimetable);
router.put('/:id', authMiddleware, roleMiddleware(['admin']), updateTimetable);
router.delete('/:id', authMiddleware, roleMiddleware(['admin']), deleteTimetable);
router.post('/bulk/create', authMiddleware, roleMiddleware(['admin']), bulkCreateTimetable);

export default router;
