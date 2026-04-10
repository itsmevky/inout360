const { ajModel, mongoose } = require("../../common/classes/Model");

const policyPackagesSchemaDefinition = {
  key: {
    type: String,
    required: true,
    unique: true,
    default: "policy_packages",
  },
  version: {
    type: Number,
    default: 1,
  },
  cameraPackages: {
    type: [String],
    default: [],
  },
  restrictedPackages: {
    type: [String],
    default: [],
  },
  removedPackages: {
    type: [String],
    default: [],
  },
  updatedBy: {
    userId: { type: String },
    role: { type: String },
  },
};

const policyPackagesTransform = (ret) => {
  return {
    key: ret.key,
    version: ret.version,
    updatedAt: ret.updatedAt,
    cameraPackages: ret.cameraPackages || [],
    restrictedPackages: ret.restrictedPackages || [],
    removedPackages: ret.removedPackages || [],
    updatedBy: ret.updatedBy,
  };
};

const PolicyPackagesModel = new ajModel(
  "PolicyPackages",
  policyPackagesSchemaDefinition,
  policyPackagesTransform
).getModel();

module.exports = PolicyPackagesModel;
