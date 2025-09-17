const axios = require('axios');
const Book = require("../models/Book");
const User = require("../models/User");
const cloudinary = require("../config/cloudinary").cloudinary; // use your configured cloudinary instance

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
      return res.status(403).json({ message: "You must purchase this book first" });
    }
    const book = await Book.findById(bookId);
    if (!book) return res.status(404).json({ message: "Book not found" });

    if (!book.pdfPublicId) {
      return res.status(404).json({ message: "PDF Public ID not available" });
    }

    // Generate signed URL valid for 1 hour
    const signedUrl = cloudinary.v2.url(book.pdfPublicId, {
      sign_url: true,
      expires_at: Math.floor(Date.now() / 1000) + 3600,
      resource_type: 'raw',
    });

    // Stream PDF from signed URL
    const response = await axios.get(signedUrl, { responseType: 'stream' });
    res.setHeader('Content-Type', 'application/pdf');
    res.setHeader('Content-Disposition', `inline; filename="${book.title}.pdf"`);
    response.data.pipe(res);
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

    if (!pdfFile) {
      return res.status(400).json({ message: "PDF file is required" });
    }

    const pdfUrl = pdfFile.secure_url || pdfFile.path || pdfFile.location || null;
    const pdfPublicId = pdfFile.public_id || null;
    const imageUrl = imageFile?.secure_url || imageFile?.path || imageFile?.location || null;

    if (!pdfUrl || !pdfPublicId) {
      return res.status(500).json({ message: "PDF upload failed or public ID missing" });
    }

    const newBook = new Book({
      title,
      author,
      genre,
      price,
      image: imageUrl,
      pdfUrl,
      pdfPublicId,
    });

    await newBook.save();
    console.log(`✅ Book created: ${newBook.title}`);
    res.status(201).json(newBook);
  } catch (error) {
    console.error("Error in createBook:", error);
    res.status(500).json({ message: "Server error while creating book" });
  }
};

// 🗑 Delete a book (optional Cloudinary cleanup)
exports.deleteBook = async (req, res) => {
  try {
    const book = await Book.findById(req.params.bookId);
    if (!book) return res.status(404).json({ message: "Book not found" });

    // Optional cleanup from Cloudinary if you save public ids for image/pdf
    // if (book.imagePublicId) await cloudinary.v2.uploader.destroy(book.imagePublicId);
    // if (book.pdfPublicId) await cloudinary.v2.uploader.destroy(book.pdfPublicId);

    await book.deleteOne();
    res.json({ message: `🗑 Book "${book.title}" deleted successfully` });
  } catch (error) {
    console.error("Error deleting book:", error);
    res.status(500).json({ message: "Server error while deleting book" });
  }
};

