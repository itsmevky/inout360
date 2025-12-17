const express = require("express");
const router = express.Router();
const Controller = require("./controller");
const verifyToken = require("../../middleware/verifyToken");
const checkAuthorization = require("../../middleware/checkAuthorization");

const allRoles = ["admin", "hr", "supervisor", "employee", "manager", "superadmin", "contractor"];

router.post(
  "/",
  verifyToken,
  checkAuthorization(allRoles, "employees"),
  Controller.add
);

// Alias for /employees/add
router.post(
  "/add",
  verifyToken,
  checkAuthorization(allRoles, "employees"),
  Controller.add
);

router.get(
  "/",
  verifyToken,
  checkAuthorization(allRoles, "employees"),
  Controller.getAll
);

router.get(
  "/all",
  verifyToken,
  checkAuthorization(allRoles, "employees"),
  Controller.getAll
);

router.get(
  "/search",
  verifyToken,
  checkAuthorization(allRoles, "employees"),
  Controller.getAll
);

router.get(
  "/:id",
  verifyToken,
  checkAuthorization(allRoles, "employees"),
  Controller.getbyid
);

router.put(
  "/:id",
  verifyToken,
  checkAuthorization(allRoles, "employees"),
  Controller.update
);

router.put(
  "/status",
  verifyToken,
  checkAuthorization(allRoles, "employees"),
  Controller.updateStatus
);

router.delete(
  "/:id",
  verifyToken,
  checkAuthorization(allRoles, "employees"),
  Controller.delete
);

router.post(
  "/delete",
  verifyToken,
  checkAuthorization(allRoles, "employees"),
  Controller.delete
);

module.exports = router;
