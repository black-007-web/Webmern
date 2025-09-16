const express = require('express');
const router = express.Router();
const { adminProtect } = require('../middleware/adminMiddleware');
const { getAllBooks, createBook, deleteBook } = require('../controllers/bookController');
const { upload } = require('../middleware/uploadMiddleware'); // your updated upload middleware

// GET all books (admin only)
router.get('/', adminProtect, getAllBooks);

// POST create a new book (admin only)
// Uses Cloudinary upload middleware for PDF and image
router.post('/', adminProtect, upload, createBook);

// DELETE a book by ID (admin only)
router.delete('/:bookId', adminProtect, deleteBook);

module.exports = router;
