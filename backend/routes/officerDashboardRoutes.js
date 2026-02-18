const express = require("express");
const router = express.Router();
const Application = require("../models/Application");
const upload = require("../config/multer");

// GET ALL APPLICATIONS
router.get("/applications", async (req, res) => {
const apps = await Application.find()
  .populate("appointmentSlot") // ⭐ THIS IS KEY
  .sort({ createdAt: -1 });

res.json(apps);

});

// UPDATE STATUS
router.put("/applications/:id", async (req, res) => {
  await Application.findByIdAndUpdate(
    req.params.id,
    { status: req.body.status }
  );

  res.json({ success: true });
});
router.put("/schedule/:id", async (req, res) => {
  try {
    await Application.findByIdAndUpdate(
      req.params.id,
      { appointmentDate: req.body.appointmentDate }
    );

    res.json({ success: true });
  } catch {
    res.status(500).json({ success: false });
  }
});

router.put("/update-application/:id", upload.any(), async (req, res) => {
  try {
    // GET EXISTING APPLICATION
    const application = await Application.findById(req.params.id);

    if (!application) {
      return res.status(404).json({ success: false });
    }

    // PARSE FORM DATA
    let formData = {};
    if (req.body.data) {
      formData = JSON.parse(req.body.data);
    }

    // START WITH EXISTING DOCUMENTS
    const documents = { ...application.documents };

    // REPLACE ONLY NEW UPLOADED FILES
    if (req.files) {
      req.files.forEach(file => {
        documents[file.fieldname] = file.path;
      });
    }

    // UPDATE APPLICATION
    application.formData = formData;
    application.documents = documents;

    await application.save();

    res.json({ success: true });

  } catch (err) {
    console.error(err);
    res.status(500).json({ success: false });
  }
});


module.exports = router;
