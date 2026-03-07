const mongoose = require("mongoose");

const FingerprintSchema = new mongoose.Schema({

  applicationId: {
    type: mongoose.Schema.Types.ObjectId,
    ref: "Application",
    required: true,
    unique: true
  },

  biometrics: {
    groom: String,
    bride: String,
    witness1: String,
    witness2: String,
    witness3: String
  },

  capturedAt: {
    type: Date,
    default: Date.now
  }

});

module.exports = mongoose.model("Fingerprint", FingerprintSchema);