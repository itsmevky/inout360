const express = require("express");
const router = express.Router();

const {
  createEmployee,
  getAllEmployees,
  getEmployeeById,
  getEmployeeByRFID,
  getEmployeeByEmployeeId,
} = require("./Controller");

router.post("/add", createEmployee);
router.get("/all", getAllEmployees);
router.get("/rfid/:rfid", getEmployeeByRFID);
router.get("/by-employee-id/:employeeId", getEmployeeByEmployeeId); // 👈 MUST be above `/:id`
router.get("/:id", getEmployeeById);

module.exports = router;
