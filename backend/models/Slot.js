const mongoose = require("mongoose");

const SlotSchema = new mongoose.Schema({
  officerId: {
    type: String,
    required: true
  },

  date: {
    type: String, // YYYY-MM-DD
    required: true
  },

  startTime: {
    type: String,
    required: true
  },

  endTime: {
    type: String,
    required: true
  },

  status: {
    type: String,
    default: "available" // available | booked | cancelled
  },

  applicationId: {
    type: mongoose.Schema.Types.ObjectId,
    ref: "applications"
  },

  /* ⭐ ADD THESE */
  cpan: String,
  email: String,

  bookedAt: Date,

  createdAt: {
    type: Date,
    default: Date.now
  }
});

module.exports = mongoose.model("slots", SlotSchema);
