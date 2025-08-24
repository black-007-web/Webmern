const mongoose = require('mongoose');
const dotenv = require('dotenv');
const Admin = require('../models/admin');
const bcrypt = require('bcryptjs');

dotenv.config();
mongoose.connect(process.env.MONGO_URI);

const seedAdmin = async () => {
  try {
    const existing = await Admin.findOne({ email: 'mdfarial100@gmail.com' });
    if (existing) {
      console.log('Admin already exists');
      process.exit();
    }

    const hashedPassword = await bcrypt.hash('mongodb69@', 10);
    await Admin.create({
      name: 'Mohammad Farial',
      email: 'mdfarial100@gmail.com',
      password: 'mongodb69@',
    });

    console.log('✅ Admin seeded');
    process.exit();
  } catch (err) {
    console.error(err);
    process.exit(1);
  }
};

seedAdmin();
