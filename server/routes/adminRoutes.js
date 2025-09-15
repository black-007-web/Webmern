const express = require('express');
const multer = require('multer');
const {
  loginAdmin,
  getAllUsers,
  deleteUser,
  createBook, // ⬅️ Use adminController which delegates to bookController
} = require('../controllers/adminController');
const { adminProtect } = require('../middleware/adminMiddleware');
const { storage } = require('../config/cloudinary');

const router = express.Router();

// Multer setup using Cloudinary storage engine
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

// 📚 Create a new book (with Cloudinary upload)
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
