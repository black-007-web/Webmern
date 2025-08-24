// Backend/routes/adminRoutes.js
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

const router = express.Router();

// ✅ Multer setup for file uploads (image + pdf)
const storage = multer.diskStorage({
  destination: function (req, file, cb) {
    if (file.mimetype.startsWith('image/')) {
      cb(null, 'uploads/images'); // cover images folder
    } else if (file.mimetype === 'application/pdf') {
      cb(null, 'uploads/pdfs'); // pdfs folder
    } else {
      cb(new Error('Only images and PDFs are allowed'), false);
    }
  },
  filename: function (req, file, cb) {
    cb(null, Date.now() + path.extname(file.originalname)); // unique file names
  },
});

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

// 📚 Create a new book (with file upload)
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
