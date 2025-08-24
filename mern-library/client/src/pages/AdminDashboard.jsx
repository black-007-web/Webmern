
// Frontend/components/AdminDashboard.jsx
import React, { useState, useEffect, useCallback } from 'react';
import axios from 'axios';

const AdminDashboard = () => {
  const [admin, setAdmin] = useState(null);
  const [users, setUsers] = useState([]);
  const [books, setBooks] = useState([]);
  const [email, setEmail] = useState('');
  const [password, setPassword] = useState('');
  const [loading, setLoading] = useState(true);

  // Book form state
  const [title, setTitle] = useState('');
  const [author, setAuthor] = useState('');
  const [genre, setGenre] = useState('');
  const [price, setPrice] = useState('');
  const [image, setImage] = useState(null);
  const [pdf, setPdf] = useState(null);

  const token = localStorage.getItem('adminToken');

  // Fetch all registered users
  const fetchUsers = useCallback(async () => {
    try {
      const res = await axios.get('/api/admin/users', {
        headers: { Authorization: `Bearer ${token}` },
      });
      setUsers(res.data);
    } catch (err) {
      console.error('Error fetching users:', err);
    }
  }, [token]);

  // Fetch all books
  const fetchBooks = useCallback(async () => {
    try {
      const res = await axios.get('/api/books');
      setBooks(res.data);
    } catch (err) {
      console.error('Error fetching books:', err);
    }
  }, []);

  // Admin login handler
  const handleLogin = async (e) => {
    e.preventDefault();
    try {
      const res = await axios.post('/api/admin/login', { email, password });
      localStorage.setItem('adminToken', res.data.token);
      setAdmin(res.data.admin);
      fetchUsers();
      fetchBooks();
    } catch (err) {
      alert('Invalid admin credentials');
    }
  };

  // Delete user
  const handleDeleteUser = async (id) => {
    if (!window.confirm('Are you sure you want to delete this user?')) return;
    try {
      await axios.delete(`/api/admin/users/${id}`, {
        headers: { Authorization: `Bearer ${token}` },
      });
      setUsers(users.filter((u) => u._id !== id));
    } catch (err) {
      console.error('Error deleting user:', err);
    }
  };

  // Create book
  const handleCreateBook = async (e) => {
    e.preventDefault();

    if (!image || !pdf) {
      alert('Please upload both image and PDF');
      return;
    }

    const formData = new FormData();
    formData.append('title', title);
    formData.append('author', author);
    formData.append('genre', genre);
    formData.append('price', price);
    formData.append('image', image);
    formData.append('pdf', pdf);

    try {
      const res = await axios.post('/api/admin/books', formData, {
        headers: {
          'Content-Type': 'multipart/form-data',
          Authorization: `Bearer ${token}`,
        },
      });
      alert(`Book "${res.data.title}" created successfully!`);

      // Clear form
      setTitle('');
      setAuthor('');
      setGenre('');
      setPrice('');
      setImage(null);
      setPdf(null);
      fetchBooks(); // Refresh book list
    } catch (err) {
      console.error('Error creating book:', err.response || err);
      alert(err.response?.data?.message || 'Failed to create book');
    }
  };

  // Delete book
  const handleDeleteBook = async (id) => {
    if (!window.confirm('Are you sure you want to delete this book?')) return;
    try {
      await axios.delete(`/api/admin/books/${id}`, {
        headers: { Authorization: `Bearer ${token}` },
      });
      alert('Book deleted successfully');
      setBooks(books.filter((b) => b._id !== id));
    } catch (err) {
      console.error('Error deleting book:', err);
      alert('Failed to delete book');
    }
  };

  // Load admin info, users, and books
  useEffect(() => {
    const fetchAdmin = async () => {
      if (!token) {
        setLoading(false);
        return;
      }
      try {
        const res = await axios.get('/api/admin/me', {
          headers: { Authorization: `Bearer ${token}` },
        });
        setAdmin(res.data.admin);
        fetchUsers();
        fetchBooks();
      } catch (err) {
        console.error('Admin auth failed:', err);
        localStorage.removeItem('adminToken');
      } finally {
        setLoading(false);
      }
    };
    fetchAdmin();
  }, [fetchUsers, fetchBooks, token]);

  if (loading) return <p>Loading...</p>;

  if (!admin) {
    return (
      <form onSubmit={handleLogin} className="admin-login-form">
        <h2>Admin Login</h2>
        <input
          type="email"
          placeholder="Admin Email"
          value={email}
          onChange={(e) => setEmail(e.target.value)}
          required
        />
        <input
          type="password"
          placeholder="Admin Password"
          value={password}
          onChange={(e) => setPassword(e.target.value)}
          required
        />
        <button type="submit">Login</button>
      </form>
    );
  }

  return (
    <div className="admin-dashboard">
      <h2>Welcome, {admin.name}</h2>
      <p>Email: {admin.email}</p>

      <div className="analytics">
        <h3>📊 Dashboard Analytics</h3>
        <p>Total Registered Users: <strong>{users.length}</strong></p>
        <p>Total Created Books: <strong>{books.length}</strong></p>
      </div>

      <h3>👥 Registered Users</h3>
      {users.length === 0 ? <p>No users found.</p> :
        <ul className="user-list">
          {users.map((user) => (
            <li key={user._id}>
              {user.name} ({user.email})
              <button onClick={() => handleDeleteUser(user._id)}>❌ Delete</button>
            </li>
          ))}
        </ul>
      }

      <h3>📚 Created Books</h3>
      {books.length === 0 ? <p>No books yet.</p> :
        <ul className="book-list">
          {books.map((book) => (
            <li key={book._id}>
              {book.title} by {book.author}
              <button onClick={() => handleDeleteBook(book._id)}>❌ Delete Book</button>
            </li>
          ))}
        </ul>
      }

      <h3>➕ Create New Book</h3>
      <form onSubmit={handleCreateBook} className="book-form">
        <input
          type="text"
          placeholder="Title"
          value={title}
          onChange={(e) => setTitle(e.target.value)}
          required
        />
        <input
          type="text"
          placeholder="Author"
          value={author}
          onChange={(e) => setAuthor(e.target.value)}
          required
        />
        <input
          type="text"
          placeholder="Genre"
          value={genre}
          onChange={(e) => setGenre(e.target.value)}
          required
        />
        <input
          type="number"
          placeholder="Price"
          value={price}
          onChange={(e) => setPrice(e.target.value)}
          required
        />
        <input
          type="file"
          accept="image/*"
          onChange={(e) => setImage(e.target.files[0])}
          required
        />
        <input
          type="file"
          accept="application/pdf"
          onChange={(e) => setPdf(e.target.files[0])}
          required
        />
        <button type="submit">Create Book</button>
      </form>
    </div>
  );
};

export default AdminDashboard;





