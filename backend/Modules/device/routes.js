const express = require("express");
const router = express.Router();
const Controller = require("./controller");

router.get("/", Controller.getAll);
router.get("/:id", Controller.getById);
router.post("/register", Controller.register);
router.post("/send-otp", Controller.sendOtp);
router.post("/add", Controller.add);
router.post("/track", Controller.track);
router.post("/verify-otp", Controller.verifyOtp);

module.exports = router;
