import mongoose from 'mongoose';

const transportSchema = new mongoose.Schema({
  busNumber: { type: String, required: true, unique: true },
  route: { type: String, required: true },
  driverName: { type: String, required: true },
  driverPhone: String,
  conductorName: String,
  conductorPhone: String,
  capacity: Number,
  startPoint: String,
  endPoint: String,
  stops: [{
    stopName: String,
    stopTime: String,
    location: String
  }],
  students: [{ type: mongoose.Schema.Types.ObjectId, ref: 'Student' }],
  operatingDays: [String],
  fare: Number,
  registrationNumber: String,
  insuranceProvider: String,
  insuranceExpiry: Date,
  lastMaintenance: Date,
  isActive: { type: Boolean, default: true },
  createdAt: { type: Date, default: Date.now },
  updatedAt: { type: Date, default: Date.now }
});

export default mongoose.model('Transport', transportSchema);
