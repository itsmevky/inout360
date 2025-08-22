const mongoose = require("mongoose");

const rfidCardSchema = new mongoose.Schema(
  {
    uid: {
      type: String,
      required: true,
      unique: true,   // The actual RFID card UID (from reader)
      trim: true,
    },
    employeeId: {
      type: mongoose.Schema.Types.ObjectId,
      ref: "Employee",
      unique: true,   // one card → one employee
    },
    issuedAt: {
      type: Date,
      default: Date.now,
    },
    isActive: {
      type: Boolean,
      default: true,
    },
    lostOrReplaced: {
      type: Boolean,
      default: false,
    },
  },
  { timestamps: true }
);

module.exports = mongoose.model("RFID", rfidCardSchema);
