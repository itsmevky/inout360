const ActivityModel = require("./model");
const DeviceEventModel = require("../device/deviceEventModel");
const DeviceModel = require("../device/model");
const paginate = require("../../helpers/limitoffset");
const mongoose = require("mongoose");
const UserModel = require("../user/model");

const resolveCategory = (eventType) => {
  const value = String(eventType || "").toLowerCase();
  if (value.includes("app_install")) return "app_install";
  if (value.includes("app_uninstall")) return "app_uninstall";
  if (value.includes("screenshot")) return "screenshot";
  if (value.includes("video")) return "video";
  if (value.includes("camera")) return "camera";
  return "other";
};

const resolveActivityType = (eventType) => {
  const value = String(eventType || "").toLowerCase();
  if (value.includes("app_install")) return "app_install";
  if (value.includes("app_uninstall")) return "app_uninstall";
  if (value.includes("screenshot")) return "screenshot";
  if (value.includes("video")) return "video";
  if (value.includes("camera")) return "take_picture";
  return eventType;
};

const resolveMediaType = (eventType) => {
  const value = String(eventType || "").toLowerCase();
  if (value.includes("video")) return "video";
  if (value.includes("screenshot")) return "screenshot";
  if (value.includes("camera")) return "photo";
  return "file";
};

const isCameraActivity = (value) =>
  /camera|screenshot|video/i.test(String(value || ""));

const resolvePolicyVoilation = async (payload) => {
  const isCamera =
    isCameraActivity(payload.activityType) || isCameraActivity(payload.category);
  if (!isCamera) return false;
  if (!payload.userId || !mongoose.isValidObjectId(payload.userId)) return false;
  const user = await UserModel.findById(payload.userId)
    .select("sessionStatus")
    .lean();
  return user?.sessionStatus === "Logged In";
};

const buildEventFilter = ({ userId, employeeId, deviceId, category, search }) => {
  const filter = {};
  if (employeeId) filter.employeeId = employeeId;
  if (deviceId) filter.deviceId = deviceId;

  if (category) {
    const value = String(category).toLowerCase();
    if (value === "camera") {
      filter.event = { $regex: "camera|screenshot|video", $options: "i" };
    } else if (value === "app_install") {
      filter.event = { $regex: "app[_-]?install", $options: "i" };
    } else if (value === "app_uninstall") {
      filter.event = { $regex: "app[_-]?uninstall", $options: "i" };
    } else {
      filter.event = { $regex: value, $options: "i" };
    }
  }

  if (userId) {
    filter.$or = [{ name: userId }, { employeeId: userId }];
  }

  if (search) {
    const regex = new RegExp(String(search), "i");
    filter.$or = [
      ...(filter.$or || []),
      { event: regex },
      { name: regex },
      { employeeId: regex },
      { codeId: regex },
    ];
  }

  return filter;
};

exports.add = async (req, res) => {
  try {
    const payload = { ...req.body };
    if (payload.policyVoilation === undefined) {
      payload.policyVoilation = await resolvePolicyVoilation(payload);
    }
    const record = await ActivityModel.create(payload);
    res.status(201).json({ status: true, message: "Activity logged", data: record });
  } catch (error) {
    res.status(400).json({ status: false, message: error.message });
  }
};

// Summary counts for dashboard cards
exports.getSummary = async (_req, res) => {
  try {
    const cameraCount = await DeviceEventModel.countDocuments({
      event: { $regex: "camera|screenshot|video", $options: "i" },
    });
    const installCount = await DeviceEventModel.countDocuments({
      event: { $regex: "app[_-]?install", $options: "i" },
    });
    const uninstallCount = await DeviceEventModel.countDocuments({
      event: { $regex: "app[_-]?uninstall", $options: "i" },
    });

    return res.status(200).json({
      status: true,
      data: {
        camera: cameraCount || 0,
        app_install: installCount || 0,
        app_uninstall: uninstallCount || 0,
      },
    });
  } catch (error) {
    return res.status(500).json({ status: false, message: error.message });
  }
};

