const express = require("express");
const router = express.Router();
const { registerUser, loginUser, getUsers } = require("./controller");

router.post("/register", registerUser);
router.post("/login", loginUser);
router.get("/", getUsers);

module.exports = router;
