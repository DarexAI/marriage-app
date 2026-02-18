const mongoose = require("mongoose");

const OfficerSchema = new mongoose.Schema({
  name: String,
  email: { type: String, unique: true },
  password: String,
  officerId: String,
  ward: String,
  role: {
    type: String,
    default: "officer"
  },
  createdAt: {
    type: Date,
    default: Date.now
  }
});

module.exports = mongoose.model("officers", OfficerSchema);
