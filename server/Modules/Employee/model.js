const mongoose = require("mongoose");

const employeeSchema = new mongoose.Schema({
  firstName: { type: String, required: true, trim: true },
  lastName: { type: String, required: true, trim: true },
  gender: { type: String, enum: ["Male", "Female", "Other"], required: true },
  dob: { type: Date },
  email: { type: String, required: true, unique: true, lowercase: true },
  currentaddress: { type: String },
  permanentaddress: { type: String },
  state: { type: String },
  city: { type: String },
  pincode: { type: String },
  phone: { type: String, required: true },
  joiningDate: { type: Date },
  designation: { type: String },
  shift: { type: String },
  department: { type: String },
  section: { type: String },
  rfid: { type: String },
  role: { type: String },
  aadharcardnumber: { type: String },
  pancard: { type: String },
  accountNumber: { type: String },
  ifscCode: { type: String },
}, { timestamps: true });

module.exports = mongoose.model("Employee", employeeSchema);
