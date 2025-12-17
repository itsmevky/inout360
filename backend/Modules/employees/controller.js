const bcrypt = require("bcrypt");
const EmployeeModel = require("./model");
const paginate = require("../../helpers/limitoffset");
const Validator = require("../../helpers/validators");

const normalizePayload = (data) => {
  const toDate = (v) => (v ? new Date(v) : v);

  return {
    ...data,
    profileImage: data.profileImage || data.profile_image || "",
    currentAddress: {
      street: data.currentAddress?.street || data.currentStreet || data.current_address_street,
      city: data.currentAddress?.city || data.currentCity || data.current_address_city,
      state: data.currentAddress?.state || data.currentState || data.current_address_state,
      pincode:
        data.currentAddress?.pincode ||
        data.currentPincode ||
        data.current_address_pincode,
    },
    permanentAddress: {
      street:
        data.permanentAddress?.street ||
        data.permanentStreet ||
        data.permanent_address_street,
      city:
        data.permanentAddress?.city ||
        data.permanentCity ||
        data.permanent_address_city,
      state:
        data.permanentAddress?.state ||
        data.permanentState ||
        data.permanent_address_state,
      pincode:
        data.permanentAddress?.pincode ||
        data.permanentPincode ||
        data.permanent_address_pincode,
    },
    joiningDate: toDate(data.joiningDate || data.joining_date),
    dob: toDate(data.dob || data.date_of_birth),
    employmentType: data.employmentType || data.employment_type || "Full-time",
    status: data.status || "Active",
    role: data.role || "employee",
    bankDetails: {
      aadharcardnumber: data.aadharcardnumber,
      pancard: data.pancard,
      accountNumber: data.accountNumber,
      ifscCode: data.ifscCode,
      bankName: data.bankName,
      branch: data.branch,
    },
    emergencyContact: {
      name: data.emergencyName || data.emergency_contact_name || data.emergency_contact,
      relation:
        data.emergencyRelation ||
        data.emergency_contact_relation ||
        data.emergency_relation,
      phone: data.emergencyPhone || data.emergency_contact_phone,
    },
    systemAccess: {
      emailVerified: !!data.emailVerified,
      phoneVerified: !!data.phoneVerified,
      loginEnabled: data.loginEnabled !== false,
      lastLogin: toDate(data.lastLogin),
    },
  };
};

const validateEmployeeData = async (data) => {
  const rules = {
    firstName: "required|string",
    lastName: "required|string",
    gender: "required|string",
    dob: "required|date",
    email: "required|email",
    phone: "required|string",
    password: "required|string|min:5",

    "currentAddress.street": "required|string",
    "currentAddress.city": "required|string",
    "currentAddress.state": "required|string",
    "currentAddress.pincode": "required|string",

    "permanentAddress.street": "required|string",
    "permanentAddress.city": "required|string",
    "permanentAddress.state": "required|string",
    "permanentAddress.pincode": "required|string",

    employeeId: "required|string",
    rfid: "required|string",
    joiningDate: "required|date",
    designation: "required|string",
    department: "required|string",
    section: "required|string",
    shift: "required|string",
    employmentType: "required|string",
    role: "required|string",
    status: "required|string",

    "bankDetails.aadharcardnumber": "required|string",
    "bankDetails.pancard": "required|string",
    "bankDetails.accountNumber": "required|string",
    "bankDetails.ifscCode": "required|string",

    "emergencyContact.name": "required|string",
    "emergencyContact.relation": "required|string",
    "emergencyContact.phone": "required|string",
  };
  const validator = new Validator(data, rules);
  await validator.validate();
};

exports.add = async (req, res) => {
  try {
    const normalized = normalizePayload(req.body);
    await validateEmployeeData(normalized);

    const existing = await EmployeeModel.findOne({ email: normalized.email });
    if (existing) {
      return res
        .status(400)
        .json({ status: false, message: "Employee already exists with this email" });
    }

    const hashedPassword = await bcrypt.hash(normalized.password, 10);
    const data = { ...normalized, password: hashedPassword, raw: req.body };

    const employee = await EmployeeModel.create(data);
    return res.status(201).json({
      status: true,
      message: "Employee created successfully",
      data: employee,
    });
  } catch (error) {
    if (error.errors) {
      return res.status(400).json({
        status: false,
        message: "Validation failed",
        errors: error.errors,
      });
    }
    return res.status(500).json({ status: false, message: error.message });
  }
};

