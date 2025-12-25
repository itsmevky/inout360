const mongoose = require("mongoose");
const Validator = require("../../helpers/validators");
const EnquiryModel = require("./model");

exports.create = async (req, res) => {
  try {
    const { userId, employeeId, message } = req.body || {};

    const rules = {
      userId: "required|string",
      employeeId: "required|string",
      message: "required|string",
    };
    const validator = new Validator({ userId, employeeId, message }, rules);
    await validator.validate();

    if (!mongoose.isValidObjectId(userId)) {
      return res.status(400).json({ status: false, message: "userId must be valid" });
    }

    const enquiry = await EnquiryModel.create({
      userId,
      employeeId: String(employeeId).trim(),
      message: String(message).trim(),
    });

    return res.status(201).json({
      status: true,
      message: "Sent successfully",
      data: {
        _id: enquiry._id,
        userId: enquiry.userId,
        employeeId: enquiry.employeeId,
      },
    });
  } catch (error) {
    if (error.errors) {
      return res.status(400).json({
        status: false,
        message: error.message || "Validation failed",
        errors: error.errors,
      });
    }
    return res.status(500).json({ status: false, message: error.message });
  }
};

exports.getAll = async (req, res) => {
  try {
    const enquiries = await EnquiryModel.find()
      .sort({ createdAt: -1 })
      .lean();

    return res.status(200).json({
      status: true,
      data: enquiries,
    });
  } catch (error) {
    return res.status(500).json({ status: false, message: error.message });
  }
};
