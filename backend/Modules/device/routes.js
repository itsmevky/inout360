const express = require("express");
const router = express.Router();
const Controller = require("./controller");
const OtpController = require("../otp/controller");
const DeviceEventController = require("./deviceEventController");
const PolicyController = require("./policycontroller");
router.get("/policy-packages", PolicyController.getPolicyPackages);
const verifyToken = require("../../middleware/verifyToken");
const checkAuthorization = require("../../middleware/checkAuthorization");
const adminRoles = ["admin", "superadmin"];
const readRoles = ["admin", "superadmin", "hr", "manager"];

router.get("/", verifyToken, checkAuthorization(readRoles, "device"), Controller.getAll);
router.get("/status", Controller.deviceStatus);
router.get("/:id", verifyToken, checkAuthorization(readRoles, "device"), Controller.getById);
router.post("/register", Controller.register);
router.post("/verify-token", Controller.verifyRegisterToken);
router.post("/add", Controller.add);
router.post("/uninstall", Controller.uninstallDevice);
router.post("/track", Controller.track);
router.post("/ping", Controller.pingDevice);
router.post("/:id/policy", verifyToken, checkAuthorization(adminRoles, "device"), Controller.setDevicePolicy);
router.get("/:id/policy", verifyToken, checkAuthorization(adminRoles, "device"), Controller.getDevicePolicy);
router.put("/:id/policy/toggle", verifyToken, checkAuthorization(adminRoles, "device"), Controller.toggleDevicePolicy);
router.post("/:id/test-notification", verifyToken, checkAuthorization(adminRoles, "device"), Controller.sendTestNotification);
router.post("/device-event", DeviceEventController.storeEvent);
router.get("/device-event/latest-screenshot", DeviceEventController.getLatestScreenshot);
router.get("/admin/camera-events", verifyToken, checkAuthorization(["superadmin"], "device"), DeviceEventController.getCameraEvents);


// Admin routes for policy packages
router.get("/admin/policy-packages", verifyToken, checkAuthorization(adminRoles, "device"), PolicyController.getAdminPolicyPackages);
router.post("/admin/policy-packages", verifyToken, checkAuthorization(adminRoles, "device"), PolicyController.updatePolicyPackages);
router.delete("/admin/policy-packages", verifyToken, checkAuthorization(adminRoles, "device"), PolicyController.deletePolicyPackages);

router.post("/send-otp", OtpController.sendOtp);
router.post("/verify-otp", OtpController.verifyOtp);
router.delete("/:id", verifyToken, checkAuthorization(adminRoles, "device"), Controller.remove);

module.exports = router;
