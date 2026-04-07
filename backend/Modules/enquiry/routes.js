const express = require("express");
const router = express.Router();
const Controller = require("./controller");
const verifyToken = require("../../middleware/verifyToken");
const checkAuthorization = require("../../middleware/checkAuthorization");

const allRoles = ["admin", "superadmin", "hr", "manager"];
router.post("/", Controller.create);
router.get("/", verifyToken, checkAuthorization(allRoles, "employees", "read"), Controller.getAll);

module.exports = router;