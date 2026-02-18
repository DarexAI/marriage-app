const express = require("express");
const router = express.Router();

const Slot = require("../models/Slot");
const Application = require("../models/Application");


/* ===============================
   CREATE SLOT
=============================== */
router.post("/slots", async (req, res) => {
  try {
    const { officerId, date, startTime, endTime } = req.body;

    if (!officerId || !date || !startTime || !endTime) {
      return res.json({
        success: false,
        msg: "All fields required"
      });
    }

    // Prevent duplicate slot
    const exists = await Slot.findOne({
      officerId,
      date,
      startTime,
      endTime
    });

    if (exists) {
      return res.json({
        success: false,
        msg: "Slot already exists"
      });
    }

    const slot = new Slot({
      officerId,
      date,
      startTime,
      endTime,
      status: "available"
    });

    await slot.save();

    res.json({
      success: true,
      slot
    });

  } catch (err) {
    console.error(err);
    res.status(500).json({
      success: false,
      msg: "Server error"
    });
  }
});


/* ===============================
   BOOK SLOT (Schedule Verification)
=============================== */
router.post("/slots/book", async (req, res) => {
  try {
    const { slotId, applicationId, cpan, email } = req.body;

    const slot = await Slot.findById(slotId);

    if (!slot || slot.status !== "available") {
      return res.json({
        success: false,
        msg: "Slot unavailable"
      });
    }

    slot.status = "booked";
    slot.applicationId = applicationId;
    slot.cpan = cpan;
    slot.email = email;
    slot.bookedAt = new Date();

    await slot.save();

await Application.findByIdAndUpdate(
  applicationId,
  {
    $set: {
      appointmentSlot: slotId,
      appointmentDate: slot.date,
      appointmentStartTime: slot.startTime,
      appointmentEndTime: slot.endTime,
      status: "verification_scheduled"
    }
  }
);



    res.json({
      success: true,
      msg: "Verification scheduled"
    });

  } catch (err) {
    console.error(err);
    res.status(500).json({
      success: false,
      msg: "Server error"
    });
  }
});


/* ===============================
   GET AVAILABLE SLOTS
=============================== */
router.get("/slots/available", async (req, res) => {
  try {
    const slots = await Slot.find({ status: "available" })
      .sort({ date: 1, startTime: 1 });

    res.json({
      success: true,
      slots
    });

  } catch (err) {
    console.error(err);
    res.status(500).json({
      success: false,
      msg: "Server error"
    });
  }
});

/* ===============================
   GET SLOT BY ID (FOR RESTORE AFTER REFRESH)
=============================== */
router.get("/slots/:id", async (req, res) => {
  try {
    const slot = await Slot.findById(req.params.id);

    if (!slot) {
      return res.json({ success: false });
    }

    res.json({
      success: true,
      slot
    });

  } catch (err) {
    console.error(err);
    res.status(500).json({
      success: false,
      msg: "Server error"
    });
  }
});

/* ===============================
   RESCHEDULE SLOT
=============================== */
router.put("/slots/reschedule", async (req, res) => {
  try {
    const { oldSlotId, newSlotId, applicationId } = req.body;

    const oldSlot = await Slot.findById(oldSlotId);
    const newSlot = await Slot.findById(newSlotId);

    if (!newSlot || newSlot.status !== "available") {
      return res.json({
        success: false,
        msg: "New slot unavailable"
      });
    }

    // Make old slot available
    if (oldSlot) {
      oldSlot.status = "available";
      oldSlot.applicationId = null;
      oldSlot.cpan = null;
      oldSlot.email = null;
      await oldSlot.save();
    }

    // Book new slot
    newSlot.status = "booked";
    newSlot.applicationId = applicationId;
    await newSlot.save();

    // Update application
    await Application.findByIdAndUpdate(applicationId, {
      appointmentSlot: newSlotId,
      appointmentDate: newSlot.date,
      appointmentStartTime: newSlot.startTime,
      appointmentEndTime: newSlot.endTime,
      status: "verification_scheduled"
    });

    res.json({
      success: true,
      msg: "Slot rescheduled"
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
