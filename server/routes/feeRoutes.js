import express from 'express';
import {
  getAllFees,
  getStudentFees,
  getPendingFees,
  addFee,
  bulkAddFees,
  recordPayment,
  getPaymentHistory,
  getFeeStatistics,
  createFeeTemplate,
  getFeeTemplates,
  updateFeeTemplate,
  deleteFeeTemplate,
  getStudentFeeSummary,
  updateFee
} from '../controllers/feeController.js';
import authMiddleware from '../middleware/authMiddleware.js';
import { roleMiddleware } from '../middleware/roleMiddleware.js';

const router = express.Router();

// Specific routes first (most specific to least specific)

// Get statistics (before generic routes)
router.get('/statistics', authMiddleware, roleMiddleware('admin', 'accountant'), getFeeStatistics);

// Get payment history for a fee
router.get('/payment-history/:feeId', authMiddleware, getPaymentHistory);

// Fee template routes (before generic routes)
router.get('/templates/list', authMiddleware, getFeeTemplates);
router.post('/templates', authMiddleware, roleMiddleware('admin', 'accountant'), createFeeTemplate);
router.put('/templates/:templateId', authMiddleware, roleMiddleware('admin', 'accountant'), updateFeeTemplate);
router.delete('/templates/:templateId', authMiddleware, roleMiddleware('admin', 'accountant'), deleteFeeTemplate);

// Pending fees
router.get('/pending', authMiddleware, roleMiddleware('admin', 'accountant'), getPendingFees);

// Get student fees summary
router.get('/summary/:studentId', authMiddleware, getStudentFeeSummary);

// Get student fees list
router.get('/student/:studentId', authMiddleware, getStudentFees);

// Generic routes (least specific)
// GET all fees - Admin and Accountant can view
router.get('/', authMiddleware, roleMiddleware('admin', 'accountant'), getAllFees);

// Fee CRUD - ONLY Accountant can create/update fees
router.post('/', authMiddleware, roleMiddleware('accountant'), addFee);
router.post('/bulk', authMiddleware, roleMiddleware('accountant'), bulkAddFees);
router.put('/:feeId', authMiddleware, roleMiddleware('accountant'), updateFee);

// Payment recording - Students and all roles
router.post('/pay', authMiddleware, recordPayment);

export default router;
