const express = require("express");
const router = express.Router();
const Controller = require("./controller");

router.get("/", Controller.getAll);
router.get("/:id", Controller.getById);
router.post("/add", Controller.add);
router.put("/:id", Controller.update);
router.delete("/:id", Controller.remove);

module.exports = router;
