import express from 'express';
import { register, login, logout, getCurrentUser, updateProfile, getAllUsers, deleteUser, resetPassword } from '../controllers/authController.js';
import authMiddleware from '../middleware/authMiddleware.js';
import roleMiddleware from '../middleware/roleMiddleware.js';

const router = express.Router();

router.post('/register', register);
router.post('/login', login);
router.post('/logout', authMiddleware, logout);
router.get('/me', authMiddleware, getCurrentUser);
router.put('/profile', authMiddleware, updateProfile);
router.post('/reset-password', resetPassword);
router.get('/users', authMiddleware, roleMiddleware('admin'), getAllUsers);
router.delete('/users/:userId', authMiddleware, roleMiddleware('admin'), deleteUser);

export default router;
