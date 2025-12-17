const SettingsModel = require("./model");

const toBool = (v, fallback) => (typeof v === "boolean" ? v : fallback);

const normalizePayload = (body = {}) => {
  const deviceControls = body.deviceControls || {};
  const alerts = body.alerts || {};

  return {
    apiEndpointUrl: body.apiEndpointUrl,
    unitLocation: body.unitLocation,
    apkFileUrl: body.apkFileUrl,
    companyLogoUrl: body.companyLogoUrl,
    deviceControls: {
      cameraAccess: toBool(deviceControls.cameraAccess, true),
      allowAppUninstall: toBool(deviceControls.allowAppUninstall, false),
      locationAccess: toBool(deviceControls.locationAccess, true),
      allowScreenshots: toBool(deviceControls.allowScreenshots, false),
      blockUnknownApps: toBool(deviceControls.blockUnknownApps, true),
      autoSyncEnable: toBool(deviceControls.autoSyncEnable, true),
      whatsappCameraAccess: toBool(deviceControls.whatsappCameraAccess, false),
      facebookCameraAccess: toBool(deviceControls.facebookCameraAccess, false),
    },
    alerts: {
      appInstallAlert: toBool(alerts.appInstallAlert, true),
      appUninstallAlert: toBool(alerts.appUninstallAlert, true),
      screenshotAlert: toBool(alerts.screenshotAlert, false),
      cameraActivityAlert: toBool(alerts.cameraActivityAlert, false),
    },
    metadata: body.metadata,
  };
};

exports.get = async (_req, res) => {
  try {
    const record = await SettingsModel.findOne();
    res.status(200).json({ status: true, data: record || {} });
  } catch (error) {
    res.status(500).json({ status: false, message: error.message });
  }
};

exports.update = async (req, res) => {
  try {
    const payload = normalizePayload(req.body);
    const record = await SettingsModel.findOneAndUpdate({}, payload, {
      new: true,
      upsert: true,
      setDefaultsOnInsert: true,
    });
    res.status(200).json({ status: true, message: "Settings saved", data: record });
  } catch (error) {
    res.status(500).json({ status: false, message: error.message });
  }
};
