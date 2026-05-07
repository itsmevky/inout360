const mongoose = require("mongoose");
const path = require("path");
const axios = require("axios");
const { GoogleAuth } = require("google-auth-library");
const DeviceEvent = require("./deviceEventModel");
const DeviceModel = require("./model");
const UserModel = require("../user/model");
const UserSession = require("../user/userSessionsModel");
const EmployeeModel = require("../employees/model");
const VisitorModel = require("../user/visitorModel");
const PROJECT_ID = process.env.FIREBASE_PROJECT_ID || "pil-app-7fb48";
const DEFAULT_SERVICE_ACCOUNT_PATH = path.join(
  __dirname,
  "..",
  "..",
  "config",
  "serviceAccountKey.json"
);

const resolveServiceAccountPath = () => {
  const envPath = process.env.FIREBASE_SERVICE_ACCOUNT_PATH;
  if (!envPath) return DEFAULT_SERVICE_ACCOUNT_PATH;
  return path.isAbsolute(envPath) ? envPath : path.join(process.cwd(), envPath);
};
const normalizeDeviceId = (value) => String(value || "").trim();
const resolveActivityCategory = (eventType) => {
  const value = String(eventType || "").toLowerCase();
  if (value.includes("accessibility")) return "app_install";
  if (value.includes("camera")) return "camera";
  if (value.includes("screenshot")) return "screenshot";
  if (value.includes("video")) return "video";
  return "other";
};

const isCameraEvent = (eventType) =>
  /camera|screenshot|video|picture/i.test(String(eventType || ""));

const isAppAccessEvent = (...values) => {
  const text = values
    .filter(Boolean)
    .map((value) => String(value).toLowerCase())
    .join(" ");
  if (!text) return false;
  return (
    text.includes("app access") ||
    text.includes("restricted app opened") ||
    text.includes("youtube") ||
    text.includes("whatsapp") ||
    text.includes("instagram") ||
    text.includes("facebook")
  );
};

const isAppInstallEvent = (...values) => {
  const text = values
    .filter(Boolean)
    .map((value) => String(value).toLowerCase())
    .join(" ");
  if (!text) return false;
  return (
    text.includes("app_install") ||
    text.includes("app install") ||
    text.includes("restricted settings") ||
    text.includes("user has opened restricted settings of app") ||
    text.includes("user has opened restricted settings of application")
  );
};

const isRestrictedSettingsEvent = (...values) => {
  const text = values
    .filter(Boolean)
    .map((value) => String(value).toLowerCase())
    .join(" ");
  if (!text) return false;
  return (
    text.includes("restricted settings") ||
    text.includes("user has opened restricted settings of app") ||
    text.includes("user has opened restricted settings of application")
  );
};

const resolveUserSessionStatus = async ({ userId, employeeId }) => {
  const sessionFilters = [];
  if (userId && mongoose.isValidObjectId(userId)) {
    sessionFilters.push({ userId });
  }
  if (employeeId) {
    sessionFilters.push({ employeeId });
  }
  if (sessionFilters.length) {
    const session = await UserSession.findOne({
      $or: sessionFilters,
    })
      .sort({ createdAt: -1, _id: -1 })
      .select("action")
      .lean();
    if (session) return session.action;
  }
  if (userId && mongoose.isValidObjectId(userId)) {
    const user = await UserModel.findById(userId)
      .select("sessionStatus")
      .lean();
    if (user) return user.sessionStatus;
  }
  if (employeeId) {
    const user = await UserModel.findOne({ employeeId })
      .select("sessionStatus")
      .lean();
    if (user) return user.sessionStatus;
  }
  if (userId && mongoose.isValidObjectId(userId)) {
    const visitor = await VisitorModel.findById(userId)
      .select("sessionStatus")
      .lean();
    if (visitor) return visitor.sessionStatus;
  }
  if (employeeId) {
    const visitor = await VisitorModel.findOne({ employeeId })
      .select("sessionStatus")
      .lean();
    if (visitor) return visitor.sessionStatus;
  }
  return null;
};

const shouldIgnoreEventWhenLoggedOut = ({ event, metadata, narrative }) => {
  if (
    isRestrictedSettingsEvent(
      event,
      narrative,
      metadata?.event,
      metadata?.narrative
    )
  ) {
    return false;
  }

  const blockedByType = isCameraEvent(event);
  const blockedByAccess = isAppAccessEvent(
    event,
    narrative,
    metadata?.appName,
    metadata?.packageName,
    metadata?.app,
    metadata?.event,
    metadata?.narrative
  );
  return blockedByType || blockedByAccess;
};

