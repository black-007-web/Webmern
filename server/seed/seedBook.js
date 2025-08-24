const mongoose = require('mongoose');
const dotenv = require('dotenv');
const Book = require('../models/Book');

dotenv.config();
mongoose.connect(process.env.MONGO_URI);

const books = [
  {
    title: 'Atomic Habits',
    author: 'James Clear',
    genre: 'Self-help',
    price: 12.99,
    image: 'https://i.ibb.co/0mYh3Xw/atomic-habits.jpg',
    pdfUrl: 'https://example.com/atomic-habits.pdf',
  },
  {
    title: 'The Alchemist',
    author: 'Paulo Coelho',
    genre: 'Fiction',
    price: 10.5,
    image: 'https://i.ibb.co/jZG6F1K/alchemist.jpg',
    pdfUrl: 'https://example.com/the-alchemist.pdf',
  },
  {
    title: '1984',
    author: 'George Orwell',
    genre: 'Dystopian',
    price: 9.99,
    image: 'https://i.ibb.co/0Ff4ns6/1984.jpg',
    pdfUrl: 'https://example.com/1984.pdf',
  },
  // Add pdfUrl for all remaining books...
];

const seedBooks = async () => {
  try {
    await Book.deleteMany();
    await Book.insertMany(books);
    console.log('✅ Books seeded with PDF links');
    process.exit();
  } catch (err) {
    console.error(err);
    process.exit(1);
  }
};

seedBooks();
