const SettingsModel = require("./model");

const toBool = (v, fallback) => {
  if (typeof v === "boolean") return v;
  if (typeof v === "string") {
    if (v.toLowerCase() === "true") return true;
    if (v.toLowerCase() === "false") return false;
  }
  if (typeof v === "number") return v === 1;
  return fallback;
};

const normalizePayload = (body = {}) => {
  const deviceControls =
    typeof body.deviceControls === "string"
      ? JSON.parse(body.deviceControls)
      : body.deviceControls || {};
  const alerts =
    typeof body.alerts === "string"
      ? JSON.parse(body.alerts)
      : body.alerts || {};
  const qrExpirySeconds =
    Number.isFinite(Number(body.qrExpirySeconds)) && Number(body.qrExpirySeconds) > 0
      ? Number(body.qrExpirySeconds)
      : undefined;
  const otpEmail = body.otpEmail ? String(body.otpEmail).trim().toLowerCase() : undefined;

  return {
    apiEndpointUrl: body.apiEndpointUrl,
    unitLocation: body.unitLocation,
    apkFileUrl: body.apkFileUrl,
    companyLogoUrl: body.companyLogoUrl,
    qrExpirySeconds,
    otpEmail,
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

exports.get = async (req, res) => {
  try {
    const unitLocation = req.query?.unitLocation;
    const filter = unitLocation ? { unitLocation } : {};
    const record = await SettingsModel.findOne(filter);
    res.status(200).json({ status: true, data: record || {} });
  } catch (error) {
    res.status(500).json({ status: false, message: error.message });
  }
};

exports.update = async (req, res) => {
  try {
    const payload = normalizePayload(req.body);
    const unitLocation = payload.unitLocation || "";
    const apkFile = req.files?.apkFile?.[0];
    const companyLogo = req.files?.companyLogo?.[0];

    if (apkFile) {
      payload.apkFileUrl = `/uploads/settings/${apkFile.filename}`;
    }
    if (companyLogo) {
      payload.companyLogoUrl = `/uploads/settings/${companyLogo.filename}`;
    }
    const record = await SettingsModel.findOneAndUpdate(
      { unitLocation },
      payload,
      {
      new: true,
      upsert: true,
      setDefaultsOnInsert: true,
      }
    );
    res.status(200).json({ status: true, message: "Settings saved", data: record });
  } catch (error) {
    res.status(500).json({ status: false, message: error.message });
  }
};
