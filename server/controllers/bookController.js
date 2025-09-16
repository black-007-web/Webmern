const path = require("path");
const fs = require("fs");
const Book = require("../models/Book");
const User = require("../models/User");
const cloudinary = require("../config/cloudinary"); // optional cleanup

// 📚 Get all books
exports.getAllBooks = async (req, res) => {
  try {
    const books = await Book.find({});
    res.json(books);
  } catch (error) {
    console.error("Error fetching books:", error);
    res.status(500).json({ message: "Server error while fetching books" });
  }
};

// 📖 Read a book (only if purchased)
exports.readBook = async (req, res) => {
  try {
    const user = await User.findById(req.user._id);
    const bookId = req.params.bookId;

    if (!user.purchasedBooks.includes(bookId)) {
      return res
        .status(403)
        .json({ message: "You must purchase this book first" });
    }

    const book = await Book.findById(bookId);
    if (!book) return res.status(404).json({ message: "Book not found" });

    if (!book.pdfUrl) {
      return res.status(404).json({ message: "PDF URL not available" });
    }

    // Check if pdfUrl is local or Cloudinary
    if (book.pdfUrl.startsWith("http")) {
      // Cloudinary / public URL
      res.json({ title: book.title, pdfUrl: book.pdfUrl });
    } else {
      // Local storage
      const filePath = path.resolve(book.pdfUrl);
      if (!fs.existsSync(filePath)) {
        return res.status(404).json({ message: "PDF file not found on server" });
      }
      res.sendFile(filePath);
    }
  } catch (error) {
    console.error("Error in readBook:", error);
    res.status(500).json({ message: "Server error" });
  }
};

// 📝 Admin: Create a new book
exports.createBook = async (req, res) => {
  try {
    const { title, author, genre, price } = req.body;

    if (!title || !author || !genre || !price) {
      return res.status(400).json({ message: "All fields are required" });
    }

    const pdfFile = req.files && req.files.pdf ? req.files.pdf[0] : null;
    const imageFile = req.files && req.files.image ? req.files.image[0] : null;

    if (!pdfFile) return res.status(400).json({ message: "PDF file is required" });

    // Determine PDF URL
    let pdfUrl;
    if (pdfFile.secure_url) {
      // Cloudinary
      pdfUrl = pdfFile.secure_url;
    } else if (pdfFile.path) {
      // Local storage
      pdfUrl = pdfFile.path;
    } else if (pdfFile.location) {
      // S3 or other storage
      pdfUrl = pdfFile.location;
    } else {
      return res.status(500).json({ message: "PDF upload failed" });
    }

    let imageUrl = null;
    if (imageFile) {
      if (imageFile.secure_url) imageUrl = imageFile.secure_url;
      else if (imageFile.path) imageUrl = imageFile.path;
      else if (imageFile.location) imageUrl = imageFile.location;
    }

    const newBook = new Book({
      title,
      author,
      genre,
      price,
      image: imageUrl,
      pdfUrl,
    });

    await newBook.save();
    console.log(`✅ Book created: ${newBook.title}`);
    res.status(201).json(newBook);
  } catch (error) {
    console.error("Error in createBook:", error);
    res.status(500).json({ message: "Server error while creating book" });
  }
};

// 🗑 Delete a book (with optional Cloudinary cleanup)
exports.deleteBook = async (req, res) => {
  try {
    const book = await Book.findById(req.params.bookId);
    if (!book) return res.status(404).json({ message: "Book not found" });

    // Optional cleanup for Cloudinary
    // if (book.imagePublicId) await cloudinary.uploader.destroy(book.imagePublicId);
    // if (book.pdfPublicId) await cloudinary.uploader.destroy(book.pdfPublicId);

    await book.deleteOne();
    res.json({ message: `🗑 Book "${book.title}" deleted successfully` });
  } catch (error) {
    console.error("Error deleting book:", error);
    res.status(500).json({ message: "Server error while deleting book" });
  }
};
