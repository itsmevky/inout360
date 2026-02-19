const DeviceModel = require("../Modules/device/model");

const CHECK_INTERVAL_MS = 60 * 1000; // Check every 1 minute
const OFFLINE_TIMEOUT_MS = 2 * 60 * 1000; // 2 minutes

let timer = null;
let running = false;
let DeviceEventModel = null;

const runCheck = async () => {
  if (running) return;
  running = true;
  if (!DeviceEventModel) {
    try {
      DeviceEventModel = require("../Modules/device/deviceEventModel");
    } catch (e) {
      console.warn("DeviceEventModel not loaded in monitor");
    }
  }

  try {
    const cutoff = new Date(Date.now() - OFFLINE_TIMEOUT_MS);

    // Find devices that are about to be marked offline to log events
    const devicesToOffline = await DeviceModel.find({
      status: "ONLINE",
      lastSeen: { $lte: cutoff },
    }).select("_id deviceId userId employeeId name").lean();

    if (devicesToOffline.length > 0) {
      const bulkOps = devicesToOffline.map(d => ({
        updateOne: {
          filter: { _id: d._id },
          update: {
            $set: {
              status: "OFFLINE",
              "metadata.appState": "inactive_timeout",
              "metadata.inactiveAt": new Date(),
            }
          }
        }
      }));

      await DeviceModel.bulkWrite(bulkOps);

      // Log events for dashboard notification
      if (DeviceEventModel) {
        const events = devicesToOffline.map(d => ({
          deviceId: d._id,
          event: "device_offline_auto",
          name: d.name || "Unknown",
          employeeId: d.employeeId || "",
          timestamp: new Date(),
          metadata: {
            reason: "inactive_timeout",
            deviceId: d.deviceId,
            lastSeen: d.lastSeen
          },
          raw: { autoBlocked: true }
        }));
        await DeviceEventModel.insertMany(events);
      }

      console.log(`[Monitor] Marked ${devicesToOffline.length} devices as OFFLINE`);
    }

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
