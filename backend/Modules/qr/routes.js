const express = require("express");
const router = express.Router();
const { generateQr, generateQrPng, consumeQr } = require("./controller");

// No auth: QR generate/consume handled via separate flow
router.post("/generate", generateQr);
router.post("/generate-png", generateQrPng);
router.post("/consume", consumeQr);

module.exports = router;
