const Contractor = require("../contractors/model");
const Employee = require("../employees/model");
const Section = require("../sections/model");
const Attendance = require("../attendance/model");
const Visitor = require("../user/visitorModel");
const DeviceEvent = require("../device/deviceEventModel");
const { resolveLocationScope } = require("../../helpers/locationScope");

const buildLocationFallbackFilter = (location) => ({
  $or: [
    { location },
    { unitLocation: location },
    { "metadata.location": location },
    { "metadata.unitLocation": location },
  ],
});

const otpGateFilter = { $or: [{ otpVerified: true }, { otpVerified: { $exists: false } }] };

// Dashboard summary counts for cards
exports.getSummary = async (req, res) => {
  try {
    const scope = await resolveLocationScope(req);

    if (scope.isAdmin) {
      const location = scope.location;
      const [employeesAtLocation, visitorsAtLocation] = await Promise.all([
        Employee.find({ location, ...otpGateFilter }).select("employeeId").lean(),
        Visitor.find({ location, ...otpGateFilter }).select("employeeId").lean(),
      ]);

      const scopedEmployeeIds = Array.from(
        new Set(
          [...employeesAtLocation, ...visitorsAtLocation]
            .map((doc) => String(doc?.employeeId || "").trim())
            .filter(Boolean)
        )
      );

      const attendanceFilter = scopedEmployeeIds.length
        ? { employeeId: { $in: scopedEmployeeIds } }
        : { _id: { $in: [] } };

      const deviceEventFilter = scopedEmployeeIds.length
        ? { employeeId: { $in: scopedEmployeeIds }, policyVoilation: true }
        : { _id: { $in: [] }, policyVoilation: true };

      const startOfDay = new Date();
      startOfDay.setHours(0, 0, 0, 0);
      const endOfDay = new Date();
      endOfDay.setHours(23, 59, 59, 999);

      const todayDeviceEventFilter = {
        ...deviceEventFilter,
        timestamp: { $gte: startOfDay, $lte: endOfDay }
      };

      const [contractors, employees, visitors, managers, departments, monthlyReports, totalActivities, todayActivities] =
        await Promise.all([
          Contractor.countDocuments(buildLocationFallbackFilter(location)),
          Employee.countDocuments({ location, ...otpGateFilter }),
          Visitor.countDocuments({ location, ...otpGateFilter }),
          Employee.countDocuments({ role: "manager", location }),
          Section.countDocuments(buildLocationFallbackFilter(location)),
          Attendance.countDocuments(attendanceFilter),
          DeviceEvent.countDocuments(deviceEventFilter),
          DeviceEvent.countDocuments(todayDeviceEventFilter),
        ]);

      const loggedIn = await Attendance.countDocuments({
        ...attendanceFilter,
        entryGateIn: { $exists: true, $ne: null },
        createdAt: { $gte: startOfDay, $lte: endOfDay }
      });

      const loggedOut = await Attendance.countDocuments({
        ...attendanceFilter,
        exitGateOut: { $exists: true, $ne: null },
        createdAt: { $gte: startOfDay, $lte: endOfDay }
      });

      const sevenDaysAgo = new Date();
      sevenDaysAgo.setHours(0, 0, 0, 0);
      sevenDaysAgo.setDate(sevenDaysAgo.getDate() - 6);

      const recentAttendanceInfo = await Attendance.find({
        ...attendanceFilter,
        createdAt: { $gte: sevenDaysAgo }
      }).select("createdAt entryGateIn exitGateOut").lean();

      const last7DaysAttendance = [];
      for (let i = 6; i >= 0; i--) {
        const d = new Date();
        d.setHours(0, 0, 0, 0);
        d.setDate(d.getDate() - i);
        const nextDay = new Date(d);
        nextDay.setDate(nextDay.getDate() + 1);

        const dL = d.toLocaleDateString("en-US", { month: "short", day: "numeric" });

        let loggedInCount = 0;
        let loggedOutCount = 0;

        recentAttendanceInfo.forEach(record => {
          if (record.createdAt >= d && record.createdAt < nextDay) {
            if (record.entryGateIn) loggedInCount++;
            if (record.exitGateOut) loggedOutCount++;
          }
        });

        last7DaysAttendance.push({
          name: dL,
          loggedIn: loggedInCount,
          loggedOut: loggedOutCount
        });
      }

      return res.status(200).json({
        status: true,
        data: {
          contractors,
          employees,
          visitors,
          managers,
          departments,
          monthlyReports,
          totalActivities,
          todayActivities,
          loggedIn,
          loggedOut,
          last7DaysAttendance
        },
      });
    }

    const startOfDay = new Date();
    startOfDay.setHours(0, 0, 0, 0);
    const endOfDay = new Date();
    endOfDay.setHours(23, 59, 59, 999);

    const todayDeviceEventFilter = {
      policyVoilation: true,
      timestamp: { $gte: startOfDay, $lte: endOfDay }
    };

    const [contractors, employees, visitors, managers, departments, monthlyReports, totalActivities, todayActivities] =
      await Promise.all([
        Contractor.countDocuments({}),
        Employee.countDocuments({ ...otpGateFilter }),
        Visitor.countDocuments({ ...otpGateFilter }),
        Employee.countDocuments({ role: "manager" }),
        Section.countDocuments({}),
        Attendance.countDocuments({}), // treating attendance entries as monthly reports
        DeviceEvent.countDocuments({ policyVoilation: true }),
        DeviceEvent.countDocuments(todayDeviceEventFilter),
      ]);

    const loggedIn = await Attendance.countDocuments({
      entryGateIn: { $exists: true, $ne: null },
      createdAt: { $gte: startOfDay, $lte: endOfDay }
    });

    const loggedOut = await Attendance.countDocuments({
      exitGateOut: { $exists: true, $ne: null },
      createdAt: { $gte: startOfDay, $lte: endOfDay }
    });

    const sevenDaysAgo = new Date();
    sevenDaysAgo.setHours(0, 0, 0, 0);
    sevenDaysAgo.setDate(sevenDaysAgo.getDate() - 6);

    const recentAttendanceInfo = await Attendance.find({
      createdAt: { $gte: sevenDaysAgo }
    }).select("createdAt entryGateIn exitGateOut").lean();

    const last7DaysAttendance = [];
    for (let i = 6; i >= 0; i--) {
      const d = new Date();
      d.setHours(0, 0, 0, 0);
      d.setDate(d.getDate() - i);
      const nextDay = new Date(d);
      nextDay.setDate(nextDay.getDate() + 1);

      const dL = d.toLocaleDateString("en-US", { month: "short", day: "numeric" });

      let loggedInCount = 0;
      let loggedOutCount = 0;

      recentAttendanceInfo.forEach(record => {
        if (record.createdAt >= d && record.createdAt < nextDay) {
          if (record.entryGateIn) loggedInCount++;
          if (record.exitGateOut) loggedOutCount++;
        }
      });

      last7DaysAttendance.push({
        name: dL,
        loggedIn: loggedInCount,
        loggedOut: loggedOutCount
      });
    }

    return res.status(200).json({
      status: true,
      data: {
        contractors,
        employees,
        visitors,
        managers,
        departments,
        monthlyReports,
        totalActivities,
        todayActivities,
        loggedIn,
        loggedOut,
        last7DaysAttendance
      },
    });
  } catch (error) {
    return res.status(500).json({ status: false, message: error.message });
  }
};
