const Admin = require('../models/admin');
const User = require('../models/User');
const { createBook: cloudinaryCreateBook } = require('./bookController');
const generateToken = require('../utils/generateToken');

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
    res.json(users);
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
