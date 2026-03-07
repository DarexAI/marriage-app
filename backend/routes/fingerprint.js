const express = require("express");
const multer = require("multer");
const streamifier = require("streamifier");

const router = express.Router();

const cloudinary = require("../config/cloudinary");
const Fingerprint = require("../models/Fingerprint");

const storage = multer.memoryStorage();

const upload = multer({
  storage,
  limits: { fileSize: 2 * 1024 * 1024 } // 2MB limit
});

/* ==================================
   UPLOAD FINGERPRINT
================================== */
router.post(
  "/uploadFingerprint",
  upload.single("fingerprint"),
  async (req, res) => {

    try {

      const { applicationId, person } = req.body;

      if (!req.file) {
        return res.status(400).json({ error: "No fingerprint uploaded" });
      }

      const uploadStream = () => {
        return new Promise((resolve, reject) => {

          const stream = cloudinary.uploader.upload_stream(
            { folder: "fingerprints" },
            (error, result) => {
              if (result) resolve(result);
              else reject(error);
            }
          );

          streamifier
            .createReadStream(req.file.buffer)
            .pipe(stream);

        });
      };

      const result = await uploadStream();

      const update = {};
      update[`biometrics.${person}`] = result.secure_url;

      const fingerprintDoc = await Fingerprint.findOneAndUpdate(
        { applicationId },
        { $set: update },
        {
          new: true,
          upsert: true
        }
      );

      res.json({
        success: true,
        url: result.secure_url,
        data: fingerprintDoc
      });

    } catch (err) {

      console.error(err);

      res.status(500).json({
        error: "Upload failed"
      });

    }

  }
);

module.exports = router;