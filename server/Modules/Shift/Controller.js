const Shift = require("./model"); // Shift model
const Validator = require("../../Utils/Validator");

 
// @route   POST /api/shifts
exports.addShift = async (req, res) => {
  const rules = {
    shiftName: ["required"],
    startTime: ["required"],
    endTime: ["required"],
    sectionId: ["required"],
    supervisorId: ["required"],
  };

  const validator = new Validator(req.body, rules);
  if (!validator.validate()) {
    return res.status(422).json({ errors: validator.getErrors() });
  }

  try {
    // ✅ Check if shift with same name already exists in that section
    const exists = await Shift.findOne({
      shiftName: req.body.shiftName.trim(),
      sectionId: req.body.sectionId,
    });

    if (exists) {
      return res.status(400).json({ message: "Shift already exists in this section" });
    }

    const shift = await Shift.create({
      shiftName: req.body.shiftName.trim(),
      sectionId: req.body.sectionId,
      supervisorId: req.body.supervisorId,
      contractors: req.body.contractors || [],
      startTime: req.body.startTime,
      endTime: req.body.endTime,
      breakTimes: req.body.breakTimes || [],
      plannedHeadcount: req.body.plannedHeadcount || 0,
      actualHeadcount: req.body.actualHeadcount || 0,
      status: req.body.status || "scheduled",
      overtimeAllowed: req.body.overtimeAllowed || false,
      notes: req.body.notes?.trim(),
    });

    res.status(201).json({ message: "✅ Shift created successfully", shift });
  } catch (error) {
    res.status(500).json({ message: "❌ Server error", error: error.message });
  }
};

// @desc    Get all shifts
// @route   GET /api/shifts/all
exports.getAllShifts = async (req, res) => {
  try {
    const shifts = await Shift.find()
      .populate("sectionId", "name code")
      .populate("supervisorId", "name email")
      .sort({ startTime: 1 });
    res.json(shifts);
  } catch (error) {
    res.status(500).json({ message: "Failed to fetch shifts", error: error.message });
  }
};

// @desc    Get shift by ID
// @route   GET /api/shifts/:id
exports.getShiftById = async (req, res) => {
  try {
    const shift = await Shift.findById(req.params.id)
      .populate("sectionId", "name code")
      .populate("supervisorId", "name email");

    if (!shift) return res.status(404).json({ message: "Shift not found" });
    res.json(shift);
  } catch (error) {
    res.status(500).json({ message: "Error fetching shift", error: error.message });
  }
};

// @desc    Update shift
// @route   PUT /api/shifts/:id
// @desc    Update shift
// @route   PUT /api/shifts/:id
exports.updateShift = async (req, res) => {
  try {
    const updateData = {
      ...(req.body.shiftName && { shiftName: req.body.shiftName.trim() }),
      ...(req.body.sectionId && { sectionId: req.body.sectionId }),
      ...(req.body.supervisorId && { supervisorId: req.body.supervisorId }),
      ...(req.body.contractors && { contractors: req.body.contractors }), // array of contractor IDs
      ...(req.body.startTime && { startTime: req.body.startTime }),
      ...(req.body.endTime && { endTime: req.body.endTime }),
      ...(req.body.breakTimes && { breakTimes: req.body.breakTimes }), // [{from, to}]
      ...(req.body.plannedHeadcount !== undefined && { plannedHeadcount: req.body.plannedHeadcount }),
      ...(req.body.actualHeadcount !== undefined && { actualHeadcount: req.body.actualHeadcount }),
      ...(req.body.status && { status: req.body.status }),
      ...(req.body.overtimeAllowed !== undefined && { overtimeAllowed: req.body.overtimeAllowed }),
      ...(req.body.notes && { notes: req.body.notes.trim() }),
    };

    const shift = await Shift.findByIdAndUpdate(req.params.id, updateData, { new: true })
      .populate("sectionId", "name code")
      .populate("supervisorId", "name email")
      .populate("contractors", "name email");

    if (!shift) {
      return res.status(404).json({ message: "Shift not found" });
    }

    res.json({ message: "✅ Shift updated successfully", shift });
  } catch (error) {
    res.status(500).json({ message: "❌ Update failed", error: error.message });
  }
};


// @desc    Delete shift
// @route   DELETE /api/shifts/:id
exports.deleteShift = async (req, res) => {
  try {
    const shift = await Shift.findByIdAndDelete(req.params.id);
    if (!shift) return res.status(404).json({ message: "Shift not found" });

    res.json({ message: "Shift deleted" });
  } catch (error) {
    res.status(500).json({ message: "Delete failed", error: error.message });
  }
};
