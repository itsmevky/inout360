const DeviceModel = require("../Modules/device/model");

const CHECK_INTERVAL_MS = 10 * 1000;
const OFFLINE_TIMEOUT_MS = 80 * 1000;

let timer = null;
let running = false;

const runCheck = async () => {
  if (running) return;
  running = true;
  try {
    const cutoff = new Date(Date.now() - OFFLINE_TIMEOUT_MS);
    await DeviceModel.updateMany(
      {
        status: "ONLINE",
        lastSeen: { $lte: cutoff },
      },
      {
        $set: {
          status: "OFFLINE",
          "metadata.appState": "inactive_timeout",
          "metadata.inactiveAt": new Date(),
        },
      }
    );
  } catch (error) {
    console.error("Device presence monitor error:", error.message);
  } finally {
    running = false;
  }
};

const startDevicePresenceMonitor = () => {
  if (timer) return;
  timer = setInterval(runCheck, CHECK_INTERVAL_MS);
};

module.exports = { startDevicePresenceMonitor };
