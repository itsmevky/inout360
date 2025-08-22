const express = require("express");
const router = express.Router();
const sectionController = require("./Controller");

// @route   POST /api/sections
// @desc    Add new section
router.post("/", sectionController.addSection);

// @route   GET /api/sections
// @desc    Get all sections
router.get("/", sectionController.getAllSections);

// @route   GET /api/sections/:id
// @desc    Get section by ID
router.get("/:id", sectionController.getSectionById);

// @route   PUT /api/sections/:id
// @desc    Update section
router.put("/:id", sectionController.updateSection);

// @route   DELETE /api/sections/:id
// @desc    Delete section
router.delete("/:id", sectionController.deleteSection);

module.exports = router;
