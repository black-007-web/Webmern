// Frontend/components/User.jsx
import React, { useEffect, useState } from 'react';
import axios from 'axios';
import "../styles.css"; // Ensure your neon CSS is included

const User = () => {
  const [user, setUser] = useState(null);
  const [loading, setLoading] = useState(true);

  const BACKEND_URL = 'http://localhost:5000';

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
        const fullPdfUrl = `${BACKEND_URL}${res.data.pdfUrl}`;
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
    // Initialize movable particles only if element exists
    const particlesElement = document.getElementById("particles-js");
    if (particlesElement) {
      window.particlesJS("particles-js", {
        particles: {
          number: { value: 70, density: { enable: true, value_area: 800 } },
          color: { value: "#00ffff" },
          shape: { type: "circle" },
          opacity: { value: 0.6, anim: { enable: true, speed: 1, opacity_min: 0.3, sync: false } },
          size: { value: 3, random: true, anim: { enable: true, speed: 2, size_min: 1, sync: false } },
          line_linked: { enable: true, distance: 120, color: "#00ffff", opacity: 0.3, width: 1 },
          move: { enable: true, speed: 2, direction: "none", random: false, straight: false, out_mode: "out" },
        },
        interactivity: {
          detect_on: "canvas",
          events: {
            onhover: { enable: true, mode: "repulse" },
            onclick: { enable: true, mode: "push" },
          },
          modes: {
            repulse: { distance: 100 },
            push: { particles_nb: 4 },
          },
        },
        retina_detect: true,
      });
    }

    fetchProfile();
  }, []);

  if (loading) return <div className="user-loading">Loading user info…</div>;

  return (
    <div className="user-dashboard">
      <div id="particles-js"></div>
      <div className="user-container">
        <div className="user-info neon-box">
          <h2>👤 Welcome, {user.name}</h2>
          <p>Email: {user.email}</p>
        </div>

        <div className="user-books neon-box">
          <h3>📚 Purchased Books</h3>
          {user.purchasedBooks.length === 0 ? (
            <p>No books purchased yet.</p>
          ) : (
            <ul className="book-list">
              {user.purchasedBooks.map((book) => (
                <li key={book._id} className="book-item neon-card">
                  <div className="book-details">
                    <h4>{book.title}</h4>
                    <p>Genre: {book.genre}</p>
                    <p>Price: ${book.price}</p>
                  </div>
                  <div className="book-actions">
                    <button
                      onClick={() => handleRemoveBook(book._id)}
                      className="delete-button neon-btn"
                    >
                      ❌ Remove
                    </button>
                    <button
                      onClick={() => handleReadBook(book._id)}
                      className="read-button neon-btn"
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
    </div>
  );
};

export default User;
