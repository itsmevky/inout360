const jwt = require("jsonwebtoken");
const mongoose = require("mongoose");
const { randomUUID } = require("crypto");
const qrcode = require("qrcode");
const User = require("../user/model");
const DeviceModel = require("../device/model");
const UserSession = require("../userSessions/model");
const QrToken = require("./model");
const AttendanceModel = require("../attendance/model");
const EmployeeModel = require("../employees/model");

const JWT_SECRET =
  process.env.SECRET_KEY ||
  process.env.JWT_ACCESS_SECRET ||
  process.env.JWT_SECRET;

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

const createQrToken = async (payload) => {
  const action = String(payload.action || "").toLowerCase();
  const location = payload.location;
  const expiresIn = payload.expiresIn;
  const expiresAt = payload.expiresAt;

  if (!["login", "logout"].includes(action)) {
    const error = new Error("action must be login or logout");
    error.status = 400;
    throw error;
  }
  if (location === undefined || location === null || location === "") {
    const error = new Error("location is required");
    error.status = 400;
    throw error;
  }

  let expirationMs = 5 * 60 * 1000;
  if (expiresAt) {
    const parsed = new Date(expiresAt);
    if (isNaN(parsed.getTime())) {
      const error = new Error("expiresAt is invalid");
      error.status = 400;
      throw error;
    }
    expirationMs = parsed.getTime() - Date.now();
    if (expirationMs <= 0) {
      const error = new Error("expiresAt must be in the future");
      error.status = 400;
      throw error;
    }
  } else if (expiresIn !== undefined) {
    const seconds = Number(expiresIn);
    if (!Number.isFinite(seconds) || seconds <= 0) {
      const error = new Error("expiresIn must be a positive number of seconds");
      error.status = 400;
      throw error;
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
    raw: payload,
  });

  return { token, expiresAt: expiresAtDate, action, location };
};

exports.generateQr = async (req, res) => {
  try {
    const { token, expiresAt, action, location } = await createQrToken(req.body);

    return res.status(201).json({
      message: "QR generated successfully",
      token,
      expiresAt,
      action,
      location,
    });
  } catch (error) {
    console.error("QR Generate Error:", error);
    return res
      .status(error.status || 500)
      .json({ message: error.message || "Server error", error: error.message });
  }
};

exports.generateQrPng = async (req, res) => {
  try {
    const { token, expiresAt, action, location } = await createQrToken(req.body);
    const pngBuffer = await qrcode.toBuffer(token, {
      type: "png",
      errorCorrectionLevel: "M",
      margin: 2,
      width: 300,
    });

    res.set({
      "Content-Type": "image/png",
      "Cache-Control": "no-store",
      "X-QR-Token": token,
      "X-QR-Expires-At": expiresAt.toISOString(),
      "X-QR-Action": action,
      "X-QR-Location": String(location),
    });
    return res.status(200).send(pngBuffer);
  } catch (error) {
    console.error("QR PNG Error:", error);
    return res
      .status(error.status || 500)
      .json({ message: error.message || "Server error", error: error.message });
  }
};

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

    // Resolve user/employee: accept userId as User _id or Employee _id/employeeId/userId
    let user = null;
    let employee = null;

    if (mongoose.isValidObjectId(userId)) {
      user = await User.findById(userId);
      if (!user) {
        employee =
          (await EmployeeModel.findById(userId)) ||
          (await EmployeeModel.findOne({ userId }));
      }
    }
    if (!user && !employee) {
      employee =
        (await EmployeeModel.findOne({ employeeId: String(userId) })) ||
        (await EmployeeModel.findOne({ userId: userId }));
    }
    if (!user && employee?.userId) {
      user = await User.findById(employee.userId);
    }
    if (!employee && user?.employeeId) {
      employee = await EmployeeModel.findOne({ employeeId: user.employeeId });
    }

    if (!employee && !user) {
      return res.status(404).json({ message: "User not found" });
    }
    if (!employee) {
      return res.status(404).json({ message: "Employee not found" });
    }

    let sessionDeviceId = deviceId;
    if (user) {
      const resolved = await resolveAssignedDeviceId(user, deviceId);
      if (resolved.error) {
        return res.status(400).json({ message: resolved.error });
      }
      sessionDeviceId = resolved.deviceId;
      if (resolved.syncDeviceId) {
        await User.findByIdAndUpdate(user._id, {
          deviceId: resolved.syncDeviceId,
        });
      }
    }

    if (action === "login" && user?.sessionStatus === "Logged In") {
      return res.status(400).json({
        message: "User is already logged in on another device",
      });
    }
    if (action === "logout" && user?.sessionStatus === "Logout") {
      return res.status(400).json({ message: "User is already logged out" });
    }

    if (!employee.rfid || !employee.section) {
      return res.status(400).json({ message: "Employee RFID/section missing for attendance" });
    }

    await markAttendance(employee, action);

    const sessionAction = action === "login" ? "Logged In" : "Logout";
    await UserSession.create({
      userId: user ? user._id : employee._id,
      deviceId: sessionDeviceId,
      employeeId: employee.employeeId,
      action: sessionAction,
      location,
      raw: req.body,
    });
    if (user) {
      await User.findByIdAndUpdate(user._id, {
        sessionStatus: sessionAction,
      });
    }

    await QrToken.findByIdAndUpdate(qrRecord._id, {
      usedAt: new Date(),
    });

    return res.status(200).json({
      message: action === "login" ? "Logged in successfully" : "Logged out successfully",
      userId: user ? user._id : employee._id,
      employeeId: employee.employeeId,
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
