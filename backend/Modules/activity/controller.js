const DeviceEventModel = require("../device/deviceEventModel");
const DeviceModel = require("../device/model");
const paginate = require("../../helpers/limitoffset");
const mongoose = require("mongoose");
const UserModel = require("../user/model");
const VisitorModel = require("../user/visitorModel");
const EmployeeModel = require("../employees/model");
const UserSession = require("../user/userSessionsModel");
const { resolveLocationScope } = require("../../helpers/locationScope");

const resolveCategory = (eventType) => {
  const value = String(eventType || "").toLowerCase();
  if (value.includes("app_install")) return "app_install";
  if (value.includes("app_uninstall")) return "app_uninstall";
  if (value.includes("accessibility")) return "app_install";
  if (value.includes("restricted app opened")) return "app_access";
  if (value.includes("unauthorized uninstall")) return "app_uninstall";
  if (value.includes("youtube")) return "app_access";
  if (value.includes("whatsapp")) return "app_access";
  if (value.includes("instagram")) return "app_access";
  if (value.includes("facebook")) return "app_access";
  if (value.includes("screenshot")) return "screenshot";
  if (value.includes("video")) return "video";
  if (value.includes("camera") || value.includes("picture")) return "camera";
  return "other";
};

const resolveActivityType = (eventType) => {
  const value = String(eventType || "").toLowerCase();
  if (value.includes("app_install")) return "app_install";
  if (value.includes("app_uninstall")) return "app_uninstall";
  if (value.includes("accessibility")) return "accessibility_permission";
  if (value.includes("restricted app opened")) return "app_access";
  if (value.includes("unauthorized uninstall")) return "app_uninstall_attempt";
  if (value.includes("screenshot")) return "screenshot";
  if (value.includes("video")) return "video";
  if (value.includes("camera") || value.includes("picture")) return "take_picture";
  return eventType;
};

const resolveAppNameFromText = (text) => {
  const value = String(text || "").toLowerCase();
  if (!value) return "";
  const known = [
    { key: "instagram", label: "Instagram" },
    { key: "whatsapp", label: "WhatsApp" },
    { key: "facebook", label: "Facebook" },
    { key: "youtube", label: "YouTube" },
  ];
  for (const item of known) {
    if (value.includes(item.key)) return item.label;
  }
  const pkgMatch = value.match(/\b([a-z0-9_]+)\.([a-z0-9_]+)(?:\.[a-z0-9_]+)*\b/);
  if (pkgMatch) {
    const candidate = pkgMatch[2] || pkgMatch[1];
    return candidate
      ? candidate.charAt(0).toUpperCase() + candidate.slice(1)
      : "";
  }
  return "";
};

const resolveMediaType = (eventType) => {
  const value = String(eventType || "").toLowerCase();
  if (value.includes("video")) return "video";
  if (value.includes("screenshot")) return "screenshot";
  if (value.includes("camera") || value.includes("picture")) return "photo";
  return "file";
};

const isCameraActivity = (value) =>
  /camera|screenshot|video|picture/i.test(String(value || ""));

