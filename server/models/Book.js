const mongoose = require('mongoose');
const path = require('path');
const fs = require('fs');

const bookSchema = new mongoose.Schema(
  {
    title: {
      type: String,
      required: [true, 'Book title is required'],
      trim: true,
    },
    author: {
      type: String,
      required: [true, 'Author is required'],
      trim: true,
    },
    genre: {
      type: String,
      required: [true, 'Genre is required'],
    },
    price: {
      type: Number,
      required: [true, 'Price is required'],
      min: 0,
    },
    image: {
      type: String,
      required: true,
      validate: {
        validator: function (v) {
          return /^https?:\/\/.+\.(jpg|jpeg|png|webp|gif)$/.test(v);
        },
        message: props => `${props.value} is not a valid image URL`,
      },
    },
    pdfUrl: {
      type: String,
      required: true,
      validate: {
        validator: function (v) {
          return /^https?:\/\/.+\.pdf$/.test(v);
        },
        message: props => `${props.value} is not a valid PDF URL`,
      },
    },
  },
  { timestamps: true }
);

// 🔍 Virtuals for filename extraction
bookSchema.virtual('pdfFilename').get(function () {
  return this.pdfUrl?.split('/').pop();
});

bookSchema.virtual('imageFilename').get(function () {
  return this.image?.split('/').pop();
});

// 🧪 Optional method to check if PDF exists on server
bookSchema.methods.pdfExistsOnServer = function () {
  const filename = this.pdfFilename;
  const filePath = path.join(__dirname, '..', 'uploads/pdfs', filename);
  return fs.existsSync(filePath);
};

module.exports = mongoose.model('Book', bookSchema);


