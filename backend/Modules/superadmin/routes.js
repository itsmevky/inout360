const express = require("express");
const router = express.Router();
const PolicyController = require("../policyPackages/controller");
const verifyToken = require("../../middleware/verifyToken");
const checkAuthorization = require("../../middleware/checkAuthorization");

// Superadmin only routes
router.get(
  "/policy-packages",
  verifyToken,
  checkAuthorization(["superadmin"], "superadmin"),
  PolicyController.getPolicyPackages
);

router.post(
  "/policy-packages",
  verifyToken,
  checkAuthorization(["superadmin"], "superadmin"),
  PolicyController.updatePolicyPackages
);

module.exports = router;
