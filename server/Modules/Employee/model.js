const mongoose = require("mongoose");

const employeeSchema = new mongoose.Schema(
  {
    profileImage: { type: String, default: "" },

    // 🧍 PERSONAL INFORMATION
    personal: {
      firstName: { type: String, required: true },
      lastName: { type: String },
      gender: {
        type: String,
        enum: ["Male", "Female", "Other"],
        required: true,
      },
      dob: { type: Date, required: true },
      email: { type: String, required: true },
      phone: { type: String, required: true },
      password: { type: String, required: true },
    },

    // 🏠 ADDRESS INFORMATION
    address: {
      current: {
        street: { type: String, required: true },
        city: { type: String, required: true },
        state: { type: String, required: true },
        pincode: { type: String, required: true },
      },
      permanent: {
        street: { type: String, required: true },
        city: { type: String, required: true },
        state: { type: String, required: true },
        pincode: { type: String, required: true },
      },
    },

    // 💼 PROFESSIONAL INFORMATION
    professional: {
      employeeId: { type: String, required: true, unique: true },
      rfid: { type: String, required: true, unique: true },
      joiningDate: { type: Date, required: true },
      designation: { type: String, required: true },
      department: { type: String, required: true },
      section: { type: String, required: true },
      shift: { type: String, required: true },
      employmentType: {
        type: String,
        enum: ["Full time", "Part time", "Contract"],
        default: "Full time",
      },
      role: {
        type: String,
        enum: ["Employee", "Admin", "Super Admin"],
        required: true,
      },
      status: { type: String, enum: ["Active", "Inactive"], default: "Active" },
    },

    // 🏦 BANK DETAILS
    bankDetails: {
      accountNumber: { type: String, required: true },
      ifscCode: { type: String, required: true },
      bankName: { type: String },
      branch: { type: String },
      pancard: { type: String, required: true },
      aadharcardnumber: { type: String, required: true },
    },

    // 🚨 EMERGENCY CONTACT
    emergencyContact: {
      name: { type: String, required: true },
      relation: { type: String, required: true },
      phone: { type: String, required: true },
    },

    // 🔐 SYSTEM ACCESS
    systemAccess: {
      emailVerified: { type: Boolean, default: false },
      phoneVerified: { type: Boolean, default: false },
      loginEnabled: { type: Boolean, default: true },
      lastLogin: { type: Date },
    },

    createdBy: { type: String, default: "admin" },
  },
  { timestamps: true }
);

// ✅ Correct unique indexes
employeeSchema.index({ "personal.email": 1 }, { unique: true });
employeeSchema.index({ "professional.employeeId": 1 }, { unique: true });
employeeSchema.index({ "professional.rfid": 1 }, { unique: true });

module.exports = mongoose.model("Employee", employeeSchema);
