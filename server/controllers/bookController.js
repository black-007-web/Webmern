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

    // ✅ If stored as raw content, return the bytes directly
    if (book.fileContent) {
      res.set({
        "Content-Type": book.fileType || "application/octet-stream",
        "Content-Disposition": `inline; filename="${book.title}"`,
      });
      return res.send(book.fileContent);
    }

    // ✅ Otherwise return Cloudinary/S3 URL
    if (book.fileUrl) {
      return res.json({ title: book.title, fileUrl: book.fileUrl });
    }

    res.status(404).json({ message: "No file available" });
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

    // ✅ Handle file uploads (must match your route: upload.fields([...]))
    const uploadedFile = req.files && req.files.pdf ? req.files.pdf[0] : null;
    const imageFile = req.files && req.files.image ? req.files.image[0] : null;

    if (!uploadedFile) {
      return res.status(400).json({ message: "File is required" });
    }

    let fileUrl = null;
    let fileContent = null;
    let fileType = uploadedFile.mimetype;

    // ✅ If Cloudinary (or S3) gives URL
    if (uploadedFile.secure_url || uploadedFile.path || uploadedFile.location) {
      fileUrl =
        uploadedFile.secure_url ||
        uploadedFile.path ||
        uploadedFile.location;
    } else if (uploadedFile.buffer) {
      // ✅ If Multer provides raw Buffer
      fileContent = uploadedFile.buffer;
    }

    if (!fileUrl && !fileContent) {
      return res.status(500).json({ message: "File upload failed" });
    }

    const newBook = new Book({
      title,
      author,
      genre,
      price,
      image: imageFile?.secure_url || imageFile?.path || null,
      fileUrl,
      fileContent,
      fileType,
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
    // if (book.filePublicId) await cloudinary.uploader.destroy(book.filePublicId);

    await book.deleteOne();
    res.json({ message: `🗑 Book "${book.title}" deleted successfully` });
  } catch (error) {
    console.error("Error deleting book:", error);
    res.status(500).json({ message: "Server error while deleting book" });
  }
};

