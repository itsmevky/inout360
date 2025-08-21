const User = require("./model");
const Validator = require("../../Utils/Validator");

const {
  generateAccessToken,
  generateRefreshToken,
} = require("../../Utils/generateToken"); // ✅ make sure these functions are exported from this file

exports.registerUser = async (req, res) => {
  const { firstName, lastName, email, password, role } = req.body;

  // ✅ Validation rules
  const rules = {
    firstName: ["required"],
    lastName: ["required"],
    email: ["required", "email"],
    password: ["required", "min:6"],
    role: ["required", "enum:admin,hr,supervisor,employee,manager,superadmin"],
  };

  const validator = new Validator(req.body, rules);
  if (!validator.validate()) {
    return res.status(422).json({ errors: validator.getErrors() });
  }

  try {
    // ✅ 1. Check if email already exists
    const existingUser = await User.findOne({ email });
    if (existingUser) {
      return res.status(400).json({ message: "User already exists" });
    }

    // ✅ 2. Prevent duplicate admin/superadmin
    if (role === "admin" || role === "superadmin") {
      const existingRoleUser = await User.findOne({ role });
      if (existingRoleUser) {
        return res.status(400).json({
          message: `A ${role} already exists. You cannot create more than one ${role}.`,
        });
      }
    }

    // ✅ 3. Create user
    const user = await User.create({ firstName, lastName, email, password, role });

    // ✅ 4. Generate tokens
    const accessToken = generateAccessToken(user);
    const refreshToken = generateRefreshToken(user);

    // ✅ 5. Respond with user data + tokens
    res.status(201).json({
      _id: user._id,
      firstName: user.firstName,
      lastName: user.lastName,
      email: user.email,
      role: user.role,
      accessToken,
      refreshToken,
    });
  } catch (error) {
    console.error("Registration Error:", error);
    res.status(500).json({ message: "Server error", error: error.message });
  }
};



exports.loginUser = async (req, res) => {
  const { email, password } = req.body;

  // ✅ Validation rules
  const rules = {
    email: ["required", "email"],
    password: ["required"],
  };

  const validator = new Validator(req.body, rules);
  if (!validator.validate()) {
    return res.status(422).json({ errors: validator.getErrors() });
  }

  try {
    // ✅ 1. Find user by email
    const user = await User.findOne({ email });
    if (!user) {
      return res.status(400).json({ message: "Invalid credentials" });
    }

    // ✅ 2. Check password match
    const isMatch = await user.matchPassword(password);
    if (!isMatch) {
      return res.status(400).json({ message: "Invalid credentials" });
    }

    // ✅ 3. Generate tokens
    const accessToken = generateAccessToken(user);
    const refreshToken = generateRefreshToken(user);

    // ✅ 4. Send response
    res.status(200).json({
      _id: user._id,
      firstName: user.firstName,
      lastName: user.lastName,
      email: user.email,
      role: user.role,
      accessToken,
      refreshToken,
    });
  } catch (error) {
    console.error("Login Error:", error);
    res.status(500).json({ message: "Server error", error: error.message });
  }
};

exports.getUsers = async (req, res) => {
  try {
    const users = await User.find().select("-password");

    res.status(200).json({
      message: "Users fetched successfully",
      total: users.length,
      users,
    });
  } catch (error) {
    console.error("Get Users Error:", error);
    res.status(500).json({ message: "Server error", error: error.message });
  }
};
