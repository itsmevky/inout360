const { ajModel } = require("../../common/classes/Model");

const visitorSchemaDefinition = {
  name: { type: String, trim: true, required: true },
  employeeId: { type: String, trim: true, unique: true, index: true },
  role: { type: String, default: "visitor" },
  sessionStatus: {
    type: String,
    enum: ["Logged In", "Logout"],
    default: "Logout",
  },
  rfid: { type: String, unique: true, sparse: true, trim: true, default: null },
  deviceId: { type: String, trim: true, index: true },
  metadata: { type: Object, default: {} },
};

const visitorTransform = (ret) => ({
  id: ret._id,
  name: ret.name,
  employeeId: ret.employeeId,
  role: ret.role,
  sessionStatus: ret.sessionStatus,
  rfid: ret.rfid,
  deviceId: ret.deviceId,
  createdAt: ret.createdAt,
  updatedAt: ret.updatedAt,
});

const VisitorModel = new ajModel("Visitor", visitorSchemaDefinition, visitorTransform);

module.exports = VisitorModel.getModel();
