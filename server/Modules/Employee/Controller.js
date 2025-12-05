const Employee = require("./model");
const User = require("../User/model");
const Validator = require("../../Utils/Validator");

// Generate Employee ID
const generateEmployeeId = () => {
  return `EMP-${Date.now()}-${Math.floor(Math.random() * 1000)}`;
};

// Generate RFID
const generateRFID = (prefix = "EMP") => {
  return `${prefix}-${Math.floor(100000 + Math.random() * 900000)}`;
};

// 🟢 CREATE EMPLOYEE
exports.createEmployee = async (req, res) => {
  try {
    const data = req.body;

    // Validate required sections
    if (!data.personal || !data.professional) {
      return res.status(400).json({
        message: "Missing required sections: personal or professional data",
      });
    }

    // ✅ Check duplicate email (nested)
    const existing = await Employee.findOne({
      "personal.email": data.personal.email,
    });
    if (existing) {
      return res
        .status(400)
        .json({ message: "Employee already exists with this email." });
    }

    // ✅ Generate IDs if missing
    data.professional.employeeId =
      data.professional.employeeId || generateEmployeeId();
    data.professional.rfid = data.professional.rfid || generateRFID();

    // ✅ Create Employee record
    const employee = await Employee.create(data);

    return res.status(201).json({
      message: "✅ Employee created successfully",
      employee,
    });
  } catch (error) {
    console.error("❌ Employee Creation Error:", error);
    return res.status(500).json({
      message: "Server error",
      error: error.message,
    });
  }
};

// 🟢 GET ALL EMPLOYEES
exports.getAllEmployees = async (req, res) => {
  try {
    const employees = await Employee.find().sort({ createdAt: -1 });
    const total = await Employee.countDocuments();

    res.status(200).json({
      message: "Employees fetched successfully",
      total,
      employees,
    });
  } catch (error) {
    res.status(500).json({
      message: "Failed to fetch employees",
      error: error.message,
    });
  }
};

// 🟢 GET EMPLOYEE BY ID OR EMPLOYEEID
exports.getEmployeeById = async (req, res) => {
  const param = req.params.id;

  try {
    let employee;

    // If param looks like a Mongo ObjectId
    if (/^[0-9a-fA-F]{24}$/.test(param)) {
      employee = await Employee.findById(param);
    }

    // Otherwise, try with nested professional.employeeId
    if (!employee) {
      employee = await Employee.findOne({
        "professional.employeeId": param,
      });
    }

    if (!employee) {
      return res.status(404).json({ message: "Employee not found" });
    }

    return res.status(200).json({
      message: "Employee fetched successfully",
      employee,
    });
  } catch (error) {
    return res.status(500).json({
      message: "Error fetching employee",
      error: error.message,
    });
  }
};

// 🟢 GET EMPLOYEE BY EMPLOYEEID ONLY
exports.getEmployeeByEmployeeId = async (req, res) => {
  const { employeeId } = req.params;

  try {
    const employee = await Employee.findOne({
      "professional.employeeId": employeeId,
    });

    if (!employee) {
      return res.status(404).json({ message: "Employee not found" });
    }

    return res.status(200).json({
      message: "Employee fetched successfully",
      employee,
    });
  } catch (error) {
    return res.status(500).json({
      message: "Error fetching employee",
      error: error.message,
    });
  }
};

// 🟢 GET EMPLOYEE BY RFID
exports.getEmployeeByRFID = async (req, res) => {
  const { rfid } = req.params;
  console.log("📥 [getEmployeeByRFID] Received RFID:", rfid);

  try {
    const employee = await Employee.findOne({
      "professional.rfid": rfid,
    });

    if (!employee) {
      return res.status(404).json({ message: "Employee not found" });
    }

    res.status(200).json({
      message: "Employee fetched successfully",
      employee,
    });
  } catch (error) {
    console.error("❌ [getEmployeeByRFID] Error:", error.message);
    res.status(500).json({ message: "Error", error: error.message });
  }
};

// 🟢 UPDATE EMPLOYEE
exports.updateEmployee = async (req, res) => {
  const param = req.params.id;
  const updates = req.body;

  try {
    let employee;

    // ✅ Use $set and disable full validation to allow partial updates
    const updateOptions = { new: true, runValidators: false };

    // ✅ If param looks like a Mongo ObjectId
    if (/^[0-9a-fA-F]{24}$/.test(param)) {
      employee = await Employee.findByIdAndUpdate(
        param,
        { $set: updates },
        updateOptions
      );
    }

    // ✅ Otherwise, try professional.employeeId
    if (!employee) {
      employee = await Employee.findOneAndUpdate(
        { "professional.employeeId": param },
        { $set: updates },
        updateOptions
      );
    }

    // ✅ If still not found
    if (!employee) {
      return res.status(404).json({ message: "Employee not found" });
    }

    return res.status(200).json({
      message: "✅ Employee updated successfully",
      employee,
    });
  } catch (error) {
    console.error("❌ Employee Update Error:", error);
    return res.status(500).json({
      message: "Server error",
      error: error.message,
    });
  }
};

// 🟢 DELETE EMPLOYEE
exports.deleteEmployee = async (req, res) => {
  const param = req.params.id;

  try {
    let employee;

    // If param looks like a Mongo ObjectId
    if (/^[0-9a-fA-F]{24}$/.test(param)) {
      employee = await Employee.findByIdAndDelete(param);
    }

    // Otherwise, try with professional.employeeId
    if (!employee) {
      employee = await Employee.findOneAndDelete({
        "professional.employeeId": param,
      });
    }

    if (!employee) {
      return res.status(404).json({ message: "Employee not found" });
    }

    return res.status(200).json({
      message: "Employee deleted successfully",
      employee,
    });
  } catch (error) {
    console.error("❌ Employee Delete Error:", error);
    return res.status(500).json({
      message: "Server error",
      error: error.message,
    });
  }
};
