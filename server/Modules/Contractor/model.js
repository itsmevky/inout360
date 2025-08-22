const mongoose = require("mongoose");

const contractorSchema = new mongoose.Schema({  
  name: { type: String, required: true },
  code: { type: String, required: true, unique: true },   // e.g., CONT-001
  contactPerson: { type: String },
  contactPhone: { type: String },
  gstNumber: { type: String }, // optional: PAN/GST for vendor billing
  status: { 
    type: String, 
    enum: ["ACTIVE", "INACTIVE"], 
    default: "ACTIVE" 
  }
}, { timestamps: true });


module.exports = mongoose.model("Contractor", contractorSchema);
