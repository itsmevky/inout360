const mongoose = require("mongoose");
const AttendanceModel = require("./model");
const EmployeeModel = require("../employees/model");
const VisitorModel = require("../user/visitorModel");
const UserModel = require("../user/model");
const DeviceModel = require("../device/model");
const paginate = require("../../helpers/limitoffset");
const Validator = require("../../helpers/validators");
const { resolveLocationScope } = require("../../helpers/locationScope");

const validateAttendanceData = async (data) => {
  const rules = {
    rfidCardId: "required|string",
    date: "required|date"
  };
  const validator = new Validator(data, rules);
  await validator.validate();
};

const buildAttendanceScopeFilter = async (req) => {
  const scope = await resolveLocationScope(req);
  if (!scope.isAdmin) {
    return null;
  }

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

  const userIds = new Set();
  users.forEach((doc) => {
    if (doc?._id) userIds.add(String(doc._id));
  });
  visitors.forEach((doc) => {
    if (doc?._id) userIds.add(String(doc._id));
  });

  const or = [];
  if (employeeIds.size > 0) {
    or.push({ employeeId: { $in: Array.from(employeeIds) } });
  }
  if (userIds.size > 0) {
    or.push({ userId: { $in: Array.from(userIds) } });
  }

  if (or.length === 0) {
    return { _id: { $in: [] } };
  }

  return { $or: or };
};

const withScopeFilter = (filter = {}, scopeFilter = null) => {
  if (!scopeFilter) return filter;
  return { $and: [filter, scopeFilter] };
};

exports.add = async (req, res) => {
  try {
    await validateAttendanceData(req.body);
    const payload = { ...req.body };
    if (!payload.deviceId && payload.userId && mongoose.isValidObjectId(payload.userId)) {
      const device = await DeviceModel.findOne({ userId: payload.userId })
        .select("deviceId")
        .lean();
      if (device?.deviceId) {
        payload.deviceId = device.deviceId;
      }
    }
    const attendance = await AttendanceModel.create(payload);
    return res.status(201).json({
      status: true,
      message: "Attendance created successfully",
      data: attendance,
    });
  } catch (error) {
    if (error.errors) {
      return res.status(400).json({
        status: false,
        message: error.message || "Validation failed",
        errors: error.errors,
      });
    }
    return res.status(500).json({ status: false, message: error.message });
  }
};

exports.getAll = async (req, res) => {
  try {
    const scopeFilter = await buildAttendanceScopeFilter(req);
    const {
      sectionAssigned,
      status,
      page,
      limit,
      search,
      date,
    } = req.query;
    // normalize to zero-based page
    const pageNumber = Math.max(0, (parseInt(page, 10) || 1) - 1);
    const filter = {};
    if (sectionAssigned) filter.sectionAssigned = sectionAssigned;
    if (date) {
      const [y, m, d] = String(date).split("-").map((part) => parseInt(part, 10));
      if (Number.isFinite(y) && Number.isFinite(m) && Number.isFinite(d)) {
        const dayStart = new Date(y, m - 1, d, 0, 0, 0, 0);
        const dayEnd = new Date(y, m - 1, d, 23, 59, 59, 999);
        filter.date = { $gte: dayStart, $lte: dayEnd };
      }
    }
    if (status === "approved") {
      filter.hrApproved = true;
      filter.supervisorApproved = true;
    }

    const result = await paginate(
      AttendanceModel,
      withScopeFilter(filter, scopeFilter),
      pageNumber,
      limit,
      [],
      ["sectionAssigned", "remarks", "rfidCardId"],
      search,
      { entryGateIn: -1, exitGateOut: -1, updatedAt: -1, _id: -1 }
    );
    const records = result.data || [];
    const employeeIds = Array.from(
      new Set(records.map((r) => r.employeeId).filter(Boolean))
    );
    const userIds = Array.from(
      new Set(
        records
          .map((r) => (r.userId ? String(r.userId) : ""))
          .filter(Boolean)
      )
    );

    const [employees, visitors, users, devices] = await Promise.all([
      employeeIds.length > 0
        ? EmployeeModel.find({ employeeId: { $in: employeeIds } })
            .select("name employeeId userId")
            .lean()
        : [],
      employeeIds.length > 0
        ? VisitorModel.find({ employeeId: { $in: employeeIds } })
            .select("name employeeId userId")
            .lean()
        : [],
      userIds.length > 0
        ? UserModel.find({ _id: { $in: userIds } })
            .select("name fullName fullname username")
            .lean()
        : [],
      userIds.length > 0
        ? DeviceModel.find({ userId: { $in: userIds } })
            .select("userId deviceId")
            .lean()
        : [],
    ]);

    const employeeMap = new Map();
    employees.forEach((emp) => {
      employeeMap.set(String(emp.employeeId), emp.name || "");
    });
    visitors.forEach((vis) => {
      if (!employeeMap.has(String(vis.employeeId))) {
        employeeMap.set(String(vis.employeeId), vis.name || "");
      }
    });

    const userMap = new Map();
    users.forEach((user) => {
      const name = user.name || user.fullName || user.fullname || user.username || "";
      userMap.set(String(user._id), name);
    });

    const deviceMap = new Map();
    devices.forEach((device) => {
      if (device?.userId && device?.deviceId) {
        deviceMap.set(String(device.userId), device.deviceId);
      }
    });

    // Normalize rows for UI consumption
    const dataWithId = records.map((doc) => {
      const plain = typeof doc.toObject === "function" ? doc.toObject() : doc;
      const userName =
        (plain.userId && userMap.get(String(plain.userId))) ||
        (plain.employeeId && employeeMap.get(String(plain.employeeId))) ||
        "";
      const deviceId =
        plain?.metadata?.deviceId ||
        plain?.metadata?.device?.deviceId ||
        plain?.metadata?.device?.id ||
        plain?.deviceId ||
        (plain.userId ? deviceMap.get(String(plain.userId)) : "") ||
        "";
      return {
        ...plain,
        id: plain._id?.toString?.() || plain.id,
        userName,
        deviceId,
      };
    });
    return res.status(200).json({
      status: true,
      data: dataWithId,
      total: result?.pagination?.totalrecords || dataWithId.length,
      pagination: result?.pagination || {
        totalrecords: dataWithId.length,
        currentPage: pageNumber,
        totalPages: 1,
        limit: parseInt(limit, 10) || dataWithId.length || 10,
      },
    });
  } catch (error) {
    return res.status(500).json({
      status: false,
      message: "Server Error",
      error: error.message,
    });
  }
};

