const mongoose = require("mongoose");

const employeeSchema = new mongoose.Schema(
  {
    employeeId: {
      type: String,
      required: true,
      unique: true, // 💡 ensures uniqueness across the collection
    },
    firstName: { type: String, required: true, trim: true },
    lastName: { type: String, required: true, trim: true },
    email: { type: String, required: true, unique: true, lowercase: true },
    phone: { type: String, required: true, trim: true },
    gender: { type: String, enum: ["male", "female", "other"], required: true },
    address: { type: String },
    dob: { type: Date },
    joiningDate: { type: Date, required: true },
    designation: { type: String, required: true },
    section: { type: String, required: true },
    shift: {
      type: String,
      enum: ["Morning", "Evening", "Night"],
      default: "Morning",
    },
    contractorId: {
      type: mongoose.Schema.Types.ObjectId,
      ref: "Contractor",
      required: false,
    },
    rfid: { type: String, required: true, unique: true },
    status: {
      type: String,
      enum: ["active", "inactive"],
      default: "active",
    },
    userId: {
      type: mongoose.Schema.Types.ObjectId,
      ref: "User",
      required: true,
    },
  },
  {
    timestamps: true,
  }
);

module.exports = mongoose.model("Employee", employeeSchema);
