const mongoose = require("mongoose");
const paginate = require("../../helpers/limitoffset");
const DeviceModel = require("./model");
const UserModel = require("../user/model");
const EmployeeModel = require("../employees/model");

const normalizeStatus = (value) => {
  const up = String(value || "").toUpperCase();
  if (["ONLINE", "OFFLINE", "BLOCKED"].includes(up)) return up;
  return "OFFLINE";
};

const normalizeDeviceId = (value) => String(value || "").trim();

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
      d.userId?.name ||
      (d.userId && (d.userId.firstName || d.userId.lastName)
        ? `${d.userId.firstName || ""} ${d.userId.lastName || ""}`.trim()
        : d.userId?.email),
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
    deviceStatus,
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

  let filter = cleanUpdate({
    userId,
    deviceName,
    platform,
  });

  if (deviceId) {
    const normalized = normalizeDeviceId(deviceId);
    const orFilters = [{ deviceId: new RegExp(`^${normalized}$`, "i") }];
    if (mongoose.isValidObjectId(deviceId)) {
      orFilters.push({ _id: deviceId });
    }
    filter = { $or: orFilters };
  }

  const update = cleanUpdate({
    userId,
    employeeId,
    deviceId,
    deviceName,
    deviceStatus,
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
      name,
      employeeId,
      deviceId,
      deviceName,
      platform,
      model,
      osVersion,
      appVersion,
      deviceOwner,
    } = req.body;

    if (!name || !employeeId || !deviceId) {
      return res.status(400).json({
        status: false,
        message: "name, employeeId and deviceId are required",
      });
    }

    const employee = await EmployeeModel.findOne({ employeeId });
    if (!employee) {
      return res.status(400).json({ status: false, message: "Employee not found" });
    }
    const user = employee.userId
      ? await UserModel.findById(employee.userId)
      : await UserModel.findOne({ employeeId });
    if (!user) {
      return res.status(404).json({ status: false, message: "User not found for this employee" });
    }
    const normalizedName = String(name).trim().toLowerCase();
    const employeeName = (employee.name ||
      `${employee.firstName || ""} ${employee.lastName || ""}`)
      .trim()
      .toLowerCase();
    if (normalizedName !== employeeName) {
      return res.status(400).json({
        status: false,
        message: "Name does not match the employeeId",
      });
    }

    // Prevent assigning a new device if the user already has an Active device
    const activeFilter = {
      userId: user._id,
      deviceStatus: "Active",
    };
    if (deviceId && mongoose.isValidObjectId(deviceId)) {
      activeFilter._id = { $ne: deviceId };
    }
    const activeDevice = await DeviceModel.findOne(activeFilter);
    if (activeDevice) {
      return res.status(400).json({
        status: false,
        message: "User already has an active device assigned",
      });
    }

    const device = await upsertDevice({
      userId: user._id,
      employeeId,
      deviceId,
      deviceName: deviceName || deviceId,
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
