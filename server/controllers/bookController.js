const path = require('path');
const fs = require('fs');
const Book = require('../models/Book');
const User = require('../models/User');
const { cloudinary } = require('../config/cloudinary');

// 📚 Get all books
exports.getAllBooks = async (req, res) => {
  try {
    const books = await Book.find({});
    res.json(books);
  } catch (error) {
    console.error("Error fetching books:", error);
    res.status(500).json({ message: 'Error fetching books' });
  }
};

// 📖 Read a book (only if purchased)
exports.readBook = async (req, res) => {
  try {
    const user = await User.findById(req.user._id);
    const bookId = req.params.bookId;

    if (!user.purchasedBooks.includes(bookId)) {
      return res.status(403).json({ message: "You must purchase this book first" });
    }

    const book = await Book.findById(bookId);
    if (!book) return res.status(404).json({ message: "Book not found" });

    if (!book.pdfUrl) {
      return res.status(404).json({ message: "PDF URL not available" });
    }

    res.json({ title: book.title, pdfUrl: book.pdfUrl });
  } catch (error) {
    console.error("Error in readBook:", error);
    res.status(500).json({ message: "Server error" });
  }
};

// 📝 Admin: Create a new book (Cloudinary version)
exports.createBook = async (req, res) => {
  try {
    const { title, author, genre, price } = req.body;

    if (!title || !author || !genre || !price) {
      return res.status(400).json({ message: "All fields are required" });
    }

    const pdfFile = req.files?.pdf?.[0];
    const imageFile = req.files?.image?.[0] || null;

    if (!pdfFile) {
      return res.status(400).json({ message: "PDF file is required" });
    }

    // Upload PDF to Cloudinary
    const pdfUpload = await cloudinary.uploader.upload(pdfFile.path, {
      resource_type: 'raw',
      folder: 'mern-library/pdfs',
    });

    let imageUpload = null;
    if (imageFile) {
      imageUpload = await cloudinary.uploader.upload(imageFile.path, {
        resource_type: 'image',
        folder: 'mern-library/images',
      });
    }

    const newBook = new Book({
      title,
      author,
      genre,
      price,
      image: imageUpload?.secure_url || null,
      pdfUrl: pdfUpload.secure_url,
    });

    await newBook.save();
    console.log(`✅ Book created: ${newBook.title}`);
    res.status(201).json(newBook);

  } catch (error) {
    console.error("Error in createBook:", error);
    res.status(500).json({ message: "Error creating book", error: error.message });
  }
};

// 🗑 Delete a book (Admin only)
exports.deleteBook = async (req, res) => {
  try {
    const book = await Book.findById(req.params.bookId);
    if (!book) return res.status(404).json({ message: "Book not found" });

    // Optionally delete from Cloudinary if needed

    await book.deleteOne();
    res.json({ message: `🗑 Book "${book.title}" deleted successfully` });
  } catch (error) {
    console.error("Error deleting book:", error);
    res.status(500).json({ message: "Server error while deleting book" });
  }
};
