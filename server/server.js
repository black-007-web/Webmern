const express = require('express');
const dotenv = require('dotenv');
const cors = require('cors');
const mongoose = require('mongoose');
const path = require('path');
const http = require('http');
const { Server } = require('socket.io');

const authRoutes = require('./routes/authRoutes');
const userRoutes = require('./routes/userRoutes');
const adminRoutes = require('./routes/adminRoutes');
const bookRoutes = require('./routes/userBooks');
const bookReadRoutes = require('./routes/bookReadRoutes');
const adminBookRoutes = require('./routes/adminBookRoutes');
const chatRoutes = require('./routes/chatRoutes');

const { socketAuth } = require('./middleware/socketAuth');

dotenv.config();

const app = express();
const server = http.createServer(app);
const io = new Server(server, {
  cors: {
    origin: '*',
    methods: ['GET', 'POST', 'DELETE', 'PATCH'],
  },
});

// Attach io to app for controllers
app.set('io', io);

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
app.use('/api/chat', chatRoutes);

// 🛑 Global error handler
app.use((err, req, res, next) => {
  console.error('🔥 Unhandled error:', err);
  res.status(500).json({ message: 'Internal Server Error', details: err.message });
});

// 🔗 MongoDB connection
mongoose
  .connect(process.env.MONGO_URI)
  .then(() => {
    console.log('✅ MongoDB connected');
    server.listen(process.env.PORT || 5000, () => {
      console.log(`🚀 Server running on port ${process.env.PORT || 5000}`);
    });
  })
  .catch((err) => {
    console.error('❌ Failed to connect to MongoDB:', err.message);
  });

// ⚡ Socket.io authentication
io.use(socketAuth);

io.on('connection', (socket) => {
  console.log(`🔌 User connected: ${socket.userId} (${socket.userType})`);

  // Join room for each conversation
  socket.on('joinRoom', (conversationId) => {
    socket.join(conversationId);
    console.log(`📥 User ${socket.userId} joined room: ${conversationId}`);
  });

  // Disconnect
  socket.on('disconnect', () => {
    console.log(`❌ User disconnected: ${socket.userId}`);
  });
});
