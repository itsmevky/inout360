const ActivityModel = require("./model");
const DeviceEventModel = require("../device/deviceEventModel");
const paginate = require("../../helpers/limitoffset");

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
    const record = await ActivityModel.create(req.body);
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
