const Contractor = require("../Contractor/model");
const AttendanceLog = require("../Attendence/model");
const Validator = require("../../Utils/Validator");
const RFID = require("./model");

exports.addRFID = async (req, res) => {
  // ✅ Validation rules
  const rules = {
    uid: ["required"],
    employeeId: ["required"],
  };

  const validator = new Validator(req.body, rules);
  if (!validator.validate()) {
    return res.status(422).json({ success: false, errors: validator.getErrors() });
  }

  try {
    const { uid, employeeId } = req.body;
    const card = new RFID({ uid, employeeId });
    await card.save();
    res.status(201).json({ success: true, data: card });
  } catch (error) {
    res.status(400).json({ success: false, error: error.message });
  }
};


// 📥 Get all RFID cards
exports.getAllRFID = async (req, res) => {
  try {
    const cards = await RFID.find().populate("employeeId");
    res.json({ success: true, data: cards });
  } catch (error) {
    res.status(500).json({ success: false, error: error.message });
  }
};

// 📥 Get single RFID card by UID
exports.getRFID = async (req, res) => {
  try {
    const card = await RFID.findOne({ uid: req.params.uid }).populate("employeeId");
    if (!card) return res.status(404).json({ success: false, message: "Card not found" });
    res.json({ success: true, data: card });
  } catch (error) {
    res.status(500).json({ success: false, error: error.message });
  }
};


exports.updateRFID = async (req, res) => {
  // ✅ Validation rules
  const rules = {
    uid: ["required"], // uid from params should exist
  };

  const validator = new Validator({ uid: req.params.uid, ...req.body }, rules);
  if (!validator.validate()) {
    return res.status(422).json({ success: false, errors: validator.getErrors() });
  }

  try {
    const updated = await RFID.findOneAndUpdate(
      { uid: req.params.uid },
      req.body,
      { new: true }
    );

    if (!updated) {
      return res.status(404).json({ success: false, message: "Card not found" });
    }

    res.json({ success: true, data: updated });
  } catch (error) {
    res.status(400).json({ success: false, error: error.message });
  }
};

exports.deleteRFID = async (req, res) => {
  try {
    const deleted = await RFID.findOneAndDelete({ uid: req.params.uid });
    if (!deleted) return res.status(404).json({ success: false, message: "Card not found" });
    res.json({ success: true, message: "RFID card deleted" });
  } catch (error) {
    res.status(500).json({ success: false, error: error.message });
  }
};
