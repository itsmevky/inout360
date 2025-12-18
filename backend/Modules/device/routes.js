const express = require("express");
const router = express.Router();
const Controller = require("./controller");
const verifyToken = require("../../middleware/verifyToken");
const checkAuthorization = require("../../middleware/checkAuthorization");

const requireSuperadmin = (req, res, next) => {
  if (req.user?.role === "superadmin") return next();
  return res.status(403).json({ status: "error", message: "Forbidden: superadmin only" });
};

router.get("/", Controller.getAll);
router.get("/:id", Controller.getById);
router.post("/register", Controller.register);
router.post("/send-otp", Controller.sendOtp);
router.post("/add", Controller.add);
router.post("/track", Controller.track);
router.post("/verify-otp", Controller.verifyOtp);
router.post(
  "/otp-email",
  verifyToken,
  requireSuperadmin,
  Controller.setOtpEmail
);
router.get(
  "/otp-email",
  verifyToken,
  requireSuperadmin,
  Controller.getOtpEmail
);

module.exports = router;
