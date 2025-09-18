const express = require('express');
const multer = require('multer');
const {
  loginAdmin,
  getAllUsers,
  deleteUser,
  createBook,
} = require('../controllers/adminController');
const { adminProtect } = require('../middleware/adminMiddleware');
const { storage } = require('../config/cloudinary');

const router = express.Router();

// Multer setup using Cloudinary storage engine
const upload = multer({ storage });

// Admin login route (public)
router.post('/login', loginAdmin);

// Get current logged-in admin info (protected)
router.get('/me', adminProtect, (req, res) => {
  res.json({
    admin: {
      _id: req.admin._id,
      name: req.admin.name,
      email: req.admin.email,
    },
  });
});

// Admin user management routes (protected)
router.get('/users', adminProtect, getAllUsers);
router.delete('/users/:id', adminProtect, deleteUser);

// Book management routes (protected)
// Create a new book (with file uploads)
router.post(
  '/books',
  adminProtect,
  upload.fields([
    { name: 'image', maxCount: 1 },
    { name: 'pdf', maxCount: 1 },
  ]),
  createBook
);

// Delete a book by ID (protected)
router.delete('/books/:bookId', adminProtect, async (req, res, next) => {
  try {
    // Delegate to bookController deleteBook method
    const bookController = require('../controllers/bookController');
    await bookController.deleteBook(req, res);
  } catch (error) {
    next(error);
  }
});

// 🔹 NEW: Admin chat routes integration
const chatController = require('../controllers/chatController');

router.get('/chat/users', adminProtect, chatController.getAdminUsers);
router.post('/chat/announcement', adminProtect, chatController.sendAnnouncement);
router.post('/chat/kick', adminProtect, chatController.kickUser);
router.delete('/chat/message/:messageId', adminProtect, chatController.deleteMessage);
router.delete('/chat/clear/:userId', adminProtect, chatController.clearChatHistory);
router.patch('/chat/approve/:conversationId', adminProtect, chatController.approveChatRequest);

module.exports = router;

