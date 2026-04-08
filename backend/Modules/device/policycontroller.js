const Model = require("./policypackageModel");

/**
 * Validation helper for package names
 * @param {string} pkg 
 * @returns {boolean}
 */
const isValidPackageName = (pkg) => {
  if (typeof pkg !== "string") return false;
  const trimmed = pkg.trim();
  if (trimmed.length < 3) return false;
  if (trimmed.includes(" ")) return false;
  if (!trimmed.includes(".")) return false;
  return true;
};

/**
 * Clean and validate arrays of packages
 * @param {Array} packages 
 * @returns {Array}
 */
const cleanPackages = (packages) => {
  if (!Array.isArray(packages)) return [];
  return [
    ...new Set(
      packages
        .filter(isValidPackageName)
        .map((p) => p.trim().toLowerCase())
    ),
  ];
};

const getPolicyPackages = async (req, res) => {
  try {
    let config = await Model.findOne({ key: "policy_packages" });

    // If it's a device request, the format is slightly different
    const isDeviceRequest = req.originalUrl.includes("/api/device/");

    if (!config) {
      if (isDeviceRequest) {
        return res.json({
          success: true,
          version: 0,
          updatedAt: new Date().toISOString(),
          cameraPackages: [],
          restrictedPackages: [],
        });
      }
      return res.json({
        success: true,
        data: {
          key: "policy_packages",
          version: 0,
          updatedAt: new Date().toISOString(),
          cameraPackages: [],
          restrictedPackages: [],
        },
      });
    }

    if (isDeviceRequest) {
      return res.json({
        success: true,
        version: config.version,
        updatedAt: config.updatedAt,
        cameraPackages: config.cameraPackages,
        restrictedPackages: config.restrictedPackages,
      });
    }

    // Superadmin format
    return res.json({
      success: true,
      data: config,
    });
  } catch (error) {
    console.error("Error fetching policy packages:", error);
    return res.status(500).json({ success: false, message: "Internal server error" });
  }
};

const updatePolicyPackages = async (req, res) => {
  try {
    const { mode = "merge", cameraPackages = [], restrictedPackages = [] } = req.body;
    const user = req.user;

    let config = await Model.findOne({ key: "policy_packages" });

    if (!config) {
      config = new Model({
        key: "policy_packages",
        version: 0,
        cameraPackages: [],
        restrictedPackages: [],
      });
    }

    const validatedCamera = cleanPackages(cameraPackages);
    const validatedRestricted = cleanPackages(restrictedPackages);

    if (mode === "merge") {
      config.cameraPackages = [...new Set([...config.cameraPackages, ...validatedCamera])];
      config.restrictedPackages = [...new Set([...config.restrictedPackages, ...validatedRestricted])];
    } else if (mode === "replace") {
      config.cameraPackages = validatedCamera;
      config.restrictedPackages = validatedRestricted;
    } else {
      return res.status(400).json({ success: false, message: "Invalid mode. Use 'merge' or 'replace'." });
    }

    config.version += 1;
    config.updatedBy = {
      userId: user._id || user.id,
      role: user.role,
    };

    await config.save();

    return res.json({
      success: true,
      message: "Policy packages updated successfully",
      data: {
        version: config.version,
        updatedAt: config.updatedAt,
        cameraPackagesCount: config.cameraPackages.length,
        restrictedPackagesCount: config.restrictedPackages.length,
        cameraPackages: config.cameraPackages,
        restrictedPackages: config.restrictedPackages,
      },
    });
  } catch (error) {
    console.error("Error updating policy packages:", error);
    return res.status(500).json({ success: false, message: "Internal server error" });
  }
};

module.exports = {
  getPolicyPackages,
  updatePolicyPackages,
};
