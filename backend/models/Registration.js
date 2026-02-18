const mongoose = require("mongoose");

const registrationSchema = new mongoose.Schema(
  {
    name: String,
    email: String,
    phone: String,
    aadhaar: {
      type: String,
      unique: true, // prevents duplicate Aadhaar
      required: true,
    },
    password: {
      type: String,
      required: true,
    },
  },
  { timestamps: true }
);

module.exports = mongoose.model(
  "Registration",
  registrationSchema,
  "registrations"
);
