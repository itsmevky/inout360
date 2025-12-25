const mongoose = require("mongoose");
const paginate = require("../../helpers/limitoffset");
const DeviceModel = require("./model");
const UserModel = require("../user/model");
const EmployeeModel = require("../employees/model");
const PolicyModel = require("../policy/model");
const VisitorModel = require("../visitor/model");

const normalizeStatus = (value) => {
  const up = String(value || "").toUpperCase();
  if (["ONLINE", "OFFLINE", "BLOCKED"].includes(up)) return up;
  return "OFFLINE";
};

const normalizeDeviceId = (value) => String(value || "").trim();
const padVisitorId = (seq) => `VIS-${String(seq).padStart(5, "0")}`;

const getNextVisitorId = async () => {
  const counters = mongoose.connection.collection("counters");
  const result = await counters.findOneAndUpdate(
    { _id: "visitor" },
    { $inc: { seq: 1 } },
    { upsert: true, returnDocument: "after" }
  );
  const seq = result?.value?.seq || 1;
  return padVisitorId(seq);
};


const boolOrDefault = (value, defaultValue) =>
  typeof value === "boolean" ? value : defaultValue;

const toValidDate = (value) => {
  if (!value) return undefined;
  if (value instanceof Date) {
    return isNaN(value.getTime()) ? undefined : value;
  }
  const str = String(value).trim();
  if (!str) return undefined;
  // Trim microseconds to milliseconds if present (e.g. 2025-12-22T12:07:02.922527)
  const normalized = str.replace(/(\.\d{3})\d+/, "$1");
  const d = new Date(normalized);
  return isNaN(d.getTime()) ? undefined : d;
};

const cleanUpdate = (obj) =>
  Object.fromEntries(Object.entries(obj).filter(([, v]) => v !== undefined));

