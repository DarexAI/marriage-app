const mongoose = require("mongoose");

const CertificateSchema = new mongoose.Schema({
  applicationId: mongoose.Schema.Types.ObjectId,
  cpan: String,
  certificateUrl: String,
  createdAt: { type: Date, default: Date.now }
});

module.exports = mongoose.model("Certificate", CertificateSchema);