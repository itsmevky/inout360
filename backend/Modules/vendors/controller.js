const mongoose = require("mongoose");
const VendorModel = require("./model");

const normalizeVendorCode = (value) => String(value || "").trim().toUpperCase();
const normalizeName = (value) => String(value || "").trim();

const format = (doc) => {
  const d = typeof doc.toObject === "function" ? doc.toObject() : doc;
  return { ...d, id: d._id?.toString?.() || d.id };
};

// Public endpoint for registration flows: verify a vendorCode and return vendor details.
exports.verifyPublic = async (req, res) => {
  try {
    const vendorCode = normalizeVendorCode(req.query?.vendorCode);
    if (!vendorCode) {
      return res.status(400).json({ status: false, message: "vendorCode is required" });
    }

    const vendor = await VendorModel.findOne({ vendorCode })
      .select("name vendorCode")
      .lean();
    if (!vendor) {
      return res.status(404).json({ status: false, message: "Invalid vendorCode" });
    }

    return res.status(200).json({
      status: true,
      message: "Vendor verified",
      data: {
        id: String(vendor._id),
        name: vendor.name,
        vendorCode: vendor.vendorCode,
      },
    });
  } catch (error) {
    return res.status(500).json({ status: false, message: error.message });
  }
};

exports.add = async (req, res) => {
  try {
    const name = normalizeName(req.body?.name);
    const vendorCode = normalizeVendorCode(req.body?.vendorCode);
    if (!name) {
      return res.status(400).json({ status: false, message: "Company name is required" });
    }
    if (!vendorCode) {
      return res.status(400).json({ status: false, message: "vendorCode is required" });
    }

    const exists = await VendorModel.findOne({ vendorCode }).select("_id").lean();
    if (exists) {
      return res.status(400).json({ status: false, message: "vendorCode already exists" });
    }

    const vendor = await VendorModel.create({ name, vendorCode, raw: req.body });
    return res.status(201).json({ status: true, message: "Vendor created", data: format(vendor) });
  } catch (error) {
    return res.status(500).json({ status: false, message: error.message });
  }
};

exports.getAll = async (req, res) => {
  try {
    const search = String(req.query?.search || "").trim();
    const filter = {};
    if (search) {
      filter.$or = [
        { name: { $regex: search, $options: "i" } },
        { vendorCode: { $regex: search, $options: "i" } },
      ];
    }

    const vendors = await VendorModel.find(filter)
      .select("name vendorCode")
      .sort({ name: 1 })
      .lean();

    return res.status(200).json({
      status: true,
      vendors: vendors.map((v) => ({
        id: String(v._id),
        name: v.name,
        vendorCode: v.vendorCode,
      })),
    });
  } catch (error) {
    return res.status(500).json({ status: false, message: error.message });
  }
};

exports.getById = async (req, res) => {
  try {
    const { id } = req.params;
    const query = mongoose.isValidObjectId(id) ? { _id: id } : { vendorCode: normalizeVendorCode(id) };
    const vendor = await VendorModel.findOne(query).select("name vendorCode").lean();
    if (!vendor) {
      return res.status(404).json({ status: false, message: "Not found" });
    }
    return res.status(200).json({ status: true, data: format(vendor) });
  } catch (error) {
    return res.status(500).json({ status: false, message: error.message });
  }
};

exports.update = async (req, res) => {
  try {
    const { id } = req.params;
    const name = normalizeName(req.body?.name);
    if (!name) {
      return res.status(400).json({ status: false, message: "Company name is required" });
    }

    const vendor = await VendorModel.findByIdAndUpdate(
      id,
      { $set: { name, raw: req.body } },
      { new: true, runValidators: true }
    ).lean();
    if (!vendor) {
      return res.status(404).json({ status: false, message: "Not found" });
    }
    return res.status(200).json({ status: true, message: "Vendor updated", data: format(vendor) });
  } catch (error) {
    return res.status(500).json({ status: false, message: error.message });
  }
};

exports.remove = async (req, res) => {
  try {
    const { id } = req.params;
    const vendor = await VendorModel.findByIdAndDelete(id).lean();
    if (!vendor) {
      return res.status(404).json({ status: false, message: "Not found" });
    }
    return res.status(200).json({ status: true, message: "Vendor deleted" });
  } catch (error) {
    return res.status(500).json({ status: false, message: error.message });
  }
};
