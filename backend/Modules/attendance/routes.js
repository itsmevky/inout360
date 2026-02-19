const express = require("express");
const router = express.Router();
const Controller = require("./controller");
const verifyToken = require("../../middleware/verifyToken");
const checkAuthorization = require("../../middleware/checkAuthorization");

const adminRoles = ["admin", "superadmin"];

router.post(
  "/",
  verifyToken,
  checkAuthorization(adminRoles, "attendance"),
  Controller.add
);

// Alias for /attendance/add
router.post(
  "/add",
  verifyToken,
  checkAuthorization(adminRoles, "attendance"),
  Controller.add
);

router.get(
  "/",
  verifyToken,
  checkAuthorization(adminRoles, "attendance"),
  Controller.getAll
);

router.get(
  "/all",
  verifyToken,
  checkAuthorization(adminRoles, "attendance"),
  Controller.getAll
);

router.get(
  "/search",
  verifyToken,
  checkAuthorization(adminRoles, "attendance"),
  Controller.getAll
);

router.get(
  "/:id",
  verifyToken,
  checkAuthorization(adminRoles, "attendance"),
  Controller.getbyid
);

router.put(
  "/:id",
  verifyToken,
  checkAuthorization(adminRoles, "attendance"),
  Controller.update
);

router.delete(
  "/:id",
  verifyToken,
  checkAuthorization(adminRoles, "attendance"),
  Controller.delete
);

router.post(
  "/delete",
  verifyToken,
  checkAuthorization(adminRoles, "attendance"),
  Controller.delete
);

module.exports = router;
