import express from 'express';
import { createNotification, getAllNotifications, getNotificationsForUser, markAsRead, deleteNotification } from '../controllers/notificationController.js';
import authMiddleware from '../middleware/authMiddleware.js';
import { roleMiddleware } from '../middleware/roleMiddleware.js';

const router = express.Router();

router.post('/', authMiddleware, roleMiddleware('admin'), createNotification);
router.get('/', authMiddleware, getAllNotifications);
router.get('/user/notifications', authMiddleware, getNotificationsForUser);
router.put('/:notificationId/read', authMiddleware, markAsRead);
router.delete('/:notificationId', authMiddleware, roleMiddleware('admin'), deleteNotification);

export default router;
