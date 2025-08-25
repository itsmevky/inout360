const express = require("express");
const router = express.Router();
const attendanceController = require("./Controller");

// Add new attendance (initial punch)
router.post("/add", attendanceController.addAttendance);

// Get all attendance records
router.get("/all", attendanceController.getAllAttendance);

// Get attendance by ID
router.get("/:id", attendanceController.getAttendanceById);

// Update attendance (punches or details)
router.put("/:id", attendanceController.updateAttendance);

// Delete attendance
router.delete("/:id", attendanceController.deleteAttendance);

// HR approval
router.put("/hr-approve/:id", attendanceController.hrApprove);

// Supervisor approval
router.put("/supervisor-approve/:id", attendanceController.supervisorApprove);

// Finalize attendance (after both approvals)
router.put("/finalize/:id", attendanceController.finalizeAttendance);

module.exports = router;
