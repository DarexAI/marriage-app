const express = require("express");
const bcrypt = require("bcryptjs");
const jwt = require("jsonwebtoken");

const Officer = require("../models/Officer");

const router = express.Router();


// REGISTER OFFICER (Admin only ideally)
router.post("/register", async (req, res) => {
  try {
    const { name, email, password, officerId, ward } = req.body;

    const hashed = await bcrypt.hash(password, 10);

    const officer = new Officer({
      name,
      email,
      password: hashed,
      officerId,
      ward
    });

    await officer.save();

    res.json({ success: true });
  } catch (err) {
    res.status(500).json({ success: false });
  }
});


// LOGIN OFFICER
router.post("/login", async (req, res) => {
  try {
    const { email, password } = req.body;

    const officer = await Officer.findOne({ email });
    if (!officer) {
      return res.json({ success: false, msg: "Invalid Email" });
    }

    const match = await bcrypt.compare(password, officer.password);
    if (!match) {
      return res.json({ success: false, msg: "Wrong Password" });
    }

    const token = jwt.sign(
      { id: officer._id },
      process.env.JWT_SECRET || "secret",
      { expiresIn: "1d" }
    );

    res.json({
      success: true,
      token,
      officer
    });

  } catch {
    res.status(500).json({ success: false });
  }
});



module.exports = router;
