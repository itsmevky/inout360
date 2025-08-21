const Contractor = require("./model");
const Validator = require("../../Utils/Validator");

// Create Contractor
function generateRFID(prefix = "CNT") {
  return `${prefix}-${Date.now()}-${Math.floor(Math.random() * 100)}`;
}

exports.addContractor = async (req, res) => {
  const rules = {
    firstName: ["required"],
    lastName: ["required"],
    section: ["required"],
    phoneNumber: ["string", { min: 10 }],
    email: ["string", { optional: true }],
    fullAddress: ["string", { optional: true }],
    city: ["string", { optional: true }],
    state: ["string", { optional: true }],
    middleName: ["string", { optional: true }],
  };

  const validator = new Validator(req.body, rules);
  if (!validator.validate()) {
    return res.status(422).json({ errors: validator.getErrors() });
  }

  try {
    const rfid = generateRFID();

    const contractor = await Contractor.create({
      firstName: req.body.firstName,
      middleName: req.body.middleName || "",
      lastName: req.body.lastName,
      email: req.body.email || "",
      phoneNumber: req.body.phoneNumber || "",
      fullAddress: req.body.fullAddress || "",
      city: req.body.city || "",
      state: req.body.state || "",
      rfid,
      section: req.body.section,
      onboardedAt: new Date(),
    });

    res.status(201).json({
      message: "Contractor added successfully",
      contractor,
    });
  } catch (error) {
    res.status(500).json({
      message: "Error adding contractor",
      error: error.message,
    });
  }
};

// Get All Contractors
exports.getAllContractors = async (req, res) => {
  try {
    const contractors = await Contractor.find().populate("section");
    res.json(contractors);
  } catch (error) {
    res
      .status(500)
      .json({ message: "Error fetching contractors", error: error.message });
  }
};

// Get Contractor by ID
exports.getContractorById = async (req, res) => {
  try {
    const contractor = await Contractor.findById(req.params.id).populate(
      "section"
    );
    if (!contractor) return res.status(404).json({ message: "Not found" });
    res.json(contractor);
  } catch (error) {
    res
      .status(500)
      .json({ message: "Error fetching contractor", error: error.message });
  }
};

// Update Contractor
exports.updateContractor = async (req, res) => {
  try {
    const contractor = await Contractor.findByIdAndUpdate(
      req.params.id,
      { $set: req.body },
      { new: true }
    );
    res.json({ message: "Contractor updated", contractor });
  } catch (error) {
    res.status(500).json({ message: "Update failed", error: error.message });
  }
};

// Delete Contractor
exports.deleteContractor = async (req, res) => {
  try {
    await Contractor.findByIdAndDelete(req.params.id);
    res.json({ message: "Contractor deleted" });
  } catch (error) {
    res.status(500).json({ message: "Deletion failed", error: error.message });
  }
};
