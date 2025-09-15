const Book = require('../models/Book');
const User = require('../models/User');

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

// 📝 Admin: Create a new book (Cloudinary integrated correctly)
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

    const pdfUrl = pdfFile.path || pdfFile.location || pdfFile.secure_url;
    const imageUrl = imageFile ? (imageFile.path || imageFile.location || imageFile.secure_url) : null;

    if (!pdfUrl) {
      return res.status(500).json({ message: "PDF upload URL missing" });
    }

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
    console.error("Error in createBook:", error);
    res.status(500).json({ message: "Error creating book", error: error.message });
  }
};

// 🗑 Delete a book (improved, with optional Cloudinary cleanup if needed)
exports.deleteBook = async (req, res) => {
  try {
    const book = await Book.findById(req.params.bookId);
    if (!book) return res.status(404).json({ message: "Book not found" });

    // Optionally delete associated files from Cloudinary here if desired
    // Example: await cloudinary.uploader.destroy(public_id);

    await book.deleteOne();
    res.json({ message: `🗑 Book "${book.title}" deleted successfully` });
  } catch (error) {
    console.error("Error deleting book:", error);
    res.status(500).json({ message: "Server error while deleting book" });
  }
};
