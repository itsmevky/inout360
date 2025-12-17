const { ajModel, mongoose } = require("../../common/classes/Model");

const deviceSchemaDefinition = {
  // Align ref name with the User model used elsewhere
  userId: { type: mongoose.Schema.Types.ObjectId, ref: "User", required: true, index: true },
  employeeId: { type: String, trim: true, index: true },
  deviceId: { type: String, trim: true, index: true },
  deviceName: { type: String, required: true, trim: true },
  deviceStatus: {
    type: String,
    enum: ["Active", "Disable"],
    default: "Disable",
  },
  type: {
    type: String,
    enum: ["MOBILE", "WEB", "TABLET", "DESKTOP", "OTHER"],
    default: "MOBILE",
  },
  platform: { type: String, trim: true },
  model: { type: String, trim: true },
  browser: { type: String, trim: true },
  osVersion: { type: String, trim: true },
  appVersion: { type: String, trim: true },
  fcmToken: { type: String, trim: true },
  ownerName: { type: String, trim: true },
  isDeviceOwner: { type: Boolean, default: false },
  deviceInfo: { type: mongoose.Schema.Types.Mixed, default: {} },
  devicePolicyState: {
    cameraDisabled: { type: Boolean, default: false },
    uninstallBlocked: { type: Boolean, default: false },
    kioskMode: { type: Boolean, default: false },
    allowedApps: { type: [String], default: [] },
    blockedApps: { type: [String], default: [] },
  },
  policyId: { type: mongoose.Schema.Types.ObjectId, ref: "Policy", default: null },
  status: {
    type: String,
    enum: ["ONLINE", "OFFLINE", "BLOCKED"],
    default: "OFFLINE",
  },
  verified: { type: Boolean, default: false },
  otpCode: { type: String, trim: true, default: null },
  otpExpiresAt: { type: Date, default: null },
  lastOnline: { type: Date, default: null },
  enrollmentDate: { type: Date, default: null },
  lastSeen: { type: Date, default: null },
  deviceOwner: { type: String, trim: true },
  cameraAllowed: { type: Boolean, default: true },
  locationAllowed: { type: Boolean, default: true },
  lastScreenshotAt: { type: Date, default: null },
  metadata: { type: mongoose.Schema.Types.Mixed, default: {} },
  raw: { type: mongoose.Schema.Types.Mixed, default: {} },
};

const deviceModel = new ajModel("UserDevice", deviceSchemaDefinition);
deviceModel.schema.index({ userId: 1, type: 1 });
deviceModel.schema.index({ employeeId: 1 });

module.exports = deviceModel.getModel();
