const express = require("express");
const router = express.Router();
const contractorController = require("./Controller");

// ✅ Create Contractor
router.post("/", contractorController.addContractor);

// ✅ Get All Contractors (with optional query params for search/pagination later)
router.get("/", contractorController.getAllContractors);

// ✅ Get Contractor by ID
router.get("/:id", contractorController.getContractorById);

// ✅ Update Contractor
router.put("/:id", contractorController.updateContractor);

// ✅ Delete Contractor
router.delete("/:id", contractorController.deleteContractor);

module.exports = router;