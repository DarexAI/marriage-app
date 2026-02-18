const express = require("express");
const router = express.Router();

const upload = require("../config/multer");
const Application = require("../models/Application");

const generateCPAN = () => {
  const date = new Date()
    .toISOString()
    .slice(0, 10)
    .replace(/-/g, "");

  const unique = Math.floor(100000 + Math.random() * 900000);

  return `CPAN-ULH-${date}-${unique}`;
};


router.post("/applications", upload.any(), async (req, res) => {
  try {
    console.log("BODY:", req.body);
    console.log("FILES:", req.files);

    // Safely parse JSON data
    let formData = {};
    if (req.body.data) {
      try {
        formData = JSON.parse(req.body.data);
      } catch (err) {
        console.log("JSON parse error:", err);
      }
    }

    // IMPORTANT: Extract userId properly
    const userId =
      req.body.userId ||
      formData.userId ||
      null;

    if (!userId) {
      return res.status(400).json({
        success: false,
        message: "User ID missing"
      });
    }

    // Collect uploaded documents
    const documents = {};
    if (req.files) {
      req.files.forEach(file => {
        documents[file.fieldname] = file.path;
      });
    }

    const cpan = generateCPAN();

    const application = new Application({
      userId,
      formData,
      documents,
      cpan,
      status: "in_progress"
    });

    await application.save();

    res.json({
      success: true,
      cpan
    });

  } catch (err) {
    console.error(err);
    res.status(500).json({ success: false });
  }
});



router.get("/applications/status/:userId", async (req, res) => {
  try {
const app = await Application.findOne({
  userId: req.params.userId
});



    if (!app) {
      return res.json({
        status: "not_applied"
      });
    }

    res.json({
      status: app.status,
      cpan: app.cpan,
      application: app
    });

  } catch (err) {
    res.status(500).json({ error: err.message });
  }
});

// GET APPLICATION BY EMAIL (FOR OFFICER DASHBOARD)
router.get("/applications/by-email/:email", async (req, res) => {
  try {
    const app = await Application.findOne({
      userId: req.params.email
    });

    if (!app) {
      return res.json({
        success: false,
        message: "Application not found"
      });
    }

    res.json({
      success: true,
      application: app
    });

  } catch (err) {
    console.error(err);
    res.status(500).json({ success: false });
  }
});

module.exports = router;
