const EmployeeModel = require("../Modules/employees/model");

const normalizeLocation = (value) => String(value || "").trim();

const resolveUserLocation = async (user = {}) => {
  const directLocation = normalizeLocation(user.location);
  if (directLocation) {
    return directLocation;
  }

  const employeeId = normalizeLocation(user.employeeId);
  if (!employeeId) {
    return "";
  }

  const employee = await EmployeeModel.findOne({ employeeId }).select("location").lean();
  return normalizeLocation(employee?.location);
};

const resolveLocationScope = async (req) => {
  const role = String(req.user?.role || "").toLowerCase();
  const isSuperadmin = role === "superadmin";
  const isAdmin = role === "admin";

  if (!isSuperadmin && !isAdmin) {
    return { role, isAdmin: false, isSuperadmin: false, location: "" };
  }

  if (isSuperadmin) {
    return { role, isAdmin: false, isSuperadmin: true, location: "" };
  }

  const adminLocation = await resolveUserLocation(req.user);
  if (!adminLocation) {
    const error = new Error("Admin location is not configured");
    error.statusCode = 403;
    throw error;
  }

  return { role, isAdmin: true, isSuperadmin: false, location: adminLocation };
};

const assertScopedLocation = (recordLocation, scope, message) => {
  if (!scope?.isAdmin) return;
  const normalizedRecordLocation = normalizeLocation(recordLocation);
  if (normalizedRecordLocation !== scope.location) {
    const error = new Error(message || "You can only access your assigned location data");
    error.statusCode = 403;
    throw error;
  }
};

module.exports = {
  normalizeLocation,
  resolveUserLocation,
  resolveLocationScope,
  assertScopedLocation,
};
