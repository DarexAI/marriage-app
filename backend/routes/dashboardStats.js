const express = require("express");
const router = express.Router();

const Application = require("../models/Application");
const PhysicalVerification = require("../models/PhysicalVerification");
const Certification = require("../models/Certificate");
const Certificate = require("../models/Certificate");

router.get("/dashboard-stats", async (req, res) => {
  try {
    const totalApplications = await Application.countDocuments();

    const totalPhysicalVerifications =
      await PhysicalVerification.countDocuments();

    const totalApproved =
      await PhysicalVerification.countDocuments({
        status: "completed"
      });

    const pendingVerifications =
      await Application.countDocuments({
        status: "verification_scheduled"
      });

    const certificatesIssued =
      await Certificate.countDocuments();

    res.json({
      success: true,
      stats: {
        totalApplications,
        totalPhysicalVerifications,
        totalApproved,
        pendingVerifications,
        certificatesIssued
      }
    });
  } catch (err) {
    console.log(err);
    res.status(500).json({ success: false });
  }
});

module.exports = router;