import Notification from '../models/Notification.js';

// Create notification
export const createNotification = async (req, res) => {
  try {
    const { title, message, type, targetRole, targetClass, priority, attachments, expiryDate } = req.body;

    const notification = new Notification({
      title,
      message,
      type,
      targetRole: targetRole || [],
      targetClass,
      priority,
      attachments: attachments || [],
      expiryDate,
      createdBy: req.user.id
    });

    await notification.save();

    res.status(201).json({
      message: 'Notification created successfully',
      notification
    });
  } catch (error) {
    res.status(500).json({ message: error.message });
  }
};

// Get all notifications
export const getAllNotifications = async (req, res) => {
  try {
    const notifications = await Notification.find()
      .populate('createdBy', 'name')
      .sort({ publishDate: -1 });
    res.json(notifications);
  } catch (error) {
    res.status(500).json({ message: error.message });
  }
};

// Get notifications for user
export const getNotificationsForUser = async (req, res) => {
  try {
    const userRole = req.user.role;
    const notifications = await Notification.find({
      targetRole: userRole,
      $or: [
        { expiryDate: { $gte: Date.now() } },
        { expiryDate: null }
      ]
    })
      .populate('createdBy', 'name')
      .sort({ publishDate: -1 });

    res.json(notifications);
  } catch (error) {
    res.status(500).json({ message: error.message });
  }
};

// Mark as read
export const markAsRead = async (req, res) => {
  try {
    const { notificationId } = req.params;
    const userId = req.user.id;

    const notification = await Notification.findByIdAndUpdate(
      notificationId,
      { 
        isRead: true,
        $addToSet: { readBy: userId }
      },
      { new: true }
    );

    if (!notification) {
      return res.status(404).json({ message: 'Notification not found' });
    }

    res.json({ message: 'Marked as read', notification });
  } catch (error) {
    res.status(500).json({ message: error.message });
  }
};

// Delete notification
export const deleteNotification = async (req, res) => {
  try {
    const { notificationId } = req.params;

    const notification = await Notification.findByIdAndDelete(notificationId);

    if (!notification) {
      return res.status(404).json({ message: 'Notification not found' });
    }

    res.json({ message: 'Notification deleted successfully' });
  } catch (error) {
    res.status(500).json({ message: error.message });
  }
};

export default { createNotification, getAllNotifications, getNotificationsForUser, markAsRead, deleteNotification };