exports.getAll = async (req, res) => {
  try {
    const { userId, employeeId, deviceId, category, search } = req.query;
    const filter = buildEventFilter({ userId, employeeId, deviceId, category, search });

    const events = await DeviceEventModel.find(filter).lean();
    const dataWithId = events.map((doc) => {
      const plain = typeof doc.toObject === "function" ? doc.toObject() : doc;
      const categoryResolved = resolveCategory(plain.event);
      const activityTypeResolved = resolveActivityType(plain.event);
      const mediaUrl = plain.imagePath || plain.metadata?.mediaUrl || "";
      const resolvedDeviceId =
        plain.raw?.deviceId || plain.metadata?.deviceId || plain.deviceId || "";
      const media = mediaUrl
        ? [
            {
              url: mediaUrl,
              type: resolveMediaType(plain.event),
              capturedAt: plain.timestamp || plain.createdAt,
            },
          ]
        : [];

      return {
        id: plain._id?.toString?.() || plain.id,
        userName: plain.name || "",
        name: plain.name || "",
        activityType: activityTypeResolved,
        title: activityTypeResolved,
        description: plain.metadata?.description || plain.event,
        category: categoryResolved,
        deviceId: String(resolvedDeviceId),
        employeeId: plain.employeeId || "",
        occurredAt: plain.timestamp || plain.createdAt,
        policyVoilation: !!plain.policyVoilation,
        media,
        metadata: {
          ...(plain.metadata || {}),
          mediaUrl,
          originalEvent: plain.event,
        },
      };
    });
    const grouped = new Map();
    for (const item of dataWithId) {
      const userKey = item.userName || item.employeeId || item.deviceId || item.id;
      const existing = grouped.get(userKey);
      if (!existing) {
        grouped.set(userKey, {
          user: item.userName || "-",
          userKey,
          deviceId: item.deviceId || "",
          employeeId: item.employeeId || "",
          activities: [item],
        });
        continue;
      }
      existing.activities.push(item);
      if (!existing.deviceId && item.deviceId) {
        existing.deviceId = item.deviceId;
      }
      if (!existing.employeeId && item.employeeId) {
        existing.employeeId = item.employeeId;
      }
    }

    res.status(200).json(Array.from(grouped.values()));
  } catch (error) {
    res.status(500).json({ status: false, message: error.message });
  }
};

