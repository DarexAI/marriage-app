const express = require("express");
const router = express.Router();
const Registration = require("../models/Registration");

/* GET ALL CITIZENS */
router.get("/citizens", async (req, res) => {
  try {
    const users = await Registration.find()
      .sort({ createdAt: -1 });

    res.json({
      success: true,
      users
    });

  } catch (err) {
    console.error(err);
    res.status(500).json({
      success: false,
      msg: "Server error"
    });
  }
});


/* DELETE CITIZEN */
router.delete("/citizens/:id", async (req, res) => {
  try {
    await Registration.findByIdAndDelete(req.params.id);

    res.json({
      success: true,
      msg: "Citizen deleted"
    });

  } catch (err) {
    res.status(500).json({
      success: false
    });
  }
});

module.exports = router;
