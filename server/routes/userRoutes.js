const express = require('express');
const { protect } = require('../middleware/authMiddleware');
const {
  buyBook,
  getPurchasedBooks,
  deletePurchasedBook,
  getUserProfile,
} = require('../controllers/userController');

const router = express.Router();

// ✅ NEW: Get user profile
router.get('/profile', protect, getUserProfile);

// Buy a book (POST /api/user/buy)
router.post('/buy', protect, buyBook);

// Get all purchased books for the logged-in user (GET /api/user/books)
router.get('/books', protect, getPurchasedBooks);

// Delete a purchased book (DELETE /api/user/books/:bookId)
router.delete('/books/:bookId', protect, deletePurchasedBook);

module.exports = router;
