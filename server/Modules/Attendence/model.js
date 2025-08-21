const mongoose = require("mongoose");

const attendanceSchema = new mongoose.Schema(
  {
    contractorId: {
      type: mongoose.Schema.Types.ObjectId,
      ref: "Contractor",
      required: true,
    },
    rfidCardId: {
      type: String,
      required: true,
    },
    date: {
      type: Date,
      required: true,
    },

    // Punch Times
    entryGateIn: {
      type: Date, // time when punched at Entry Gate
    },
    workfloorIn: {
      type: Date, // time when entered work section
    },
    workfloorOut: {
      type: Date, // time when left work section
    },
    exitGateOut: {
      type: Date, // time when exiting facility
    },

    // Work Section Info
    sectionAssigned: {
      type: String,
      enum: [
        "Assembly",
        "Packing",
        "Welding",
        "Quality",
        "Maintenance",
        "Electrical",
        "Fabrication",
        "Store",
      ], // extend if needed
      required: true,
    },

    // Approval Workflow
    hrApproved: {
      type: Boolean,
      default: false,
    },
    hrApprovedAt: {
      type: Date,
    },
    supervisorApproved: {
      type: Boolean,
      default: false,
    },
    supervisorApprovedAt: {
      type: Date,
    },

    isFinalized: {
      type: Boolean,
      default: false,
    },

    remarks: {
      type: String,
    },
  },
  { timestamps: true }
);

module.exports = mongoose.model("Attendance", attendanceSchema);
