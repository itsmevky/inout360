const express = require("express");
const router = express.Router();
const Controller = require("./Controller"); // import shift controller
 
// @desc    Add new shift
router.post("/", Controller.addShift);

// @route   GET /api/shifts
// @desc    Get all shifts
router.get("/", Controller.getAllShifts);

// @route   GET /api/shifts/:id
// @desc    Get shift by ID
router.get("/:id", Controller.getShiftById);

// @route   PUT /api/shifts/:id
// @desc    Update shift
router.put("/:id", Controller.updateShift);

// @route   DELETE /api/shifts/:id
// @desc    Delete shift
router.delete("/:id", Controller.deleteShift);

module.exports = router;
