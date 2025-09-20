// controllers/chatController.js
const Message = require('../models/Message');
const Conversation = require('../models/Conversation');
const User = require('../models/User');
const Admin = require('../models/admin');
const multer = require('multer');
const path = require('path');
const fs = require('fs');

// Configure multer for file uploads
const storage = multer.diskStorage({
  destination: function (req, file, cb) {
    const uploadDir = 'uploads/chat-files';
    if (!fs.existsSync(uploadDir)) {
      fs.mkdirSync(uploadDir, { recursive: true });
    }
    cb(null, uploadDir);
  },
  filename: function (req, file, cb) {
    const uniqueSuffix = Date.now() + '-' + Math.round(Math.random() * 1E9);
    cb(null, file.fieldname + '-' + uniqueSuffix + path.extname(file.originalname));
  }
});

const fileFilter = (req, file, cb) => {
  const allowedTypes = [
    'image/jpeg', 'image/png', 'image/gif', 'image/webp',
    'application/pdf', 'text/plain',
    'application/msword', 'application/vnd.openxmlformats-officedocument.wordprocessingml.document'
  ];
  if (allowedTypes.includes(file.mimetype)) {
    cb(null, true);
  } else {
    cb(new Error('Unsupported file type'), false);
  }
};

const upload = multer({
  storage: storage,
  limits: {
    fileSize: 10 * 1024 * 1024 // 10MB limit
  },
  fileFilter: fileFilter
});

// Helper: get auth context (user/admin) robustly
function getAuthContext(req) {
  // adminProtect sets req.admin, protect sets req.user
  if (req.admin) {
    return { id: req.admin._id, model: 'Admin', isAdmin: true, raw: req.admin };
  }
  if (req.user) {
    return { id: req.user._id, model: 'User', isAdmin: !!req.user.isAdmin, raw: req.user };
  }
  // fallback: if middleware wasn't used correctly
  return { id: null, model: null, isAdmin: false, raw: null };
}

