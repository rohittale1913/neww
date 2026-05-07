import express from 'express';
import {
  generateTimetableForClass,
  getAllTimetables,
  getClassTimetable,
  getStudentTimetable,
  getTeacherTimetable,
  downloadTimetablePDF,
  downloadTimetableCSV,
  createTimetable,
  updateTimetable,
  deleteTimetable,
  validateTimetable,
  validateGenerationPrerequisites
} from '../controllers/dailyTimetableController.js';
import authMiddleware from '../middleware/authMiddleware.js';
import roleMiddleware from '../middleware/roleMiddleware.js';

const router = express.Router();

// Public routes (authenticated users)
router.get('/my-schedule', authMiddleware, getStudentTimetable);
router.get('/teacher/schedule', authMiddleware, getTeacherTimetable);

// Download routes
router.get('/download/:classId/pdf', authMiddleware, downloadTimetablePDF);
router.get('/download/:classId/csv', authMiddleware, downloadTimetableCSV);

// Admin routes
router.get('/', authMiddleware, roleMiddleware(['admin']), getAllTimetables);
router.get('/class/:classId', authMiddleware, getClassTimetable);
// Allow authenticated users to check prerequisites and generate timetables
router.post('/check-prerequisites', authMiddleware, validateGenerationPrerequisites);
router.post('/generate', authMiddleware, generateTimetableForClass);
router.post('/validate', authMiddleware, roleMiddleware(['admin']), validateTimetable);
router.post('/', authMiddleware, roleMiddleware(['admin']), createTimetable);
router.put('/:id', authMiddleware, roleMiddleware(['admin']), updateTimetable);
router.delete('/:id', authMiddleware, roleMiddleware(['admin']), deleteTimetable);

export default router;
