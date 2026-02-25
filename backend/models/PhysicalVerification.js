const mongoose = require("mongoose");

const PhysicalVerificationSchema = new mongoose.Schema({
  applicationId: {
    type: mongoose.Schema.Types.ObjectId,
    ref: "Application",
    required: true
  },

  cpan: String,

  officerId: String,

  documentsVerified: {
    type: Boolean,
    default: false
  },

  biometricDone: {
    type: Boolean,
    default: false
  },

  livePhotos: {
    groom: String,
    bride: String,
    witness1: String,
    witness2: String,
    witness3: String
  },

  officerRemarks: String,

  verifiedAt: {
    type: Date,
    default: Date.now
  }
});

module.exports = mongoose.model(
  "PhysicalVerification",
  PhysicalVerificationSchema
);