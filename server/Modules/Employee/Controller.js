const Employee = require("./model");
const User = require("../User/model");
const Validator = require("../../Utils/Validator");
const generateRFID = require("../../Utils/generateRFID");

const generateEmployeeId = () => {
  return `EMP-${Date.now()}-${Math.floor(Math.random() * 1000)}`;
};

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

  // ✅ Validation rules
  const rules = {
    firstName: ["required"],
    lastName: ["required"],
    email: ["required", "email"],
    password: ["required", "min:6"],
    phone: ["required"],
    gender: ["required"],
    joiningDate: ["required"],
    designation: ["required"],
    section: ["required"],
    shift: ["required"],
  };

  const validator = new Validator(req.body, rules);
  if (!validator.validate()) {
    return res.status(422).json({ errors: validator.getErrors() });
  }

  try {
    // 🔁 Check if user already exists
    const existingUser = await User.findOne({ email });
    if (existingUser) {
      return res.status(400).json({ message: "User already exists" });
    }

    // 🧾 Step 1: Create user account (for login)
    const newUser = await User.create({
      firstName,
      lastName,
      email,
      password,
      role,
    });

    // ✅ Generate unique employeeId
    const employeeId = generateEmployeeId();

    // 👷 Step 2: Create employee profile
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
      rfid: generateRFID("EMP"),
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

exports.getEmployeeById = async (req, res) => {
  const param = req.params.id;

  try {
    let employee;

    // First try by MongoDB ObjectId
    if (/^[0-9a-fA-F]{24}$/.test(param)) {
      employee = await Employee.findById(param);
    }

    // If not found or not a valid ObjectId, try by employeeId
    if (!employee) {
      employee = await Employee.findOne({ employeeId: param });
    }

    if (!employee) {
      return res.status(404).json({ message: "Employee not found" });
    }

    return res
      .status(200)
      .json({ message: "Employee fetched successfully", employee });
  } catch (error) {
    return res.status(500).json({ message: "Error", error: error.message });
  }
};
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

// Get employee by ID
exports.getEmployeeByRFID = async (req, res) => {
  const { rfid } = req.params;
  console.log("📥 [getEmployeeByRFID] Received request with RFID:", rfid);

  try {
    const employee = await Employee.findOne({ rfid });
    console.log("🔍 [getEmployeeByRFID] Employee lookup result:", employee);

    if (!employee) {
      console.warn("⚠️ [getEmployeeByRFID] No employee found for RFID:", rfid);
      return res.status(404).json({ message: "Employee not found" });
    }

    console.log("✅ [getEmployeeByRFID] Employee found:", employee._id);
    res.json({
      message: "Employee fetched successfully",
      employee,
    });
  } catch (error) {
    console.error("❌ [getEmployeeByRFID] Error occurred:", error.message);
    res.status(500).json({ message: "Error", error: error.message });
  }
};
