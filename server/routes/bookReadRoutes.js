const express = require('express');
const { protect } = require('../middleware/authMiddleware');
const { readBook } = require('../controllers/bookController');

const router = express.Router();

// 📖 Read a book (only if purchased)
// Returns Cloudinary-hosted PDF URL
router.get('/:bookId', protect, readBook);

module.exports = router;
