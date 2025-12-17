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

const hashPassword = async (password) => {
  const salt = await bcrypt.genSalt(10);
  return bcrypt.hash(password, salt);
};

const generateAccessToken = (user) =>
  jwt.sign({ userId: user._id, role: user.role }, JWT_SECRET, {
    expiresIn: "30d",
  });

const generateRefreshToken = (user) =>
  jwt.sign({ userId: user._id, role: user.role }, JWT_SECRET, {
    expiresIn: "7d",
  });

/* ---------------------------------
   Register User
---------------------------------- */
exports.registerUser = async (req, res) => {
  const { firstName, lastName, role } = req.body;
  const email = req.body.email?.toLowerCase().trim();
  const password = req.body.password;

  const rules = {
    firstName: "required",
    lastName: "required",
    email: "required|email",
    password: "required|min:6",
    role: "required|in:admin,hr,supervisor,employee,manager,superadmin,contractor",
  };

  try {
    const validator = new Validator({ ...req.body, email }, rules);
    await validator.validate();

    const existingUser = await User.findOne({ email });
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

    // 🔐 HASH PASSWORD HERE
    const hashedPassword = await hashPassword(password);

    const user = await User.create({
      firstName,
      lastName,
      email,
      password: hashedPassword,
      role,
    });

    const accessToken = generateAccessToken(user);
    const refreshToken = generateRefreshToken(user);

    res.status(201).json({
      id: user._id,
      firstName,
      lastName,
      email,
      role,
      accessToken,
      refreshToken,
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

  const rules = {
    email: "required|email",
    password: "required",
  };

  try {
    const validator = new Validator({ ...req.body, email }, rules);
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

    res.status(200).json({
      id: user._id,
      firstName: user.firstName,
      lastName: user.lastName,
      email: user.email,
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

/* ---------------------------------
   Get All Users
---------------------------------- */
exports.getUsers = async (_req, res) => {
  try {
    const users = await User.find();
    res.status(200).json({
      message: "Users fetched successfully",
      total: users.length,
      users,
    });
  } catch (error) {
    console.error("Get Users Error:", error);
    res.status(500).json({
      message: "Server error",
      error: error.message,
    });
  }
};
