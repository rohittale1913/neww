import express from 'express';
import { getAllClasses, createClass, updateClass, getAllSubjects, createSubject, getClassTimetable, createTimetableEntry } from '../controllers/classController.js';
import authMiddleware from '../middleware/authMiddleware.js';
import { roleMiddleware } from '../middleware/roleMiddleware.js';

const router = express.Router();

// Classes
router.get('/', authMiddleware, getAllClasses);
router.post('/', authMiddleware, roleMiddleware('admin'), createClass);
router.put('/:classId', authMiddleware, roleMiddleware('admin'), updateClass);

// Subjects
router.get('/subjects', authMiddleware, getAllSubjects);
router.post('/subjects', authMiddleware, roleMiddleware('admin'), createSubject);

// Timetable
router.get('/timetable/:classId', authMiddleware, getClassTimetable);
router.post('/timetable', authMiddleware, roleMiddleware('admin'), createTimetableEntry);

export default router;
