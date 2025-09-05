import React, { useEffect, useState } from 'react';
import axios from 'axios';

const BookList = () => {
  const [books, setBooks] = useState([]);
  const [filteredBooks, setFilteredBooks] = useState([]);
  const [message, setMessage] = useState('');
  const [messageType, setMessageType] = useState(''); // success | error
  const [search, setSearch] = useState('');
  const [suggestions, setSuggestions] = useState([]);
  const [selectedGenre, setSelectedGenre] = useState('All');

  // Fetch all books from the database
  const fetchBooks = async () => {
    try {
  const res = await axios.get('https://api-fable-forest.onrender.com/api/books');
      setBooks(res.data);
      setFilteredBooks(res.data);
    } catch (err) {
      console.error('Error fetching books:', err);
    }
  };

  // Handle book purchase
  const handleBuy = async (bookId) => {
    try {
      const token = localStorage.getItem('token');
      if (!token) {
        setMessage('⚠️ You must be logged in to purchase a book.');
        setMessageType('error');
        return;
      }

      await axios.post(
  'https://api-fable-forest.onrender.com/api/user/buy',
        { bookId },
        {
          headers: { Authorization: `Bearer ${token}` },
        }
      );

      const purchased = books.find((b) => b._id === bookId);
      setMessage(`🎉 Welcome & happy reading! Enjoy “${purchased?.title || 'your book'}”.`);
      setMessageType('success');
    } catch (err) {
      console.error(err.response?.data || err.message);
      setMessage('❌ Error purchasing book');
      setMessageType('error');
    } finally {
      // auto-hide
      setTimeout(() => {
        setMessage('');
        setMessageType('');
      }, 4000);
    }
  };

  // Filter and search
  useEffect(() => {
    let tempBooks = [...books];

    if (selectedGenre !== 'All') {
      tempBooks = tempBooks.filter(
        (b) => b.genre.toLowerCase() === selectedGenre.toLowerCase()
      );
    }

    if (search.trim()) {
      tempBooks = tempBooks.filter(
        (b) =>
          b.title.toLowerCase().includes(search.toLowerCase()) ||
          b.author.toLowerCase().includes(search.toLowerCase())
      );

      const sug = books
        .filter(
          (b) =>
            b.title.toLowerCase().includes(search.toLowerCase()) ||
            b.author.toLowerCase().includes(search.toLowerCase())
        )
        .slice(0, 5);
      setSuggestions(sug);
    } else {
      setSuggestions([]);
    }

    setFilteredBooks(tempBooks);
  }, [search, selectedGenre, books]);

  useEffect(() => {
    fetchBooks();
  }, []);

  const genres = ['All', ...new Set(books.map((b) => b.genre))];

  return (
    <div className="book-list">
      <h2>📚 Book Store</h2>

      {/* Purchase message banner */}
      {message && (
        <div className={`message ${messageType}`}>
          <span className="sparkle" />
          {message}
        </div>
      )}

      {/* Search + Filter */}
      <div className="controls">
        <input
          type="text"
          placeholder="Search by title or author..."
          value={search}
          onChange={(e) => setSearch(e.target.value)}
          className="search-input"
        />
        <select
          value={selectedGenre}
          onChange={(e) => setSelectedGenre(e.target.value)}
          className="genre-select"
        >
          {genres.map((g, i) => (
            <option key={i} value={g}>
              {g}
            </option>
          ))}
        </select>
      </div>

      {/* Suggestions */}
      {suggestions.length > 0 && (
        <ul className="suggestions">
          {suggestions.map((s) => (
            <li key={s._id} onClick={() => setSearch(s.title)}>
              {s.title} — <span className="author">{s.author}</span>
            </li>
          ))}
        </ul>
      )}

      {/* Books */}
      <div className="books-grid">
        {filteredBooks.length > 0 ? (
          filteredBooks.map((book) => (
            <div key={book._id} className="book-card">
              <img src={book.image} alt={book.title} className="book-image" />
              <h4>{book.title}</h4>
              <p><strong>Author:</strong> {book.author}</p>
              <p><strong>Genre:</strong> {book.genre}</p>
              <p><strong>Price:</strong> ${book.price}</p>
              <button onClick={() => handleBuy(book._id)} className="buy-btn">🛒 Buy</button>
            </div>
          ))
        ) : (
          <p>No books found.</p>
        )}
      </div>
    </div>
  );
};

export default BookList;
