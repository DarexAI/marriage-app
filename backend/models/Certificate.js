const mongoose = require("mongoose");

const CertificateSchema = new mongoose.Schema({
  applicationId: mongoose.Schema.Types.ObjectId,
  cpan: String,
  certificateUrl: String,
    receiptUrl: String,          // 🔥 ADD
  goshvaraUrl: String,
  
  // Blockchain fields
  certificateId: String,
  certificateHash: String,
  txSignature: String,
  blockchainStatus: {
    type: String,
    enum: ['pending', 'confirmed', 'failed'],
    default: 'pending'
  },
  blockchainError: String,
  registeredOnChain: { type: Boolean, default: false },
  
  createdAt: { type: Date, default: Date.now }
});

module.exports = mongoose.model("Certificate", CertificateSchema);