// Send message
const sendMessage = async (req, res) => {
  try {
    // Auth context (works for both protect and adminProtect)
    const auth = getAuthContext(req);
    if (!auth.id) {
      return res.status(401).json({ message: 'Not authorized' });
    }

    // NOTE: frontend sends FormData — message will be string or ''.
    // If front-end uses JSON, ensure body parsing already enabled.
    const { message } = req.body;
    // If frontend passes isAdmin flag in body, prefer actual auth context
    // But allow boolean in body for backward compatibility
    const bodyIsAdmin = req.body.isAdmin === 'true' || req.body.isAdmin === true;
    const senderModel = auth.isAdmin || bodyIsAdmin ? 'Admin' : 'User';
    const senderId = auth.id;

    let { receiverId } = req.body;
    // guard
    if (!receiverId && !req.file) {
      return res.status(400).json({ message: 'Receiver and message/file are required' });
    }

    // If receiverId is the string 'admin', resolve to actual admin id (first admin)
    let actualReceiverId = receiverId;
    if (receiverId === 'admin') {
      const adminUser = await Admin.findOne().sort({ createdAt: 1 });
      if (!adminUser) return res.status(404).json({ message: 'Admin not found' });
      actualReceiverId = adminUser._id.toString();
    }

    // Determine receiver model:
    // If actualReceiverId === admin user's id --> Admin, otherwise User
    let receiverModel = 'User';
    if (actualReceiverId) {
      // compare with an actual admin id if available
      const adminUser = await Admin.findOne().sort({ createdAt: 1 });
      if (adminUser && adminUser._id.toString() === actualReceiverId.toString()) {
        receiverModel = 'Admin';
      }
    }

    // Decide / find conversation
    let conversation = null;

    // If either side is Admin (sender or receiver resolves to admin) we use admin-user conversation helper
    const eitherIsAdmin = senderModel === 'Admin' || receiverModel === 'Admin';

    if (eitherIsAdmin) {
      // getOrCreateAdminConversation(userId, adminId)
      // Make sure to pass (userId, adminId) in correct order:
      let userIdParam, adminIdParam;
      if (senderModel === 'Admin') {
        // Admin sending => other side is user
        userIdParam = actualReceiverId;
        adminIdParam = senderId;
      } else if (receiverModel === 'Admin') {
        // User sending to admin
        userIdParam = senderId;
        adminIdParam = actualReceiverId;
      } else {
        // fallback (shouldn't happen) — find an admin to act as admin
        const adminUser = await Admin.findOne().sort({ createdAt: 1 });
        if (!adminUser) return res.status(500).json({ message: 'No admin available' });
        userIdParam = senderModel === 'User' ? senderId : actualReceiverId;
        adminIdParam = adminUser._id;
      }

      conversation = await Conversation.getOrCreateAdminConversation(userIdParam, adminIdParam);
    } else {
      // user-to-user conversation
      conversation = await Conversation.findBetweenUsers(senderId, senderModel, actualReceiverId, receiverModel);
      if (!conversation) {
        // create but require admin approval by default
        conversation = new Conversation({
          participants: [
            { user: senderId, userModel: senderModel },
            { user: actualReceiverId, userModel: receiverModel }
          ],
          conversationType: 'direct',
          settings: {
            allowUserToUser: false,
            adminApprovalRequired: true,
            isApproved: false
          }
        });
        await conversation.save();
        return res.status(403).json({ message: 'User-to-user chat requires admin approval' });
      }
      if (!conversation.settings.isApproved) {
        return res.status(403).json({ message: 'This conversation is pending admin approval' });
      }
    }

    // Handle uploaded file (multer single('file') places file on req.file)
    let fileData = null;
    if (req.file) {
      fileData = {
        fileUrl: `/uploads/chat-files/${req.file.filename}`,
        fileName: req.file.originalname,
        fileType: req.file.mimetype,
        fileSize: req.file.size
      };
    }

    // Ensure message is always string
    const messageText = (typeof message === 'string') ? message : (req.body.message || '');

    const newMessage = new Message({
      sender: senderId,
      senderModel,
      receiver: actualReceiverId,
      receiverModel,
      conversation: conversation._id,
      message: messageText || '',
      ...fileData
    });

    await newMessage.save();
    await conversation.updateLastActivity(newMessage._id);
    await newMessage.populate('sender', 'name email isAdmin');

    const io = req.app.get('io');
    // emit to conversation room
    if (io && conversation && conversation._id) {
      io.to(conversation._id.toString()).emit('receiveMessage', newMessage);
    }

    return res.status(201).json(newMessage);
  } catch (error) {
    console.error('Send message error:', error);
    return res.status(500).json({ message: 'Server error', error: error.message });
  }
};

// Get messages for a conversation
const getMessages = async (req, res) => {
  try {
    const { userId } = req.params;
    const auth = getAuthContext(req);
    if (!auth.id) return res.status(401).json({ message: 'Not authorized' });

    // if admin made the request use admin id; otherwise user id
    const currentUserId = auth.id;
    const isRequesterAdmin = auth.isAdmin;

    let conversation = null;

    if (userId === 'admin') {
      const adminUser = await Admin.findOne().sort({ createdAt: 1 });
      if (!adminUser) return res.status(404).json({ message: 'Admin not found' });
      conversation = await Conversation.getAdminUserConversation(currentUserId, adminUser._id);
    } else {
      // If requester is admin and wants messages for userId, get admin-user conversation
      if (isRequesterAdmin) {
        // admin wants to see conversation between admin and the userId
        const adminId = currentUserId;
        conversation = await Conversation.getAdminUserConversation(userId, adminId);
      } else {
        // regular user requesting messages with another user/admin
        const userModel = 'User';
        const targetModel = 'User'; // by default assume target is user
        // If userId equals admin id in DB, adjust targetModel
        const adminUser = await Admin.findOne().sort({ createdAt: 1 });
        if (adminUser && adminUser._id.toString() === userId) {
          // target is admin
          conversation = await Conversation.getAdminUserConversation(currentUserId, adminUser._id);
        } else {
          conversation = await Conversation.findBetweenUsers(currentUserId, 'User', userId, targetModel);
        }
      }
    }

    if (!conversation) return res.json({ messages: [], conversationId: null });

    const messages = await Message.getConversationMessages(conversation._id, { limit: 50, includeDeleted: false });
    // mark unread count reset for this user
    await conversation.updateUnreadCount(currentUserId, isRequesterAdmin ? 'Admin' : 'User', false);

    return res.json({ messages: messages.reverse(), conversationId: conversation._id });
  } catch (error) {
    console.error('Get messages error:', error);
    return res.status(500).json({ message: 'Server error', error: error.message });
  }
};

