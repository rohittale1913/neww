import express from 'express';
import { getAllBooks, addBook, issueBook, returnBook, getStudentBooks, searchBooks } from '../controllers/libraryController.js';
import authMiddleware from '../middleware/authMiddleware.js';
import { roleMiddleware } from '../middleware/roleMiddleware.js';

const router = express.Router();

router.get('/', authMiddleware, getAllBooks);
router.get('/search', authMiddleware, searchBooks);
router.post('/', authMiddleware, roleMiddleware('librarian', 'admin'), addBook);
router.post('/issue', authMiddleware, roleMiddleware('librarian', 'admin'), issueBook);
router.post('/return', authMiddleware, roleMiddleware('librarian', 'admin'), returnBook);
router.get('/student/:studentId', authMiddleware, getStudentBooks);

export default router;
