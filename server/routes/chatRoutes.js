// Backend/routes/chatRoutes.js - Chat API routes
const express = require('express');
const router = express.Router();
const {
  sendMessage,
  getMessages,
  getUserContacts,
  getAdminUsers,
  sendAnnouncement,
  kickUser,
  deleteMessage,
  clearChatHistory,
  requestChatApproval,
  approveChatRequest
} = require('../controllers/chatController');

const { protect } = require('../middleware/authMiddleware');
const { adminProtect } = require('../middleware/adminMiddleware');

// User routes
router.post('/send', protect, sendMessage);
router.get('/messages/:userId', protect, getMessages);
router.get('/user/contacts', protect, getUserContacts);
router.post('/request-approval', protect, requestChatApproval);

// Admin routes
router.get('/admin/users', adminProtect, getAdminUsers);
router.post('/admin/announcement', adminProtect, sendAnnouncement);
router.post('/admin/kick', adminProtect, kickUser);
router.delete('/admin/message/:messageId', adminProtect, deleteMessage);
router.delete('/admin/clear/:userId', adminProtect, clearChatHistory);
router.patch('/admin/approve/:conversationId', adminProtect, approveChatRequest);

module.exports = router;
