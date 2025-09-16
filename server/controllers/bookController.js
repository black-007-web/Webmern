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

    // ✅ Simplified: just return Cloudinary PDF URL
    res.json({ title: book.title, pdfUrl: book.pdfUrl });
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

    // ✅ Upload PDF to Cloudinary as raw
    let pdfUrl;
    if (pdfFile.path) {
      const uploadedPdf = await cloudinary.uploader.upload(pdfFile.path, {
        resource_type: "raw",
        folder: "books",
      });
      pdfUrl = uploadedPdf.secure_url;
    } else if (pdfFile.secure_url) {
      pdfUrl = pdfFile.secure_url;
    } else {
      return res.status(500).json({ message: "PDF upload failed" });
    }

    // Optional image upload
    let imageUrl = null;
    if (imageFile) {
      if (imageFile.path) {
        const uploadedImage = await cloudinary.uploader.upload(imageFile.path, {
          folder: "books/images",
        });
        imageUrl = uploadedImage.secure_url;
      } else if (imageFile.secure_url) {
        imageUrl = imageFile.secure_url;
      }
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
