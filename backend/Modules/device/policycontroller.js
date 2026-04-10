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
    const config = await Model.findOne({ key: "policy_packages" });

    if (!config) {
      return res.json({
        success: true,
        version: 0,
        updatedAt: new Date().toISOString(),
        cameraPackages: [],
        restrictedPackages: [],
        removedPackages: [],
      });
    }

    return res.json({
      success: true,
      version: config.version,
      updatedAt: config.updatedAt,
      cameraPackages: config.cameraPackages,
      restrictedPackages: config.restrictedPackages,
      removedPackages: config.removedPackages,
    });
  } catch (error) {
    console.error("Error fetching policy packages:", error);
    return res.status(500).json({ success: false, message: "Internal server error" });
  }
};

const getAdminPolicyPackages = async (req, res) => {
  try {
    const config = await Model.findOne({ key: "policy_packages" });
    return res.json({
      success: true,
      data: config || {
        cameraPackages: [],
        restrictedPackages: [],
        removedPackages: [],
        version: 0,
      },
    });
  } catch (error) {
    console.error("Error fetching admin policy packages:", error);
    return res.status(500).json({ success: false, message: "Internal server error" });
  }
};

const updatePolicyPackages = async (req, res) => {
  try {
    const {
      mode = "merge",
      cameraPackages = [],
      restrictedPackages = [],
      removedPackages = [],
    } = req.body;
    const user = req.user;

    let config = await Model.findOne({ key: "policy_packages" });

    if (!config) {
      config = new Model({
        key: "policy_packages",
        version: 0,
        cameraPackages: [],
        restrictedPackages: [],
        removedPackages: [],
      });
    }

    const validatedCamera = cleanPackages(cameraPackages);
    const validatedRestricted = cleanPackages(restrictedPackages);
    const validatedRemoved = cleanPackages(removedPackages);

    // If removedPackages are explicitly provided, remove them from the current state
    if (validatedRemoved.length > 0) {
      config.cameraPackages = config.cameraPackages.filter(
        (pkg) => !validatedRemoved.includes(pkg)
      );
      config.restrictedPackages = config.restrictedPackages.filter(
        (pkg) => !validatedRemoved.includes(pkg)
      );
      config.removedPackages = validatedRemoved;
    }

    if (mode === "merge") {
      config.cameraPackages = [
        ...new Set([...config.cameraPackages, ...validatedCamera]),
      ];
      config.restrictedPackages = [
        ...new Set([...config.restrictedPackages, ...validatedRestricted]),
      ];
    } else if (mode === "replace") {
      config.cameraPackages = validatedCamera;
      config.restrictedPackages = validatedRestricted;
    } else {
      return res
        .status(400)
        .json({ success: false, message: "Invalid mode. Use 'merge' or 'replace'." });
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
      data: config,
    });
  } catch (error) {
    console.error("Error updating policy packages:", error);
    return res.status(500).json({ success: false, message: "Internal server error" });
  }
};

const deletePolicyPackages = async (req, res) => {
  try {
    const config = await Model.findOne({ key: "policy_packages" });
    if (!config) return res.json({ success: true, message: "Already empty" });

    config.cameraPackages = [];
    config.restrictedPackages = [];
    config.removedPackages = [];
    config.version += 1;
    config.updatedBy = {
      userId: req.user._id || req.user.id,
      role: req.user.role,
    };

    await config.save();

    return res.json({
      success: true,
      message: "Policy packages cleared successfully",
    });
  } catch (error) {
    console.error("Error deleting policy packages:", error);
    return res.status(500).json({ success: false, message: "Internal server error" });
  }
};

module.exports = {
  getPolicyPackages,
  getAdminPolicyPackages,
  updatePolicyPackages,
  deletePolicyPackages,
};
