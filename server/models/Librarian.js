import mongoose from 'mongoose';

const librarianSchema = new mongoose.Schema({
  librarianId: { type: String, unique: true, required: true },
  userId: { type: mongoose.Schema.Types.ObjectId, ref: 'User', required: true },
  name: { type: String, required: true },
  department: { type: String, default: 'Library' },
  qualification: String,
  experience: Number,
  phone: String,
  email: String,
  joiningDate: { type: Date, default: Date.now },
  salary: Number,
  specialization: String,
  booksManaged: Number,
  libraryArea: String,
  isActive: { type: Boolean, default: true },
  createdAt: { type: Date, default: Date.now },
  updatedAt: { type: Date, default: Date.now }
});

export default mongoose.model('Librarian', librarianSchema);
