const Contractor = require("./model");
const Validator = require("../../Utils/Validator");

// Utility: Generate Contractor Code (e.g., CONT-001)
function generateContractorCode(prefix = "CONT") {
  return `${prefix}-${Date.now()}-${Math.floor(Math.random() * 100)}`;
}

// ✅ Create Contractor
exports.addContractor = async (req, res) => {
  const rules = {
    name: ["required"],
    contactPerson: ["string", { optional: true }],
    contactPhone: ["string", { optional: true }],
    gstNumber: ["string", { optional: true }],
    status: ["string", { optional: true }],
  };

  const validator = new Validator(req.body, rules);
  if (!validator.validate()) {
    return res.status(422).json({ errors: validator.getErrors() });
  }

  try {
    const code = generateContractorCode();

    const contractor = await Contractor.create({
      name: req.body.name,
      code,
      contactPerson: req.body.contactPerson || "",
      contactPhone: req.body.contactPhone || "",
      gstNumber: req.body.gstNumber || "",
      status: req.body.status || "ACTIVE",
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

// ✅ Get All Contractors
exports.getAllContractors = async (req, res) => {
  try {
    const contractors = await Contractor.find();
    res.json(contractors);
  } catch (error) {
    res.status(500).json({ message: "Error fetching contractors", error: error.message });
  }
};

// ✅ Get Contractor by ID
exports.getContractorById = async (req, res) => {
  try {
    const contractor = await Contractor.findById(req.params.id);
    if (!contractor) return res.status(404).json({ message: "Contractor not found" });
    res.json(contractor);
  } catch (error) {
    res.status(500).json({ message: "Error fetching contractor", error: error.message });
  }
};

// ✅ Update Contractor
exports.updateContractor = async (req, res) => {
  try {
    const contractor = await Contractor.findByIdAndUpdate(
      req.params.id,
      { $set: req.body },
      { new: true, runValidators: true }
    );
    if (!contractor) return res.status(404).json({ message: "Contractor not found" });

    res.json({ message: "Contractor updated", contractor });
  } catch (error) {
    res.status(500).json({ message: "Update failed", error: error.message });
  }
};

// ✅ Delete Contractor
exports.deleteContractor = async (req, res) => {
  try {
    const contractor = await Contractor.findByIdAndDelete(req.params.id);
    if (!contractor) return res.status(404).json({ message: "Contractor not found" });

    res.json({ message: "Contractor deleted successfully" });
  } catch (error) {
    res.status(500).json({ message: "Deletion failed", error: error.message });
  }
};