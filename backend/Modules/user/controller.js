const jwt = require("jsonwebtoken");
const bcrypt = require("bcryptjs");
const Validator = require("../../helpers/validators");
const User = require("./model");

/* ---------------------------------
   Helpers
---------------------------------- */
const JWT_SECRET =
  process.env.SECRET_KEY ||
  process.env.JWT_ACCESS_SECRET ||
  process.env.JWT_SECRET;

const generateAccessToken = (user) =>
  jwt.sign({ userId: user._id, role: user.role }, JWT_SECRET, {
    expiresIn: "30d",
  });

const generateRefreshToken = (user) =>
  jwt.sign({ userId: user._id, role: user.role }, JWT_SECRET, {
    expiresIn: "7d",
  });

const hashPassword = async (password) => {
  const salt = await bcrypt.genSalt(10);
  return bcrypt.hash(password, salt);
};

/* ---------------------------------
   Register User
---------------------------------- */
exports.registerUser = async (req, res) => {
  const role = req.body.role || "employee";
  const email = req.body.email?.toLowerCase().trim();
  const password = req.body.password;
  const name = req.body.name?.trim();
  const employeeId = req.body.employeeId?.trim();

  const rules = {
    name: "required",
    email: "required|email",
    password: "required|min:6",
    employeeId: "required",
  };
  if (req.body.role) {
    rules.role =
      "in:admin,hr,supervisor,employee,manager,superadmin,contractor";
  }

  try {
    const validator = new Validator(
      {
        ...req.body,
        email,
        password,
        name,
        employeeId,
        role,
      },
      rules
    );
    await validator.validate();

    const existingUser = await User.findOne({
      $or: [{ email }, { employeeId }],
    });
    if (existingUser) {
      return res.status(400).json({ message: "User already exists" });
    }

    // Only one admin / superadmin
    if (role === "admin" || role === "superadmin") {
      const roleUser = await User.findOne({ role });
      if (roleUser) {
        return res.status(400).json({
          message: `A ${role} already exists`,
        });
      }
    }

    const hashedPassword = await hashPassword(password);
    const user = await User.create({
      name,
      email,
      employeeId,
      role,
      password: hashedPassword,
    });

    res.status(201).json({
      message: "User registered successfully",
      user: {
        id: user._id,
        name: user.name,
        employeeId: user.employeeId,
        role: user.role,
      },
    });
  } catch (error) {
    console.error("Registration Error:", error);
    res.status(500).json({
      message: "Server error",
      error: error.message,
    });
  }
};

/* ---------------------------------
   Login User
---------------------------------- */
exports.loginUser = async (req, res) => {
  const email = req.body.email?.toLowerCase().trim();
  const password = req.body.password;

  try {
    if (!email || !password) {
      return res.status(400).json({
        message: "email and password are required",
      });
    }

    const validator = new Validator(
      { email, password },
      { email: "required|email", password: "required" }
    );
    await validator.validate();

    const user = await User.findOne({ email }).select("+password");
    if (!user) {
      return res.status(400).json({ message: "Invalid credentials" });
    }

    const isMatch = await bcrypt.compare(password, user.password);
    if (!isMatch) {
      return res.status(400).json({ message: "Invalid credentials" });
    }

    const accessToken = generateAccessToken(user);
    const refreshToken = generateRefreshToken(user);

    await User.findByIdAndUpdate(user._id, {
      sessionStatus: "Logged In",
    });

    res.status(200).json({
      id: user._id,
      name: user.name,
      role: user.role,
      accessToken,
      refreshToken,
    });
  } catch (error) {
    console.error("Login Error:", error);
    res.status(500).json({
      message: "Server error",
      error: error.message,
    });
  }
};
