const jwt = require("jsonwebtoken");
const mongoose = require("mongoose");
const { randomUUID } = require("crypto");
const qrcode = require("qrcode");
const User = require("../user/model");
const DeviceModel = require("../device/model");
const UserSession = require("../user/userSessionsModel");
const AttendanceModel = require("../attendance/model");
const EmployeeModel = require("../employees/model");
const SettingsModel = require("../settings/model");

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

const resolveUserLocation = async (user) => {
  const directLocation = user?.location;
  if (directLocation) {
    return directLocation;
  }

  if (!user?._id) {
    return "";
  }

  const employee = await EmployeeModel.findOne({ userId: user._id }).lean();
  return employee?.location || "";
};

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

const markAttendance = async (employee, action, userId) => {
  const { start, end } = getDayRange(new Date());
  const attendanceQuery = {
    employeeId: employee.employeeId,
    date: { $gte: start, $lte: end },
  };
  const now = new Date();

  if (action === "login") {
    const existing = await AttendanceModel.findOne({
      ...attendanceQuery,
      exitGateOut: { $exists: false },
    });
    if (existing) {
      if (!existing.entryGateIn) {
        existing.entryGateIn = now;
        await existing.save();
      }
      return existing;
    }

    return AttendanceModel.create({
      rfidCardId: employee.rfid,
      employeeId: employee.employeeId,
      userId: userId || employee.userId || null,
      date: start,
      entryGateIn: now,
      sectionAssigned: employee.section,
      status: "Present",
    });
  }

  if (action === "logout") {
    const existing = await AttendanceModel.findOne({
      ...attendanceQuery,
      exitGateOut: { $exists: false },
    }).sort({ createdAt: -1 });
    if (existing) {
      existing.exitGateOut = now;
      if (existing.entryGateIn) {
        const diffMs = now.getTime() - existing.entryGateIn.getTime();
        existing.totalWorkHours = Math.max(0, diffMs / (1000 * 60 * 60));
      }
      await existing.save();
      return existing;
    }
    return null;
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
  } else {
    const settings = await SettingsModel.findOne().lean();
    const fallbackSeconds = Number(settings?.qrExpirySeconds);
    if (Number.isFinite(fallbackSeconds) && fallbackSeconds > 0) {
      expirationMs = fallbackSeconds * 1000;
    }
  }

  const tokenId = randomUUID();
  const token = jwt.sign(
    { jti: tokenId, action, location },
    JWT_SECRET,
    { expiresIn: Math.floor(expirationMs / 1000) }
  );

  const expiresAtDate = new Date(Date.now() + expirationMs);
  return { token, expiresAt: expiresAtDate, action, location, reused: false };
};

