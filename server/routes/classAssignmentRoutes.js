import express from 'express';
import {
  assignTeacherToClass,
  getAllAssignments,
  getAssignmentWithConnections,
  updateAssignment,
  deleteAssignment,
  getAvailableTeachersForClass,
  getAllClassesAndSections,
  getClassStudents
} from '../controllers/classAssignmentController.js';
import authMiddleware from '../middleware/authMiddleware.js';
import { roleMiddleware } from '../middleware/roleMiddleware.js';

const router = express.Router();

// Public routes (authenticated but not admin-only)
// Teachers need access to view classes and create assignments
router.get('/all', authMiddleware, getAllAssignments);
router.get('/classes-sections', authMiddleware, getAllClassesAndSections);
router.get('/class-students', authMiddleware, getClassStudents);
// Teachers can assign themselves to classes
router.post('/assign', authMiddleware, assignTeacherToClass);

// Admin-only routes
router.use(authMiddleware, roleMiddleware('admin'));
router.get('/available-teachers', getAvailableTeachersForClass);
router.get('/:assignmentId', getAssignmentWithConnections);
router.put('/:assignmentId', updateAssignment);
router.delete('/:assignmentId', deleteAssignment);

export default router;
