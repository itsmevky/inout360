const mongoose = require("mongoose");
const path = require("path");
const axios = require("axios");
const { GoogleAuth } = require("google-auth-library");
const DeviceEvent = require("./model");
const DeviceModel = require("../device/model");
const ActivityModel = require("../activity/model");
const UserModel = require("../user/model");
const EmployeeModel = require("../employees/model");
const VisitorModel = require("../visitor/model");

const PROJECT_ID = process.env.FIREBASE_PROJECT_ID || "pidilite-cd009";
const DEFAULT_SERVICE_ACCOUNT_PATH = path.join(
  process.cwd(),
  "config",
  "serviceAccountKey.json"
);
const resolveServiceAccountPath = () => {
  const envPath = process.env.FIREBASE_SERVICE_ACCOUNT_PATH;
  if (!envPath) {
    return DEFAULT_SERVICE_ACCOUNT_PATH;
  }
  return path.isAbsolute(envPath) ? envPath : path.join(process.cwd(), envPath);
};

const normalizeDeviceId = (value) => String(value || "").trim();
const resolveActivityCategory = (eventType) => {
  const value = String(eventType || "").toLowerCase();
  if (value.includes("camera")) return "camera";
  if (value.includes("screenshot")) return "screenshot";
  if (value.includes("video")) return "video";
  return "other";
};

const resolveActorName = async ({ userId, employeeId, fallbackName }) => {
  if (employeeId) {
    const employee = await EmployeeModel.findOne({ employeeId }).lean();
    if (employee?.name) return employee.name;
    const visitor = await VisitorModel.findOne({ employeeId }).lean();
    if (visitor?.name) return visitor.name;
  }

  if (userId && mongoose.isValidObjectId(userId)) {
    const user = await UserModel.findById(userId).lean();
    if (user?.name) return user.name;
  }

  return fallbackName || "";
};

const getAccessToken = async () => {
  const auth = new GoogleAuth({
    keyFile: resolveServiceAccountPath(),
    scopes: ["https://www.googleapis.com/auth/firebase.messaging"],
  });

  const client = await auth.getClient();
  const tokenObj = await client.getAccessToken();
  if (!tokenObj || !tokenObj.token) {
    throw new Error("No access token returned from GoogleAuth");
  }
  return tokenObj.token;
};

const sendAdminNotification = async (
  device,
  eventType,
  cameraStatus,
  name,
  employeeId,
  imagePath
) => {
  if (!device?.fcmToken) {
    return;
  }

  const url = `https://fcm.googleapis.com/v1/projects/${PROJECT_ID}/messages:send`;
  const message = {
    message: {
      token: device.fcmToken,
      notification: {
        title: "Camera Event Detected",
        body: `Event ${eventType} on ${name || device.ownerName || device.deviceId}`,
      },
      data: {
        event: eventType,
        cameraStatus: cameraStatus || "unknown",
        deviceId: String(device._id || ""),
        name: name || "",
        employee_id: employeeId || "",
        imagePath: imagePath || "",
      },
    },
  };

  const accessToken = await getAccessToken();
  await axios.post(url, message, {
    headers: {
      "Content-Type": "application/json",
      Authorization: `Bearer ${accessToken}`,
    },
  });
};

// Save device event (camera opened, etc.)
exports.storeEvent = async (req, res) => {
  try {
    const {
      deviceId,
      event,
      timestamp,
      cameraStatus,
      name,
      employeeId,
      employee_id,
      imagePath,
      codeId,
      metadata,
    } = req.body;

    if (!deviceId) {
      return res.status(400).json({ status: false, message: "deviceId is required" });
    }
    if (!event) {
      return res.status(400).json({ status: false, message: "event is required" });
    }

    const normalizedDeviceId = normalizeDeviceId(deviceId);
    const deviceQuery = { $or: [{ deviceId: new RegExp(`^${normalizedDeviceId}$`, "i") }] };
    if (mongoose.isValidObjectId(deviceId)) {
      deviceQuery.$or.push({ _id: deviceId });
    }
    const device = await DeviceModel.findOne(deviceQuery);
    if (!device) {
      return res.status(404).json({ status: false, message: "Device not found" });
    }

    const normalizedTimestamp = timestamp
      ? new Date(String(timestamp).replace(/(\.\d{3})\d+/, "$1"))
      : new Date();

    if (timestamp && isNaN(normalizedTimestamp.getTime())) {
      return res.status(400).json({ status: false, message: "timestamp is invalid" });
    }

    const savedEvent = await DeviceEvent.create({
      deviceId: device._id,
      event,
      cameraStatus,
      imagePath,
      name,
      employeeId: employeeId || employee_id,
      codeId,
      timestamp: normalizedTimestamp,
      metadata: metadata || {},
      raw: req.body,
    });

    const actorName = await resolveActorName({
      userId: device.userId,
      employeeId: employeeId || employee_id || device.employeeId,
      fallbackName: name || device.ownerName,
    });

    await ActivityModel.create({
      userId: device.userId,
      employeeId: employeeId || employee_id || device.employeeId || "",
      deviceId: String(device.deviceId || device._id || ""),
      category: resolveActivityCategory(event),
      activityType: event,
      title: "Device event",
      description: `Event ${event} reported by ${actorName || device.deviceId}`,
      name: actorName,
      occurredAt: normalizedTimestamp,
      metadata: {
        cameraStatus,
        imagePath,
        codeId,
        ...metadata,
      },
      raw: req.body,
    });

    try {
      await sendAdminNotification(
        device,
        event,
        cameraStatus,
        name,
        employeeId || employee_id,
        imagePath
      );
    } catch (notifyError) {
      console.warn("⚠️ Device event notification failed:", notifyError.message);
    }

    return res.status(200).json({
      status: true,
      message: "Event saved successfully",
      data: savedEvent,
    });
  } catch (error) {
    return res.status(500).json({ status: false, message: error.message });
  }
};
