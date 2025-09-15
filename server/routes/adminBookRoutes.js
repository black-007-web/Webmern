const express = require('express');
const router = express.Router();
const { adminProtect } = require('../middleware/adminMiddleware');
const { createBook, deleteBook } = require('../controllers/bookController');
const multer = require('multer');
const { storage } = require('../config/cloudinary');

// Multer middleware with Cloudinary storage for image and pdf
const upload = multer({ storage }).fields([
  { name: 'image', maxCount: 1 },
  { name: 'pdf', maxCount: 1 },
]);

// Route to create a new book (admin only)
router.post('/', adminProtect, upload, createBook);

// Route to delete a book by ID (admin only)
router.delete('/:bookId', adminProtect, deleteBook);

module.exports = router;
