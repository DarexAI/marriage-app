const express = require("express");
const router = express.Router();
const cloudinary = require("../config/cloudinary");

/* ===============================
   UPLOAD IMAGE TO CLOUDINARY
=============================== */
router.post("/upload-photo", async (req, res) => {
  try {
    const { image } = req.body; // base64 image

    const uploaded = await cloudinary.uploader.upload(image, {
      folder: "physical_verification",
    });

    res.json({
      success: true,
      url: uploaded.secure_url
    });

  } catch (err) {
    console.error(err);
    res.status(500).json({
      success: false,
      msg: "Upload failed"
    });
  }
});

module.exports = router;