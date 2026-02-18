const multer = require("multer");
const { CloudinaryStorage } = require("multer-storage-cloudinary");
const cloudinary = require("./cloudinary");

const storage = new CloudinaryStorage({
  cloudinary,
  params: {
    folder: "marriage_documents",
    resource_type: "image"
// supports images, pdfs, docs
  }
});

module.exports = multer({ storage });
