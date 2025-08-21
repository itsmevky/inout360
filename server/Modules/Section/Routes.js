const express = require("express");
const router = express.Router();
const sectionController = require("./Controller");

// Add new section
router.post("/add", sectionController.addSection);

// Get all sections
router.get("/all", sectionController.getAllSections);

// Get section by ID
router.get("/:id", sectionController.getSectionById);

// Update section
router.put("/:id", sectionController.updateSection);

// Delete section
router.delete("/:id", sectionController.deleteSection);

module.exports = router;
