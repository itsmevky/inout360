const { ajModel } = require("../../common/classes/Model");

const userSchemaDefinition = {
  name: { type: String, required: true, trim: true },
  employeeId: { type: String, required: true, trim: true, index: true },
  deviceId: { type: String, required: true, trim: true, index: true },
  sessionStatus: {
    type: String,
    enum: ["Logged In", "Logout"],
    default: "Logout",
  },

  email: {
    type: String,
    required: true,
    unique: true,
    lowercase: true,
    trim: true,
  },
  password: {
    type: String,
    required: true,
    select: false,
  },

  role: {
    type: String,
    enum: [
      "admin",
      "hr",
      "supervisor",
      "employee",
      "manager",
      "superadmin",
      "contractor",
    ],
    default: "employee",
  },
};

const userTransform = (ret) => ({
  id: ret._id,
  name: ret.name,
  fullname: ret.name,
  employeeId: ret.employeeId,
  deviceId: ret.deviceId,
  sessionStatus: ret.sessionStatus,
  role: ret.role,
  createdAt: ret.createdAt,
  updatedAt: ret.updatedAt,
});

const UserWrapper = new ajModel(
  "User",
  userSchemaDefinition,
  userTransform
);

module.exports = UserWrapper.getModel();
