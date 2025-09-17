const Book = require("../models/Book");
const User = require("../models/User");
const axios = require("axios");
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
      return res.status(404).json({ message: "File URL not available" });
    }

    // Fetch file content from Cloudinary (or any URL)
    const response = await axios.get(book.pdfUrl, { responseType: "arraybuffer" });

    // Determine content type (PDF, image, video, etc.)
    const contentType = book.pdfUrl.endsWith(".pdf")
      ? "application/pdf"
      : book.pdfUrl.match(/\.(jpg|jpeg|png|gif)$/i)
      ? `image/${book.pdfUrl.split(".").pop()}`
      : book.pdfUrl.match(/\.(mp4|mov|webm)$/i)
      ? `video/${book.pdfUrl.split(".").pop()}`
      : "application/octet-stream";

    res.set({
      "Content-Type": contentType,
      "Content-Disposition": `inline; filename="${book.title}"`,
    });
    res.send(Buffer.from(response.data, "binary"));
  } catch (error) {
    console.error("Error in readBook:", error);
    res.status(500).json({ message: "Server error" });
  }
};

// 📝 Admin: Create a new book
exports.createBook = async (req, res) => {
  try {
    const { title, author, genre, price } = req.body;

    // ✅ Validate required fields
    if (!title || !author || !genre || !price) {
      return res.status(400).json({ message: "All fields are required" });
    }

    // ✅ Handle file uploads
    const pdfFile = req.files && req.files.pdf ? req.files.pdf[0] : null;
    const imageFile = req.files && req.files.image ? req.files.image[0] : null;

    if (!pdfFile) {
      return res.status(400).json({ message: "File is required" });
    }

    // ✅ Extract URLs from Multer-Cloudinary
    const pdfUrl =
      pdfFile.secure_url || pdfFile.path || pdfFile.location || null;
    const imageUrl =
      imageFile?.secure_url || imageFile?.path || imageFile?.location || null;

    if (!pdfUrl) {
      return res.status(500).json({ message: "File upload failed" });
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

    // Optional: clean up from Cloudinary if you store public_id in DB
    // if (book.imagePublicId) await cloudinary.uploader.destroy(book.imagePublicId);
    // if (book.pdfPublicId) await cloudinary.uploader.destroy(book.pdfPublicId);

    await book.deleteOne();
    res.json({ message: `🗑 Book "${book.title}" deleted successfully` });
  } catch (error) {
    console.error("Error deleting book:", error);
    res.status(500).json({ message: "Server error while deleting book" });
  }
};

