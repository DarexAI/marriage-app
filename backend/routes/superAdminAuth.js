const express = require("express");
const router = express.Router();
const bcrypt = require("bcryptjs");
const jwt = require("jsonwebtoken");

const SuperAdmin = require("../models/SuperAdmin");


// ===============================
// CREATE SUPER ADMIN (Run Once)
// ===============================
router.post("/create", async (req, res) => {
  try {
    const { name, email, password } = req.body;

    const exists = await SuperAdmin.findOne({ email });
    if (exists) {
      return res.json({ success: false, msg: "Admin already exists" });
    }

    const hashed = await bcrypt.hash(password, 10);

    const admin = new SuperAdmin({
      name,
      email,
      password: hashed
    });

    await admin.save();

    res.json({ success: true, msg: "Super admin created" });

  } catch (err) {
    console.log(err);
    res.status(500).json({ success: false });
  }
});


// ===============================
// LOGIN
// ===============================
router.post("/login", async (req, res) => {
  try {
    const { email, password } = req.body;

    const admin = await SuperAdmin.findOne({ email });
    if (!admin) {
      return res.json({ success: false, msg: "Invalid credentials" });
    }

    const isMatch = await bcrypt.compare(password, admin.password);
    if (!isMatch) {
      return res.json({ success: false, msg: "Invalid credentials" });
    }

    const token = jwt.sign(
      { id: admin._id, role: "super_admin" },
      "SUPER_ADMIN_SECRET",
      { expiresIn: "1d" }
    );

    res.json({
      success: true,
      token,
      admin: {
        id: admin._id,
        name: admin.name,
        email: admin.email
      }
    });

  } catch (err) {
    console.log(err);
    res.status(500).json({ success: false });
  }
});

module.exports = router;