import Book from '../models/Book.js';
import BookIssue from '../models/BookIssue.js';

// Get all books
export const getAllBooks = async (req, res) => {
  try {
    const books = await Book.find();
    res.json(books);
  } catch (error) {
    res.status(500).json({ message: error.message });
  }
};

// Add book
export const addBook = async (req, res) => {
  try {
    const { title, author, isbn, publisher, publicationYear, category, description, totalQuantity, price, image, location } = req.body;

    const book = new Book({
      title,
      author,
      isbn,
      publisher,
      publicationYear,
      category,
      description,
      totalQuantity,
      availableQuantity: totalQuantity,
      price,
      image,
      location
    });

    await book.save();

    res.status(201).json({
      message: 'Book added successfully',
      book
    });
  } catch (error) {
    res.status(500).json({ message: error.message });
  }
};

// Issue book
export const issueBook = async (req, res) => {
  try {
    const { bookId, studentId, dueDate } = req.body;

    const book = await Book.findById(bookId);

    if (!book) {
      return res.status(404).json({ message: 'Book not found' });
    }

    if (book.availableQuantity <= 0) {
      return res.status(400).json({ message: 'Book not available' });
    }

    const bookIssue = new BookIssue({
      bookId,
      studentId,
      dueDate,
      status: 'issued'
    });

    await bookIssue.save();

    // Decrease available quantity
    book.availableQuantity -= 1;
    await book.save();

    res.status(201).json({
      message: 'Book issued successfully',
      bookIssue
    });
  } catch (error) {
    res.status(500).json({ message: error.message });
  }
};

// Return book
export const returnBook = async (req, res) => {
  try {
    const { bookIssueId } = req.body;

    const bookIssue = await BookIssue.findById(bookIssueId);

    if (!bookIssue) {
      return res.status(404).json({ message: 'Book issue record not found' });
    }

    const currentDate = new Date();
    let fine = 0;

    // Calculate fine if overdue
    if (currentDate > bookIssue.dueDate) {
      const daysOverdue = Math.floor((currentDate - bookIssue.dueDate) / (1000 * 60 * 60 * 24));
      fine = daysOverdue * 10; // $10 per day
    }

    bookIssue.returnDate = currentDate;
    bookIssue.status = 'returned';
    bookIssue.fine = fine;

    await bookIssue.save();

    // Increase available quantity
    const book = await Book.findById(bookIssue.bookId);
    book.availableQuantity += 1;
    await book.save();

    res.json({
      message: 'Book returned successfully',
      bookIssue,
      fine
    });
  } catch (error) {
    res.status(500).json({ message: error.message });
  }
};

// Get student's issued books
export const getStudentBooks = async (req, res) => {
  try {
    const { studentId } = req.params;
    const bookIssues = await BookIssue.find({ studentId })
      .populate('bookId', 'title author');
    res.json(bookIssues);
  } catch (error) {
    res.status(500).json({ message: error.message });
  }
};

// Search books
export const searchBooks = async (req, res) => {
  try {
    const { query } = req.query;
    const books = await Book.find({
      $or: [
        { title: { $regex: query, $options: 'i' } },
        { author: { $regex: query, $options: 'i' } },
        { category: { $regex: query, $options: 'i' } }
      ]
    });
    res.json(books);
  } catch (error) {
    res.status(500).json({ message: error.message });
  }
};

export default { getAllBooks, addBook, issueBook, returnBook, getStudentBooks, searchBooks };
