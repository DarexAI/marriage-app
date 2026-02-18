const express = require("express");
const bcrypt = require("bcrypt");
const router = express.Router();
const Registration = require("../models/Registration");

router.post("/register", async (req, res) => {
  try {
    const { name, email, phone, aadhaar, password } = req.body;

    // Check Aadhaar duplicate
    const existingUser = await Registration.findOne({ aadhaar });

    if (existingUser) {
      return res.status(400).json({
        success: false,
        message: "User with this Aadhaar already exists",
      });
    }

    // Encrypt password
    const hashedPassword = await bcrypt.hash(password, 10);

    const user = await Registration.create({
      name,
      email,
      phone,
      aadhaar,
      password: hashedPassword,
    });

    res.json({
      success: true,
      message: "Registration successful",
      data: user,
    });

  } catch (error) {
    res.status(500).json({
      success: false,
      message: error.message,
    });
  }
});

module.exports = router;



// LOGIN ROUTE
router.post("/login", async (req, res) => {
  try {
    const { email, password } = req.body;

    const user = await Registration.findOne({ email });

    if (!user) {
      return res.status(400).json({
        success: false,
        message: "Email not registered",
      });
    }

    // Compare encrypted password
    const match = await bcrypt.compare(password, user.password);

    if (!match) {
      return res.status(400).json({
        success: false,
        message: "Incorrect password",
      });
    }

    res.json({
      success: true,
      message: "Login successful",
      user,
    });

  } catch (error) {
    res.status(500).json({
      success: false,
      message: error.message,
    });
  }
});

// GET USER PROFILE BY EMAIL
router.get("/profile/:email", async (req, res) => {
  try {
    const user = await Registration.findOne({ email: req.params.email });

    if (!user) {
      return res.status(404).json({
        success: false,
        message: "User not found",
      });
    }

    res.json({
      success: true,
      user,
    });

  } catch (error) {
    res.status(500).json({
      success: false,
      message: error.message,
    });
  }
});
