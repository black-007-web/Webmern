// Backend/routes/adminBookRoutes.js
const express = require('express');
const router = express.Router();
const { adminProtect } = require('../middleware/adminMiddleware');
const { createBook, deleteBook } = require('../controllers/bookController');
const multer = require('multer');
const path = require('path');
const fs = require('fs');

// Ensure directories
const imageDir = path.join(__dirname, '..', 'uploads', 'images');
const pdfDir = path.join(__dirname, '..', 'uploads', 'pdfs');
if (!fs.existsSync(imageDir)) fs.mkdirSync(imageDir, { recursive: true });
if (!fs.existsSync(pdfDir)) fs.mkdirSync(pdfDir, { recursive: true });

// Multer config
const storage = multer.diskStorage({
  destination: (req, file, cb) => {
    if (file.fieldname === 'image') cb(null, imageDir);
    else if (file.fieldname === 'pdf') cb(null, pdfDir);
    else cb(new Error('Unknown file type'), null);
  },
  filename: (req, file, cb) => {
    cb(null, Date.now() + path.extname(file.originalname));
  },
});

const upload = multer({ storage }).fields([
  { name: 'image', maxCount: 1 },
  { name: 'pdf', maxCount: 1 },
]);

// Routes
router.post('/', adminProtect, upload, createBook);
router.delete('/:bookId', adminProtect, deleteBook);

module.exports = router;
