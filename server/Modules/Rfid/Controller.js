const Contractor = require("../Contractor/model");
const AttendanceLog = require("../Attendence/model");
const Validator = require("../../Utils/Validator");

exports.punchRFID = async (req, res) => {
  const { rfid, location } = req.body;

  // ✅ Validation rules
  const rules = {
    rfid: ["required"],
    location: ["required", "enum:entry,section,exit"],
  };

  const validator = new Validator(req.body, rules);
  if (!validator.validate()) {
    return res.status(422).json({ errors: validator.getErrors() });
  }

  try {
    const contractor = await Contractor.findOne({ rfid }).populate("section");
    if (!contractor) {
      return res.status(404).json({ message: "Contractor not found" });
    }

    let log = await AttendanceLog.findOne({
      contractor: contractor._id,
      date: new Date().toDateString(),
    });

    if (!log) {
      log = new AttendanceLog({ contractor: contractor._id });
    }

    // ✅ First-Time Entry Handling
    if (contractor.isFirstTime) {
      contractor.isFirstTime = false;
      contractor.onboardedAt = new Date();
      await contractor.save();

      return res.json({
        message: "First-time entry logged. Section mapped.",
        section: contractor.section?.name || "Not assigned",
      });
    }

    // ✅ Daily Punch Flow
    switch (location) {
      case "entry":
        log.entryTime = new Date();
        break;
      case "section":
        log.sectionPunchTime = new Date();
        break;
      case "exit":
        log.exitTime = new Date();
        break;
    }

    await log.save();

    res.json({
      message: `Punch recorded at ${location}`,
      log,
    });
  } catch (error) {
    console.error("Punch Error:", error);
    res.status(500).json({ message: "Server error", error: error.message });
  }
};
