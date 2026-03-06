const { ajModel } = require("../../common/classes/Model");

const vendorSchemaDefinition = {
  name: { type: String, required: true, trim: true },
  vendorCode: {
    type: String,
    required: true,
    trim: true,
    uppercase: true,
    unique: true,
    index: true,
  },
  raw: { type: Object, default: {} },
};

const vendorModel = new ajModel("Vendor", vendorSchemaDefinition);

module.exports = vendorModel.getModel();

