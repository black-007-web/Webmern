const express = require('express');
const router = express.Router();
const { adminProtect } = require('../middleware/adminMiddleware');
const { createBook, deleteBook } = require('../controllers/bookController');
const multer = require('multer');
const { storage } = require('../config/cloudinary'); // ⬅️ Cloudinary storage

// ✅ Cloudinary-based upload middleware
const upload = multer({ storage }).fields([
  { name: 'image', maxCount: 1 },
  { name: 'pdf', maxCount: 1 },
]);

// Routes
router.post('/', adminProtect, upload, createBook);
router.delete('/:bookId', adminProtect, deleteBook);

module.exports = router;

