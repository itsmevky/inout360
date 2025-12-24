import React, { useEffect, useState } from "react";
import { useNavigate } from "react-router-dom";
import { toast } from "react-toastify";
import { API } from "../../Helpers/api.js";

const AddUserForm = ({ onSuccess }) => {
  const [formError, setFormError] = useState("");
  const [profileImageFile, setProfileImageFile] = useState(null);
  const [profileImagePreview, setProfileImagePreview] = useState("");
  const navigate = useNavigate();

  const requiredFields = [
    "firstName",
    "lastName",
    "gender",
    "dob",
    "email",
    "phone",
    "currentaddress",
    "city",
    "state",
    "pincode",
    "permanentaddress",
    "permanentCity",
    "permanentState",
    "permanentPincode",
    "employeeId",
    "rfid",
    "joiningDate",
    "designation",
    "department",
    "section",
    "shift",
    "role",
    "aadharcardnumber",
    "pancard",
    "accountNumber",
    "ifscCode",
    "emergencyName",
    "emergencyRelation",
    "emergencyPhone",
  ];

  const fieldLabel = {
    firstName: "First Name",
    lastName: "Last Name",
    gender: "Gender",
    dob: "Date of Birth",
    email: "Email",
    phone: "Phone",
    currentaddress: "Current Address Street",
    city: "Current Address City",
    state: "Current Address State",
    pincode: "Current Address Pincode",
    permanentaddress: "Permanent Address Street",
    permanentCity: "Permanent Address City",
    permanentState: "Permanent Address State",
    permanentPincode: "Permanent Address Pincode",
    employeeId: "Employee ID",
    rfid: "RFID",
    joiningDate: "Joining Date",
    designation: "Designation",
    department: "Department",
    section: "Section",
    shift: "Shift",
    role: "Role",
    aadharcardnumber: "Aadhar Card Number",
    pancard: "PAN Card",
    accountNumber: "Account Number",
    ifscCode: "IFSC Code",
    emergencyName: "Emergency Contact Name",
    emergencyRelation: "Emergency Contact Relation",
    emergencyPhone: "Emergency Contact Phone",
  };

  const normalizeValue = (value) => String(value || "").trim();

  const handleSubmit = async (event) => {
    event.preventDefault();
    setFormError("");

    const form = event.currentTarget;
    const formData = new FormData(form);
    const payload = {};

    for (const [key, value] of formData.entries()) {
      if (value instanceof File) continue;
      payload[key] = typeof value === "string" ? value.trim() : value;
    }

    payload.name = [payload.firstName, payload.lastName].filter(Boolean).join(" ");
    payload.emailVerified = form.elements.emailVerified?.checked || false;
    payload.phoneVerified = form.elements.phoneVerified?.checked || false;
    payload.loginEnabled = form.elements.loginEnabled?.checked || false;
    formData.set("name", payload.name);
    formData.set("emailVerified", String(payload.emailVerified));
    formData.set("phoneVerified", String(payload.phoneVerified));
    formData.set("loginEnabled", String(payload.loginEnabled));

    const missing = requiredFields.find(
      (key) => !normalizeValue(payload[key])
    );
    if (missing) {
      const message = `${fieldLabel[missing] || missing} is required.`;
      setFormError(message);
      toast.error(message);
      return;
    }

    try {
      const result = await API.add(
        "employees/add",
        profileImageFile ? formData : payload
      );
      if (result.status === true || result.success === true) {
        toast.success(result.message || "✅ Employee created successfully!");
        form.reset();
        setProfileImageFile(null);
        setProfileImagePreview("");
        if (typeof onSuccess === "function") {
          onSuccess(result);
          return;
        }
        navigate("/dashboard/users/employees", { replace: true });
      } else {
        const message = result.message || "❌ Failed to create employee.";
        setFormError(message);
        toast.error(message);
      }
    } catch (error) {
      setFormError("An error occurred. Please try again.");
      toast.error("An error occurred. Please try again.");
    }
  };
  useEffect(() => {
    if (!profileImageFile) {
      setProfileImagePreview("");
      return;
    }
    const objectUrl = URL.createObjectURL(profileImageFile);
    setProfileImagePreview(objectUrl);
    return () => URL.revokeObjectURL(objectUrl);
  }, [profileImageFile]);

  const handleProfileImageChange = (event) => {
    const file = event.target.files?.[0] || null;
    setProfileImageFile(file);
  };
  return (
    <div className="adduser-outer-section">
      <div className="adduser-inner-section">
        <form
          className="w-full max-w-5xl mx-auto mt-8 bg-white p-6 rounded-lg shadow-md addnew-employe-popup-form"
          noValidate
          onSubmit={handleSubmit}
        >
          <h2 className="text-lg font-semibold mb-6 text-gray-800">
            Add New Employee
          </h2>

          <div className="grid grid-cols-1 md:grid-cols-2 gap-x-6 gap-y-4">
            {/* ================= PROFILE PHOTO ================= */}
            <div className="flex items-center space-x-4 col-span-2 mb-4">
              <div className="w-[132px] h-[170px] border rounded-lg overflow-hidden flex items-center justify-center bg-gray-100">
                <img
                  src={
                    profileImagePreview ||
                    "https://via.placeholder.com/132x170.png?text=Photo"
                  }
                  alt="Profile"
                  className="object-cover w-full h-full"
                />
              </div>
              <div>
                <label className="block mb-2 text-sm font-medium text-gray-700 !p-6">
                  Upload Profile Image
                </label>
                <input
                  type="file"
                  name="profileImage"
                  accept="image/*"
                  onChange={handleProfileImageChange}
                  className="block w-full text-sm text-gray-600 file:mr-4 file:py-2 file:px-3 file:rounded-lg file:border-0 file:text-sm file:font-semibold file:bg-blue-50 file:text-blue-700 hover:file:bg-blue-100"
                  style={{ paddingTop: "10px", paddingBottom: "10px" }} />
              </div>
            </div>

            {/* ================= PERSONAL INFORMATION ================= */}
            <div className="col-span-2">
              <h2 className="text-lg font-semibold mb-2">
                Personal Information
              </h2>
            </div>

            <div className="AJ-floating-label-wrapper mb-6">
              <input
                type="text"
                className="AJ-floating-input"
                placeholder=" "
                name="firstName"
              />
              <label className="AJ-floating-label">First Name *</label>
            </div>

            <div className="AJ-floating-label-wrapper mb-6">
              <input
                type="text"
                className="AJ-floating-input"
                placeholder=" "
                name="lastName"
              />
              <label className="AJ-floating-label">Last Name *</label>
            </div>

            <div className="AJ-floating-label-wrapper mb-6">
              <select className="AJ-floating-input" name="gender">
                <option value="" disabled hidden></option>
                <option>Male</option>
                <option>Female</option>
                <option>Other</option>
              </select>
              <label className="AJ-floating-label">Gender *</label>
            </div>

            <div className="AJ-floating-label-wrapper mb-6">
              <input type="date" className="AJ-floating-input" name="dob" />
              <label className="AJ-floating-label">Date of Birth *</label>
            </div>

            <div className="AJ-floating-label-wrapper mb-6">
              <input
                type="email"
                className="AJ-floating-input"
                placeholder=" "
                name="email"
              />
              <label className="AJ-floating-label">Email *</label>
            </div>

            <div className="AJ-floating-label-wrapper mb-6">
              <input
                type="text"
                className="AJ-floating-input"
                placeholder=" "
                name="phone"
              />
              <label className="AJ-floating-label">Phone *</label>
            </div>

            <div className="AJ-floating-label-wrapper mb-6">
              <input
                type="password"
                className="AJ-floating-input"
                placeholder=" "
                name="password"
              />
              <label className="AJ-floating-label">Password *</label>
            </div>

            {/* ================= CURRENT ADDRESS ================= */}
            <div className="col-span-2">
              <h2 className="text-lg font-semibold mb-2">Current Address</h2>
            </div>

            <div className="AJ-floating-label-wrapper mb-6">
              <input
                type="text"
                className="AJ-floating-input"
                placeholder=" "
                name="currentaddress"
              />
              <label className="AJ-floating-label">Street *</label>
            </div>

            <div className="AJ-floating-label-wrapper mb-6">
              <input
                type="text"
                className="AJ-floating-input"
                placeholder=" "
                name="city"
              />
              <label className="AJ-floating-label">City *</label>
            </div>

            <div className="AJ-floating-label-wrapper mb-6">
              <input
                type="text"
                className="AJ-floating-input"
                placeholder=" "
                name="state"
              />
              <label className="AJ-floating-label">State *</label>
            </div>

            <div className="AJ-floating-label-wrapper mb-6">
              <input
                type="number"
                className="AJ-floating-input"
                placeholder=" "
                name="pincode"
              />
              <label className="AJ-floating-label">Pincode *</label>
            </div>

            {/* ================= PERMANENT ADDRESS ================= */}
            <div className="col-span-2">
              <h2 className="text-lg font-semibold mb-2">Permanent Address</h2>
            </div>

            <div className="AJ-floating-label-wrapper mb-6">
              <input
                type="text"
                className="AJ-floating-input"
                placeholder=" "
                name="permanentaddress"
              />
              <label className="AJ-floating-label">Street *</label>
            </div>

            <div className="AJ-floating-label-wrapper mb-6">
              <input
                type="text"
                className="AJ-floating-input"
                placeholder=" "
                name="permanentCity"
              />
              <label className="AJ-floating-label">City *</label>
            </div>

            <div className="AJ-floating-label-wrapper mb-6">
              <input
                type="text"
                className="AJ-floating-input"
                placeholder=" "
                name="permanentState"
              />
              <label className="AJ-floating-label">State *</label>
            </div>

            <div className="AJ-floating-label-wrapper mb-6">
              <input
                type="number"
                className="AJ-floating-input"
                placeholder=" "
                name="permanentPincode"
              />
              <label className="AJ-floating-label">Pincode *</label>
            </div>

            {/* ================= PROFESSIONAL INFORMATION ================= */}
            <div className="col-span-2">
              <h2 className="text-lg font-semibold mb-2">
                Professional Information
              </h2>
            </div>

            <div className="AJ-floating-label-wrapper mb-6">
              <input
                type="text"
                className="AJ-floating-input"
                placeholder=" "
                name="employeeId"
              />
              <label className="AJ-floating-label">Employee ID *</label>
            </div>

            <div className="AJ-floating-label-wrapper mb-6">
              <input
                type="text"
                className="AJ-floating-input"
                placeholder=" "
                name="rfid"
              />
              <label className="AJ-floating-label">RFID *</label>
            </div>

            <div className="AJ-floating-label-wrapper mb-6">
              <input type="date" className="AJ-floating-input" name="joiningDate" />
              <label className="AJ-floating-label">Joining Date *</label>
            </div>

            <div className="AJ-floating-label-wrapper mb-6">
              <input
                type="text"
                className="AJ-floating-input"
                placeholder=" "
                name="designation"
              />
              <label className="AJ-floating-label">Designation *</label>
            </div>

            <div className="AJ-floating-label-wrapper mb-6">
              <input
                type="text"
                className="AJ-floating-input"
                placeholder=" "
                name="department"
              />
              <label className="AJ-floating-label">Department *</label>
            </div>

            <div className="AJ-floating-label-wrapper mb-6">
              <input
                type="text"
                className="AJ-floating-input"
                placeholder=" "
                name="section"
              />
              <label className="AJ-floating-label">Section *</label>
            </div>

            <div className="AJ-floating-label-wrapper mb-6">
              <input
                type="text"
                className="AJ-floating-input"
                placeholder=" "
                name="shift"
              />
              <label className="AJ-floating-label">Shift *</label>
            </div>

            <div className="AJ-floating-label-wrapper mb-6">
              <select className="AJ-floating-input" name="employmentType">
                <option value="" disabled hidden></option>
                <option>Full-time</option>
                <option>Part-time</option>
                <option>Contract</option>
                <option>Intern</option>
              </select>
              <label className="AJ-floating-label">Employment Type *</label>
            </div>

            <div className="AJ-floating-label-wrapper mb-6">
              <select className="AJ-floating-input" name="role">
                <option value="" disabled hidden></option>
                <option value="superadmin">Super Admin</option>
                <option value="admin">Admin</option>
                <option value="hr">HR</option>
                <option value="employee">Employee</option>
                <option value="manager">Manager</option>
                <option value="supervisor">Supervisor</option>
                <option value="contractor">Contractor</option>
                <option value="visitor">Visitor</option>
              </select>
              <label className="AJ-floating-label">Role *</label>
            </div>

            <div className="AJ-floating-label-wrapper mb-6">
              <select className="AJ-floating-input" name="status">
                <option>Active</option>
                <option>Inactive</option>
              </select>
              <label className="AJ-floating-label">Status *</label>
            </div>

            {/* ================= BANK DETAILS ================= */}
            <div className="col-span-2">
              <h2 className="text-lg font-semibold mb-2">Bank Details</h2>
            </div>

            <div className="AJ-floating-label-wrapper mb-6">
              <input
                type="text"
                className="AJ-floating-input"
                placeholder=" "
                name="aadharcardnumber"
              />
              <label className="AJ-floating-label">Aadhar Card Number *</label>
            </div>

            <div className="AJ-floating-label-wrapper mb-6">
              <input
                type="text"
                className="AJ-floating-input"
                placeholder=" "
                name="pancard"
              />
              <label className="AJ-floating-label">PAN Card *</label>
            </div>

            <div className="AJ-floating-label-wrapper mb-6">
              <input
                type="text"
                className="AJ-floating-input"
                placeholder=" "
                name="accountNumber"
              />
              <label className="AJ-floating-label">Account Number *</label>
            </div>

            <div className="AJ-floating-label-wrapper mb-6">
              <input
                type="text"
                className="AJ-floating-input"
                placeholder=" "
                name="ifscCode"
              />
              <label className="AJ-floating-label">IFSC Code *</label>
            </div>

            <div className="AJ-floating-label-wrapper mb-6">
              <input
                type="text"
                className="AJ-floating-input"
                placeholder=" "
                name="bankName"
              />
              <label className="AJ-floating-label">Bank Name *</label>
            </div>

            <div className="AJ-floating-label-wrapper mb-6">
              <input
                type="text"
                className="AJ-floating-input"
                placeholder=" "
                name="branch"
              />
              <label className="AJ-floating-label">Branch *</label>
            </div>

            {/* ================= EMERGENCY CONTACT ================= */}
            <div className="col-span-2">
              <h2 className="text-lg font-semibold mb-2">Emergency Contact</h2>
            </div>

            <div className="AJ-floating-label-wrapper mb-6">
              <input
                type="text"
                className="AJ-floating-input"
                placeholder=" "
                name="emergencyName"
              />
              <label className="AJ-floating-label">Name *</label>
            </div>

            <div className="AJ-floating-label-wrapper mb-6">
              <input
                type="text"
                className="AJ-floating-input"
                placeholder=" "
                name="emergencyRelation"
              />
              <label className="AJ-floating-label">Relation *</label>
            </div>

            <div className="AJ-floating-label-wrapper mb-6">
              <input
                type="text"
                className="AJ-floating-input"
                placeholder=" "
                name="emergencyPhone"
              />
              <label className="AJ-floating-label">Phone *</label>
            </div>

            {/* ================= SYSTEM ACCESS ================= */}
            <div className="col-span-2">
              <h2 className="text-lg font-semibold mb-2 !m-0">System Access</h2>
            </div>

            <div className="flex items-center space-x-2 mb-3 gap-2">
              <input type="checkbox" className="w-4 h-4" name="emailVerified" />
              <label className="text-sm text-gray-700 !m-0">Email Verified</label>
            </div>

            <div className="flex items-center space-x-2 mb-3 gap-2">
              <input type="checkbox" className="w-4 h-4" name="phoneVerified" />
              <label className="text-sm text-gray-700 !m-0">Phone Verified</label>
            </div>

            <div className="flex items-center space-x-2 mb-3 gap-2">
              <input type="checkbox" className="w-4 h-4" name="loginEnabled" />
              <label className="text-sm text-gray-700 !m-0">Login Enabled</label>
            </div>

            <div className="AJ-floating-label-wrapper mb-6 col-span-2">
              <input type="datetime-local" className="AJ-floating-input" name="lastLogin" />
              <label className="AJ-floating-label">Last Login</label>
            </div>
          </div>

          {/* ================= SUBMIT BUTTON ================= */}
          <div className="AJ-crm-save w-full md:col-span-2 mt-6">
            <button
              type="submit"
              className="button-section w-full md:w-auto rounded"
            >
              Submit
            </button>
            {formError ? (
              <div className="text-red-600 text-sm mt-2">{formError}</div>
            ) : null}
          </div>
        </form>
      </div>
    </div>
  );
};

export default AddUserForm;
