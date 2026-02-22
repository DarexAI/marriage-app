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

    // Prevent duplicate slot same officer/date/time
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
   BOOK SLOT (INITIAL SCHEDULING)
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

    // Book slot
    slot.status = "booked";
    slot.applicationId = applicationId;
    slot.cpan = cpan;
    slot.email = email;
    slot.bookedAt = new Date();
    await slot.save();

    // Update application
    await Application.findByIdAndUpdate(applicationId, {
      $set: {
        appointmentSlot: {
          _id: slot._id,
          date: slot.date,
          startTime: slot.startTime,
          endTime: slot.endTime
        },
        appointmentDate: slot.date,
        appointmentStartTime: slot.startTime,
        appointmentEndTime: slot.endTime,
        status: "verification_scheduled"
      }
    });

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
   GET SLOT BY ID
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
   RESCHEDULE SLOT (FIXED VERSION)
=============================== */
router.put("/slots/reschedule", async (req, res) => {
  try {
    const { oldSlotId, newSlotId, applicationId } = req.body;

    const oldSlot = await Slot.findById(oldSlotId);
    const newSlot = await Slot.findById(newSlotId);
    const application = await Application.findById(applicationId);

    if (!newSlot || newSlot.status !== "available") {
      return res.json({
        success: false,
        msg: "New slot unavailable"
      });
    }

    /* ---- Restore old slot ---- */
    if (oldSlot) {
      oldSlot.status = "available";
      oldSlot.applicationId = null;
      oldSlot.cpan = null;
      oldSlot.email = null;
      oldSlot.bookedAt = null;
      await oldSlot.save();
    }

    /* ---- Book new slot properly ---- */
    newSlot.status = "booked";
    newSlot.applicationId = applicationId;
    newSlot.cpan = application.cpan;
    newSlot.email = application.formData?.userId;
    newSlot.bookedAt = new Date();
    await newSlot.save();

    /* ---- Update application ---- */
    await Application.findByIdAndUpdate(applicationId, {
      $set: {
        appointmentSlot: {
          _id: newSlot._id,
          date: newSlot.date,
          startTime: newSlot.startTime,
          endTime: newSlot.endTime
        },
        appointmentDate: newSlot.date,
        appointmentStartTime: newSlot.startTime,
        appointmentEndTime: newSlot.endTime,
        status: "verification_scheduled"
      }
    });

    res.json({
      success: true,
      msg: "Slot rescheduled successfully"
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
   GET ALL SLOTS (ADMIN VIEW)
=============================== */
router.get("/slots", async (req, res) => {
  try {
    const slots = await Slot.find()
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
   DELETE SLOT
=============================== */
router.delete("/slots/:id", async (req, res) => {
  try {
    const slot = await Slot.findById(req.params.id);

    if (!slot) {
      return res.json({ success: false });
    }

    if (slot.status === "booked") {
      return res.json({
        success: false,
        msg: "Cannot delete booked slot"
      });
    }

    await Slot.findByIdAndDelete(req.params.id);

    res.json({
      success: true,
      msg: "Slot deleted"
    });

  } catch (err) {
    res.status(500).json({ success: false });
  }
});


/* ===============================
   UPDATE SLOT TIME
=============================== */
router.put("/slots/:id", async (req, res) => {
  try {
    const { startTime, endTime } = req.body;

    const slot = await Slot.findById(req.params.id);

    if (!slot) {
      return res.json({ success: false });
    }

    if (slot.status === "booked") {
      return res.json({
        success: false,
        msg: "Cannot edit booked slot"
      });
    }

    slot.startTime = startTime;
    slot.endTime = endTime;

    await slot.save();

    res.json({
      success: true,
      slot
    });

  } catch (err) {
    res.status(500).json({ success: false });
  }
});

module.exports = router;