const express = require('express');
const multer = require('multer');
const path = require('path');
const {
  loginAdmin,
  getAllUsers,
  deleteUser,
} = require('../controllers/adminController');
const { createBook } = require('../controllers/bookController');
const { adminProtect } = require('../middleware/adminMiddleware');
const { storage } = require('../config/cloudinary'); // ⬅️ Cloudinary storage

const router = express.Router();

// ✅ Multer setup using Cloudinary storage engine
const upload = multer({ storage });

// 🔑 Login route
router.post('/login', loginAdmin);

// ✅ Get current logged-in admin info
router.get('/me', adminProtect, (req, res) => {
  res.json({
    admin: {
      _id: req.admin._id,
      name: req.admin.name,
      email: req.admin.email,
    },
  });
});

// 👥 Admin-only routes
router.get('/users', adminProtect, getAllUsers);
router.delete('/users/:id', adminProtect, deleteUser);

// 📚 Create a new book (with file upload to Cloudinary)
router.post(
  '/books',
  adminProtect,
  upload.fields([
    { name: 'image', maxCount: 1 },
    { name: 'pdf', maxCount: 1 },
  ]),
  createBook
);

module.exports = router;
