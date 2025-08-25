const Attendance = require("./model"); // your Attendance model path
const Validator = require("../../Utils/Validator");

// Add Attendance (initial punch)
exports.addAttendance = async (req, res) => {
  const rules = {
    contractorId: ["required"],
    rfidCardId: ["required"],
    sectionAssigned: ["required"],
    date: ["required"],
    entryGateIn: ["required"],
  };

  const validator = new Validator(req.body, rules);
  if (!validator.validate()) {
    return res.status(422).json({ errors: validator.getErrors() });
  }

  try {
    // Optional: Prevent duplicate attendance for same contractor and date   
    const existing = await Attendance.findOne({
      contractorId: req.body.contractorId,
      date: new Date(req.body.date).setHours(0, 0, 0, 0),
    });

    if (existing) {
      return res.status(400).json({
        message: "Attendance already exists for this contractor today.",
      });
    }

    const attendance = await Attendance.create({
      contractorId: req.body.contractorId,
      rfidCardId: req.body.rfidCardId,
      sectionAssigned: req.body.sectionAssigned,
      date: req.body.date,
      entryGateIn: req.body.entryGateIn,
      workfloorIn: req.body.workfloorIn,
      workfloorOut: req.body.workfloorOut,
      exitGateOut: req.body.exitGateOut,
    });

    res.status(201).json({
      message: "Attendance recorded successfully",
      attendance,
    });
  } catch (error) {
    res.status(500).json({
      message: "Error recording attendance",
      error: error.message,
    });
  }
};

// Get All Attendance Records
exports.getAllAttendance = async (req, res) => {
  try {
    // 🚀 Fetch attendance without populate
    const attendance = await Attendance.find();

    res.status(200).json(attendance);
  } catch (error) {
    res.status(500).json({
      message: "Error fetching attendance",
      error: error.message,
    });
  }
};


// Get Attendance by ID
exports.getAttendanceById = async (req, res) => {
  try {
    const attendance = await Attendance.findById(req.params.id).populate(
      "contractorId"
    );
    if (!attendance) return res.status(404).json({ message: "Not found" });
    res.json(attendance);
  } catch (error) {
    res
      .status(500)
      .json({ message: "Error fetching record", error: error.message });
  }
};

// Update Punch Times or Details
exports.updateAttendance = async (req, res) => {
  try {
    const attendance = await Attendance.findByIdAndUpdate(
      req.params.id,
      { $set: req.body },
      { new: true }
    );
    res.json({ message: "Attendance updated", attendance });
  } catch (error) {
    res.status(500).json({ message: "Update failed", error: error.message });
  }
};

// Delete Attendance Record
exports.deleteAttendance = async (req, res) => {
  try {
    await Attendance.findByIdAndDelete(req.params.id);
    res.json({ message: "Attendance deleted" });
  } catch (error) {
    res.status(500).json({ message: "Deletion failed", error: error.message });
  }
};

// HR Approval
exports.hrApprove = async (req, res) => {
  try {
    const attendance = await Attendance.findById(req.params.id);
    if (!attendance) return res.status(404).json({ message: "Not found" });

    attendance.hrApproved = true;
    attendance.hrApprovedAt = new Date();
    await attendance.save();

    res.json({ message: "HR approved attendance", attendance });
  } catch (error) {
    res
      .status(500)
      .json({ message: "HR approval failed", error: error.message });
  }
};

// Supervisor Approval
exports.supervisorApprove = async (req, res) => {
  try {
    const attendance = await Attendance.findById(req.params.id);
    if (!attendance) return res.status(404).json({ message: "Not found" });

    attendance.supervisorApproved = true;
    attendance.supervisorApprovedAt = new Date();
    await attendance.save();

    res.json({ message: "Supervisor approved attendance", attendance });
  } catch (error) {
    res
      .status(500)
      .json({ message: "Supervisor approval failed", error: error.message });
  }
};

// Finalize Attendance (after both approvals)
exports.finalizeAttendance = async (req, res) => {
  try {
    const attendance = await Attendance.findById(req.params.id);
    if (!attendance) return res.status(404).json({ message: "Not found" });

    if (!attendance.hrApproved || !attendance.supervisorApproved) {
      return res
        .status(400)
        .json({ message: "HR and Supervisor approval required" });
    }

    attendance.isFinalized = true;
    await attendance.save();

    res.json({ message: "Attendance finalized", attendance });
  } catch (error) {
    res
      .status(500)
      .json({ message: "Finalization failed", error: error.message });
  }
};
