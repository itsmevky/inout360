const crypto = require("crypto");

/**
 * Generate a unique RFID code
 * Format: EMP + YYYYMMDD + 5-digit random hex
 * Example: EMP20250716-A1F3B
 */
function generateRFID(prefix = "EMP") {
  const date = new Date();
  const dateStr = date.toISOString().split("T")[0].replace(/-/g, ""); // YYYYMMDD
  const randomStr = crypto
    .randomBytes(3)
    .toString("hex")
    .toUpperCase()
    .slice(0, 5); // 5-char random
  return `${prefix}${dateStr}-${randomStr}`;
}

module.exports = generateRFID;