const formatDevice = (doc) => {
  const d = typeof doc.toObject === "function" ? doc.toObject() : doc;
  return {
    ...d,
    id: d._id?.toString?.() || d.id,
    name: d.name,
    deviceId: d.deviceId || d._id,
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
    deviceStatus: d.deviceStatus,
    cameraDisabled: d.devicePolicyState?.cameraDisabled ?? false,
    uninstallBlocked: d.devicePolicyState?.uninstallBlocked ?? false,
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
    name,
    deviceStatus,
    type,
    platform,
    model,
    browser,
    osVersion,
    appVersion,
    fcmToken,
    isDeviceOwner,
    deviceInfo,
    devicePolicyState,
    status,
    deviceOwner,
    locationAllowed,
    lastScreenshotAt,
    enrollmentDate,
    lastSeen,
    deviceLocation,
    createdAt,
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
    name,
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

  const updateSet = cleanUpdate({
    userId,
    employeeId,
    deviceId,
    deviceName,
    name,
    deviceStatus,
    type: type || "MOBILE",
    platform,
    model,
    browser,
    osVersion,
    appVersion,
    fcmToken,
    isDeviceOwner: typeof isDeviceOwner === "boolean" ? isDeviceOwner : undefined,
    deviceInfo,
    devicePolicyState,
    status: normalizedStatus,
    lastOnline: normalizedStatus === "ONLINE" ? now : undefined,
    enrollmentDate: toValidDate(enrollmentDate),
    lastSeen: toValidDate(lastSeen),
    deviceLocation,
    deviceOwner,
    locationAllowed: boolOrDefault(locationAllowed, true),
    lastScreenshotAt: toValidDate(lastScreenshotAt),
    metadata,
    raw,
    verified: typeof verified === "boolean" ? verified : undefined,
  });

  const createdAtDate = toValidDate(createdAt);
  const updateDoc = {
    $set: updateSet,
    ...(createdAtDate ? { $setOnInsert: { createdAt: createdAtDate } } : {}),
  };

  const result = await DeviceModel.findOneAndUpdate(filter, updateDoc, {
    new: true,
    upsert: true,
    setDefaultsOnInsert: true,
    runValidators: true,
    rawResult: true,
  });

  let doc = result?.value;
  if (doc && typeof doc.populate === "function") {
    await doc.populate("userId");
  }
  if (!doc) {
    doc = await DeviceModel.findOne(filter).populate("userId");
  }

  const wasInserted = !!result?.lastErrorObject?.upserted;
  if (process.env.NODE_ENV !== "production") {
    const id = doc?._id ? doc._id.toString() : "unknown";
    console.log(
      `Device upsert ${wasInserted ? "inserted" : "updated"}: ${id}`
    );
  }

  return doc;
};

// Track or upsert device info (used on login or heartbeats)
exports.track = async (req, res) => {
  try {
    const { userId, employeeId, deviceId } = req.body || {};
    if (!userId || !employeeId || !deviceId) {
      return res.status(400).json({
        status: false,
        message: "userId, employeeId and deviceId are required",
      });
    }
    const device = await upsertDevice(req.body);
    return res.status(200).json({
      status: true,
      message: "Device tracked",
      data: {
        deviceId: device.deviceId || device._id,
        userId: device.userId?._id || device.userId,
        deviceStatus: device.deviceStatus,
        verified: !!device.verified,
        devicePolicyState: device.devicePolicyState || {},
        deviceLocation: device.deviceLocation || null,
      },
    });
  } catch (error) {
    const details = error && error.stack ? error.stack : error;
    console.error("Device register failed:", details);
    return res.status(500).json({
      status: false,
      message: error.message || "Device register failed",
    });
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
      fcmToken,
      isDeviceOwner,
      deviceInfo,
      devicePolicyState,
      createdAt,
      lastSeen,
      deviceOwner,
    } = req.body;

    if (!name || !deviceId) {
      return res.status(400).json({
        status: false,
        message: "name and deviceId are required",
      });
    }

    let user = null;
    let effectiveEmployeeId = employeeId;
    let isVisitor = false;
    let visitor = null;

    if (employeeId) {
      const employee = await EmployeeModel.findOne({ employeeId });
      if (!employee) {
        return res.status(400).json({ status: false, message: "Employee not found" });
      }
      user = employee.userId
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
    } else {
      isVisitor = true;
      const normalizedDeviceId = normalizeDeviceId(deviceId);
      visitor = await VisitorModel.findOne({ deviceId: normalizedDeviceId });
      if (!visitor) {
        const visitorEmployeeId = await getNextVisitorId();
        visitor = await VisitorModel.create({
          name: String(name).trim(),
          employeeId: visitorEmployeeId,
          deviceId: normalizedDeviceId,
          role: "visitor",
        });
      }
      user = visitor;
      effectiveEmployeeId = visitor.employeeId;
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

    if (deviceId) {
      const normalizedDeviceId = normalizeDeviceId(deviceId);
      const existingDevice = await DeviceModel.findOne({
        $or: [
          { deviceId: new RegExp(`^${normalizedDeviceId}$`, "i") },
          ...(mongoose.isValidObjectId(deviceId) ? [{ _id: deviceId }] : []),
        ],
      });
      if (
        existingDevice &&
        existingDevice.userId &&
        existingDevice.userId.toString() !== user._id.toString() &&
        existingDevice.deviceStatus === "Active"
      ) {
        return res.status(409).json({
          status: false,
          message: "Device already assigned to another user",
        });
      }
    }

    const device = await upsertDevice({
      userId: user._id,
      employeeId: effectiveEmployeeId,
      deviceId,
      deviceName: deviceName || deviceId,
      name,
      platform,
      model,
      osVersion,
      appVersion,
      fcmToken,
      isDeviceOwner,
      deviceInfo,
      devicePolicyState,
      createdAt,
      lastSeen,
      deviceOwner,
      status: "OFFLINE",
      verified: false,
    });

    if (!device || !device._id) {
      return res.status(500).json({
        status: false,
        message: "Device register failed: no document returned from DB",
      });
    }

    console.log("Device register saved:", device._id.toString());

    return res.status(200).json({
      status: true,
      message: isVisitor
        ? "Visitor device registered successfully. Proceed to send OTP."
        : "Device registered successfully. Proceed to send OTP.",
      deviceId: device._id,
      userId: user._id,
      employeeId: effectiveEmployeeId,
      verified: !!device.verified,
    });
  } catch (error) {
    return res.status(500).json({ status: false, message: error.message });
  }
};

// Verify device register token to allow skipping OTP on future launches
exports.verifyRegisterToken = async (req, res) => {
  try {
    const token = String(req.body.registerToken || "").trim();
    const deviceId = String(req.body.deviceId || "").trim();
    if (!token || !deviceId) {
      return res.status(400).json({
        status: false,
        message: "deviceId and registerToken are required",
      });
    }

    const orFilters = [{ deviceId: new RegExp(`^${normalizeDeviceId(deviceId)}$`, "i") }];
    if (mongoose.isValidObjectId(deviceId)) {
      orFilters.push({ _id: deviceId });
    }
    const device = await DeviceModel.findOne({ $or: orFilters });
    if (!device || !device.registerToken) {
      return res.status(404).json({ status: false, message: "Device not registered" });
    }
    if (device.registerToken !== token) {
      return res.status(401).json({ status: false, message: "Invalid register token" });
    }

    return res.status(200).json({
      status: true,
      message: "Device verified",
      data: {
        deviceId: device._id,
        employeeId: device.employeeId,
        userId: device.userId,
        verified: !!device.verified,
      },
    });
  } catch (error) {
    return res.status(500).json({ status: false, message: error.message });
  }
};

// Get or update device status/settings for a user/device pair
exports.deviceStatus = async (req, res) => {
  try {
    const { userId, deviceId, deviceLocation, deviceSettings } = req.body || {};
    if (!userId || !deviceId) {
      return res.status(400).json({
        status: false,
        message: "userId and deviceId are required",
      });
    }
    if (!mongoose.isValidObjectId(userId)) {
      return res.status(400).json({ status: false, message: "userId must be valid" });
    }

    const normalizedDeviceId = normalizeDeviceId(deviceId);
    const orFilters = [
      { deviceId: new RegExp(`^${escapeRegExp(normalizedDeviceId)}$`, "i") },
    ];
    if (mongoose.isValidObjectId(deviceId)) {
      orFilters.push({ _id: deviceId });
    }

    const device = await DeviceModel.findOne({ userId, $or: orFilters });
    if (!device) {
      return res.status(404).json({ status: false, message: "Device not found" });
    }

    const updateSet = {};
    if (deviceLocation !== undefined) {
      updateSet.deviceLocation = deviceLocation;
    }

    if (deviceSettings && typeof deviceSettings === "object") {
      if (deviceSettings.deviceStatus !== undefined) {
        updateSet.deviceStatus = deviceSettings.deviceStatus;
      }
      if (deviceSettings.locationAllowed !== undefined) {
        updateSet.locationAllowed = deviceSettings.locationAllowed;
      }

      const policyUpdate = {};
      if (deviceSettings.devicePolicyState && typeof deviceSettings.devicePolicyState === "object") {
        Object.assign(policyUpdate, deviceSettings.devicePolicyState);
      }
      if (deviceSettings.cameraDisabled !== undefined) {
        policyUpdate.cameraDisabled = deviceSettings.cameraDisabled;
      }
      if (deviceSettings.uninstallBlocked !== undefined) {
        policyUpdate.uninstallBlocked = deviceSettings.uninstallBlocked;
      }
      if (Object.keys(policyUpdate).length) {
        updateSet.devicePolicyState = {
          ...(device.devicePolicyState || {}),
          ...policyUpdate,
        };
      }
    }

    const updatedDevice =
      Object.keys(updateSet).length > 0
        ? await DeviceModel.findOneAndUpdate(
            { _id: device._id },
            { $set: updateSet },
            { new: true }
          ).lean()
        : device.toObject?.() || device;

    return res.status(200).json({
      status: true,
      message: "Device status fetched",
      data: {
        userId: updatedDevice.userId,
        deviceId: updatedDevice.deviceId || updatedDevice._id,
        deviceLocation: updatedDevice.deviceLocation || null,
        deviceSettings: {
          deviceStatus: updatedDevice.deviceStatus,
          cameraDisabled: updatedDevice.devicePolicyState?.cameraDisabled ?? false,
          uninstallBlocked: updatedDevice.devicePolicyState?.uninstallBlocked ?? false,
          locationAllowed: updatedDevice.locationAllowed ?? true,
          devicePolicyState: updatedDevice.devicePolicyState || {},
        },
      },
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

// Assign or update policy for a device
exports.setDevicePolicy = async (req, res) => {
  try {
    const { id } = req.params;
    const policyData = req.body || {};

    const device = await DeviceModel.findById(id);
    if (!device) {
      return res.status(404).json({ status: false, message: "Device not found" });
    }

    let policy;
    if (device.policyId) {
      policy = await PolicyModel.findByIdAndUpdate(
        device.policyId,
        { rules: policyData },
        { new: true }
      );
    } else {
      policy = await PolicyModel.create({
        name: `Policy-${device.deviceId || device._id}`,
        rules: policyData,
      });
      device.policyId = policy._id;
    }

    device.devicePolicyState = { ...policyData };
    await device.save();

    return res.status(200).json({
      status: true,
      message: "Policy assigned successfully",
      policy,
    });
  } catch (error) {
    return res.status(500).json({ status: false, message: error.message });
  }
};

// Toggle a single policy flag on a device
exports.toggleDevicePolicy = async (req, res) => {
  try {
    const { id } = req.params;
    const { field } = req.body || {};
    const allowedFields = ["cameraDisabled", "uninstallBlocked"];

    if (!allowedFields.includes(field)) {
      return res.status(400).json({ status: false, message: "Invalid policy field" });
    }

    const device = await DeviceModel.findById(id);
    if (!device) {
      return res.status(404).json({ status: false, message: "Device not found" });
    }

    const current = device.devicePolicyState?.[field] ?? false;
    const nextValue = !current;
    device.devicePolicyState = {
      ...(device.devicePolicyState || {}),
      [field]: nextValue,
    };
    await device.save();

    if (device.policyId) {
      await PolicyModel.findByIdAndUpdate(
        device.policyId,
        { $set: { [`rules.${field}`]: nextValue } },
        { new: true }
      );
    }

    return res.status(200).json({
      status: true,
      message: "Policy updated",
      data: formatDevice(device),
    });
  } catch (error) {
    return res.status(500).json({ status: false, message: error.message });
  }
};

// Fetch policy and applied state for a device
exports.getDevicePolicy = async (req, res) => {
  try {
    const device = await DeviceModel.findById(req.params.id)
      .populate("policyId")
      .lean();

    if (!device) {
      return res.status(404).json({ status: false, message: "Device not found" });
    }

    return res.status(200).json({
      status: true,
      data: {
        policy: device.policyId || null,
        appliedState: device.devicePolicyState || {},
      },
    });
  } catch (error) {
    return res.status(500).json({ status: false, message: error.message });
  }
};
