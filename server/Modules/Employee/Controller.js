const Employee = require("./model");
const User = require("../User/model");
const Validator = require("../../Utils/Validator");
// const generateRFID = require("../../Utils/generateRFID");

// Generate Employee ID
const generateEmployeeId = () => {
  return `EMP-${Date.now()}-${Math.floor(Math.random() * 1000)}`;
};

// Generate RFID
const generateRFID = (prefix = "EMP") => {
  return `${prefix}-${Math.floor(100000 + Math.random() * 900000)}`;
};

// Create Employee
exports.createEmployee = async (req, res) => {
  const {
    firstName,
    lastName,
    email,
    phone,
    gender,
    address,
    dob,
    joiningDate,
    designation,
    section,
    shift,
    password,
  } = req.body;

  const role = "employee";

  // Validation rules
  const rules = {
    firstName: "required",
    lastName: "required",
    email: "required|email",
    password: "required|min:6",
    phone: "required",
    gender: "required",
    joiningDate: "required",
    designation: "required",
    section: "required",
    shift: "required",
  };

  // const validator = new Validator(req.body, rules);
  // if (validator.fails()) {
  //   return res.status(422).json({ errors: validator.errors.all() });
  // }

  try {
    // Check if user already exists
    const existingUser = await User.findOne({ email });
    if (existingUser) {
      return res.status(400).json({ message: "User already exists" });
    }

    // Create User account (for login)
    const newUser = await User.create({
      firstName,
      lastName,
      email,
      password,
      role,
    });

    // Generate Employee ID & RFID
    const employeeId = generateEmployeeId();
    const rfid = generateRFID("EMP");

    // Create Employee profile
    const employee = await Employee.create({
      employeeId,
      firstName,
      lastName,
      email,
      phone,
      gender,
      address,
      dob,
      joiningDate,
      designation,
      section,
      shift,
      rfid,
      userId: newUser._id,
    });

    return res.status(201).json({
      message: "Employee created successfully",
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

// Get all employees
exports.getAllEmployees = async (req, res) => {
  try {
    const employees = await Employee.find();
    const total = await Employee.countDocuments();

    res.status(200).json({
      message: "Employees fetched successfully",
      total,
      employees,
    });
  } catch (error) {
    res.status(500).json({ message: "Failed to fetch", error: error.message });
  }
};

// Get employee by MongoDB ID or EmployeeID
exports.getEmployeeById = async (req, res) => {
  const param = req.params.id;

  try {
    let employee;

    if (/^[0-9a-fA-F]{24}$/.test(param)) {
      employee = await Employee.findById(param);
    }

    if (!employee) {
      employee = await Employee.findOne({ employeeId: param });
    }

    if (!employee) {
      return res.status(404).json({ message: "Employee not found" });
    }

    return res.status(200).json({
      message: "Employee fetched successfully",
      employee,
    });
  } catch (error) {
    return res.status(500).json({ message: "Error", error: error.message });
  }
};

// Get employee by EmployeeID only
exports.getEmployeeByEmployeeId = async (req, res) => {
  const { employeeId } = req.params;

  try {
    const employee = await Employee.findOne({ employeeId });
    if (!employee) {
      return res.status(404).json({ message: "Employee not found" });
    }

    return res.status(200).json({
      message: "Employee fetched successfully",
      employee,
    });
  } catch (error) {
    return res.status(500).json({ message: "Error", error: error.message });
  }
};

// Get employee by RFID
exports.getEmployeeByRFID = async (req, res) => {
  const { rfid } = req.params;
  console.log("📥 [getEmployeeByRFID] Received RFID:", rfid);

  try {
    const employee = await Employee.findOne({ rfid });
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
