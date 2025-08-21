const express = require("express");
const router = express.Router();
const { registerUser, loginUser, getUsers } = require("./Controller");

router.post("/register", registerUser);

router.post("/login", loginUser);
router.get("/users", getUsers);
module.exports = router;
