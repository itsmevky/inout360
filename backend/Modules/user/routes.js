const express = require("express");
const router = express.Router();
const {
  registerUser,
  loginUser,
  logoutUser,
  getUsers,
} = require("./controller");

router.post("/register", registerUser);
router.post("/login", loginUser);
router.post("/logout", logoutUser);
router.get("/", getUsers);

module.exports = router;
