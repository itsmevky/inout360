const { ajModel } = require("../../common/classes/Model");

const userSchemaDefinition = {
  firstName: { type: String, required: true, trim: true },
  lastName: { type: String, required: true, trim: true },

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
    select: false, // 🔒 hidden by default
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
    default: "hr",
  },
};

const userTransform = (ret) => ({
  id: ret._id,
  firstName: ret.firstName,
  lastName: ret.lastName,
  fullname: `${ret.firstName} ${ret.lastName}`.trim(),
  email: ret.email,
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
