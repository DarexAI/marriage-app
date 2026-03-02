const mongoose = require("mongoose");

const biometricSchema = new mongoose.Schema({
  userId: {
    type: mongoose.Schema.Types.ObjectId,
    ref: "Application", // or User model if you have one
  },
  pidXml: {
    type: String,
    required: true,
  },
  deviceInfo: {
    type: String, // optional: store RD info XML
  },
  capturedAt: {
    type: Date,
    default: Date.now,
  },
});

module.exports = mongoose.model("Biometric", biometricSchema);