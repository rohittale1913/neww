import mongoose from 'mongoose';

const transportManagerSchema = new mongoose.Schema({
  transportManagerId: { type: String, unique: true, required: true },
  userId: { type: mongoose.Schema.Types.ObjectId, ref: 'User', required: true },
  name: { type: String, required: true },
  department: { type: String, default: 'Transport' },
  qualification: String,
  experience: Number,
  phone: String,
  email: String,
  joiningDate: { type: Date, default: Date.now },
  salary: Number,
  licenseNumber: String,
  licenseExpiry: Date,
  busesManaged: Number,
  routesManaged: Number,
  isActive: { type: Boolean, default: true },
  createdAt: { type: Date, default: Date.now },
  updatedAt: { type: Date, default: Date.now }
});

export default mongoose.model('TransportManager', transportManagerSchema);
