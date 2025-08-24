// Backend/middleware/adminMiddleware.js
const jwt = require('jsonwebtoken');
const Admin = require('../models/admin'); // ✅ Capitalized to match filename

exports.adminProtect = async (req, res, next) => {
  let token;

  if (
    req.headers.authorization &&
    req.headers.authorization.startsWith('Bearer')
  ) {
    try {
      // Extract token
      token = req.headers.authorization.split(' ')[1];

      // Verify token
      const decoded = jwt.verify(token, process.env.JWT_SECRET);

      // Find admin by decoded id
      const admin = await Admin.findById(decoded.id).select('-password');
      if (!admin) {
        return res.status(404).json({ message: 'Admin not found' });
      }

      // Attach admin object to request
      req.admin = admin;
      return next();
    } catch (error) {
      console.error('Admin token verification failed:', error.message);
      return res
        .status(401)
        .json({ message: 'Not authorized, token invalid or expired' });
    }
  }

  // No token case
  return res.status(401).json({ message: 'Not authorized, no token provided' });
};
