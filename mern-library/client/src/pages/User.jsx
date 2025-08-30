// Frontend/components/User.jsx
import React, { useEffect, useState } from 'react';
import axios from 'axios';

const User = () => {
  const [user, setUser] = useState(null);
  const [loading, setLoading] = useState(true);

  // Replace with your backend URL if frontend runs on a different port
  const BACKEND_URL = 'https://api-fable-forest.onrender.com';

  const fetchProfile = async () => {
    try {
      const token = localStorage.getItem('token');
      if (!token) {
        alert('No token found. Please login.');
        window.location.href = '/login';
        return;
      }

  const res = await axios.get(`${BACKEND_URL}/api/user/profile`, {
        headers: { Authorization: `Bearer ${token}` },
      });

      setUser(res.data);
      setLoading(false);
    } catch (err) {
      console.error('Error fetching user profile:', err.response?.data || err.message);
      alert('Session expired or unauthorized. Please login again.');
      localStorage.removeItem('token');
      window.location.href = '/login';
    }
  };

  const handleRemoveBook = async (bookId) => {
    try {
      const token = localStorage.getItem('token');
  await axios.delete(`${BACKEND_URL}/api/user/books/${bookId}`, {
        headers: { Authorization: `Bearer ${token}` },
      });
      fetchProfile();
    } catch (err) {
      console.error('Error removing book:', err.response?.data || err.message);
      alert('Failed to remove book.');
    }
  };

  const handleReadBook = async (bookId) => {
    try {
      const token = localStorage.getItem('token');
  const res = await axios.get(`${BACKEND_URL}/api/read/${bookId}`, {
        headers: { Authorization: `Bearer ${token}` },
      });

      if (res.data.pdfUrl) {
        // Prepend backend URL to relative PDF path
        const fullPdfUrl = `${BACKEND_URL}${res.data.pdfUrl}`;
        // Open PDF in new tab
        window.open(fullPdfUrl, '_blank');
      } else {
        alert('PDF not available for this book.');
      }
    } catch (err) {
      console.error('Error reading book:', err.response?.data || err.message);
      alert(err.response?.data?.message || 'Cannot read this book.');
    }
  };

  useEffect(() => {
    fetchProfile();
  }, []);

  if (loading) return <div className="user-loading">Loading user info…</div>;

  return (
    <div className="user-dashboard">
      <div className="user-info">
        <h2>👤 Welcome, {user.name}</h2>
        <p>Email: {user.email}</p>
      </div>

      <div className="user-books">
        <h3>📚 Purchased Books</h3>
        {user.purchasedBooks.length === 0 ? (
          <p>No books purchased yet.</p>
        ) : (
          <ul className="book-list">
            {user.purchasedBooks.map((book) => (
              <li key={book._id} className="book-item">
                <div className="book-details">
                  <h4>{book.title}</h4>
                  <p>Genre: {book.genre}</p>
                  <p>Price: ${book.price}</p>
                </div>
                <div>
                  <button
                    onClick={() => handleRemoveBook(book._id)}
                    className="delete-button"
                  >
                    ❌ Remove
                  </button>
                  <button
                    onClick={() => handleReadBook(book._id)}
                    className="read-button"
                  >
                    📖 Read
                  </button>
                </div>
              </li>
            ))}
          </ul>
        )}
      </div>
    </div>
  );
};

export default User;
