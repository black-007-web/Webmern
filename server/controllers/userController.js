const User = require('../models/User');
const Book = require('../models/Book');

// 🛒 Buy a book
exports.buyBook = async (req, res) => {
  try {
    const user = await User.findById(req.user._id);
    const { bookId } = req.body;

    // Check if already purchased
    if (user.purchasedBooks.includes(bookId)) {
      return res.status(400).json({ message: 'You already purchased this book.' });
    }

    user.purchasedBooks.push(bookId);
    await user.save();

    res.status(200).json({ message: 'Book purchased successfully!' });
  } catch (error) {
    console.error('Error in buyBook:', error.message);
    res.status(500).json({ message: 'Server error while purchasing book' });
  }
};

// 📚 Get all purchased books
exports.getPurchasedBooks = async (req, res) => {
  try {
    const user = await User.findById(req.user._id).populate('purchasedBooks');
    res.json(user.purchasedBooks);
  } catch (error) {
    console.error('Error in getPurchasedBooks:', error.message);
    res.status(500).json({ message: 'Error fetching purchased books' });
  }
};

// ❌ Delete a purchased book
exports.deletePurchasedBook = async (req, res) => {
  try {
    const user = await User.findById(req.user._id);
    const bookId = req.params.bookId;

    user.purchasedBooks = user.purchasedBooks.filter(
      (id) => id.toString() !== bookId
    );

    await user.save();
    res.status(200).json({ message: 'Book removed from purchases.' });
  } catch (error) {
    console.error('Error in deletePurchasedBook:', error.message);
    res.status(500).json({ message: 'Server error while removing book' });
  }
};

// ✅ NEW: Return user profile info (name, email, and purchased books)
exports.getUserProfile = async (req, res) => {
  try {
    const user = await User.findById(req.user._id).populate('purchasedBooks');
    if (!user) return res.status(404).json({ message: 'User not found' });

    res.json({
      name: user.name,
      email: user.email,
      purchasedBooks: user.purchasedBooks,
    });
  } catch (error) {
    console.error('Error fetching user profile:', error.message);
    res.status(500).json({ message: 'Server error while fetching profile' });
  }
};
