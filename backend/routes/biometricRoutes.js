const express = require("express");
const router = express.Router();
const Biometric = require("../models/Biometric");

router.post("/store-pid", async (req, res) => {
  try {
    const { pidXml, userId } = req.body;

    const biometric = await Biometric.create({
      pidXml,
      userId,
    });

    res.json({
      success: true,
      message: "Biometric stored",
      data: biometric,
    });

  } catch (error) {
    console.error(error);
    res.status(500).json({ success: false });
  }
});

module.exports = router;