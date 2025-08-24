// Backend/routes/bookReadRoutes.js
const express = require('express');
const { protect } = require('../middleware/authMiddleware');
const { readBook } = require('../controllers/bookController');

const router = express.Router();

// 📖 Read a book (only if purchased)
router.get('/:bookId', protect, readBook);

module.exports = router;
