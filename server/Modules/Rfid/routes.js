const express = require("express");
const router = express.Router();
const rfidController = require("./Controller");

// Punch in or out based on location: entry, section, or exit
router.post("/punch", rfidController.punchRFID);

module.exports = router;
