import express from 'express';
import {
  assignTeacherToClass,
  getAllAssignments,
  getAssignmentWithConnections,
  updateAssignment,
  deleteAssignment,
  getAvailableTeachersForClass,
  getAllClassesAndSections,
  getClassStudents,
  getSubjectsForClass
} from '../controllers/classAssignmentController.js';
import authMiddleware from '../middleware/authMiddleware.js';
import { roleMiddleware } from '../middleware/roleMiddleware.js';

const router = express.Router();

// All routes require authentication and (admin or accountant)
router.use(authMiddleware, roleMiddleware('admin', 'accountant'));

// Assignment management routes
router.post('/assign', assignTeacherToClass);
router.get('/all', getAllAssignments);
router.get('/available-teachers', getAvailableTeachersForClass);
router.get('/classes-sections', getAllClassesAndSections);
router.get('/class-students', getClassStudents);
router.get('/:assignmentId', getAssignmentWithConnections);
router.put('/:assignmentId', updateAssignment);
router.delete('/:assignmentId', deleteAssignment);

// Separate route for getting subjects - accessible to all authenticated users (teachers, admin, accountant)
router.get('/subjects/:classId', authMiddleware, getSubjectsForClass);

export default router;
