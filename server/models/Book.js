import mongoose from 'mongoose';

const bookSchema = new mongoose.Schema({
  title: { type: String, required: true },
  author: { type: String, required: true },
  isbn: { type: String, unique: true },
  publisher: String,
  publicationYear: Number,
  category: String,
  description: String,
  totalQuantity: { type: Number, default: 0 },
  availableQuantity: { type: Number, default: 0 },
  location: String, // Shelf location
  price: Number,
  image: String,
  isActive: { type: Boolean, default: true },
  createdAt: { type: Date, default: Date.now },
  updatedAt: { type: Date, default: Date.now }
});

export default mongoose.model('Book', bookSchema);
