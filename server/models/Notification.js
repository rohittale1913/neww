import mongoose from 'mongoose';

const notificationSchema = new mongoose.Schema({
  title: { type: String, required: true },
  message: { type: String, required: true },
  type: { type: String, enum: ['announcement', 'alert', 'reminder', 'update'], default: 'announcement' },
  targetRole: [String], // admin, teacher, student, parent, accountant, librarian, transport_manager
  targetUser: { type: mongoose.Schema.Types.ObjectId, ref: 'User' },
  targetClass: String,
  priority: { type: String, enum: ['low', 'medium', 'high'], default: 'medium' },
  isRead: { type: Boolean, default: false },
  readBy: [{ type: mongoose.Schema.Types.ObjectId, ref: 'User' }],
  attachments: [String],
  publishDate: { type: Date, default: Date.now },
  expiryDate: Date,
  createdBy: { type: mongoose.Schema.Types.ObjectId, ref: 'User' },
  createdAt: { type: Date, default: Date.now },
  updatedAt: { type: Date, default: Date.now }
});

export default mongoose.model('Notification', notificationSchema);
