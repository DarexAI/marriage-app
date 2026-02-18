const mongoose = require("mongoose");

const ApplicationSchema = new mongoose.Schema({
  userId: String,
    formData: Object,
  documents: Object,
  appointmentDate: Date,
appointmentSlot: {
  type: mongoose.Schema.Types.ObjectId,
  ref: "slots"
},

  cpan: String,
    status: {
    type: String,
    default: "in_progress" // not_applied | in_progress | approved
  },
  createdAt: {
    type: Date,
    default: Date.now
  }
});

module.exports = mongoose.model("applications", ApplicationSchema);
