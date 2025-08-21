const express = require("express");
const router = express.Router();
const contractorController = require("./controller");

router.post("/add", contractorController.addContractor);
router.get("/all", contractorController.getAllContractors);
router.get("/:id", contractorController.getContractorById);
router.put("/:id", contractorController.updateContractor);
router.delete("/:id", contractorController.deleteContractor);

module.exports = router;
