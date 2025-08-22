const express = require("express");
const router = express.Router();
const rfidController = require("./Controller");


router.post("/", rfidController.addRFID);

router.get("/", rfidController.getAllRFID);

router.get("/:uid", rfidController.getRFID);

router.put("/:uid", rfidController.updateRFID);

router.delete("/:uid", rfidController.deleteRFID);

module.exports = router;