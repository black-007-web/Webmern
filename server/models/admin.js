const mongoose = require('mongoose');
const bcrypt = require('bcryptjs');

// Admin Schema
const adminSchema = new mongoose.Schema({
  name: {
    type: String,
    required: true, // ✅ Make name required
  },
  email: {
    type: String,
    required: true,
    unique: true, // ✅ Ensures no duplicate admin emails
  },
  password: {
    type: String,
    required: true,
  },
}, {
  timestamps: true, // ✅ Optional: adds createdAt and updatedAt fields
});

// Compare entered password with hashed password
adminSchema.methods.matchPassword = async function (enteredPassword) {
  return await bcrypt.compare(enteredPassword, this.password);
};

// Hash password before saving
adminSchema.pre('save', async function (next) {
  if (!this.isModified('password')) return next();

  const salt = await bcrypt.genSalt(10);
  this.password = await bcrypt.hash(this.password, salt);
  next();
});

const Admin = mongoose.model('Admin', adminSchema);
module.exports = Admin;
