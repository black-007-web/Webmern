const express = require('express');
const { getAllBooks } = require('../controllers/bookController');

const router = express.Router();

// 📚 Public route to fetch all books with Cloudinary-hosted image/pdf URLs
router.get('/', getAllBooks);

module.exports = router;