// Get user contacts
const getUserContacts = async (req, res) => {
  try {
    const auth = getAuthContext(req);
    if (!auth.id) return res.status(401).json({ message: 'Not authorized' });

    const userId = auth.id;
    const conversations = await Conversation.getUserConversations(userId, 'User');
    const contacts = [];

    const adminUser = await Admin.findOne().sort({ createdAt: 1 });
    if (adminUser) contacts.push({ _id: 'admin', name: 'SYSTEM_ADMIN', email: adminUser.email, isAdmin: true });

    for (const conversation of conversations) {
      if (conversation.conversationType === 'direct' && conversation.settings.isApproved) {
        const others = conversation.getOtherParticipants(userId, 'User');
        for (const participant of others) {
          await participant.populate('user', 'name email isAdmin');
          contacts.push({
            _id: participant.user._id,
            name: participant.user.name,
            email: participant.user.email,
            isAdmin: participant.user.isAdmin || false
          });
        }
      }
    }

    return res.json(contacts);
  } catch (error) {
    console.error('Get user contacts error:', error);
    return res.status(500).json({ message: 'Server error', error: error.message });
  }
};

// Get admin users (for admin UI)
const getAdminUsers = async (req, res) => {
  try {
    const users = await User.find({}, 'name email createdAt').sort({ createdAt: -1 });
    return res.json(users);
  } catch (error) {
    console.error('Get admin users error:', error);
    return res.status(500).json({ message: 'Server error', error: error.message });
  }
};

// Send announcement (admin only)
const sendAnnouncement = async (req, res) => {
  try {
    // require admin context
    const auth = getAuthContext(req);
    if (!auth.isAdmin) return res.status(401).json({ message: 'Admin only' });

    const { message } = req.body;
    const adminId = auth.id;

    if (!message || !message.trim()) return res.status(400).json({ message: 'Announcement message is required' });

    const users = await User.find({}, '_id');
    const announcements = [];

    for (const user of users) {
      const conversation = await Conversation.getOrCreateAdminConversation(user._id, adminId);
      const announcement = new Message({
        sender: adminId,
        senderModel: 'Admin',
        receiver: user._id,
        receiverModel: 'User',
        conversation: conversation._id,
        message: message,
        isAnnouncement: true,
        messageType: 'announcement'
      });
      await announcement.save();
      await conversation.updateLastActivity(announcement._id);
      await announcement.populate('sender', 'name email isAdmin');
      announcements.push(announcement);
    }

    const io = req.app.get('io');
    if (io) {
      io.emit('announcement', { sender: { _id: adminId, name: auth.raw?.name || 'ADMIN' , isAdmin: true }, message, isAnnouncement: true, createdAt: new Date() });
    }

    return res.status(201).json({ message: 'Announcement sent to all users', count: announcements.length });
  } catch (error) {
    console.error('Send announcement error:', error);
    return res.status(500).json({ message: 'Server error', error: error.message });
  }
};

// Kick user (admin only)
const kickUser = async (req, res) => {
  try {
    const auth = getAuthContext(req);
    if (!auth.isAdmin) return res.status(401).json({ message: 'Admin only' });

    const { userId, reason } = req.body;
    if (!userId) return res.status(400).json({ message: 'User ID is required' });

    const user = await User.findById(userId);
    if (!user) return res.status(404).json({ message: 'User not found' });

    const io = req.app.get('io');
    if (io) io.emit('userKicked', { userId, reason: reason || 'Violation of rules' });

    return res.json({ message: `User ${user.name} has been kicked`, reason: reason || 'Violation of rules' });
  } catch (error) {
    console.error('Kick user error:', error);
    return res.status(500).json({ message: 'Server error', error: error.message });
  }
};

// Delete message (admin only)
const deleteMessage = async (req, res) => {
  try {
    const auth = getAuthContext(req);
    if (!auth.isAdmin) return res.status(401).json({ message: 'Admin only' });

    const { messageId } = req.params;
    const adminId = auth.id;

    const message = await Message.findById(messageId);
    if (!message) return res.status(404).json({ message: 'Message not found' });

    await message.softDelete(adminId, 'Admin');

    const io = req.app.get('io');
    if (io) io.to(message.conversation.toString()).emit('messageDeleted', { messageId });

    return res.json({ message: 'Message deleted successfully' });
  } catch (error) {
    console.error('Delete message error:', error);
    return res.status(500).json({ message: 'Server error', error: error.message });
  }
};

