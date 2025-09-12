const path = require('path');
const fs = require('fs');
const Book = require('../models/Book');
const User = require('../models/User');

// 📚 Get all books
exports.getAllBooks = async (req, res) => {
  try {
    const books = await Book.find({});
    res.json(books);
  } catch (error) {
    console.error("Error fetching books:", error.message);
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

    const pdfPath = path.join(__dirname, '..', book.pdfUrl || '');
    if (!book.pdfUrl || !fs.existsSync(pdfPath)) {
      return res.status(404).json({ message: "PDF file not found" });
    }

    res.json({ title: book.title, pdfUrl: book.pdfUrl });
  } catch (error) {
    console.error("Error in readBook:", error.message);
    res.status(500).json({ message: "Server error" });
  }
};

// 📝 Admin: Create a new book
exports.createBook = async (req, res) => {
  try {
    const { title, author, genre, price } = req.body;

    if (!req.files?.pdf) {
      return res.status(400).json({ message: "PDF file is required" });
    }

    const imageFile = req.files?.image?.[0] || null;
    const pdfFile = req.files.pdf[0];

    const imageUrl = imageFile
      ? `${req.protocol}://${req.get('host')}/uploads/images/${imageFile.filename}`
      : null;

    const pdfUrl = `${req.protocol}://${req.get('host')}/uploads/pdfs/${pdfFile.filename}`;

    const newBook = new Book({
      title,
      author,
      genre,
      price,
      image: imageUrl,
      pdfUrl: pdfUrl,
    });

    await newBook.save();
    console.log(`✅ Book created: ${newBook.title}`);
    res.status(201).json(newBook);
  } catch (error) {
    console.error("Error in createBook:", error.message);
    res.status(500).json({ message: "Error creating book" });
  }
};

// 🗑 Delete a book (Admin only)
exports.deleteBook = async (req, res) => {
  try {
    const book = await Book.findById(req.params.bookId);
    if (!book) return res.status(404).json({ message: "Book not found" });

    // Delete files
    const imagePath = book.image?.startsWith('http')
      ? null
      : path.join(__dirname, '..', book.image || '');

    const pdfPath = book.pdfUrl?.startsWith('http')
      ? null
      : path.join(__dirname, '..', book.pdfUrl || '');

    if (imagePath && fs.existsSync(imagePath)) fs.unlinkSync(imagePath);
    if (pdfPath && fs.existsSync(pdfPath)) fs.unlinkSync(pdfPath);

    await book.deleteOne();
    res.json({ message: `🗑 Book "${book.title}" deleted successfully` });
  } catch (error) {
    console.error("Error deleting book:", error.message);
    res.status(500).json({ message: "Server error while deleting book" });
  }
};
