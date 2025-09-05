// Frontend/components/Navbar.jsx
import React from 'react';
import { Link, useNavigate } from 'react-router-dom';
import "../styles.css"; // Ensure neon styles are applied

const Navbar = () => {
  const token = localStorage.getItem('token');
  const adminToken = localStorage.getItem('adminToken');
  const navigate = useNavigate();

  const handleLogout = () => {
    localStorage.clear();
    alert('Logged out');
    navigate('/login');
  };

  return (
    <nav className="navbar neon-nav">
      <div className="navbar-title">
        <h2 className="neon-text">📚 Library System</h2>
      </div>
      <div className="nav-links">
        <Link className="neon-link" to="/">🏠 Home</Link>
        <Link className="neon-link" to="/booklist">📖 Books</Link>

        {adminToken ? (
          <>
            <Link className="neon-link" to="/admin-dashboard">🛠 Admin</Link>
            <button className="neon-btn logout-btn" onClick={handleLogout}>🚪 Logout</button>
          </>
        ) : token ? (
          <>
            <Link className="neon-link" to="/user">👤 Profile</Link>
            <button className="neon-btn logout-btn" onClick={handleLogout}>🚪 Logout</button>
          </>
        ) : (
          <>
            <Link className="neon-link" to="/login">🔐 Login</Link>
            <Link className="neon-link" to="/register">📝 Register</Link>
            <Link className="neon-link" to="/admin-login">🛠 Admin Login</Link>
          </>
        )}
      </div>
    </nav>
  );
};

export default Navbar;
