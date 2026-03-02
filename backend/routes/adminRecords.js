const express = require("express");
const router = express.Router();
const Certificate = require("../models/Certificate");
const Application = require("../models/Application");

router.get("/records", async (req, res) => {
  try {
    const { filter } = req.query;

    let dateFilter = {};

    const now = new Date();

    if (filter === "today") {
      const start = new Date();
      start.setHours(0, 0, 0, 0);
      dateFilter = { createdAt: { $gte: start } };
    }

    if (filter === "week") {
      const start = new Date();
      start.setDate(now.getDate() - 7);
      dateFilter = { createdAt: { $gte: start } };
    }

    if (filter === "month") {
      const start = new Date();
      start.setMonth(now.getMonth() - 1);
      dateFilter = { createdAt: { $gte: start } };
    }

    const certificates = await Certificate.find(dateFilter)
      .sort({ createdAt: -1 });

    const records = [];

    for (const cert of certificates) {
      const app = await Application.findById(cert.applicationId);

      records.push({
        cpan: cert.cpan,
        applicantName:
          app?.formData?.["groom_First Name *"] +
          " " +
          app?.formData?.["groom_Last Name *"],
        blockchainStatus: cert.blockchainStatus,
        from: "AoAxwT6ezYEgHvvXz6pWxkKPzJwKJwrAE4ineJvgGwp4",
        to: cert.certificateRecordAddress || "-",
        createdAt: cert.createdAt
      });
    }

    res.json({ success: true, records });

  } catch (err) {
    console.log(err);
    res.status(500).json({ success: false });
  }
});

module.exports = router;