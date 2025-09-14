const cloudinary = require('cloudinary').v2;
const { CloudinaryStorage } = require('multer-storage-cloudinary');

// 🔐 Cloudinary configuration using environment variables
cloudinary.config({
  cloud_name: process.env.CLOUDINARY_CLOUD_NAME,
  api_key: process.env.CLOUDINARY_API_KEY,
  api_secret: process.env.CLOUDINARY_API_SECRET,
});

// 📦 Storage engine for multer
const storage = new CloudinaryStorage({
  cloudinary,
  params: async (req, file) => {
    let folder = 'mern-library/others';
    let resource_type = 'auto';

    if (file.mimetype.startsWith('image/')) {
      folder = 'mern-library/images';
      resource_type = 'image';
    } else if (file.mimetype === 'application/pdf') {
      folder = 'mern-library/pdfs';
      resource_type = 'raw';
    }

    return {
      folder,
      resource_type,
      public_id: `${Date.now()}-${file.originalname.split('.')[0]}`,
    };
  },
});

module.exports = { cloudinary, storage };
