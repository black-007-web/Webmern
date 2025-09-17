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
      required: false, // ✅ optional to match your controller
      validate: {
        validator: function (v) {
          if (!v) return true; // allow empty
          return /^https?:\/\/.+/.test(v); // ✅ looser check, works for Cloudinary
        },
        message: (props) => `${props.value} is not a valid image URL`,
      },
    },
    pdfUrl: {
      type: String,
      required: [true, "PDF URL is required"],
      validate: {
        validator: function (v) {
          return /^https?:\/\/.+/.test(v); // ✅ accept any https URL
        },
        message: (props) => `${props.value} is not a valid PDF URL`,
      },
    },
  },
  { timestamps: true }
);

// 🔍 Virtuals for filename extraction
bookSchema.virtual("pdfFilename").get(function () {
  return this.pdfUrl?.split("/").pop();
});

bookSchema.virtual("imageFilename").get(function () {
  return this.image?.split("/").pop();
});

// 🧪 Deprecated: Local file check (always false for Cloudinary)
bookSchema.methods.pdfExistsOnServer = function () {
  return false;
};

module.exports = mongoose.model("Book", bookSchema);
