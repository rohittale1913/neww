import mongoose from 'mongoose';

const accountantSchema = new mongoose.Schema({
  accountantId: { type: String, unique: true, required: true },
  userId: { type: mongoose.Schema.Types.ObjectId, ref: 'User', required: true },
  name: { type: String, required: true },
  department: { type: String, default: 'Finance' },
  dateOfBirth: { type: Date, required: true },
  gender: { type: String, enum: ['Male', 'Female', 'Other'], required: true },
  qualification: { type: String, required: true },
  experience: {type:Number,required:true},
  phone: { type: Number, required: true },
  email: { type: String, required: true },
  joiningDate: { type: Date, default: Date.now },
  salary: Number,
  bankAccount: { type: String, required: true },
  ifscCode: { type: String, required: true },
  isActive: { type: Boolean, default: true },
  createdAt: { type: Date, default: Date.now },
  updatedAt: { type: Date, default: Date.now }
});

export default mongoose.model('Accountant', accountantSchema);
