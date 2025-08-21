const mongoose = require("mongoose");

const rfidSchema = new mongoose.Schema(
  {
    tagId: {
      type: String,
      required: true,
      unique: true,
      trim: true,
    },
    assignedTo: {
      type: mongoose.Schema.Types.ObjectId,
      refPath: "assignedModel", // dynamic reference
      default: null,
    },
    assignedModel: {
      type: String,
      enum: ["Employee", "Contractor"],
      default: null,
    },
    isActive: {
      type: Boolean,
      default: true,
    },
    isAssigned: {
      type: Boolean,
      default: false,
    },
  },
  {
    timestamps: true,
  }
);

module.exports = mongoose.model("RFID", rfidSchema);