exports.generateQr = async (req, res) => {
  try {
    const location = await resolveUserLocation(req.user);
    if (!location) {
      return res.status(400).json({ message: "location missing for user" });
    }

    const { token, expiresAt, action, reused } = await createQrToken({
      ...req.body,
      location,
    });

    return res.status(201).json({
      message: "QR generated successfully",
      token,
      expiresAt,
      action,
      location,
      reused,
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
    const location = await resolveUserLocation(req.user);
    if (!location) {
      return res.status(400).json({ message: "location missing for user" });
    }

    const { token, expiresAt, action, reused } = await createQrToken({
      ...req.body,
      location,
    });
    const pngBuffer = await qrcode.toBuffer(token, {
      type: "png",
      errorCorrectionLevel: "M",
      margin: 2,
      width: 300,
    });

    res.set({
      "Content-Type": "image/png",
      "Cache-Control": "no-store",
      "Access-Control-Expose-Headers":
        "X-QR-Token, X-QR-Expires-At, X-QR-Action, X-QR-Location, X-QR-Reused",
      "X-QR-Token": token,
      "X-QR-Expires-At": expiresAt.toISOString(),
      "X-QR-Action": action,
      "X-QR-Location": String(location),
      "X-QR-Reused": String(reused),
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
  const { token, userId, deviceId, location, deviceLocation } = req.body;

  try {
    if (!token) {
      return res.status(400).json({ message: "token is required" });
    }
    if (!userId) {
      return res.status(400).json({ message: "userId is required" });
    }
    if (!mongoose.isValidObjectId(userId)) {
      return res.status(400).json({ message: "userId must be a valid user id" });
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

    const expMs = decoded?.exp ? decoded.exp * 1000 : null;
    if (expMs && expMs < Date.now()) {
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

    user = await User.findById(userId);
    if (!user) {
      employee =
        (await EmployeeModel.findById(userId)) ||
        (await EmployeeModel.findOne({ userId }));
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
        message: "User is already Logged In ",
      });
    }
    if (action === "logout" && user?.sessionStatus === "Logout") {
      return res.status(400).json({ message: "User is already logged out" });
    }

    if (!employee.rfid || !employee.section) {
      return res.status(400).json({ message: "Employee RFID/section missing for attendance" });
    }

    await markAttendance(employee, action, user?._id);

    const sessionAction = action === "login" ? "Logged In" : "Logout";
    const sessionUserId = employee?.userId || user?._id || employee._id;
    const rawPayload = { ...req.body };
    delete rawPayload.token;
    delete rawPayload.userId;
    delete rawPayload.deviceId;
    delete rawPayload.employeeId;
    delete rawPayload.action;
    delete rawPayload.location;
    delete rawPayload.deviceLocation;

    await UserSession.create({
      userId: sessionUserId,
      deviceId: sessionDeviceId,
      employeeId: employee.employeeId,
      action: sessionAction,
      token,
      location,
      deviceLocation,
      raw: rawPayload,
    });
    if (deviceLocation !== undefined) {
      await DeviceModel.updateOne(
        { deviceId: sessionDeviceId },
        { $set: { deviceLocation } }
      );
    }
    if (user) {
      await User.findByIdAndUpdate(user._id, {
        sessionStatus: sessionAction,
      });
    }

    let loginToken = null;
    if (action === "login" && sessionDeviceId) {
      loginToken = randomUUID();
      await DeviceModel.updateOne(
        { deviceId: sessionDeviceId },
        { $set: { loginToken } }
      );
    }

    const deviceRecord = sessionDeviceId
      ? await DeviceModel.findOne({ deviceId: sessionDeviceId }).lean()
      : null;
    const deviceSettings = deviceRecord
      ? {
          deviceStatus: deviceRecord.deviceStatus,
          cameraDisabled: deviceRecord.devicePolicyState?.cameraDisabled ?? false,
          uninstallBlocked: deviceRecord.devicePolicyState?.uninstallBlocked ?? false,
          facebookBlocked: deviceRecord.devicePolicyState?.facebookBlocked ?? false,
          instagramBlocked: deviceRecord.devicePolicyState?.instagramBlocked ?? false,
          youtubeBlocked: deviceRecord.devicePolicyState?.youtubeBlocked ?? false,
          whatsappBlocked: deviceRecord.devicePolicyState?.whatsappBlocked ?? false,
          locationAllowed: deviceRecord.locationAllowed ?? true,
          devicePolicyState: deviceRecord.devicePolicyState || {},
        }
      : null;

    const responsePayload = {
      message: action === "login" ? "Logged in successfully" : "Logged out successfully",
      userId: user ? user._id : employee._id,
      employeeId: employee.employeeId,
      deviceId: sessionDeviceId,
      location,
      deviceLocation,
      deviceSettings,
      action,
    };

    if (action === "login") {
      responsePayload.loginToken = loginToken;
    }

    void tokenId;

    responsePayload.expiresAt = expMs ? new Date(expMs) : null;

    return res.status(200).json(responsePayload);
  } catch (error) {
    if (error.name === "TokenExpiredError") {
      return res.status(400).json({ message: "QR expired" });
    }
    console.error("QR Consume Error:", error);
    return res.status(500).json({ message: "Server error", error: error.message });
  }
};
