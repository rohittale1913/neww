import express from 'express';
import { getAllTeachers, getTeacherById, createTeacher, updateTeacher, deleteTeacher } from '../controllers/teacherController.js';
import authMiddleware from '../middleware/authMiddleware.js';
import { roleMiddleware } from '../middleware/roleMiddleware.js';

const router = express.Router();

router.get('/', authMiddleware, getAllTeachers);
router.get('/:id', authMiddleware, getTeacherById);
router.post('/', authMiddleware, roleMiddleware('admin'), createTeacher);
router.put('/:id', authMiddleware, roleMiddleware('admin'), updateTeacher);
router.delete('/:id', authMiddleware, roleMiddleware('admin'), deleteTeacher);

export default router;
