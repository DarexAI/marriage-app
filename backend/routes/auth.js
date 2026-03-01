const express = require("express");
const router = express.Router();

const bcrypt = require("bcrypt");
const crypto = require("crypto");
const nodemailer = require("nodemailer");
const Registration = require("../models/Registration");
router.post("/send-otp", async (req, res) => {
  try {
    const { email } = req.body;

    const user = await Registration.findOne({ email });

    if (!user) {
      return res.json({ success: false, message: "Email not registered" });
    }

    const crypto = require("crypto");

    const otp = Math.floor(100000 + Math.random() * 900000).toString();

    const otpHash = crypto
      .createHash("sha256")
      .update(otp)
      .digest("hex");

    user.resetOtpHash = otpHash;
    user.otpExpiry = Date.now() + 5 * 60 * 1000; // 5 minutes
    user.otpAttempts = 0;

    await user.save();

    // 🔹 Send Email (nodemailer)
    const nodemailer = require("nodemailer");

    const transporter = nodemailer.createTransport({
      service: "gmail",
      auth: {
        user: process.env.EMAIL_USER,
        pass: process.env.EMAIL_PASS
      }
    });

    await transporter.sendMail({
      from: process.env.EMAIL_USER,
      to: email,
      subject: "Marriage Portal - Password Reset OTP",
      html: `
        <h2>Password Reset Request</h2>
        <p>Your OTP is:</p>
        <h1>${otp}</h1>
        <p>This OTP is valid for 5 minutes.</p>
      `
    });

    res.json({ success: true });

  } catch (err) {
    console.log(err);
    res.status(500).json({ success: false });
  }
});

router.post("/verify-otp", async (req, res) => {
  try {
    const { email, otp } = req.body;

    const user = await Registration.findOne({ email });

    if (!user || !user.resetOtpHash) {
      return res.json({ success: false, message: "Invalid request" });
    }

    if (user.otpExpiry < Date.now()) {
      return res.json({ success: false, message: "OTP expired" });
    }

    if (user.otpAttempts >= 3) {
      return res.json({ success: false, message: "Too many attempts" });
    }

    const crypto = require("crypto");

    const otpHash = crypto
      .createHash("sha256")
      .update(otp)
      .digest("hex");

    if (otpHash !== user.resetOtpHash) {
      user.otpAttempts += 1;
      await user.save();
      return res.json({ success: false, message: "Invalid OTP" });
    }

    res.json({ success: true });

  } catch (err) {
    console.log(err);
    res.status(500).json({ success: false });
  }
});

router.post("/reset-password", async (req, res) => {
  try {
    const { email, password } = req.body;

    const user = await Registration.findOne({ email });

    if (!user) {
      return res.json({ success: false });
    }

    const bcrypt = require("bcrypt");

    const hashedPassword = await bcrypt.hash(password, 10);

    user.password = hashedPassword;

    // Clear OTP fields
    user.resetOtpHash = null;
    user.otpExpiry = null;
    user.otpAttempts = 0;

    await user.save();

    res.json({ success: true });

  } catch (err) {
    console.log(err);
    res.status(500).json({ success: false });
  }
});

module.exports = router;