exports.getbyid = async (req, res) => {
  try {
    const scopeFilter = await buildAttendanceScopeFilter(req);
    const { id } = req.params;

    if (!id || id === "undefined") {
      return res
        .status(400)
        .json({ status: false, message: "Attendance id is required" });
    }

    const query = mongoose.isValidObjectId(id)
      ? { _id: id }
      : { rfidCardId: id };

    const attendance = await AttendanceModel.findOne(
      withScopeFilter(query, scopeFilter)
    );
    if (!attendance) {
      return res.status(404).json({ status: false, message: "Not found" });
    }
    return res.status(200).json({
      status: true,
      message: "Record fetched",
      data: attendance,
    });
  } catch (error) {
    return res.status(500).json({ status: false, message: error.message });
  }
};

exports.update = async (req, res) => {
  try {
    const scopeFilter = await buildAttendanceScopeFilter(req);
    const { id } = req.params;
    if (!id || id === "undefined") {
      return res
        .status(400)
        .json({ status: false, message: "Attendance id is required" });
    }
    const updated = await AttendanceModel.findOneAndUpdate(
      withScopeFilter({ _id: id }, scopeFilter),
      req.body,
      {
      new: true,
      runValidators: true,
      }
    );
    if (!updated) {
      return res.status(404).json({ status: false, message: "Not found" });
    }
    return res.status(200).json({
      status: true,
      message: "Updated successfully",
      data: updated,
    });
  } catch (error) {
    return res.status(500).json({ status: false, message: error.message });
  }
};

exports.delete = async (req, res) => {
  try {
    const scopeFilter = await buildAttendanceScopeFilter(req);
    let recordIds = req.body?.recordId || req.params?.id;
    if (!recordIds) {
      return res
        .status(404)
        .json({ status: false, message: "Record ID(s) not found" });
    }
    if (recordIds === "undefined") {
      return res
        .status(400)
        .json({ status: false, message: "Record ID(s) not found" });
    }
    if (typeof recordIds === "string") recordIds = [recordIds];
    if (!Array.isArray(recordIds) || recordIds.length === 0) {
      return res.status(400).json({
        status: false,
        message: "Record ID(s) must be a non-empty string or array",
      });
    }

    const result = await AttendanceModel.deleteMany(
      withScopeFilter({ _id: { $in: recordIds } }, scopeFilter)
    );
    if (result.deletedCount === 0) {
      return res
        .status(404)
        .json({ status: false, message: "No matching records found" });
    }

    return res.status(200).json({
      status: true,
      message: `${result.deletedCount} record(s) deleted successfully`,
    });
  } catch (error) {
    return res.status(500).json({ status: false, message: error.message });
  }
};
