const express = require('express');
const dotenv = require('dotenv');
const cors = require('cors');
const mongoose = require('mongoose');
const path = require('path');

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
