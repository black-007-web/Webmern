// Backend/middleware/socketAuth.js - Socket authentication
const jwt = require('jsonwebtoken');
const User = require('../models/User');
const Admin = require('../models/admin');

const socketAuth = async (socket, next) => {
  try {
    const { token, isAdmin } = socket.handshake.auth;

    if (!token) {
      return next(new Error('Authentication token required'));
    }

    // Verify JWT token
    const decoded = jwt.verify(token, process.env.JWT_SECRET);

    let user;
    if (isAdmin === true || isAdmin === 'true') {
      user = await Admin.findById(decoded.id).select('-password');
      if (!user) {
        return next(new Error('Admin not found'));
      }
      socket.userType = 'Admin';
    } else {
      user = await User.findById(decoded.id).select('-password');
      if (!user) {
        return next(new Error('User not found'));
      }
      socket.userType = 'User';
    }

    // Attach user info to socket
    socket.userId = user._id.toString();
    socket.user = user;
    socket.isAdmin = isAdmin === true || isAdmin === 'true';

    next();
  } catch (error) {
    console.error('Socket authentication error:', error);
    return next(new Error('Authentication failed'));
  }
};

module.exports = { socketAuth };