exports.getNotifications = async (req, res) => {
  try {
    const { page = 0, limit = 20, employeeId, deviceId, search } = req.query;
    const query = { policyVoilation: true };
    if (employeeId) query.employeeId = employeeId;
    if (deviceId) {
      const normalizedDeviceId = String(deviceId);
      const orFilters = [
        { "raw.deviceId": new RegExp(`^${normalizedDeviceId}$`, "i") },
        { "metadata.deviceId": new RegExp(`^${normalizedDeviceId}$`, "i") },
      ];
      if (mongoose.isValidObjectId(deviceId)) {
        orFilters.push({ deviceId });
      }
      query.$or = orFilters;
    }

    let searchQuery = { ...query };
    if (typeof search === "string" && search.trim().length > 0) {
      const regex = new RegExp(search, "i");
      searchQuery = {
        ...searchQuery,
        $or: [
          { name: regex },
          { employeeId: regex },
          { event: regex },
          { codeId: regex },
        ],
      };
    }

    const pageNum = parseInt(page, 10) || 0;
    const limitNum = parseInt(limit, 10) || 20;
    const skip = pageNum * limitNum;

    const [data, totalrecords] = await Promise.all([
      DeviceEventModel.find(searchQuery)
        .sort({ timestamp: -1, createdAt: -1 })
        .skip(skip)
        .limit(limitNum),
      DeviceEventModel.countDocuments(searchQuery),
    ]);

    const deviceIds = Array.from(
      new Set(
        data
          .map((doc) => doc?.deviceId)
          .filter((id) => mongoose.isValidObjectId(id))
          .map((id) => String(id))
      )
    );
    const deviceMap = new Map();
    if (deviceIds.length > 0) {
      const devices = await DeviceModel.find({ _id: { $in: deviceIds } })
        .select("deviceId")
        .lean();
      devices.forEach((device) => {
        deviceMap.set(String(device._id), device.deviceId || "");
      });
    }

    const mapped = (data || []).map((doc) => {
      const plain = typeof doc.toObject === "function" ? doc.toObject() : doc;
      const rawDeviceId = plain.raw?.deviceId || plain.metadata?.deviceId || "";
      let resolvedDeviceId = "";
      if (rawDeviceId) {
        if (mongoose.isValidObjectId(rawDeviceId)) {
          resolvedDeviceId = deviceMap.get(String(rawDeviceId)) || "";
        } else {
          resolvedDeviceId = String(rawDeviceId);
        }
      } else if (
        typeof plain.deviceId === "string" &&
        !mongoose.isValidObjectId(plain.deviceId)
      ) {
        resolvedDeviceId = plain.deviceId;
      } else {
        resolvedDeviceId = deviceMap.get(String(plain.deviceId)) || "";
      }
      const description =
        plain.metadata?.description || plain.event || "Activity detected";

      return {
        id: plain._id?.toString?.() || plain.id,
        name: plain.name || "",
        employeeId: plain.employeeId || "",
        deviceId: resolvedDeviceId,
        activityType: plain.event || "",
        description,
        occurredAt: plain.timestamp || plain.createdAt,
        policyVoilation: true,
      };
    });

    return res.status(200).json({
      status: true,
      message: "Notifications fetched",
      data: mapped,
      pagination: {
        totalrecords,
        currentPage: pageNum,
        totalPages: Math.ceil(totalrecords / limitNum),
        limit: limitNum,
      },
    });
  } catch (error) {
    return res.status(500).json({ status: false, message: error.message });
  }
};

exports.getNotificationCount = async (req, res) => {
  try {
    const seenAt = req.user?.notificationsSeenAt || new Date(0);
    const count = await DeviceEventModel.countDocuments({
      policyVoilation: true,
      timestamp: { $gt: seenAt },
    });

    return res.status(200).json({ status: true, count });
  } catch (error) {
    return res.status(500).json({ status: false, message: error.message });
  }
};

exports.markNotificationsRead = async (req, res) => {
  try {
    const now = new Date();
    await UserModel.findByIdAndUpdate(req.user?._id, {
      notificationsSeenAt: now,
    });

    return res.status(200).json({
      status: true,
      message: "Notifications marked as read",
      seenAt: now,
    });
  } catch (error) {
    return res.status(500).json({ status: false, message: error.message });
  }
};

exports.getById = async (req, res) => {
  try {
    const { id } = req.params;
    if (!id || id === "undefined") {
      return res.status(400).json({ status: false, message: "Activity id is required" });
    }
    const record = await DeviceEventModel.findById(id);
    if (!record) return res.status(404).json({ status: false, message: "Not found" });
    res.status(200).json({ status: true, data: record });
  } catch (error) {
    res.status(500).json({ status: false, message: error.message });
  }
};

exports.deleteMany = async (req, res) => {
  try {
    let ids = req.body.recordId || req.body.ids || req.params.id;
    if (!ids) return res.status(400).json({ status: false, message: "recordId required" });
    if (ids === "undefined") {
      return res.status(400).json({ status: false, message: "recordId required" });
    }
    if (typeof ids === "string") ids = [ids];
    const result = await DeviceEventModel.deleteMany({ _id: { $in: ids } });
    res
      .status(200)
      .json({ status: true, message: `${result.deletedCount} record(s) deleted` });
  } catch (error) {
    res.status(500).json({ status: false, message: error.message });
  }
};
