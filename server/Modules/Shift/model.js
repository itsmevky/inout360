const mongoose = require("mongoose");

const shiftSchema = new mongoose.Schema(
  {
    shiftName: {
      type: String,
      required: true,
      trim: true,
    },
    sectionId: {
      type: mongoose.Schema.Types.ObjectId,
      ref: "Section", // link to work section (Assembly, Welding, etc.)
      required: true,
    },
    supervisorId: {
      type: mongoose.Schema.Types.ObjectId,
      ref: "User", // Supervisor responsible for the shift
      required: true,
    },
    contractors: [
      {
        type: mongoose.Schema.Types.ObjectId,
        ref: "Contractor", // Assigned contractor employees
      },
    ],
    startTime: {
      type: Date,
      required: true,
    },
    endTime: {
      type: Date,
      required: true,
    },
    breakTimes: [
      {
        from: { type: String }, // e.g., "13:00"
        to: { type: String },   // e.g., "14:00"
      },
    ],
    plannedHeadcount: {
      type: Number,
      default: 0,
    },
    actualHeadcount: {
      type: Number,
      default: 0, // update after attendance sync
    },
    status: {
      type: String,
      enum: ["scheduled", "ongoing", "completed", "cancelled"],
      default: "scheduled",
    },
    overtimeAllowed: {
      type: Boolean,
      default: false,
    },
    notes: {
      type: String,
      trim: true,
    },
  },
  { timestamps: true }
);

module.exports = mongoose.model("Shift", shiftSchema);
