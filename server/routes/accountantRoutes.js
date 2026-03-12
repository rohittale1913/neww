import express from 'express';
import { getAllAccountants, getAccountantById, createAccountant, updateAccountant, deleteAccountant } from '../controllers/accountantController.js';
import authMiddleware from '../middleware/authMiddleware.js';
import roleMiddleware from '../middleware/roleMiddleware.js';

const router = express.Router();

router.get('/', authMiddleware, getAllAccountants);
router.get('/:id', authMiddleware, getAccountantById);
router.post('/', authMiddleware, roleMiddleware('admin'), createAccountant);
router.put('/:id', authMiddleware, roleMiddleware('admin'), updateAccountant);
router.delete('/:id', authMiddleware, roleMiddleware('admin'), deleteAccountant);

export default router;
