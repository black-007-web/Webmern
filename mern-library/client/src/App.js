import React from 'react';
import './styles.css';
import { BrowserRouter as Router, Routes, Route } from 'react-router-dom';

import Navbar from './components/Navbar';
import Home from './pages/Home';
import Login from './pages/Login';
import Register from './pages/Register';
import BookList from './pages/BookList';
import User from './pages/User';
import AdminLogin from './pages/AdminLogin'; 
import AdminDashboard from './pages/AdminDashboard'; 
import BookReader from './pages/BookReader'; // ✅ NEW

function App() {
  return (
    <Router>
      <Navbar />

      <main className="container">
        <Routes>
          {/* Public Routes */}
          <Route path="/" element={<Home />} />
          <Route path="/booklist" element={<BookList />} />
          <Route path="/login" element={<Login />} />
          <Route path="/register" element={<Register />} />
          <Route path="/user" element={<User />} />

          {/* Read Book Route */}
          <Route path="/read/:bookId" element={<BookReader />} /> {/* ✅ NEW */}

          {/* Admin Routes */}
          <Route path="/admin-login" element={<AdminLogin />} />
          <Route path="/admin-dashboard" element={<AdminDashboard />} />
        </Routes>
      </main>
    </Router>
  );
}

export default App;
