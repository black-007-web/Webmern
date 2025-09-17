const mongoose = require("mongoose");

const bookSchema = new mongoose.Schema(
  {
    title: {
      type: String,
      required: [true, "Book title is required"],
      trim: true,
    },
    author: {
      type: String,
      required: [true, "Author is required"],
      trim: true,
    },
    genre: {
      type: String,
      required: [true, "Genre is required"],
      trim: true,
    },
    price: {
      type: Number,
      required: [true, "Price is required"],
      min: 0,
    },
    image: {
      type: String,
      required: false,
      validate: {
        validator: function (v) {
          if (!v) return true;
          return /^https?:\/\/.+/.test(v);
        },
        message: (props) => `${props.value} is not a valid image URL`,
      },
    },
    pdfUrl: {
      type: String,
      required: [true, "PDF URL is required"],
      validate: {
        validator: function (v) {
          return /^https?:\/\/.+/.test(v);
        },
        message: (props) => `${props.value} is not a valid PDF URL`,
      },
    },
    // New field for Cloudinary public ID (for signed URLs)
    pdfPublicId: {
      type: String,
      required: [true, "PDF Public ID is required"],
      trim: true,
    },
  },
  { timestamps: true }
);

// Virtuals for filenames
bookSchema.virtual("pdfFilename").get(function () {
  return this.pdfUrl?.split("/").pop();
});
bookSchema.virtual("imageFilename").get(function () {
  return this.image?.split("/").pop();
});

// Deprecated local file check
bookSchema.methods.pdfExistsOnServer = function () {
  return false;
};

module.exports = mongoose.model("Book", bookSchema);