const isAppAccessActivity = (...values) => {
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

const isAppInstallActivity = (...values) => {
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

const isRestrictedSettingsActivity = (...values) => {
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

const resolvePolicyVoilation = async (payload) => {
  const parts = [
    payload.activityType,
    payload.category,
    payload.title,
    payload.event,
    payload.narrative,
    payload.metadata?.narrative,
    payload.raw?.narrative,
    payload.metadata?.appName,
    payload.metadata?.packageName,
    payload.metadata?.app,
  ];
  const value = parts
    .filter(Boolean)
    .map((item) => String(item).trim().toLowerCase())
    .join(" ");

  if (isPermissionDisabledEvent(value)) return true;
  if (value.includes("picture taken")) return true;

  const isCamera =
    isCameraActivity(payload.activityType) || isCameraActivity(payload.category);
  if (!isCamera) return false;
  const seconds = parseDurationSeconds(
    payload.narrative,
    payload.metadata?.narrative,
    payload.raw?.narrative,
    payload.activityType,
    payload.category
  );
  if (!seconds || seconds <= 3) return false;
  if (!isVideoCallContext(value)) return false;

  if (payload.userId && mongoose.isValidObjectId(payload.userId)) {
    const user = await UserModel.findById(payload.userId)
      .select("sessionStatus")
      .lean();
    if (user?.sessionStatus) return user.sessionStatus === "Logged In";
    const visitor = await VisitorModel.findById(payload.userId)
      .select("sessionStatus")
      .lean();
    if (visitor?.sessionStatus) return visitor.sessionStatus === "Logged In";
  }
  if (payload.employeeId) {
    const visitor = await VisitorModel.findOne({ employeeId: payload.employeeId })
      .select("sessionStatus")
      .lean();
    if (visitor?.sessionStatus) return visitor.sessionStatus === "Logged In";
  }
  const sessionQuery = {};
  if (payload.userId && mongoose.isValidObjectId(payload.userId)) {
    sessionQuery.userId = payload.userId;
  } else if (payload.employeeId) {
    sessionQuery.employeeId = payload.employeeId;
  } else {
    return false;
  }
  const session = await UserSession.findOne(sessionQuery)
    .sort({ createdAt: -1 })
    .select("action")
    .lean();
  return session?.action === "Logged In";
};

const resolveCurrentSessionLoggedIn = async (payload) => {
  if (payload.userId && mongoose.isValidObjectId(payload.userId)) {
    const user = await UserModel.findById(payload.userId)
      .select("sessionStatus")
      .lean();
    if (user?.sessionStatus) return user.sessionStatus === "Logged In";

    const visitor = await VisitorModel.findById(payload.userId)
      .select("sessionStatus")
      .lean();
    if (visitor?.sessionStatus) return visitor.sessionStatus === "Logged In";
  }

  if (payload.employeeId) {
    const user = await UserModel.findOne({ employeeId: payload.employeeId })
      .select("sessionStatus")
      .lean();
    if (user?.sessionStatus) return user.sessionStatus === "Logged In";

    const visitor = await VisitorModel.findOne({ employeeId: payload.employeeId })
      .select("sessionStatus")
      .lean();
    if (visitor?.sessionStatus) return visitor.sessionStatus === "Logged In";
  }

  const sessionQuery = {};
  if (payload.userId && mongoose.isValidObjectId(payload.userId)) {
    sessionQuery.userId = payload.userId;
  } else if (payload.employeeId) {
    sessionQuery.employeeId = payload.employeeId;
  } else {
    return false;
  }

  const session = await UserSession.findOne(sessionQuery)
    .sort({ createdAt: -1 })
    .select("action")
    .lean();
  return session?.action === "Logged In";
};

const shouldIgnoreLoggedOutActivity = (payload) => {
  if (
    isRestrictedSettingsActivity(
      payload.activityType,
      payload.category,
      payload.event,
      payload.title,
      payload.description,
      payload.narrative,
      payload.metadata?.event,
      payload.metadata?.narrative
    )
  ) {
    return false;
  }

  return (
    isCameraActivity(payload.activityType) ||
    isCameraActivity(payload.category) ||
    isCameraActivity(payload.event) ||
    isCameraActivity(payload.title) ||
    isAppAccessActivity(
      payload.activityType,
      payload.category,
      payload.event,
      payload.title,
      payload.description,
      payload.narrative,
      payload.metadata?.appName,
      payload.metadata?.packageName,
      payload.metadata?.app,
      payload.metadata?.event,
      payload.metadata?.narrative
    )
  );
};

const buildActivityFilter = ({
  userId,
  employeeId,
  deviceId,
  category,
  search,
  violationsOnly,
  fromDate,
  toDate,
}) => {
  const filter = {};
  if (violationsOnly) {
    filter.$or = [
      { policyVoilation: true },
      { event: { $regex: "^Picture taken$", $options: "i" } }
    ];
  }
  if (employeeId) filter.employeeId = employeeId;
  if (deviceId) filter.deviceId = deviceId;

  if (category) {
    const normalized = String(category).toLowerCase();
    if (normalized === "camera_activity") {
      filter.$or = [
        { category: { $in: ["camera", "screenshot", "video"] } },
        { event: { $regex: "camera|screenshot|video|picture", $options: "i" } },
      ];
    } else if (normalized === "app_access") {
      filter.$or = [
        { category: "app_access" },
        {
          event: {
            $regex: "youtube|whatsapp|instagram|facebook|restricted app opened",
            $options: "i",
          },
        },
      ];
    } else if (normalized === "app_install_uninstall") {
      filter.$or = [
        { category: { $in: ["app_install", "app_uninstall"] } },
        {
          event: {
            $regex:
              "app[_-]?install|app[_-]?uninstall|accessibility|unauthorized uninstall|inactive|restricted app settings|working hours violation|overlay|notification permission",
            $options: "i",
          },
        },
      ];
    } else if (normalized === "clear_all") {
      filter.$or = [
        { event: "CLEAR_ALL_DETECTED" },
        { event: { $regex: "clear[_-]?all", $options: "i" } },
        { category: "clear_all" },
        { category: "CLEAR_ALL" }
      ];
    } else {
      filter.category = normalized;
    }
  }

  if (userId) {
    if (mongoose.isValidObjectId(userId)) {
      filter["raw.userId"] = userId;
    } else {
      filter.$or = [{ name: userId }, { employeeId: userId }];
    }
  }

  if (fromDate || toDate) {
    filter.timestamp = {};
    if (fromDate) filter.timestamp.$gte = new Date(fromDate);
    if (toDate) filter.timestamp.$lte = new Date(toDate);
  }

  if (search && typeof search === "string" && search.trim()) {
    const escapedSearch = String(search).trim().replace(/[.*+?^${}()|[\]\\]/g, "\\$&");
    const regex = new RegExp(escapedSearch, "i");
    const searchOr = [
      { event: regex },
      { name: regex },
      { userName: regex },
      { employeeId: regex },
      { deviceId: regex },
      { codeId: regex },
      { "metadata.description": regex },
      { "raw.deviceId": regex },
      { narrative: regex },
    ];

    if (filter.$or) {
      // If there's already an $or (e.g. from category), we must combine them with $and
      const existingOr = filter.$or;
      delete filter.$or;
      filter.$and = [
        { $or: existingOr },
        { $or: searchOr }
      ];
    } else {
      filter.$or = searchOr;
    }
  }

  return filter;
};

const buildLocationScopeFilter = async (req) => {
  const scope = await resolveLocationScope(req);
  if (!scope.isAdmin) return null;

  const [employees, visitors, users] = await Promise.all([
    EmployeeModel.find({ location: scope.location }).select("employeeId").lean(),
    VisitorModel.find({ location: scope.location }).select("employeeId _id").lean(),
    UserModel.find({ location: scope.location }).select("_id").lean(),
  ]);

  const employeeIds = new Set();
  employees.forEach((doc) => {
    if (doc?.employeeId) employeeIds.add(String(doc.employeeId));
  });
  visitors.forEach((doc) => {
    if (doc?.employeeId) employeeIds.add(String(doc.employeeId));
  });

  const principalIds = new Set();
  users.forEach((doc) => {
    if (doc?._id) principalIds.add(String(doc._id));
  });
  visitors.forEach((doc) => {
    if (doc?._id) principalIds.add(String(doc._id));
  });

  const scopeOr = [];
  if (employeeIds.size > 0) {
    scopeOr.push({ employeeId: { $in: Array.from(employeeIds) } });
  }
  if (principalIds.size > 0) {
    scopeOr.push({ "raw.userId": { $in: Array.from(principalIds) } });
  }

  // Include activities that happened at this location
  if (scope.locationId) {
    scopeOr.push({ locationId: scope.locationId });
  }
  if (scope.location) {
    scopeOr.push({ location: scope.location });
  }

  if (scopeOr.length === 0) {
    return { _id: { $in: [] } };
  }

  return { $or: scopeOr };
};

const withScope = (filter = {}, scopeFilter = null) => {
  if (!scopeFilter) return filter;
  return { $and: [filter, scopeFilter] };
};

exports.add = async (req, res) => {
  try {
    const payload = { ...req.body };
    if (payload.deviceId) {
      const normalizedId = String(payload.deviceId).trim();
      const deviceQuery = {
        $or: [{ deviceId: new RegExp(`^${normalizedId}$`, "i") }],
      };
      if (mongoose.isValidObjectId(normalizedId)) {
        deviceQuery.$or.push({ _id: normalizedId });
      }
      const device = await DeviceModel.findOne(deviceQuery)
        .select("_id devicePolicyState")
        .lean();
      if (!device) {
        return res.status(400).json({ status: false, message: "Valid deviceId is required" });
      }
      if (
        device.devicePolicyState?.uninstallBlocked !== true &&
        !isAppInstallActivity(
          payload.activityType,
          payload.category,
          payload.event,
          payload.title,
          payload.description,
          payload.narrative,
          payload.metadata?.event,
          payload.metadata?.narrative
        )
      ) {
        return res.status(200).json({
          status: true,
          skipped: true,
          message: "Activity ignored because uninstallBlocked is false",
        });
      }
    }

    const isLoggedIn = await resolveCurrentSessionLoggedIn(payload);
    if (!isLoggedIn && shouldIgnoreLoggedOutActivity(payload)) {
      return res.status(200).json({
        status: true,
        skipped: true,
        message: "Activity ignored because user is logged out",
      });
    }

    if (!payload.imagePath) {
      payload.imagePath =
        payload.metadata?.imagePath || payload.raw?.imagePath || "";
    }
    if (payload.policyVoilation === undefined) {
      payload.policyVoilation = await resolvePolicyVoilation(payload);
    }

    // Resolve current session location
    if (!payload.location) {
      const sessionQuery = {};
      if (payload.userId && mongoose.isValidObjectId(payload.userId)) {
        sessionQuery.userId = payload.userId;
      } else if (payload.employeeId) {
        sessionQuery.employeeId = payload.employeeId;
      }

      if (Object.keys(sessionQuery).length > 0) {
        const session = await UserSession.findOne(sessionQuery)
          .sort({ createdAt: -1 })
          .select("location locationId action")
          .lean();
        if (session && session.action === "Logged In") {
          payload.location = session.location;
          payload.locationId = session.locationId;
        }
      }
    }

    // Map Activity fields to DeviceEvent schema
    const eventPayload = {
      event: payload.activityType || payload.event || payload.category || "activity",
      narrative: payload.description || payload.narrative || "",
      timestamp: payload.occurredAt || new Date(),
      imagePath: payload.imagePath || "",
      employeeId: payload.employeeId || "",
      name: payload.name || "",
      location: payload.location || "",
      locationId: payload.locationId || null,
      policyVoilation: !!payload.policyVoilation,
      metadata: {
        ...(payload.metadata || {}),
        category: payload.category,
      },
      raw: {
        ...(payload.raw || {}),
        userId: payload.userId,
      },
    };

    // Resolve device ObjectId if possible
    if (payload.deviceId) {
      const normalizedId = String(payload.deviceId).trim();
      const deviceQuery = {
        $or: [{ deviceId: new RegExp(`^${normalizedId}$`, "i") }],
      };
      if (mongoose.isValidObjectId(normalizedId)) {
        deviceQuery.$or.push({ _id: normalizedId });
      }
      const device = await DeviceModel.findOne(deviceQuery).select("_id").lean();
      if (device) {
        eventPayload.deviceId = device._id;
      } else if (mongoose.isValidObjectId(normalizedId)) {
        eventPayload.deviceId = normalizedId;
      }
    }

    if (!eventPayload.deviceId) {
      // If we still don't have a valid ObjectId for deviceId, this might fail validation
      // but let's see if the schema allows it or if we can find a better fallback.
      return res.status(400).json({ status: false, message: "Valid deviceId is required" });
    }

    const record = await DeviceEventModel.create(eventPayload);
    res.status(201).json({ status: true, message: "Activity logged", data: record });
  } catch (error) {
    console.error("Activity add error:", error);
    res.status(400).json({ status: false, message: error.message });
  }
};

// Summary counts for dashboard cards
exports.getSummary = async (_req, res) => {
  try {
    const scopeFilter = await buildLocationScopeFilter(_req);
    const todayStart = new Date();
    todayStart.setHours(0, 0, 0, 0);
    const cameraCount = await DeviceEventModel.countDocuments({
      ...withScope(
        {
          $or: [
            { policyVoilation: true, event: { $regex: "camera|screenshot|video|picture", $options: "i" } },
            { event: { $regex: "^Picture taken$", $options: "i" } }
          ]
        },
        scopeFilter
      ),
    });
    const securityEventCount = await DeviceEventModel.countDocuments({
      ...withScope(
        {
          policyVoilation: true,
          event: {
            $regex: "app[_-]?install|app[_-]?uninstall|accessibility|unauthorized uninstall|inactive|restricted app settings|working hours violation|overlay|notification permission",
            $options: "i"
          },
        },
        scopeFilter
      ),
    });
    const accessCount = await DeviceEventModel.countDocuments({
      ...withScope(
        {
          policyVoilation: true,
          event: {
            $regex: "youtube|whatsapp|instagram|facebook|restricted app opened",
            $options: "i",
          },
        },
        scopeFilter
      ),
    });
    const [cameraToday, securityToday, accessToday] = await Promise.all([
      DeviceEventModel.countDocuments({
        ...withScope(
          {
            $or: [
              { policyVoilation: true, event: { $regex: "camera|screenshot|video|picture", $options: "i" } },
              { event: { $regex: "^Picture taken$", $options: "i" } }
            ],
            timestamp: { $gte: todayStart },
          },
          scopeFilter
        ),
      }),
      DeviceEventModel.countDocuments({
        ...withScope(
          {
            policyVoilation: true,
            event: {
              $regex: "app[_-]?install|app[_-]?uninstall|accessibility|unauthorized uninstall|inactive|restricted app settings|working hours violation|overlay|notification permission",
              $options: "i"
            },
            timestamp: { $gte: todayStart },
          },
          scopeFilter
        ),
      }),
      DeviceEventModel.countDocuments({
        ...withScope(
          {
            policyVoilation: true,
            event: {
              $regex: "youtube|whatsapp|instagram|facebook|restricted app opened",
              $options: "i",
            },
            timestamp: { $gte: todayStart },
          },
          scopeFilter
        ),
      }),
    ]);

    const clearAllCount = await DeviceEventModel.countDocuments({
      ...withScope(
        { event: "CLEAR_ALL_DETECTED" },
        scopeFilter
      ),
    });
    const clearAllToday = await DeviceEventModel.countDocuments({
      ...withScope(
        {
          event: "CLEAR_ALL_DETECTED",
          timestamp: { $gte: todayStart },
        },
        scopeFilter
      ),
    });

    return res.status(200).json({
      status: true,
      data: {
        camera: cameraCount || 0,
        app_install: securityEventCount || 0,
        app_uninstall: 0,
        app_access: accessCount || 0,
        clear_all: clearAllCount || 0,
        today: {
          camera: cameraToday || 0,
          app_install: securityToday || 0,
          app_uninstall: 0,
          app_access: accessToday || 0,
          clear_all: clearAllToday || 0,
        },
      },
    });
  } catch (error) {
    return res.status(500).json({ status: false, message: error.message });
  }
};

exports.getAll = async (req, res) => {
  try {
    const { userId, employeeId, deviceId, category, search, violationsOnly, groupBy, fromDate, toDate } = req.query;
    const onlyViolations = String(violationsOnly || "").toLowerCase() === "true";
    const groupByUser = String(groupBy || "").toLowerCase() === "user";

    const baseFilter = buildActivityFilter({
      userId,
      employeeId,
      deviceId,
      category,
      search,
      violationsOnly: onlyViolations,
      fromDate,
      toDate,
    });
    const scopeFilter = await buildLocationScopeFilter(req);
    const filter = withScope(baseFilter, scopeFilter);

    const pageNum = parseInt(req.query.page, 10) || 0;
    const limitNum = parseInt(req.query.limit, 10) || 50;
    const skip = Math.max(0, pageNum) * Math.max(1, limitNum);

    let finalRecords = [];
    let totalRecordsCount = 0;

    if (groupByUser) {
      // Aggregation for unique users with their latest event
      const aggregatePipeline = [
        { $match: filter },
        { $sort: { timestamp: -1, createdAt: -1 } },
        {
          $group: {
            _id: {
              $cond: [
                { $gt: [{ $ifNull: ["$employeeId", ""] }, ""] },
                "$employeeId",
                { $ifNull: ["$raw.userId", "$_id"] }
              ]
            },
            latestEvent: { $first: "$$ROOT" }
          }
        },
        { $sort: { "latestEvent.timestamp": -1, "latestEvent.createdAt": -1 } }
      ];

      // Get total unique users count
      const countResult = await DeviceEventModel.aggregate([
        ...aggregatePipeline,
        { $count: "total" }
      ]);
      totalRecordsCount = countResult[0]?.total || 0;

      // Get paginated unique users
      const paginatedResults = await DeviceEventModel.aggregate([
        ...aggregatePipeline,
        { $skip: skip },
        { $limit: limitNum }
      ]);

      const resultUserIds = paginatedResults.map(r => r._id).filter(Boolean);
      const countsMap = {};
      
      if (resultUserIds.length > 0) {
        const todayStart = new Date();
        todayStart.setHours(0, 0, 0, 0);

        // Define matchers for different categories using the same logic as buildActivityFilter
        const matchers = {
          clear_all: { event: "CLEAR_ALL_DETECTED" },
          camera: { 
            $or: [
              { category: { $in: ["camera", "screenshot", "video"] } },
              { event: { $regex: "camera|screenshot|video|picture", $options: "i" } }
            ]
          },
          app_access: {
            $or: [
              { category: "app_access" },
              { event: { $regex: "youtube|whatsapp|instagram|facebook|restricted app opened", $options: "i" } }
            ]
          },
          security: {
            $or: [
              { category: { $in: ["app_install", "app_uninstall"] } },
              {
                event: {
                  $regex: "app[_-]?install|app[_-]?uninstall|accessibility|unauthorized uninstall|inactive|restricted app settings|working hours violation|overlay|notification permission",
                  $options: "i",
                },
              },
            ]
          }
        };

        const aggregationPromises = [];
        for (const [key, match] of Object.entries(matchers)) {
          // Total counts
          aggregationPromises.push(
            DeviceEventModel.aggregate([
              { $match: { ...match, employeeId: { $in: resultUserIds } } },
              { $group: { _id: "$employeeId", count: { $sum: 1 } } }
            ]).then(res => ({ key: `${key}Total`, data: res }))
          );
          // Today counts
          aggregationPromises.push(
            DeviceEventModel.aggregate([
              { $match: { ...match, employeeId: { $in: resultUserIds }, timestamp: { $gte: todayStart } } },
              { $group: { _id: "$employeeId", count: { $sum: 1 } } }
            ]).then(res => ({ key: `${key}Today`, data: res }))
          );
        }

        const allResults = await Promise.all(aggregationPromises);
        allResults.forEach(result => {
          result.data.forEach(c => {
            if (!countsMap[c._id]) countsMap[c._id] = {};
            countsMap[c._id][result.key] = c.count;
          });
        });
      }

      finalRecords = paginatedResults.map(r => ({
        ...r.latestEvent,
        stats: countsMap[r._id] || {}
      }));
    } else {
      // Standard fetch
      const [records, totalrecords] = await Promise.all([
        DeviceEventModel.find(filter)
          .sort({ timestamp: -1, createdAt: -1 })
          .skip(skip)
          .limit(limitNum)
          .lean(),
        DeviceEventModel.countDocuments(filter),
      ]);
      finalRecords = records;
      totalRecordsCount = totalrecords;
    }

    const deviceIds = Array.from(
      new Set(
        finalRecords
          .map((doc) => doc?.deviceId)
          .filter((id) => mongoose.isValidObjectId(id))
          .map((id) => String(id))
      )
    );
    const deviceIdCandidates = new Set();
    finalRecords.forEach((doc) => {
      const raw = doc?.raw || {};
      const metadata = doc?.metadata || {};
      const candidates = [
        raw?.deviceId,
        raw?.device_id,
        raw?.device?.deviceId,
        metadata?.deviceId,
        metadata?.device_id,
        metadata?.device?.deviceId,
        doc?.deviceId,
      ]
        .filter(Boolean)
        .map((value) => String(value));
      candidates.forEach((value) => {
        if (!mongoose.isValidObjectId(value)) {
          deviceIdCandidates.add(value);
        }
      });
    });

    const deviceMap = new Map();
    const deviceIdMap = new Map();
    if (deviceIds.length > 0) {
      const devices = await DeviceModel.find({ _id: { $in: deviceIds }, verified: { $ne: false } })
        .select("deviceId")
        .lean();
      devices.forEach((device) => {
        deviceMap.set(String(device._id), device.deviceId || "");
        if (device.deviceId) {
          deviceIdMap.set(String(device.deviceId).toLowerCase(), device.deviceId);
        }
      });
    }
    if (deviceIdCandidates.size > 0) {
      const devices = await DeviceModel.find({
        deviceId: { $in: Array.from(deviceIdCandidates) },
        verified: { $ne: false },
      })
        .select("deviceId")
        .lean();
      devices.forEach((device) => {
        if (device.deviceId) {
          deviceIdMap.set(String(device.deviceId).toLowerCase(), device.deviceId);
        }
      });
    }

    const baseUrl = `${req.protocol}://${req.get("host")}`;
    const dataWithId = finalRecords.map((doc) => {
      const plain = typeof doc.toObject === "function" ? doc.toObject() : doc;
      const rawDeviceCandidate =
        plain.raw?.deviceId ||
        plain.raw?.device_id ||
        plain.raw?.device?.deviceId ||
        plain.raw?.device?.id ||
        plain.metadata?.deviceId ||
        plain.metadata?.device_id ||
        plain.metadata?.device?.deviceId ||
        plain.metadata?.device?.id ||
        "";
      const baseType = plain.event || plain.category || "";
      const activityTypeResolved = resolveActivityType(baseType);
      const categoryResolved = plain.category || resolveCategory(baseType);
      const media = Array.isArray(plain.media) ? plain.media : [];
      let resolvedDeviceId = "";
      if (rawDeviceCandidate) {
        if (mongoose.isValidObjectId(rawDeviceCandidate)) {
          resolvedDeviceId = deviceMap.get(String(rawDeviceCandidate)) || "";
        } else {
          resolvedDeviceId =
            deviceIdMap.get(String(rawDeviceCandidate).toLowerCase()) ||
            String(rawDeviceCandidate);
        }
      }
      if (!resolvedDeviceId && plain.deviceId) {
        if (
          typeof plain.deviceId === "string" &&
          !mongoose.isValidObjectId(plain.deviceId)
        ) {
          resolvedDeviceId =
            deviceIdMap.get(String(plain.deviceId).toLowerCase()) || plain.deviceId;
        } else if (mongoose.isValidObjectId(plain.deviceId)) {
          resolvedDeviceId = deviceMap.get(String(plain.deviceId)) || "";
        }
      }
      const mediaUrlCandidate =
        plain.imagePath ||
        media[0]?.url ||
        plain.metadata?.mediaUrl ||
        plain.metadata?.media ||
        plain.metadata?.imagePath ||
        plain.raw?.imagePath ||
        "";
      const narrative = plain.metadata?.narrative || plain.narrative || "";
      const appNameResolved =
        plain.metadata?.appName ||
        resolveAppNameFromText(narrative) ||
        resolveAppNameFromText(baseType);
      const mediaUrl =
        mediaUrlCandidate.startsWith("/uploads/")
          ? `${baseUrl}${mediaUrlCandidate}`
          : mediaUrlCandidate;
      const imagePath =
        plain.imagePath ||
        plain.metadata?.imagePath ||
        plain.raw?.imagePath ||
        "";
      return {
        id: plain._id?.toString?.() || plain.id,
        userName: plain.name || "",
        name: plain.name || "",
        activityType: activityTypeResolved,
        title: plain.title || activityTypeResolved,
        description:
          plain.metadata?.description || activityTypeResolved || "Activity detected",
        category: categoryResolved,
        deviceId: String(resolvedDeviceId || ""),
        employeeId: plain.employeeId || "",
        appVersion: plain.raw?.appVersion || plain.metadata?.appVersion || "",
        occurredAt: plain.timestamp || plain.createdAt,
        timestamp: plain.timestamp || plain.createdAt,
        policyVoilation: !!plain.policyVoilation,
        imagePath,
        mediaUrl,
        media,
        stats: plain.stats || {},
        metadata: {
          ...(plain.metadata || {}),
          ...(narrative ? { narrative } : {}),
          ...(appNameResolved ? { appName: appNameResolved } : {}),
          mediaUrl,
          originalEvent: baseType,
        },
      };
    });

    if (groupByUser) {
      // In groupByUser mode, we return the data already formatted as summary rows
      return res.status(200).json({
        status: true,
        data: dataWithId.map(item => ({
          user: item.userName || "-",
          userKey: item.employeeId || item.id,
          deviceId: item.deviceId || "",
          employeeId: item.employeeId || "",
          latestActivity: item,
          activities: [item] // Still include the latest as a list for compatibility
        })),
        pagination: {
          totalrecords: totalRecordsCount,
          currentPage: pageNum,
          totalPages: Math.ceil(totalRecordsCount / limitNum),
          limit: limitNum,
        },
      });
    }

    res.status(200).json({
      status: true,
      data: dataWithId,
      pagination: {
        totalrecords: totalRecordsCount,
        currentPage: pageNum,
        totalPages: Math.ceil(totalRecordsCount / limitNum),
        limit: limitNum,
      },
    });
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

    const scopeFilter = await buildLocationScopeFilter(req);
    searchQuery = withScope(searchQuery, scopeFilter);

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
      const devices = await DeviceModel.find({ _id: { $in: deviceIds }, verified: { $ne: false } })
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
      const narrative = plain.metadata?.narrative || plain.narrative || "";
      const appNameResolved =
        plain.metadata?.appName ||
        resolveAppNameFromText(narrative) ||
        resolveAppNameFromText(plain.event || "");

      return {
        id: plain._id?.toString?.() || plain.id,
        name: plain.name || "",
        employeeId: plain.employeeId || "",
        deviceId: resolvedDeviceId,
        appVersion: plain.raw?.appVersion || plain.metadata?.appVersion || "",
        location:
          plain.location ||
          plain.metadata?.location ||
          plain.raw?.location ||
          "",
        activityType: plain.event || "",
        description,
        appName: appNameResolved,
        narrative,
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
    const scopeFilter = await buildLocationScopeFilter(req);
    const count = await DeviceEventModel.countDocuments(
      withScope(
        {
          policyVoilation: true,
          timestamp: { $gt: seenAt },
        },
        scopeFilter
      )
    );

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
    const scopeFilter = await buildLocationScopeFilter(req);
    const record = await DeviceEventModel.findOne(
      withScope({ _id: id }, scopeFilter)
    );
    if (!record) return res.status(404).json({ status: false, message: "Not found" });
    res.status(200).json({ status: true, data: record });
  } catch (error) {
    res.status(500).json({ status: false, message: error.message });
  }
};

exports.deleteNotification = async (req, res) => {
  try {
    const { id } = req.params;
    if (!id || id === "undefined") {
      return res
        .status(400)
        .json({ status: false, message: "Notification id is required" });
    }
    const scopeFilter = await buildLocationScopeFilter(req);
    const filter = withScope({ _id: id, policyVoilation: true }, scopeFilter);
    const result = await DeviceEventModel.deleteOne(filter);
    return res.status(200).json({
      status: true,
      message: result.deletedCount ? "Notification deleted" : "No notification deleted",
      deletedCount: result.deletedCount || 0,
    });
  } catch (error) {
    return res.status(500).json({ status: false, message: error.message });
  }
};

exports.clearNotifications = async (req, res) => {
  try {
    const { employeeId, deviceId } = req.query || {};
    const scopeFilter = await buildLocationScopeFilter(req);
    const baseFilter = { policyVoilation: true };
    if (employeeId) baseFilter.employeeId = String(employeeId).trim();
    if (deviceId) baseFilter.deviceId = String(deviceId).trim();
    const filter = withScope(baseFilter, scopeFilter);
    const result = await DeviceEventModel.deleteMany(filter);
    return res.status(200).json({
      status: true,
      message: `${result.deletedCount || 0} notification(s) cleared`,
      deletedCount: result.deletedCount || 0,
    });
  } catch (error) {
    return res.status(500).json({ status: false, message: error.message });
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
    const scopeFilter = await buildLocationScopeFilter(req);
    const scopedIds = withScope({ _id: { $in: ids } }, scopeFilter);
    const result = await DeviceEventModel.deleteMany(scopedIds);
    res
      .status(200)
      .json({ status: true, message: `${result.deletedCount} record(s) deleted` });
  } catch (error) {
    res.status(500).json({ status: false, message: error.message });
  }
};
