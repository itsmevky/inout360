const ActivityModel = require("./model");
const paginate = require("../../helpers/limitoffset");

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
    const categories = {
      camera: ["camera", "screenshot","video"],
      app_install: ["app_install"],
      app_uninstall: ["app_uninstall"],
    };

    const results = {};
    for (const [key, catList] of Object.entries(categories)) {
      results[key] = await ActivityModel.countDocuments({ category: { $in: catList } });
    }

    return res.status(200).json({
      status: true,
      data: {
        camera: results.camera || 0,
        app_install: results.app_install || 0,
        app_uninstall: results.app_uninstall || 0,
      },
    });
  } catch (error) {
    return res.status(500).json({ status: false, message: error.message });
  }
};

exports.getAll = async (req, res) => {
  try {
    const { userId, employeeId, deviceId, category, search, page, limit } = req.query;
    const pageNumber = Math.max(0, (parseInt(page, 10) || 1) - 1);
    const filter = {};
    if (userId) filter.userId = userId;
    if (employeeId) filter.employeeId = employeeId;
    if (deviceId) filter.deviceId = deviceId;
    if (category) filter.category = category;

    const result = await paginate(
      ActivityModel,
      filter,
      pageNumber,
      limit,
      [],
      ["activityType", "title", "description", "deviceId", "employeeId"],
      search
    );
    const dataWithId = result.data.map((doc) => {
      const plain = typeof doc.toObject === "function" ? doc.toObject() : doc;
      return { ...plain, id: plain._id?.toString?.() || plain.id };
    });
    res.status(200).json(dataWithId);
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
    const record = await ActivityModel.findById(id);
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
    const result = await ActivityModel.deleteMany({ _id: { $in: ids } });
    res
      .status(200)
      .json({ status: true, message: `${result.deletedCount} record(s) deleted` });
  } catch (error) {
    res.status(500).json({ status: false, message: error.message });
  }
};
