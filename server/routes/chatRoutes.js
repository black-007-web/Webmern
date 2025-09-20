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

// =====================
// User routes
// =====================
router.post('/send', protect, sendMessage); // send message (user)
router.get('/messages/:userId', protect, getMessages); // get messages (user)
router.get('/user/contacts', protect, getUserContacts); // get user contacts
router.post('/request-approval', protect, requestChatApproval); // request chat approval

// =====================
// Admin routes
// =====================
router.post('/admin/send', adminProtect, sendMessage);           // send message (admin)
router.get('/admin/messages/:userId', adminProtect, getMessages); // get messages (admin)
router.get('/admin/users', adminProtect, getAdminUsers);         // list users
router.post('/admin/announcement', adminProtect, sendAnnouncement); // broadcast announcement
router.post('/admin/kick', adminProtect, kickUser);              // kick a user
router.delete('/admin/message/:messageId', adminProtect, deleteMessage); // delete a message
router.delete('/admin/clear/:userId', adminProtect, clearChatHistory);   // clear chat history
router.patch('/admin/approve/:conversationId', adminProtect, approveChatRequest); // approve chat request

module.exports = router;
