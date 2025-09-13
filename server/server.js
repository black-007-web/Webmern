// Backend/server.js
const express = require('express');
const dotenv = require('dotenv');
const cors = require('cors');
const mongoose = require('mongoose');
const path = require('path');
const fs = require('fs');

const authRoutes = require('./routes/authRoutes');
const userRoutes = require('./routes/userRoutes');
const adminRoutes = require('./routes/adminRoutes');
const bookRoutes = require('./routes/userBooks');
const bookReadRoutes = require('./routes/bookReadRoutes');
const adminBookRoutes = require('./routes/adminBookRoutes');

dotenv.config();

const app = express();
const PORT = process.env.PORT || 5000;

// Middleware
app.use(cors());
app.use(express.json());

// 🔓 Serve uploaded files statically
app.use('/uploads', express.static(path.join(__dirname, 'uploads')));

// 🧪 Debug route to check if a PDF exists
app.get('/api/debug-pdf/:filename', (req, res) => {
  const filePath = path.join(__dirname, 'uploads/pdfs', req.params.filename);
  const exists = fs.existsSync(filePath);
  res.json({ exists });
});

// 📤 Optional: Stream PDF directly (alternative to static serving)
app.get('/api/stream/:filename', (req, res) => {
  const filePath = path.join(__dirname, 'uploads/pdfs', req.params.filename);
  if (!fs.existsSync(filePath)) return res.status(404).send('File not found');
  res.sendFile(filePath);
});

// 🌐 Root route
app.get('/', (req, res) => {
  res.sendFile(path.join(__dirname, 'index.html'));
});

// 📚 API Routes
app.use('/api/auth', authRoutes);
app.use('/api/user', userRoutes);
app.use('/api/admin', adminRoutes);
app.use('/api/admin/books', adminBookRoutes);
app.use('/api/books', bookRoutes);
app.use('/api/read', bookReadRoutes);

// 🔗 MongoDB connection
mongoose
  .connect(process.env.MONGO_URI)
  .then(() => {
    console.log('✅ MongoDB connected');
    app.listen(PORT, () => {
      console.log(`🚀 Server running on port ${PORT}`);
    });
  })
  .catch((err) => {
    console.error('❌ Failed to connect to MongoDB:', err.message);
  });

