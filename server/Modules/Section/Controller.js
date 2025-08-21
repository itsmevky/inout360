const Section = require("./model");
const Validator = require("../../Utils/Validator");

// @desc    Add a new section
// @route   POST /api/sections/add
// @access  Public or Admin
exports.addSection = async (req, res) => {
  const rules = {
    name: ["required"],
  };

  const validator = new Validator(req.body, rules);
  if (!validator.validate()) {
    return res.status(422).json({ errors: validator.getErrors() });
  }

  try {
    const exists = await Section.findOne({ name: req.body.name.trim() });
    if (exists)
      return res.status(400).json({ message: "Section already exists" });

    const section = await Section.create({ name: req.body.name.trim() });

    res.status(201).json({ message: "Section created", section });
  } catch (error) {
    res.status(500).json({ message: "Server error", error: error.message });
  }
};

// @desc    Get all sections
// @route   GET /api/sections/all
exports.getAllSections = async (req, res) => {
  try {
    const sections = await Section.find().sort({ name: 1 });
    res.json(sections);
  } catch (error) {
    res
      .status(500)
      .json({ message: "Failed to fetch sections", error: error.message });
  }
};

// @desc    Get section by ID
// @route   GET /api/sections/:id
exports.getSectionById = async (req, res) => {
  try {
    const section = await Section.findById(req.params.id);
    if (!section) return res.status(404).json({ message: "Section not found" });
    res.json(section);
  } catch (error) {
    res
      .status(500)
      .json({ message: "Error fetching section", error: error.message });
  }
};

// @desc    Update section
// @route   PUT /api/sections/:id
exports.updateSection = async (req, res) => {
  try {
    const section = await Section.findByIdAndUpdate(
      req.params.id,
      { name: req.body.name.trim() },
      { new: true }
    );
    res.json({ message: "Section updated", section });
  } catch (error) {
    res.status(500).json({ message: "Update failed", error: error.message });
  }
};

// @desc    Delete section
// @route   DELETE /api/sections/:id
exports.deleteSection = async (req, res) => {
  try {
    await Section.findByIdAndDelete(req.params.id);
    res.json({ message: "Section deleted" });
  } catch (error) {
    res.status(500).json({ message: "Delete failed", error: error.message });
  }
};
