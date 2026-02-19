const Contractor = require("../contractors/model");
const Employee = require("../employees/model");
const Section = require("../sections/model");
const Attendance = require("../attendance/model");
const Visitor = require("../user/visitorModel");
const { resolveLocationScope } = require("../../helpers/locationScope");

const buildLocationFallbackFilter = (location) => ({
  $or: [
    { location },
    { unitLocation: location },
    { "metadata.location": location },
    { "metadata.unitLocation": location },
  ],
});

// Dashboard summary counts for cards
exports.getSummary = async (req, res) => {
  try {
    const scope = await resolveLocationScope(req);

    if (scope.isAdmin) {
      const location = scope.location;
      const [employeesAtLocation, visitorsAtLocation] = await Promise.all([
        Employee.find({ location }).select("employeeId").lean(),
        Visitor.find({ location }).select("employeeId").lean(),
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

      const [contractors, employees, visitors, managers, departments, monthlyReports] =
        await Promise.all([
          Contractor.countDocuments(buildLocationFallbackFilter(location)),
          Employee.countDocuments({ location }),
          Visitor.countDocuments({ location }),
          Employee.countDocuments({ role: "manager", location }),
          Section.countDocuments(buildLocationFallbackFilter(location)),
          Attendance.countDocuments(attendanceFilter),
        ]);

      return res.status(200).json({
        status: true,
        data: {
          contractors,
          employees,
          visitors,
          managers,
          departments,
          monthlyReports,
        },
      });
    }

    const [contractors, employees, visitors, managers, departments, monthlyReports] =
      await Promise.all([
        Contractor.countDocuments({}),
        Employee.countDocuments({}),
        Visitor.countDocuments({}),
        Employee.countDocuments({ role: "manager" }),
        Section.countDocuments({}),
        Attendance.countDocuments({}), // treating attendance entries as monthly reports
      ]);

    return res.status(200).json({
      status: true,
      data: {
        contractors,
        employees,
        visitors,
        managers,
        departments,
        monthlyReports,
      },
    });
  } catch (error) {
    return res.status(500).json({ status: false, message: error.message });
  }
};
