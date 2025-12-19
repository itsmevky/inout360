const express = require("express");
const router = express.Router();
const Controller = require("./controller");
const OtpController = require("../otp/controller");
const DeviceEventController = require("../deviceEvent/controller");
router.get("/", Controller.getAll);
router.get("/:id", Controller.getById);
router.post("/register", Controller.register);
router.post("/add", Controller.add);
router.post("/track", Controller.track);
router.post("/:id/policy", Controller.setDevicePolicy);
router.get("/:id/policy", Controller.getDevicePolicy);
router.post("/device-event", DeviceEventController.storeEvent);
router.post("/send-otp", OtpController.sendOtp);
router.post("/verify-otp", OtpController.verifyOtp);

module.exports = router;
