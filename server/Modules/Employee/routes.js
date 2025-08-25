const express = require("express");
const router = express.Router();

const {
  createEmployee,
  getAllEmployees,
  getEmployeeById,
  getEmployeeByRFID,
  getEmployeeByEmployeeId,
  updateEmployee,
  deleteEmployee
} = require("./Controller");


// Create new employee
router.post("/add", createEmployee);

// Get all employees
router.get("/all", getAllEmployees);

// Get employee by RFID
router.get("/rfid/:rfid", getEmployeeByRFID);

// Get employee by employeeId
router.get("/by-employee-id/:employeeId", getEmployeeByEmployeeId); // 👈 Must be above /:id

// Get employee by MongoDB ObjectId or employeeId
router.get("/:id", getEmployeeById);

router.put("/:id", updateEmployee);

router.delete("/:id", deleteEmployee);



module.exports = router;