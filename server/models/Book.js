const mongoose = require('mongoose');

const bookSchema = new mongoose.Schema(
  {
    title: {
      type: String,
      required: [true, 'Book title is required'],
      trim: true,
    },
    author: {
      type: String,
      required: [true, 'Author is required'],
      trim: true,
    },
    genre: {
      type: String,
      required: [true, 'Genre is required'],
    },
    price: {
      type: Number,
      required: [true, 'Price is required'],
      min: 0,
    },
    image: {
      type: String, // 📸 Full image URL (e.g., https://yourdomain.com/uploads/images/filename.jpg)
      required: true,
    },
    pdfUrl: {
      type: String, // 📕 Full PDF URL (e.g., https://yourdomain.com/uploads/pdfs/filename.pdf)
      required: true,
    },
  },
  { timestamps: true }
);

module.exports = mongoose.model('Book', bookSchema);

