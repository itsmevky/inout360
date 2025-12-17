const mongoose = require("mongoose");
const paginate = require("../../helpers/limitoffset");
const DeviceModel = require("./model");
const UserModel = require("../user/model");

const normalizeStatus = (value) => {
  const up = String(value || "").toUpperCase();
  if (["ONLINE", "OFFLINE", "BLOCKED"].includes(up)) return up;
  return "OFFLINE";
};

const boolOrDefault = (value, defaultValue) =>
  typeof value === "boolean" ? value : defaultValue;

const cleanUpdate = (obj) =>
  Object.fromEntries(Object.entries(obj).filter(([, v]) => v !== undefined));

const formatDevice = (doc) => {
  const d = typeof doc.toObject === "function" ? doc.toObject() : doc;
  return {
    ...d,
    id: d._id?.toString?.() || d.id,
    userName:
      d.userId && (d.userId.firstName || d.userId.lastName)
        ? `${d.userId.firstName || ""} ${d.userId.lastName || ""}`.trim()
        : d.userId?.email,
    statusLabel:
      (d.status || "").toUpperCase() === "ONLINE"
        ? "Online"
        : (d.status || "").toUpperCase() === "BLOCKED"
          ? "Blocked"
          : "Offline",
    androidVersion: d.osVersion,
    appVer: d.appVersion,
    verified: !!d.verified,
  };
};

const upsertDevice = async (payload) => {
  const {
    deviceId,
    userId,
    employeeId,
    deviceName,
    type,
    platform,
    model,
    browser,
    osVersion,
    appVersion,
    status,
    deviceOwner,
    cameraAllowed,
    locationAllowed,
    lastScreenshotAt,
    enrollmentDate,
    metadata = {},
    raw = {},
    verified,
  } = payload;

  if (!userId) {
    throw new Error("userId is required");
  }

  const normalizedStatus = normalizeStatus(status || "ONLINE");
  const now = new Date();

  const filter = deviceId
    ? { _id: deviceId }
    : cleanUpdate({
        userId,
        deviceName,
        platform,
      });

  const update = cleanUpdate({
    userId,
    employeeId,
    deviceName,
    type: type || "MOBILE",
    platform,
    model,
    browser,
    osVersion,
    appVersion,
    status: normalizedStatus,
    lastOnline: normalizedStatus === "ONLINE" ? now : undefined,
    enrollmentDate: enrollmentDate ? new Date(enrollmentDate) : undefined,
    deviceOwner,
    cameraAllowed: boolOrDefault(cameraAllowed, true),
    locationAllowed: boolOrDefault(locationAllowed, true),
    lastScreenshotAt: lastScreenshotAt ? new Date(lastScreenshotAt) : undefined,
    metadata,
    raw,
    verified: typeof verified === "boolean" ? verified : undefined,
  });

  return DeviceModel.findOneAndUpdate(filter, update, {
    new: true,
    upsert: true,
    setDefaultsOnInsert: true,
  }).populate("userId");
};

// Track or upsert device info (used on login or heartbeats)
exports.track = async (req, res) => {
  try {
    const device = await upsertDevice(req.body);
    return res.status(200).json({
      status: true,
      message: "Device tracked",
      deviceId: device._id,
      data: formatDevice(device),
    });
  } catch (error) {
    return res.status(500).json({ status: false, message: error.message });
  }
};

// Alias for creating/upserting from admin UI
exports.add = async (req, res) => exports.track(req, res);

// Step 1: Register device (no OTP yet)
exports.register = async (req, res) => {
  try {
    const {
      userId,
      employeeId,
      deviceName,
      platform,
      model,
      osVersion,
      appVersion,
      deviceOwner,
    } = req.body;

    if (!userId || !deviceName) {
      return res.status(400).json({ status: false, message: "userId and deviceName are required" });
    }

    const user = await UserModel.findById(userId);
    if (!user) {
      return res.status(400).json({ status: false, message: "User not found" });
    }

    const device = await upsertDevice({
      userId,
      employeeId,
      deviceName,
      platform,
      model,
      osVersion,
      appVersion,
      deviceOwner,
      status: "OFFLINE",
      verified: false,
      raw: req.body,
    });

    return res.status(200).json({
      status: true,
      message: "Device registered successfully. Proceed to send OTP.",
      deviceId: device._id,
    });
  } catch (error) {
    return res.status(500).json({ status: false, message: error.message });
  }
};

