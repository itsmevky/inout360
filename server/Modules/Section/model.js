const mongoose = require("mongoose");

const sectionSchema = new mongoose.Schema(
  {
    name: {
      type: String,
      required: true,
      trim: true,
      unique: true,   // e.g. "Assembly", "Welding"
    },
    code: {
      type: String,
      trim: true,     // e.g. SEC-001
    },
    description: {
      type: String,
      trim: true,
    },
    supervisorId: {
      type: mongoose.Schema.Types.ObjectId,
      ref: "User",   // HR/Supervisor responsible for approvals
    },
    status: {
      type: String,
      enum: ["active", "inactive"],
      default: "active",
    },
  },
  { timestamps: true }
);

module.exports = mongoose.model("Section", sectionSchema);
