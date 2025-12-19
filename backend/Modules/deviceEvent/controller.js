const mongoose = require("mongoose");
const path = require("path");
const axios = require("axios");
const { GoogleAuth } = require("google-auth-library");
const DeviceEvent = require("./model");
const DeviceModel = require("../device/model");

const PROJECT_ID = process.env.FIREBASE_PROJECT_ID || "pidilite-cd009";
const SERVICE_ACCOUNT_PATH =
  process.env.FIREBASE_SERVICE_ACCOUNT_PATH ||
  path.join(__dirname, "..", "..", "service-account.json");

const normalizeDeviceId = (value) => String(value || "").trim();

const getAccessToken = async () => {
  const auth = new GoogleAuth({
    keyFile: SERVICE_ACCOUNT_PATH,
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

    const savedEvent = await DeviceEvent.create({
      deviceId: device._id,
      event,
      cameraStatus,
      imagePath,
      name,
      employeeId: employeeId || employee_id,
      codeId,
      timestamp: timestamp ? new Date(timestamp) : new Date(),
      metadata: metadata || {},
      raw: req.body,
    });

    await sendAdminNotification(
      device,
      event,
      cameraStatus,
      name,
      employeeId || employee_id,
      imagePath
    );

    return res.status(200).json({
      status: true,
      message: "Event saved successfully",
      data: savedEvent,
    });
  } catch (error) {
    return res.status(500).json({ status: false, message: error.message });
  }
};
