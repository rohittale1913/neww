import express from 'express';
import { getAllLibrarians, getLibrarianById, createLibrarian, updateLibrarian, deleteLibrarian } from '../controllers/librarianController.js';
import authMiddleware from '../middleware/authMiddleware.js';
import roleMiddleware from '../middleware/roleMiddleware.js';

const router = express.Router();

router.get('/', authMiddleware, getAllLibrarians);
router.get('/:id', authMiddleware, getLibrarianById);
router.post('/', authMiddleware, roleMiddleware('admin'), createLibrarian);
router.put('/:id', authMiddleware, roleMiddleware('admin'), updateLibrarian);
router.delete('/:id', authMiddleware, roleMiddleware('admin'), deleteLibrarian);

export default router;
