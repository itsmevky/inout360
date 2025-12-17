const Contractor = require("../contractors/model");
const Employee = require("../employees/model");
const Section = require("../sections/model");
const Attendance = require("../attendance/model");

// Dashboard summary counts for cards
exports.getSummary = async (_req, res) => {
  try {
    const [contractors, employees, supervisors, managers, departments, monthlyReports] =
      await Promise.all([
        Contractor.countDocuments({}),
        Employee.countDocuments({}),
        Employee.countDocuments({ role: "supervisor" }),
        Employee.countDocuments({ role: "manager" }),
        Section.countDocuments({}),
        Attendance.countDocuments({}), // treating attendance entries as monthly reports
      ]);

    return res.status(200).json({
      status: true,
      data: {
        contractors,
        employees,
        supervisors,
        managers,
        departments,
        monthlyReports,
      },
    });
  } catch (error) {
    return res.status(500).json({ status: false, message: error.message });
  }
};
