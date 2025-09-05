import React, { useEffect, useState } from 'react';
import axios from 'axios';
import "../styles.css"; // Make sure this includes updated neon styles

const BookList = () => {
  const [books, setBooks] = useState([]);
  const [filteredBooks, setFilteredBooks] = useState([]);
  const [message, setMessage] = useState('');
  const [messageType, setMessageType] = useState('');
  const [search, setSearch] = useState('');
  const [suggestions, setSuggestions] = useState([]);
  const [selectedGenre, setSelectedGenre] = useState('All');

  const fetchBooks = async () => {
    try {
      const res = await axios.get('https://api-fable-forest.onrender.com/api/books');
      setBooks(res.data);
      setFilteredBooks(res.data);
    } catch (err) {
      console.error('Error fetching books:', err);
    }
  };

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
      setTimeout(() => {
        setMessage('');
        setMessageType('');
      }, 5000);
    }
  };

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
    <div className="book-list neon-bg">
      <h2 className="neon-text">📚 Book Store</h2>

      {/* Floating message */}
      {message && (
        <div className={`floating-message ${messageType}`}>
          {message}
        </div>
      )}

      {/* Search + Filter */}
      <div className="controls neon-box">
        <input
          type="text"
          placeholder="Search by title or author..."
          value={search}
          onChange={(e) => setSearch(e.target.value)}
          className="search-input neon-input"
        />
        <select
          value={selectedGenre}
          onChange={(e) => setSelectedGenre(e.target.value)}
          className="genre-select neon-select"
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
        <ul className="suggestions neon-box">
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
            <div key={book._id} className="book-card neon-card">
              <img src={book.image} alt={book.title} className="book-image" />
              <h4 className="book-title">{book.title}</h4>
              <p><strong>Author:</strong> <span className="highlight">{book.author}</span></p>
              <p><strong>Genre:</strong> <span className="highlight">{book.genre}</span></p>
              <p><strong>Price:</strong> <span className="highlight">${book.price}</span></p>
              <button onClick={() => handleBuy(book._id)} className="buy-btn neon-btn">🛒 Buy</button>
            </div>
          ))
        ) : (
          <p className="no-books">No books found.</p>
        )}
      </div>
    </div>
  );
};

export default BookList;