const parseDurationSeconds = (...candidates) => {
  const joined = candidates
    .filter(Boolean)
    .map((value) => String(value))
    .join(" ");
  if (!joined) return null;
  const text = joined.toLowerCase();
  const match = text.match(/used\s*for\s*(\d+(?:\.\d+)?)\s*(?:sec|secs|second|seconds)\b/);
  if (!match) return null;
  const seconds = Number(match[1]);
  return Number.isFinite(seconds) ? seconds : null;
};

const isPermissionDisabledEvent = (textValue) => {
  const value = String(textValue || "").toLowerCase();
  const isDisabled =
    /\bdisabled\b/i.test(value) ||
    /turned\s*off/i.test(value) ||
    /turn\s*off/i.test(value) ||
    /\boff\b/i.test(value);
  if (!isDisabled) return false;
  return (
    value.includes("overlay") ||
    value.includes("location permission") ||
    value.includes("notification permission") ||
    value.includes("device admin") ||
    value.includes("accessibility") ||
    value.includes("usage access")
  );
};

const isVideoCallContext = (textValue) => {
  const value = String(textValue || "").toLowerCase();
  return (
    value.includes("video call") ||
    value.includes("videocall") ||
    value.includes("whatsapp") ||
    value.includes("instagram") ||
    value.includes("facebook")
  );
};