// Step 2: Send OTP for an existing device
exports.sendOtp = async (req, res) => {
  try {
    const { deviceId, deviceName } = req.body;
    if (!deviceId && !deviceName) {
      return res.status(400).json({ status: false, message: "deviceId or deviceName is required" });
    }

    const query = deviceId ? { _id: deviceId } : { deviceName };
    const device = await DeviceModel.findOne(query).populate("userId");
    if (!device) {
      return res.status(404).json({ status: false, message: "Device not found" });
    }
    const userEmail = device.userId?.email;
    if (!userEmail) {
      return res.status(400).json({ status: false, message: "User email not found for device" });
    }

    const otpCode = Math.floor(100000 + Math.random() * 900000).toString();
    const otpExpiresAt = new Date(Date.now() + 10 * 60 * 1000); // 10 minutes

    device.otpCode = otpCode;
    device.otpExpiresAt = otpExpiresAt;
    device.verified = false;
    await device.save();

    await sendOtpEmail(userEmail, otpCode, device.deviceName || deviceName);

    return res.status(200).json({
      status: true,
      message: "Device registered successfully and OTP sent to email",
      deviceId: device._id,
    });
  } catch (error) {
    return res.status(500).json({ status: false, message: error.message });
  }
};

exports.verifyOtp = async (req, res) => {
  try {
    const { deviceId, deviceName, otp } = req.body;
    if (!otp || (!deviceId && !deviceName)) {
      return res.status(400).json({ status: false, message: "deviceId or deviceName and otp are required" });
    }

    const query = deviceId
      ? { _id: deviceId }
      : { deviceName };

    const device = await DeviceModel.findOne(query);
    if (!device) {
      return res.status(404).json({ status: false, message: "Device not found" });
    }
    if (!device.otpCode || !device.otpExpiresAt) {
      return res.status(400).json({ status: false, message: "No OTP pending for this device" });
    }
    if (device.otpExpiresAt < new Date()) {
      return res.status(400).json({ status: false, message: "OTP has expired" });
    }
    if (device.otpCode !== otp) {
      return res.status(400).json({ status: false, message: "Invalid OTP" });
    }

    device.verified = true;
    device.otpCode = null;
    device.otpExpiresAt = null;
    await device.save();

    return res.status(200).json({ status: true, message: "Device verified successfully" });
  } catch (error) {
    return res.status(500).json({ status: false, message: error.message });
  }
};

const sendOtpEmail = async (to, otp, deviceName) => {
  // For current testing, only log the OTP instead of sending email
  console.log(`[OTP LOG] To: ${to} Device: ${deviceName} OTP: ${otp}`);
  return;
};

// List devices for the UI grid
exports.getAll = async (req, res) => {
  try {
    const { page, limit, search, status } = req.query;
    const pageNumber = Math.max(0, (parseInt(page, 10) || 1) - 1);

    const filter = {};
    if (status) filter.status = normalizeStatus(status);

    const result = await paginate(
      DeviceModel,
      filter,
      pageNumber,
      limit,
      ["userId"],
      ["deviceName", "employeeId", "model", "appVersion", "osVersion"],
      search
    );

    const devices = result.data.map(formatDevice);

    return res.status(200).json({
      status: result.status,
      message: result.message,
      devices,
      total: result.pagination?.totalrecords || 0,
      pagination: result.pagination,
    });
  } catch (error) {
    return res.status(500).json({
      status: false,
      message: "Server Error",
      error: error.message,
    });
  }
};

// Detail view for the device modal
exports.getById = async (req, res) => {
  try {
    const { id } = req.params;
    const query = mongoose.isValidObjectId(id)
      ? { _id: id }
      : { deviceName: id };

    const device = await DeviceModel.findOne(query).populate("userId");
    if (!device) {
      return res.status(404).json({ status: false, message: "Not found" });
    }

    return res.status(200).json({
      status: true,
      message: "Record fetched",
      data: formatDevice(device),
    });
  } catch (error) {
    return res.status(500).json({ status: false, message: error.message });
  }
};
