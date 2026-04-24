import express from 'express';
import { getAllStudents, getStudentById, createStudent, updateStudent, deleteStudent, getStudentByUserId, getStudentProfileWithClassTeacher } from '../controllers/studentController.js';
import authMiddleware from '../middleware/authMiddleware.js';
import { roleMiddleware } from '../middleware/roleMiddleware.js';

const router = express.Router();

// Student profile endpoints
router.get('/profile/current', authMiddleware, getStudentByUserId);
router.get('/profile/with-teacher', authMiddleware, getStudentProfileWithClassTeacher);
router.get('/profile/with-teacher/:userId', authMiddleware, getStudentProfileWithClassTeacher);

// Standard CRUD endpoints
router.get('/', authMiddleware, getAllStudents);
router.get('/:id', authMiddleware, getStudentById);
router.post('/', authMiddleware, roleMiddleware('admin'), createStudent);
router.put('/:id', authMiddleware, roleMiddleware('admin'), updateStudent);
router.delete('/:id', authMiddleware, roleMiddleware('admin'), deleteStudent);

export default router;
