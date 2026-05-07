import express from 'express';
import {
  getAllFees,
  getEntityFees,
  getMyFees,
  createFee,
  bulkCreateFeesFromStructure,
  updateFee,
  recordPayment,
  deleteFee,
  waiveFee,
  getPendingFees,
  getOverdueFees,
  getFeeStatistics,
  getEntityFeeStatistics,
  getFeeStructures,
  createFeeStructure,
  updateFeeStructure,
  deleteFeeStructure
} from '../controllers/feeController.js';
import authMiddleware from '../middleware/authMiddleware.js';
import { roleMiddleware } from '../middleware/roleMiddleware.js';

const router = express.Router();

// ==================== FEE MANAGEMENT ROUTES ====================

// Get all fees (Admin/Accountant only)
router.get('/', authMiddleware, roleMiddleware('admin', 'accountant'), getAllFees);

// Get my fees (Students, Teachers, Staff)
router.get('/my-fees', authMiddleware, getMyFees);

// Get fees for specific entity (Admin/Accountant only)
router.get('/entity/:entityType/:entityId', authMiddleware, roleMiddleware('admin', 'accountant'), getEntityFees);

// Create fee (Admin/Accountant only)
router.post('/', authMiddleware, roleMiddleware('admin', 'accountant'), createFee);

// Bulk create fees from structure (Admin only)
router.post('/bulk/from-structure', authMiddleware, roleMiddleware('admin'), bulkCreateFeesFromStructure);

// Update fee (Admin/Accountant only)
router.put('/:id', authMiddleware, roleMiddleware('admin', 'accountant'), updateFee);

// Record payment (Admin/Accountant/User)
router.post('/:id/pay', authMiddleware, recordPayment);

// Waive fee (Admin only)
router.post('/:id/waive', authMiddleware, roleMiddleware('admin'), waiveFee);

// Delete fee (Admin only)
router.delete('/:id', authMiddleware, roleMiddleware('admin'), deleteFee);

// Get pending fees (Admin/Accountant)
router.get('/pending', authMiddleware, roleMiddleware('admin', 'accountant'), getPendingFees);

// Get overdue fees (Admin/Accountant)
router.get('/overdue', authMiddleware, roleMiddleware('admin', 'accountant'), getOverdueFees);

// Get fee statistics (Admin/Accountant)
router.get('/statistics/all', authMiddleware, roleMiddleware('admin', 'accountant'), getFeeStatistics);

// Get entity-wise statistics (Admin/Accountant)
router.get('/statistics/:entityType/:entityId', authMiddleware, roleMiddleware('admin', 'accountant'), getEntityFeeStatistics);

// ==================== FEE STRUCTURE ROUTES ====================

// Get all fee structures (Admin only)
router.get('/structure/all', authMiddleware, roleMiddleware('admin'), getFeeStructures);

// Create fee structure (Admin only)
router.post('/structure', authMiddleware, roleMiddleware('admin'), createFeeStructure);

// Update fee structure (Admin only)
router.put('/structure/:id', authMiddleware, roleMiddleware('admin'), updateFeeStructure);

// Delete fee structure (Admin only)
router.delete('/structure/:id', authMiddleware, roleMiddleware('admin'), deleteFeeStructure);

export default router;
