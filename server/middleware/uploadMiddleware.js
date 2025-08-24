// Backend/middleware/uploadMiddleware.js
const multer = require("multer");
const path = require("path");

// Storage for PDFs
const pdfStorage = multer.diskStorage({
  destination: (req, file, cb) => {
    cb(null, "uploads/books/");
  },
  filename: (req, file, cb) => {
    cb(null, Date.now() + path.extname(file.originalname)); // unique filename
  },
});

// Storage for Images
const imageStorage = multer.diskStorage({
  destination: (req, file, cb) => {
    cb(null, "uploads/images/");
  },
  filename: (req, file, cb) => {
    cb(null, Date.now() + path.extname(file.originalname));
  },
});

// File filter (only PDF for books, only image for covers)
const fileFilter = (req, file, cb) => {
  if (file.mimetype.startsWith("image/") || file.mimetype === "application/pdf") {
    cb(null, true);
  } else {
    cb(new Error("Invalid file type. Only images and PDFs allowed!"), false);
  }
};

const upload = multer({ storage: pdfStorage, fileFilter });
const uploadImage = multer({ storage: imageStorage, fileFilter });

module.exports = { upload, uploadImage };
