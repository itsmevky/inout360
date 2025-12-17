const jwt = require("jsonwebtoken");
const bcrypt = require("bcryptjs");
const { randomUUID } = require("crypto");
const Validator = require("../../helpers/validators");
const User = require("./model");
const DeviceModel = require("../device/model");
const UserSession = require("../userSessions/model");
const QrToken = require("../qrTokens/model");
const AttendanceModel = require("../attendance/model");
const EmployeeModel = require("../employees/model");

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

const cleanUpdate = (obj) =>
  Object.fromEntries(Object.entries(obj).filter(([, v]) => v !== undefined));

const normalizeLocation = (value) => {
  if (value === undefined || value === null) return "";
  if (typeof value === "string") return value.trim().toLowerCase();
  try {
    return JSON.stringify(value);
  } catch (_err) {
    return String(value);
  }
};

const normalizeDeviceId = (value) =>
  String(value || "").trim().toLowerCase();

const escapeRegExp = (value) =>
  String(value).replace(/[.*+?^${}()|[\]\\]/g, "\\$&");

const resolveAssignedDeviceId = async (user, requestedDeviceId) => {
  const provided = String(requestedDeviceId || "").trim();
  const stored = String(user.deviceId || "").trim();

  if (!provided && !stored) {
    return { error: "deviceId is required" };
  }

  const normalizedProvided = normalizeDeviceId(provided);
  const normalizedStored = normalizeDeviceId(stored);
  const employeeId = String(user.employeeId || "").trim();

  const buildAssignmentQuery = (value) => {
    const regex = new RegExp(`^${escapeRegExp(value)}$`, "i");
    const orFilters = [{ userId: user._id }];
    if (employeeId) {
      orFilters.push({ employeeId });
    }
    return {
      deviceId: { $regex: regex },
      deviceStatus: { $ne: "Disable" },
      $or: orFilters,
    };
  };

  if (stored) {
    if (provided && normalizedProvided !== normalizedStored) {
      const assignedDevice = await DeviceModel.findOne(
        buildAssignmentQuery(provided)
      );
      if (!assignedDevice) {
        return { error: "Device is not assigned to this user" };
      }
      return {
        deviceId: assignedDevice.deviceId,
        syncDeviceId: assignedDevice.deviceId,
      };
    }
    return { deviceId: stored };
  }

  if (!provided) {
    return { error: "deviceId is required" };
  }

  const assignedDevice = await DeviceModel.findOne(
    buildAssignmentQuery(provided)
  );
  if (!assignedDevice) {
    return { error: "Device is not assigned to this user" };
  }
  return {
    deviceId: assignedDevice.deviceId,
    syncDeviceId: assignedDevice.deviceId,
  };
};

const getDayRange = (date) => {
  const start = new Date(date);
  start.setHours(0, 0, 0, 0);
  const end = new Date(date);
  end.setHours(23, 59, 59, 999);
  return { start, end };
};

const markAttendance = async (employee, action) => {
  const { start, end } = getDayRange(new Date());
  const attendanceQuery = {
    employeeId: employee._id,
    date: { $gte: start, $lte: end },
  };
  const now = new Date();

  if (action === "login") {
    const existing = await AttendanceModel.findOne(attendanceQuery);
    if (existing) {
      if (!existing.entryGateIn) {
        existing.entryGateIn = now;
        await existing.save();
      }
      return existing;
    }

    return AttendanceModel.create({
      contractorId: employee.employeeId,
      rfidCardId: employee.rfid,
      employeeId: employee._id,
      date: start,
      entryGateIn: now,
      sectionAssigned: employee.section,
      status: "Present",
    });
  }

  if (action === "logout") {
    const existing = await AttendanceModel.findOne(attendanceQuery);
    if (existing) {
      existing.exitGateOut = now;
      await existing.save();
      return existing;
    }

    return AttendanceModel.create({
      contractorId: employee.employeeId,
      rfidCardId: employee.rfid,
      employeeId: employee._id,
      date: start,
      exitGateOut: now,
      sectionAssigned: employee.section,
      status: "Present",
    });
  }

  return null;
};

