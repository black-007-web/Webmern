import React from 'react';
import { Link, useNavigate } from 'react-router-dom';

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
    <nav className="navbar">
      <div className="navbar-title">
        <h2>📚 Library System</h2>
      </div>
      <div className="nav-links">
        <Link to="/">🏠 Home</Link>
        <Link to="/booklist">📖 Books</Link>

        {adminToken ? (
          <>
            <Link to="/admin-dashboard">🛠 Admin</Link>
            <button onClick={handleLogout}>🚪 Logout</button>
          </>
        ) : token ? (
          <>
            <Link to="/user">👤 Profile</Link>
            <button onClick={handleLogout}>🚪 Logout</button>
          </>
        ) : (
          <>
            <Link to="/login">🔐 Login</Link>
            <Link to="/register">📝 Register</Link>
            <Link to="/admin-login">🛠 Admin Login</Link>
          </>
        )}
      </div>
    </nav>
  );
};

export default Navbar;
