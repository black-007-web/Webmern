const express = require('express');
const { protect } = require('../middleware/authMiddleware');
const {
  buyBook,
  getPurchasedBooks,
  deletePurchasedBook,
  getUserProfile,
} = require('../controllers/userController');

const chatController = require('../controllers/chatController');

const router = express.Router();

// ✅ User profile
router.get('/profile', protect, getUserProfile);

// Buy a book
router.post('/buy', protect, buyBook);

// Get all purchased books
router.get('/books', protect, getPurchasedBooks);

// Delete a purchased book
router.delete('/books/:bookId', protect, deletePurchasedBook);

// 🔹 NEW: Chat routes for users
router.post('/chat/send', protect, chatController.sendMessage);
router.get('/chat/messages/:userId', protect, chatController.getMessages);
router.get('/chat/contacts', protect, chatController.getUserContacts);
router.post('/chat/request-approval', protect, chatController.requestChatApproval);

module.exports = router;

