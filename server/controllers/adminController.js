// Backend/controllers/adminController.js
const Admin = require('../models/admin'); // ✅ Correct model
const User = require('../models/User');
const Book = require('../models/Book'); // ✅ Added Book model
const generateToken = require('../utils/generateToken'); // ✅ Corrected path

// Admin login
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

// Get all users (for admin dashboard)
exports.getAllUsers = async (req, res) => {
  try {
    const users = await User.find({}).select('-password');
    res.json(users);
  } catch (error) {
    console.error('Get users error:', error.message);
    res.status(500).json({ message: 'Server error' });
  }
};

// Delete user by ID
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

// Create a new book (Admin only) with image + PDF upload
exports.createBook = async (req, res) => {
  try {
    const { title, author, genre, price } = req.body;
    const imageFile = req.files?.image ? req.files.image[0] : null;
    const pdfFile = req.files?.pdf ? req.files.pdf[0] : null;

    if (!title || !author || !genre || !price || !imageFile || !pdfFile) {
      return res.status(400).json({ message: 'All fields (title, author, genre, price, image, PDF) are required' });
    }

    const book = await Book.create({
      title,
      author,
      genre,
      price,
      image: `/uploads/images/${imageFile.filename}`,
      pdfUrl: `/uploads/pdfs/${pdfFile.filename}`,
    });

    res.status(201).json(book);
  } catch (error) {
    console.error('Error creating book:', error.message);
    res.status(500).json({ message: 'Server error while creating book' });
  }
};
