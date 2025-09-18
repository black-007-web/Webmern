const path = require('path');
const Admin = require('../models/Admin');
const User = require('../models/User');
const Book = require('../models/Book');
const Conversation = require('../models/Conversation'); // Added for chat integration
const generateToken = require('../utils/generateToken');

// Delegate book creation to bookController
const { createBook: cloudinaryCreateBook } = require('./bookController');

// 🔐 Admin login
exports.loginAdmin = async (req, res) => {
  try {
    const { email, password } = req.body;

    const adminDoc = await Admin.findOne({ email });
    if (!adminDoc || !(await adminDoc.matchPassword(password))) {
      return res.status(401).json({ message: 'Invalid credentials' });
    }

    res.json({
      _id: adminDoc._id,
      admin: {
        name: adminDoc.name,
        email: adminDoc.email,
      },
      token: generateToken(adminDoc._id),
    });
  } catch (error) {
    console.error('Admin login error:', error.message);
    res.status(500).json({ message: 'Server error' });
  }
};

// 👥 Get all users
exports.getAllUsers = async (req, res) => {
  try {
    const users = await User.find({}).select('-password');

    // Include chat-related info: active admin-user conversations
    const usersWithChatInfo = await Promise.all(users.map(async user => {
      const conversation = await Conversation.getAdminUserConversation(user._id, req.admin._id);
      return {
        ...user.toObject(),
        hasActiveChat: !!conversation
      };
    }));

    res.json(usersWithChatInfo);
  } catch (error) {
    console.error('Get users error:', error.message);
    res.status(500).json({ message: 'Server error' });
  }
};

// 🗑 Delete user by ID
exports.deleteUser = async (req, res) => {
  try {
    const deletedUser = await User.findByIdAndDelete(req.params.id);
    if (!deletedUser) {
      return res.status(404).json({ message: 'User not found' });
    }

    // Also archive or remove any conversations with this user
    await Conversation.updateMany(
      { 'participants.user': req.params.id },
      { isArchived: true, archivedAt: new Date(), archivedBy: req.admin._id, archivedByModel: 'Admin' }
    );

    res.json({ message: 'User deleted successfully' });
  } catch (error) {
    console.error('Delete user error:', error.message);
    res.status(500).json({ message: 'Error deleting user' });
  }
};

// 📘 Create a new book (Admin only) → delegate to bookController
exports.createBook = async (req, res) => {
  try {
    await cloudinaryCreateBook(req, res);
  } catch (error) {
    console.error("Admin createBook error:", error.message);
    res.status(500).json({ message: "Server error in admin createBook" });
  }
};

