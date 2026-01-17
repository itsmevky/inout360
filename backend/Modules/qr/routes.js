const express = require("express");
const router = express.Router();
const { generateQr, generateQrPng, generateStaticQrPng, consumeQr } = require("./controller");
const verifyToken = require("../../middleware/verifyToken");

// QR generate requires logged-in user to resolve location
router.post("/generate", verifyToken, generateQr);
router.post("/generate-png", verifyToken, generateQrPng);
router.get("/static-png", generateStaticQrPng);
router.post("/consume", consumeQr);

module.exports = router;
