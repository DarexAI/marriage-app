const express = require("express");
const router = express.Router();

const PhysicalVerification = require("../models/PhysicalVerification");
const Application = require("../models/Application"); // ⭐ ADD THIS

/* ===============================
   SAVE PHYSICAL VERIFICATION
=============================== */
router.post("/physical-verify", async (req, res) => {
  try {
    const data = req.body;

    // Save verification record
    const verification = new PhysicalVerification(data);
    await verification.save();

    // ⭐ UPDATE APPLICATION STATUS
    await Application.findByIdAndUpdate(
      data.applicationId,
      {
        status: "physical_verification_completed"
      }
    );

    res.json({
      success: true,
      msg: "Physical verification saved"
    });

  } catch (err) {
    console.error(err);
    res.status(500).json({
      success: false,
      msg: "Server error"
    });
  }
});

module.exports = router;