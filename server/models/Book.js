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

    // ✅ Cover image (Cloudinary URL optional)
    image: {
      type: String,
      required: false,
      validate: {
        validator: function (v) {
          if (!v) return true; // allow empty
          return /^https?:\/\/.+/.test(v); // accept Cloudinary or any URL
        },
        message: (props) => `${props.value} is not a valid image URL`,
      },
    },

    // ✅ Flexible file storage
    fileUrl: {
      type: String,
      required: false, // Cloudinary or external URL
      validate: {
        validator: function (v) {
          if (!v) return true;
          return /^https?:\/\/.+/.test(v);
        },
        message: (props) => `${props.value} is not a valid file URL`,
      },
    },
    fileContent: {
      type: Buffer, // raw binary (PDF, video, audio, etc.)
      required: false,
    },
    fileType: {
      type: String, // MIME type e.g. application/pdf, video/mp4
      required: false,
    },
  },
  { timestamps: true }
);

// 🔍 Virtuals for filename extraction (for convenience)
bookSchema.virtual("fileName").get(function () {
  if (this.fileUrl) return this.fileUrl.split("/").pop();
  return this.title.replace(/\s+/g, "_"); // fallback to title
});

bookSchema.virtual("imageFilename").get(function () {
  return this.image?.split("/").pop();
});

// 🧪 Method: check if stored as raw content
bookSchema.methods.hasRawContent = function () {
  return !!this.fileContent;
};

module.exports = mongoose.model("Book", bookSchema);
