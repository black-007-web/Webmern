import React, { useEffect, useState } from 'react';
import axios from 'axios';

const BookList = () => {
  const [books, setBooks] = useState([]);
  const [message, setMessage] = useState('');

  // Fetch all books from the database
  const fetchBooks = async () => {
    try {
      const res = await axios.get('/api/books');
      setBooks(res.data);
    } catch (err) {
      console.error('Error fetching books:', err);
    }
  };

  // Handle book purchase
  const handleBuy = async (bookId) => {
    try {
      const token = localStorage.getItem('token');
      if (!token) {
        setMessage('You must be logged in to purchase a book.');
        return;
      }

      await axios.post(
        '/api/user/buy',
        { bookId },
        {
          headers: {
            Authorization: `Bearer ${token}`,
          },
        }
      );
      setMessage('✅ Book purchased!');
    } catch (err) {
      console.error(err.response?.data || err.message);
      setMessage('❌ Error purchasing book');
    }
  };

  useEffect(() => {
    fetchBooks();
  }, []);

  return (
    <div className="book-list">
      <h2>📚 Book Store</h2>
      {message && <p style={{ color: 'blue' }}>{message}</p>}

      <div className="books-grid" style={{ display: 'flex', flexWrap: 'wrap', gap: '20px' }}>
        {books.map((book) => (
          <div
            key={book._id}
            className="book-card"
            style={{
              border: '1px solid #ccc',
              padding: '10px',
              borderRadius: '10px',
              width: '180px',
              textAlign: 'center',
            }}
          >
            <img src={book.image} alt={book.title} width="100%" height="200px" style={{ objectFit: 'cover' }} />
            <h4>{book.title}</h4>
            <p><strong>Author:</strong> {book.author}</p>
            <p><strong>Genre:</strong> {book.genre}</p>
            <p><strong>Price:</strong> ${book.price}</p>
            <button onClick={() => handleBuy(book._id)}>🛒 Buy</button>
          </div>
        ))}
      </div>
    </div>
  );
};

export default BookList;