// Clear chat history (admin only)
const clearChatHistory = async (req, res) => {
  try {
    const auth = getAuthContext(req);
    if (!auth.isAdmin) return res.status(401).json({ message: 'Admin only' });

    const { userId } = req.params;
    const adminId = auth.id;

    const conversation = await Conversation.getAdminUserConversation(userId, adminId);
    if (!conversation) return res.status(404).json({ message: 'Conversation not found' });

    await Message.updateMany({ conversation: conversation._id, isDeleted: false }, { isDeleted: true, deletedAt: new Date(), deletedBy: adminId, deletedByModel: 'Admin' });

    conversation.metadata.messageCount = 0;
    conversation.lastMessage = null;
    await conversation.save();

    const io = req.app.get('io');
    if (io) io.to(conversation._id.toString()).emit('chatHistoryCleared', { conversationId: conversation._id });

    return res.json({ message: 'Chat history cleared successfully' });
  } catch (error) {
    console.error('Clear chat history error:', error);
    return res.status(500).json({ message: 'Server error', error: error.message });
  }
};

// Request user-to-user chat approval
const requestChatApproval = async (req, res) => {
  try {
    const { targetUserId, message } = req.body;
    const auth = getAuthContext(req);
    if (!auth.id) return res.status(401).json({ message: 'Not authorized' });

    const requesterId = auth.id;

    if (requesterId.toString() === targetUserId) return res.status(400).json({ message: 'Cannot request chat with yourself' });

    const targetUser = await User.findById(targetUserId);
    if (!targetUser) return res.status(404).json({ message: 'Target user not found' });

    let conversation = await Conversation.findBetweenUsers(requesterId, 'User', targetUserId, 'User');
    if (conversation && conversation.settings.isApproved) return res.status(400).json({ message: 'Chat already approved' });

    if (!conversation) {
      conversation = new Conversation({
        participants: [
          { user: requesterId, userModel: 'User' },
          { user: targetUserId, userModel: 'User' }
        ],
        conversationType: 'direct',
        settings: { allowUserToUser: false, adminApprovalRequired: true, isApproved: false }
      });
      await conversation.save();
    }

    const adminUser = await Admin.findOne().sort({ createdAt: 1 });
    if (adminUser) {
      const requesterUser = await User.findById(requesterId);
      const notificationMessage = new Message({
        sender: requesterId,
        senderModel: 'User',
        receiver: adminUser._id,
        receiverModel: 'Admin',
        conversation: (await Conversation.getOrCreateAdminConversation(requesterId, adminUser._id))._id,
        message: `Chat approval request: ${requesterUser.name} wants to chat with ${targetUser.name}. Message: ${message || ''}`,
        messageType: 'text'
      });
      await notificationMessage.save();
    }

    return res.json({ message: 'Chat approval request sent to admin' });
  } catch (error) {
    console.error('Request chat approval error:', error);
    return res.status(500).json({ message: 'Server error', error: error.message });
  }
};

// Approve user-to-user chat
const approveChatRequest = async (req, res) => {
  try {
    const auth = getAuthContext(req);
    if (!auth.isAdmin) return res.status(401).json({ message: 'Admin only' });

    const { conversationId } = req.params;
    const adminId = auth.id;

    const conversation = await Conversation.findById(conversationId);
    if (!conversation) return res.status(404).json({ message: 'Conversation not found' });
    if (conversation.conversationType !== 'direct') return res.status(400).json({ message: 'Invalid conversation type' });

    await conversation.approve(adminId);
    return res.json({ message: 'Chat request approved successfully' });
  } catch (error) {
    console.error('Approve chat request error:', error);
    return res.status(500).json({ message: 'Server error', error: error.message });
  }
};

module.exports = {
  sendMessage: [upload.single('file'), sendMessage],
  getMessages,
  getUserContacts,
  getAdminUsers,
  sendAnnouncement,
  kickUser,
  deleteMessage,
  clearChatHistory,
  requestChatApproval,
  approveChatRequest
};