exports.getAll = async (req, res) => {
  try {
    const { page, limit, search, status, department, attendanceStatus } = req.query;
    const pageNumber = Math.max(0, (parseInt(page, 10) || 1) - 1);
    const filter = {};
    if (status) filter["status"] = status;
    if (department) filter["department"] = department;
    if (attendanceStatus) filter["attendanceStatus"] = attendanceStatus;

    const result = await paginate(
      EmployeeModel,
      filter,
      pageNumber,
      limit,
      [],
      ["firstName", "lastName", "email", "rfid", "designation", "employeeId", "department"],
      search
    );

    // Normalize payload for UI (add id and name)
    const employees = result.data.map((doc) => {
      const plain = typeof doc.toObject === "function" ? doc.toObject() : doc;
      return {
        ...plain,
        id: plain._id?.toString?.() || plain.id,
        name: `${plain.firstName || ""} ${plain.lastName || ""}`.trim(),
      };
    });

    return res.status(200).json({
      status: result.status,
      message: result.message,
      employees,
      total: result.pagination?.totalrecords || 0,
      pagination: result.pagination,
    });
  } catch (error) {
    return res.status(500).json({
      status: false,
      message: "Server Error",
      error: error.message,
    });
  }
};

exports.getbyid = async (req, res) => {
  try {
    const param = req.params.id;
    const employee = await EmployeeModel.findOne({
      $or: [{ _id: param }, { rfid: param }],
    });
    if (!employee) {
      return res.status(404).json({ status: false, message: "Not found" });
    }

    return res.status(200).json({ employee });
  } catch (error) {
    return res.status(500).json({ status: false, message: error.message });
  }
};

exports.update = async (req, res) => {
  try {
    const normalized = normalizePayload(req.body);
    const updates = { ...normalized, raw: req.body };

    if (updates.password) {
      updates.password = await bcrypt.hash(updates.password, 10);
    }

    const updated = await EmployeeModel.findByIdAndUpdate(
      req.params.id,
      updates,
      { new: true, runValidators: false }
    );
    if (!updated) {
      return res.status(404).json({ status: false, message: "Not found" });
    }
    return res.status(200).json({
      status: true,
      message: "Updated successfully",
      data: updated,
    });
  } catch (error) {
    return res.status(500).json({ status: false, message: error.message });
  }
};

exports.updateStatus = async (req, res) => {
  try {
    const { users, status } = req.body;
    if (!Array.isArray(users) || users.length === 0) {
      return res.status(400).json({ status: false, message: "Users missing" });
    }
    const result = await EmployeeModel.updateMany(
      { _id: { $in: users } },
      { $set: { status } }
    );
    if (result.matchedCount === 0) {
      return res
        .status(404)
        .json({ status: false, message: "No users found with the provided IDs" });
    }
    return res.status(200).json({
      status: true,
      message: "Status updated successfully",
      modifiedCount: result.modifiedCount,
    });
  } catch (error) {
    return res.status(500).json({ status: false, message: error.message });
  }
};

exports.delete = async (req, res) => {
  try {
    let recordIds = req.body?.recordId || req.params?.id;
    if (!recordIds) {
      return res
        .status(404)
        .json({ status: false, message: "Record ID(s) not found" });
    }
    if (typeof recordIds === "string") recordIds = [recordIds];
    if (!Array.isArray(recordIds) || recordIds.length === 0) {
      return res.status(400).json({
        status: false,
        message: "Record ID(s) must be a non-empty string or array",
      });
    }

    const result = await EmployeeModel.deleteMany({ _id: { $in: recordIds } });
    if (result.deletedCount === 0) {
      return res
        .status(404)
        .json({ status: false, message: "No matching records found" });
    }

    return res.status(200).json({
      status: true,
      message: `${result.deletedCount} record(s) deleted successfully`,
    });
  } catch (error) {
    return res.status(500).json({ status: false, message: error.message });
  }
};
