import express from 'express';
import { getAllFees, getStudentFees, getPendingFees, addFee, recordPayment, getFeeStatistics } from '../controllers/feeController.js';
import authMiddleware from '../middleware/authMiddleware.js';
import { roleMiddleware } from '../middleware/roleMiddleware.js';

const router = express.Router();

router.get('/', authMiddleware, getAllFees);
router.get('/student/:studentId', authMiddleware, getStudentFees);
router.get('/pending', authMiddleware, roleMiddleware('admin', 'accountant'), getPendingFees);
router.post('/', authMiddleware, roleMiddleware('admin', 'accountant'), addFee);
router.post('/pay', authMiddleware, recordPayment);
router.get('/statistics', authMiddleware, roleMiddleware('admin', 'accountant'), getFeeStatistics);

export default router;