const resolvePolicyVoilation = async ({
  eventType,
  userId,
  employeeId,
  metadata,
  narrative,
  raw,
}) => {
  const parts = [
    eventType,
    narrative,
    metadata?.appName,
    metadata?.packageName,
    metadata?.app,
    metadata?.event,
    metadata?.narrative,
    raw?.appName,
    raw?.packageName,
    raw?.app,
    raw?.event,
    raw?.narrative,
  ];
  const value = parts
    .filter(Boolean)
    .map((item) => String(item).trim().toLowerCase())
    .join(" ");

  // Rule 1: Policy violation ONLY for permission-disable type events or picture taken.
  if (isPermissionDisabledEvent(value)) return true;
  if (value.includes("picture taken")) return true;

  // Rule 2: Policy violation ONLY when user is Logged In AND camera usage > 3 sec AND (video call context).
  if (!isCameraEvent(eventType)) return false;
  const seconds = parseDurationSeconds(narrative, metadata?.narrative, raw?.narrative, eventType);
  if (!seconds || seconds <= 3) return false;
  if (!isVideoCallContext(value)) return false;
  const status = await resolveUserSessionStatus({ userId, employeeId });
  return status === "Logged In";
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

const sendFCMNotification = async (
  fcmToken,
  title,
  body,
  data
) => {
  if (!fcmToken) return;

  const url = `https://fcm.googleapis.com/v1/projects/${PROJECT_ID}/messages:send`;
  const message = {
    message: {
      token: fcmToken,
      notification: { title, body },
      android: {
        notification: {
          icon: "ic_notification",
          color: "#A52A2A",
        },
      },
      data,
    },
  };

  const accessToken = await getAccessToken();
  try {
    const response = await axios.post(url, message, {
      headers: {
        "Content-Type": "application/json",
        Authorization: `Bearer ${accessToken}`,
      },
    });
    return response?.data;
  } catch (error) {
    const errorData = error.response?.data;
    console.error(`❌ FCM notification failed for project ${PROJECT_ID}:`, error.message);
    if (errorData) {
      console.error("📦 FCM Error Response:", JSON.stringify(errorData, null, 2));
    }
    if (PROJECT_ID === "pil-app-7fb48" && !process.env.FIREBASE_PROJECT_ID) {
      console.warn("⚠️ WARNING: Using default Firebase project ID (pil-app-7fb48). Ensure FIREBASE_PROJECT_ID is set in .env");
    }
  }
};

const isNotifiableEvent = (event, policyVoilation, narrative = "") => {
  const eventLower = String(event || "").toLowerCase();

  // 1. Camera / Picture Taken handling
  // User: "camera m agar timing bali ho or usme bi 2 second se jyada open ho baki camera ki ni bejhege or Picture Taken ki jayegi"
  if (isCameraEvent(event)) {
    if (eventLower.includes("picture taken")) return true;

    const seconds = parseDurationSeconds(narrative);
    // Only notify if duration > 2 seconds
    if (seconds !== null && seconds > 2) return true;

    // Otherwise, do not notify for camera events (even if policyVoilation is true, 
    // though policyVoilation currently requires > 3s)
    return false;
  }

  // 2. App Opened / Blocked handling
  // User: "baki apps ki ni bejhenge ki y app open ya block hui"
  if (
    eventLower.includes("app opened") ||
    eventLower.includes("app access") ||
    eventLower.includes("blocked")
  ) {
    // Exception: "Restricted Settings of App" should still be notified
    if (!eventLower.includes("restricted setting")) {
      return false;
    }
  }

  // 3. Specific allowed patterns: settings, uninstall, restricted, etc.
  // User: "baki jayegi settings ki uninstall attempt ya restricted setting of app bali"
  const allowedPatterns = [
    /uninstall/i,
    /settings/i,
    /restricted/i,
    /admin/i,
    /permission/i,
    /accessibility/i,
  ];

  if (allowedPatterns.some((pattern) => pattern.test(event))) {
    return true;
  }

  // Default fallback to policyVoilation
  return !!policyVoilation;
};

const notifyTaggedEmployees = async (
  eventType,
  cameraStatus,
  actorName,
  employeeId,
  imagePath,
  policyVoilation,
  narrative = "",
  location = ""
) => {
  try {
    if (!isNotifiableEvent(eventType, policyVoilation, narrative)) {
      return;
    }

    const query = {
      employeetag: { $in: ["HR", "Security", "Manager", "Admin"] },
    };

    if (location) {
      query.location = { $regex: new RegExp(`^${location}$`, "i") };
    }

    const taggedEmployees = await EmployeeModel.find(query)
      .select("employeeId name employeetag location")
      .lean();

    if (!taggedEmployees.length) return;

    const taggedEmpIds = taggedEmployees.map(emp => emp.employeeId).filter(Boolean);
    const devices = await DeviceModel.find({
      employeeId: { $in: taggedEmpIds },
      fcmToken: { $exists: true, $ne: "" },
    }).select("fcmToken employeeId").lean();

    if (!devices.length) return;

    const title = narrative || (policyVoilation ? "Security Policy Violation" : "Device Event Detected");
    const body = `Name: ${actorName || "-"}\nEmployeeId: ${employeeId || "-"}`;
    const data = {
      event: eventType,
      cameraStatus: cameraStatus || "unknown",
      name: actorName || "",
      employee_id: employeeId || "",
      imagePath: imagePath || "",
      policyVoilation: String(!!policyVoilation),
      narrative: narrative || "",
    };

    const sendPromises = devices.map(device =>
      sendFCMNotification(device.fcmToken, title, body, data)
    );

    await Promise.all(sendPromises);
    console.log(`✅ Event notification sent to ${devices.length} tagged devices`);
  } catch (error) {
    console.error("❌ Failed to notify tagged employees:", error.message);
  }
};

exports.notifyTaggedEmployees = notifyTaggedEmployees;

const resolveDeviceById = async (deviceId) => {
  if (!deviceId) return null;
  const normalizedDeviceId = normalizeDeviceId(deviceId);
  const deviceQuery = {
    $or: [{ deviceId: new RegExp(`^${normalizedDeviceId}$`, "i") }],
  };
  if (mongoose.isValidObjectId(deviceId)) {
    deviceQuery.$or.push({ _id: deviceId });
  }
  return DeviceModel.findOne(deviceQuery);
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
      narrative,
    } = req.body;

    if (!deviceId) {
      return res.status(400).json({ status: false, message: "deviceId is required" });
    }
    if (!event) {
      return res.status(400).json({ status: false, message: "event is required" });
    }

    const device = await resolveDeviceById(deviceId);
    if (!device) {
      return res.status(404).json({ status: false, message: "Device not found" });
    }

    // Deduplication logic for app_install events
    if (String(event).toLowerCase().includes("app_install")) {
      const existingAppInstall = await DeviceEvent.findOne({
        deviceId: device._id,
        event: { $regex: /app_install/i },
      }).lean();

      if (existingAppInstall) {
        return res.status(200).json({
          status: true,
          skipped: true,
          message: "app_install event already recorded for this device",
        });
      }
    }

    if (
      device.devicePolicyState?.uninstallBlocked !== true &&
      !isAppInstallEvent(event, narrative, metadata?.event, metadata?.narrative)
    ) {
      return res.status(200).json({
        status: true,
        skipped: true,
        message: "Event ignored because uninstallBlocked is false",
      });
    }

    const resolvedEmployeeId = employeeId || employee_id || device.employeeId || "";
    const sessionStatus = await resolveUserSessionStatus({
      userId: device.userId,
      employeeId: resolvedEmployeeId,
    });
    if (
      sessionStatus !== "Logged In" &&
      shouldIgnoreEventWhenLoggedOut({ event, metadata, narrative })
    ) {
      return res.status(200).json({
        status: true,
        skipped: true,
        message: "Event ignored because user is logged out",
      });
    }

    let policyVoilation = await resolvePolicyVoilation({
      eventType: event,
      userId: device.userId,
      employeeId: resolvedEmployeeId,
      metadata,
      narrative,
      raw: req.body,
    });
    console.log("device-event policy check", {
      event,
      narrative,
      finalPolicyVoilation: policyVoilation,
    });

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
      employeeId: resolvedEmployeeId,
      codeId,
      policyVoilation,
      narrative,
      timestamp: normalizedTimestamp,
      metadata: {
        ...(metadata || {}),
        ...(narrative ? { narrative } : {}),
      },
      raw: req.body,
    });

    const actorName = await resolveActorName({
      userId: device.userId,
      employeeId: employeeId || employee_id || device.employeeId,
      fallbackName: name || device.ownerName,
    });

    const resolvedImagePath =
      imagePath || metadata?.imagePath || req.body?.imagePath || "";

    try {
      // Notify only tagged employees as per requirement
      await notifyTaggedEmployees(
        event,
        cameraStatus,
        actorName,
        employeeId || employee_id || device.employeeId,
        imagePath,
        policyVoilation,
        narrative,
        device.location || ""
      );

      // Special Case: Immediate notification on the same device for CLEAR_ALL_DETECTED
      if (String(event).toUpperCase() === "CLEAR_ALL_DETECTED") {
        if (device.fcmToken) {
          await sendFCMNotification(
            device.fcmToken,
            "PIL Activation action",
            narrative || "App was removed from recent tasks",
            {
              event: "CLEAR_ALL_DETECTED",
              deviceId: String(device.deviceId || device._id),
              employeeId: String(resolvedEmployeeId || ""),
              timestamp: new Date().toISOString(),
              narrative: narrative || "",
            }
          );
          console.log(`✅ Immediate self-notification sent for CLEAR_ALL_DETECTED on device: ${device.deviceId}`);
        }
      }
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

// Latest screenshot event for a device
exports.getLatestScreenshot = async (req, res) => {
  try {
    const { deviceId } = req.query || {};
    if (!deviceId) {
      return res.status(400).json({ status: false, message: "deviceId is required" });
    }

    const device = await resolveDeviceById(deviceId);
    if (!device) {
      return res.status(404).json({ status: false, message: "Device not found" });
    }

    const event = await DeviceEvent.findOne({
      deviceId: device._id,
      imagePath: { $exists: true, $ne: "" },
      event: { $regex: "screenshot|camera", $options: "i" },
    })
      .sort({ timestamp: -1 })
      .lean();

    if (!event) {
      return res.status(200).json({ status: true, data: null });
    }

    return res.status(200).json({
      status: true,
      data: {
        timestamp: event.timestamp,
        imagePath: event.imagePath,
        deviceId: event.raw?.deviceId || device.deviceId || device._id,
      },
    });
  } catch (error) {
    return res.status(500).json({ status: false, message: error.message });
  }
};

// Get all camera events for superadmin
exports.getCameraEvents = async (req, res) => {
  try {
    const { search, page = 1, limit = 10 } = req.query;
    const skip = (parseInt(page) - 1) * parseInt(limit);

    let query = {
      $or: [
        { event: { $regex: /camera|screenshot|video|picture/i } },
        { narrative: { $regex: /camera|screenshot|video|picture/i } }
      ]
    };

    if (search) {
      query.$and = [{
        $or: [
          { name: { $regex: search, $options: "i" } },
          { employeeId: { $regex: search, $options: "i" } },
          { narrative: { $regex: search, $options: "i" } }
        ]
      }];
    }


    const events = await DeviceEvent.find(query)
      .sort({ timestamp: -1 })
      .skip(skip)
      .limit(parseInt(limit))
      .lean();

    const total = await DeviceEvent.countDocuments(query);

    const formattedEvents = events.map(event => {
      let packageName = event.metadata?.packageName || event.raw?.packageName;
      if (!packageName && event.narrative) {
        const match = event.narrative.match(/\(([^)]+)\)/);
        if (match) packageName = match[1];
      }
      return { ...event, packageName };
    });

    return res.status(200).json({
      status: true,
      data: formattedEvents,
      total,
      page: parseInt(page),
      limit: parseInt(limit)
    });

  } catch (error) {
    return res.status(500).json({ status: false, message: error.message });
  }
};

