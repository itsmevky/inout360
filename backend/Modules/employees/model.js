const mongoose = require("mongoose");
const { ajModel } = require("../../common/classes/Model");

const addressSchema = {
  street: { type: String, required: true, trim: true },
  city: { type: String, required: true, trim: true },
  state: { type: String, required: true, trim: true },
  pincode: { type: String, required: true, trim: true },
};

const bankSchema = {
  aadharcardnumber: { type: String, required: true, trim: true },
  pancard: { type: String, required: true, trim: true },
  accountNumber: { type: String, required: true, trim: true },
  ifscCode: { type: String, required: true, trim: true },
  bankName: { type: String, trim: true },
  branch: { type: String, trim: true },
};

const emergencySchema = {
  name: { type: String, trim: true },
  relation: { type: String, trim: true },
  phone: { type: String, trim: true },
};

const systemAccessSchema = {
  emailVerified: { type: Boolean, default: false },
  phoneVerified: { type: Boolean, default: false },
  loginEnabled: { type: Boolean, default: true },
  lastLogin: { type: Date },
};

const employeeSchema = {
  profileImage: { type: String, default: "" },

  // Personal info
  name: { type: String, required: true, trim: true },
  gender: { type: String, enum: ["Male", "Female", "Other"], required: true },
  dob: { type: Date, required: true },
  email: { type: String, required: true, unique: true, trim: true },
  phone: { type: String, required: true, trim: true },
  password: { type: String, default: null, select: false },
  userId: { type: mongoose.Schema.Types.ObjectId, ref: "User", index: true },

  // Addresses
  currentAddress: addressSchema,
  permanentAddress: addressSchema,

  // Professional info
  employeeId: { type: String, required: true, unique: true, trim: true },
  rfid: { type: String, required: true, unique: true, trim: true },
  joiningDate: { type: Date, required: true },
  designation: { type: String, required: true, trim: true },
  department: { type: String, required: true, trim: true },
  section: { type: String, required: true, trim: true },
  department: { type: String, required: true, trim: true },
  section: { type: String, required: true, trim: true },
  shift: { type: String, required: true, trim: true },
  employmentType: { type: String, default: "Full-time", trim: true },
  role: { type: String, required: true, default: "employee", trim: true },
  status: { type: String, enum: ["Active", "Inactive"], default: "Active" },
  location: { type: String, trim: true, default: "" },
  attendanceStatus: {
    type: String,
    enum: ["Present", "Absent", "On Leave", "Active", "Inactive"],
    default: "Present",
  },

  // Banking
  bankDetails: bankSchema,

  // Emergency
  emergencyContact: emergencySchema,

  // System access
  systemAccess: systemAccessSchema,

  // Raw payload passthrough
  raw: { type: mongoose.Schema.Types.Mixed, default: {} },
};

const employeeModel = new ajModel("Employee", employeeSchema);
employeeModel.schema.index({ email: 1 }, { unique: true });
employeeModel.schema.index({ rfid: 1 }, { unique: true });
employeeModel.schema.index({ employeeId: 1 }, { unique: true });

module.exports = employeeModel.getModel();
