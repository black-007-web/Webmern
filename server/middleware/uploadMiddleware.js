const multer = require("multer");
const { storage } = require("../config/cloudinary");

// File filter (optional, still useful for validation)
const fileFilter = (req, file, cb) => {
  if (
    file.mimetype.startsWith("image/") ||
    file.mimetype === "application/pdf"
  ) {
    cb(null, true);
  } else {
    cb(new Error("Invalid file type. Only images and PDFs allowed!"), false);
  }
};

// Upload middleware using Cloudinary storage
const upload = multer({ storage, fileFilter }).fields([
  { name: "image", maxCount: 1 },
  { name: "pdf", maxCount: 1 },
]);

module.exports = { upload };
