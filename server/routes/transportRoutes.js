import express from 'express';
import { getAllBuses, createBus, assignStudentToBus, getBusDetails, getStudentBus, updateBus } from '../controllers/transportController.js';
import authMiddleware from '../middleware/authMiddleware.js';
import { roleMiddleware } from '../middleware/roleMiddleware.js';

const router = express.Router();

router.get('/', authMiddleware, getAllBuses);
router.post('/', authMiddleware, roleMiddleware('transport_manager', 'admin'), createBus);
router.put('/:busId', authMiddleware, roleMiddleware('transport_manager', 'admin'), updateBus);
router.post('/assign', authMiddleware, roleMiddleware('transport_manager', 'admin'), assignStudentToBus);
router.get('/:busId', authMiddleware, getBusDetails);
router.get('/student/:studentId', authMiddleware, getStudentBus);

export default router;