/* ---------------------------------
   Register User
---------------------------------- */
exports.registerUser = async (req, res) => {
  const { employeeId, deviceId } = req.body;
  const role = req.body.role || "employee";
  const email = req.body.email?.toLowerCase().trim();
  const password = req.body.password;
  const name = req.body.name?.trim();

  const rules = {
    name: "required",
    email: "required|email",
    password: "required|min:6",
    employeeId: "required",
    deviceId: "required",
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
        deviceId,
        role,
      },
      rules
    );
    await validator.validate();

    const existingEmployeeUser = await User.findOne({ employeeId });
    if (existingEmployeeUser) {
      const existingName = String(existingEmployeeUser.name || "")
        .toLowerCase()
        .trim();
      const incomingName = String(name || "").toLowerCase().trim();
      if (existingName !== incomingName) {
        return res.status(400).json({
          message: "Another user already present with this employeeId",
        });
      }
      const previousDeviceId = existingEmployeeUser.deviceId;
      const isDeviceChange =
        previousDeviceId && previousDeviceId !== deviceId;
      if (isDeviceChange) {
        const lastSession = await UserSession.findOne({
          userId: existingEmployeeUser._id,
        }).sort({ createdAt: -1 });
        const lastAction = lastSession?.action;
        if (
          existingEmployeeUser.sessionStatus === "Logged In" ||
          lastAction === "Logged In"
        ) {
          return res.status(400).json({
            message: "User is already logged in on another device",
          });
        }
        await DeviceModel.findOneAndUpdate(
          { deviceId: previousDeviceId },
          { deviceStatus: "Disable" }
        );
      }
      const existingUserByEmail = await User.findOne({ email });
      if (
        existingUserByEmail &&
        String(existingUserByEmail._id) !== String(existingEmployeeUser._id)
      ) {
        return res.status(400).json({ message: "User already exists" });
      }

      const hashedPassword = await hashPassword(password);
      const user = await User.findByIdAndUpdate(
        existingEmployeeUser._id,
        cleanUpdate({ deviceId, email, name, password: hashedPassword }),
        { new: true }
      );

      const deviceName = req.body.deviceName || deviceId;
      const devicePayload = cleanUpdate({
        userId: user._id,
        employeeId,
        deviceId,
        deviceName,
        deviceStatus: "Active",
        type: req.body.type,
        platform: req.body.platform,
        model: req.body.model,
        browser: req.body.browser,
        osVersion: req.body.osVersion,
        appVersion: req.body.appVersion,
        status: req.body.status,
        deviceOwner: req.body.deviceOwner,
        enrollmentDate: req.body.enrollmentDate,
        lastOnline: req.body.lastOnline,
        cameraAllowed: req.body.cameraAllowed,
        locationAllowed: req.body.locationAllowed,
        lastScreenshotAt: req.body.lastScreenshotAt,
        otpCode: req.body.otpCode,
        otpExpiresAt: req.body.otpExpiresAt,
        metadata: req.body.metadata,
        raw: req.body,
        verified:
          typeof req.body.verified === "boolean" ? req.body.verified : undefined,
      });

      const existingDevice = await DeviceModel.findOne({ deviceId });
      if (existingDevice) {
        await DeviceModel.findByIdAndUpdate(existingDevice._id, devicePayload, {
          new: true,
        });
      } else {
        await DeviceModel.create(devicePayload);
      }

      return res.status(201).json({
        message: "User registered successfully",
        user: {
          id: user._id,
          name: user.name,
          employeeId: user.employeeId,
          deviceId: user.deviceId,
          role: user.role,
        },
      });
    }

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

    const hashedPassword = await hashPassword(password);
    const user = await User.create(
      cleanUpdate({
        name,
        email,
        employeeId,
        deviceId,
        role,
        password: hashedPassword,
      })
    );

    const deviceName = req.body.deviceName || deviceId;
    const devicePayload = cleanUpdate({
      userId: user._id,
      employeeId,
      deviceId,
      deviceName,
      deviceStatus: "Active",
      type: req.body.type,
      platform: req.body.platform,
      model: req.body.model,
      browser: req.body.browser,
      osVersion: req.body.osVersion,
      appVersion: req.body.appVersion,
      status: req.body.status,
      deviceOwner: req.body.deviceOwner,
      enrollmentDate: req.body.enrollmentDate,
      lastOnline: req.body.lastOnline,
      cameraAllowed: req.body.cameraAllowed,
      locationAllowed: req.body.locationAllowed,
      lastScreenshotAt: req.body.lastScreenshotAt,
      otpCode: req.body.otpCode,
      otpExpiresAt: req.body.otpExpiresAt,
      metadata: req.body.metadata,
      raw: req.body,
      verified: typeof req.body.verified === "boolean" ? req.body.verified : undefined,
    });

    const existingDevice = await DeviceModel.findOne({ deviceId });
    if (existingDevice) {
      await DeviceModel.findByIdAndUpdate(existingDevice._id, devicePayload, {
        new: true,
      });
    } else {
      await DeviceModel.create(devicePayload);
    }

    res.status(201).json({
      message: "User registered successfully",
      user: {
        id: user._id,
        name,
        employeeId,
        deviceId,
        role,
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
   Generate QR Token
---------------------------------- */
exports.generateQr = async (req, res) => {
  try {
    const action = String(req.body.action || "").toLowerCase();
    const location = req.body.location;
    const expiresIn = req.body.expiresIn;
    const expiresAt = req.body.expiresAt;

    if (!["login", "logout"].includes(action)) {
      return res.status(400).json({ message: "action must be login or logout" });
    }
    if (location === undefined || location === null || location === "") {
      return res.status(400).json({ message: "location is required" });
    }

    let expirationMs = 5 * 60 * 1000;
    if (expiresAt) {
      const parsed = new Date(expiresAt);
      if (isNaN(parsed.getTime())) {
        return res.status(400).json({ message: "expiresAt is invalid" });
      }
      expirationMs = parsed.getTime() - Date.now();
      if (expirationMs <= 0) {
        return res.status(400).json({ message: "expiresAt must be in the future" });
      }
    } else if (expiresIn !== undefined) {
      const seconds = Number(expiresIn);
      if (!Number.isFinite(seconds) || seconds <= 0) {
        return res.status(400).json({ message: "expiresIn must be a positive number of seconds" });
      }
      expirationMs = seconds * 1000;
    }

    const tokenId = randomUUID();
    const token = jwt.sign(
      { jti: tokenId, action, location },
      JWT_SECRET,
      { expiresIn: Math.floor(expirationMs / 1000) }
    );

    const expiresAtDate = new Date(Date.now() + expirationMs);
    await QrToken.create({
      tokenId,
      action,
      location,
      expiresAt: expiresAtDate,
      raw: req.body,
    });

    return res.status(201).json({
      message: "QR generated successfully",
      token,
      expiresAt: expiresAtDate,
      action,
      location,
    });
  } catch (error) {
    console.error("QR Generate Error:", error);
    return res.status(500).json({ message: "Server error", error: error.message });
  }
};

/* ---------------------------------
   Consume QR Token
---------------------------------- */
exports.consumeQr = async (req, res) => {
  const { token, userId, deviceId, location } = req.body;

  try {
    if (!token) {
      return res.status(400).json({ message: "token is required" });
    }
    if (!userId) {
      return res.status(400).json({ message: "userId is required" });
    }
    if (location === undefined || location === null || location === "") {
      return res.status(400).json({ message: "location is required" });
    }

    const decoded = jwt.verify(token, JWT_SECRET);
    const tokenId = decoded.jti;
    const action = String(decoded.action || "").toLowerCase();
    const tokenLocation = decoded.location;

    if (!tokenId) {
      return res.status(400).json({ message: "tokenId missing in token" });
    }
    if (!["login", "logout"].includes(action)) {
      return res.status(400).json({ message: "token action is invalid" });
    }

    const qrRecord = await QrToken.findOne({ tokenId });
    if (!qrRecord) {
      return res.status(400).json({ message: "QR token not found" });
    }
    if (qrRecord.usedAt) {
      return res.status(400).json({ message: "QR already used" });
    }
    if (qrRecord.expiresAt && qrRecord.expiresAt < new Date()) {
      return res.status(400).json({ message: "QR expired" });
    }

    const normalizedTokenLocation = normalizeLocation(tokenLocation);
    const normalizedRequestLocation = normalizeLocation(location);
    if (normalizedTokenLocation !== normalizedRequestLocation) {
      return res.status(400).json({ message: "Location does not match QR" });
    }

    const user = await User.findById(userId);
    if (!user) {
      return res.status(404).json({ message: "User not found" });
    }

    const resolved = await resolveAssignedDeviceId(user, deviceId);
    if (resolved.error) {
      return res.status(400).json({ message: resolved.error });
    }
    const sessionDeviceId = resolved.deviceId;
    if (resolved.syncDeviceId) {
      await User.findByIdAndUpdate(user._id, {
        deviceId: resolved.syncDeviceId,
      });
    }

    if (action === "login" && user.sessionStatus === "Logged In") {
      return res.status(400).json({
        message: "User is already logged in on another device",
      });
    }
    if (action === "logout" && user.sessionStatus === "Logout") {
      return res.status(400).json({ message: "User is already logged out" });
    }

    const employee = await EmployeeModel.findOne({ employeeId: user.employeeId });
    if (!employee) {
      return res.status(400).json({ message: "Employee not found for attendance" });
    }
    if (!employee.rfid || !employee.section) {
      return res.status(400).json({ message: "Employee RFID/section missing for attendance" });
    }

    await markAttendance(employee, action);

    const sessionAction = action === "login" ? "Logged In" : "Logout";
    await UserSession.create({
      userId: user._id,
      deviceId: sessionDeviceId,
      employeeId: user.employeeId,
      action: sessionAction,
      location,
      raw: req.body,
    });
    await User.findByIdAndUpdate(user._id, {
      sessionStatus: sessionAction,
    });

    await QrToken.findByIdAndUpdate(qrRecord._id, {
      usedAt: new Date(),
    });

    return res.status(200).json({
      message: action === "login" ? "Logged in successfully" : "Logged out successfully",
      userId: user._id,
      employeeId: user.employeeId,
      deviceId: sessionDeviceId,
      location,
    });
  } catch (error) {
    if (error.name === "TokenExpiredError") {
      return res.status(400).json({ message: "QR expired" });
    }
    console.error("QR Consume Error:", error);
    return res.status(500).json({ message: "Server error", error: error.message });
  }
};

/* ---------------------------------
   Login User
---------------------------------- */
exports.loginUser = async (req, res) => {
  const email = req.body.email?.toLowerCase().trim();
  const password = req.body.password;
  const requestedDeviceId = req.body.deviceId?.trim();

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

    const sessionDeviceId = user.deviceId || requestedDeviceId || null;

    const accessToken = generateAccessToken(user);
    const refreshToken = generateRefreshToken(user);

    await UserSession.create({
      userId: user._id,
      deviceId: sessionDeviceId,
      employeeId: user.employeeId,
      action: "Logged In",
      location: req.body.location,
      raw: req.body,
    });
    await User.findByIdAndUpdate(user._id, {
      sessionStatus: "Logged In",
    });

    res.status(200).json({
      id: user._id,
      name: user.name,
      employeeId: user.employeeId,
      deviceId: user.deviceId,
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
   Logout User
---------------------------------- */
exports.logoutUser = async (req, res) => {
  const userId = req.body.userId;
  const employeeId = req.body.employeeId?.trim();
  const requestedDeviceId = req.body.deviceId?.trim();

  try {
    if (!userId && !employeeId) {
      return res.status(400).json({
        message: "userId or employeeId is required",
      });
    }

    const user = userId
      ? await User.findById(userId)
      : await User.findOne({ employeeId });
    if (!user) {
      return res.status(404).json({ message: "User not found" });
    }

    const resolved = await resolveAssignedDeviceId(user, requestedDeviceId);
    if (resolved.error) {
      return res.status(400).json({ message: resolved.error });
    }
    const sessionDeviceId = resolved.deviceId;
    if (resolved.syncDeviceId) {
      await User.findByIdAndUpdate(user._id, {
        deviceId: resolved.syncDeviceId,
      });
    }

    await UserSession.create({
      userId: user._id,
      deviceId: sessionDeviceId,
      employeeId: user.employeeId,
      action: "Logout",
      location: req.body.location,
      raw: req.body,
    });
    await User.findByIdAndUpdate(user._id, {
      sessionStatus: "Logout",
    });

    return res.status(200).json({ message: "Logged out successfully" });
  } catch (error) {
    console.error("Logout Error:", error);
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
