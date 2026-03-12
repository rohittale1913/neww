import express from 'express';
import { getAllTransportManagers, getTransportManagerById, createTransportManager, updateTransportManager, deleteTransportManager } from '../controllers/transportManagerController.js';
import authMiddleware from '../middleware/authMiddleware.js';
import roleMiddleware from '../middleware/roleMiddleware.js';

const router = express.Router();

router.get('/', authMiddleware, getAllTransportManagers);
router.get('/:id', authMiddleware, getTransportManagerById);
router.post('/', authMiddleware, roleMiddleware('admin'), createTransportManager);
router.put('/:id', authMiddleware, roleMiddleware('admin'), updateTransportManager);
router.delete('/:id', authMiddleware, roleMiddleware('admin'), deleteTransportManager);

export default router;
