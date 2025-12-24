<<<<<<< Updated upstream
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
=======
import React from "react";

const AddUserForm = () => {
  return (
        <div className="adduser-outer-section min-h-screen bg-[#f4f7fe] py-6 px-3 sm:px-6 lg:px-8">
          <div className="adduser-inner-section max-w-6xl mx-auto">
            <form
              className="bg-white shadow-xl rounded-2xl overflow-hidden border border-gray-100"
              noValidate
            >
              {/* Form Header */}
              <div className="bg-gradient-to-r from-blue-600 text-white to-indigo-700 px-6 py-4">
                <h2 className="text-xl font-bold !text-white">Add New Employee</h2>
                <p className="text-blue-100 text-sm">Please fill in all the required fields</p>
              </div>

              <div className="p-6 lg:p-10">
                {/* Grid Wrapper */}
                <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-x-6 gap-y-2">

                  {/* --- PROFILE PHOTO SECTION --- */}
                  <div className="col-span-1 md:col-span-2 lg:col-span-3 flex flex-col sm:flex-row items-center gap-6 mb-10 p-5 bg-gray-50 rounded-xl border border-dashed border-gray-300">
                    <div className="relative group">
                      <div className="w-32 h-40 border-2 border-gray-200 rounded-lg overflow-hidden bg-white shadow-sm transition group-hover:border-blue-400">
                        <img
                          src="https://via.placeholder.com/132x170.png?text=Photo"
                          alt="Profile"
                          className="object-cover w-full h-full"
                        />
                      </div>
                    </div>
                    <div className="flex-1 text-center sm:text-left">
                      <h3 className="text-gray-800 font-semibold mb-1 pl-3.5">Employee Photo</h3>
                      <p className="text-sm text-gray-500 mb-3 pl-3">Format: JPG, PNG. Max size 2MB</p>
                      <input
                        type="file"
                        className="block w-full text-sm text-gray-500 file:mr-4 file:py-2 file:px-2 file:rounded-md file:border-0 file:text-sm file:font-semibold file:bg-blue-100 file:text-blue-700 hover:file:bg-blue-100 transition-all cursor-pointer"
                      />
                    </div>
                  </div>

                  {/* --- PERSONAL INFORMATION --- */}
                  <div className="col-span-full border-l-4 border-blue-600 pl-3 mb-4 mt-2">
                    <h3 className="text-lg font-bold text-gray-800">Personal Information</h3>
                  </div>

                  <div className="AJ-floating-label-wrapper mb-6">
                    <input type="text" className="AJ-floating-input w-full" placeholder=" " />
                    <label className="AJ-floating-label">First Name *</label>
                  </div>
                  <div className="AJ-floating-label-wrapper mb-6">
                    <input type="text" className="AJ-floating-input w-full" placeholder=" " />
                    <label className="AJ-floating-label">Last Name *</label>
                  </div>
                  <div className="AJ-floating-label-wrapper mb-6">
                    <select className="AJ-floating-input w-full">
                      <option value="" disabled hidden></option>
                      <option>Male</option>
                      <option>Female</option>
                    </select>
                    <label className="AJ-floating-label">Gender *</label>
                  </div>
                  <div className="AJ-floating-label-wrapper mb-6">
                    <input type="date" className="AJ-floating-input w-full" />
                    <label className="AJ-floating-label">DOB *</label>
                  </div>
                  <div className="AJ-floating-label-wrapper mb-6">
                    <input type="email" className="AJ-floating-input w-full" placeholder=" " />
                    <label className="AJ-floating-label">Email *</label>
                  </div>
                  <div className="AJ-floating-label-wrapper mb-6">
                    <input type="text" className="AJ-floating-input w-full" placeholder=" " />
                    <label className="AJ-floating-label">Phone *</label>
                  </div>

                  {/* --- ADDRESS SECTIONS (2 Columns layout for Desktop) --- */}
                  <div className="col-span-full grid grid-cols-1 lg:grid-cols-2 gap-8 mt-4">
                    {/* Current Address */}
                    <div className="space-y-2">
                      <h4 className="font-semibold text-blue-800 border-b pb-1 mb-4">Current Address</h4>
                      <div className="grid grid-cols-1 sm:grid-cols-2 gap-4 !mt-5">
                        <div className="AJ-floating-label-wrapper sm:col-span-2">
                          <input type="text" className="AJ-floating-input w-full" placeholder=" " />
                          <label className="AJ-floating-label">Street Address *</label>
                        </div>
                        <div className="AJ-floating-label-wrapper">
                          <input type="text" className="AJ-floating-input w-full" placeholder=" " />
                          <label className="AJ-floating-label">City *</label>
                        </div>
                        <div className="AJ-floating-label-wrapper">
                          <input type="text" className="AJ-floating-input w-full" placeholder=" " />
                          <label className="AJ-floating-label">Pincode *</label>
                        </div>
                      </div>
                    </div>

                    {/* Permanent Address */}
                    <div className="space-y-2">
                      <h4 className="font-semibold text-blue-800 border-b pb-1 mb-4">Permanent Address</h4>
                      <div className="grid grid-cols-1 sm:grid-cols-2 gap-4 !mt-5">
                        <div className="AJ-floating-label-wrapper sm:col-span-2">
                          <input type="text" className="AJ-floating-input w-full" placeholder=" " />
                          <label className="AJ-floating-label">Street Address *</label>
                        </div>
                        <div className="AJ-floating-label-wrapper">
                          <input type="text" className="AJ-floating-input w-full" placeholder=" " />
                          <label className="AJ-floating-label">City *</label>
                        </div>
                        <div className="AJ-floating-label-wrapper">
                          <input type="text" className="AJ-floating-input w-full" placeholder=" " />
                          <label className="AJ-floating-label">Pincode *</label>
                        </div>
                      </div>
                    </div>
                  </div>

                  {/* --- PROFESSIONAL DETAILS --- */}
                  <div className="col-span-full border-l-4 border-blue-600 pl-3 mb-4 mt-10">
                    <h3 className="text-lg font-bold text-gray-800">Professional Information</h3>
                  </div>
                  <div className="AJ-floating-label-wrapper mb-6">
                    <input type="text" className="AJ-floating-input w-full" placeholder=" " />
                    <label className="AJ-floating-label">Employee ID *</label>
                  </div>
                  <div className="AJ-floating-label-wrapper mb-6">
                    <input type="text" className="AJ-floating-input w-full" placeholder=" " />
                    <label className="AJ-floating-label">Designation *</label>
                  </div>
                  <div className="AJ-floating-label-wrapper mb-6">
                    <select className="AJ-floating-input w-full">
                      <option>Admin</option>
                      <option>HR</option>
                      <option>Developer</option>
                    </select>
                    <label className="AJ-floating-label">Role *</label>
                  </div>

                  {/* --- SYSTEM ACCESS (Checkbox Section) --- */}
                  <div className="col-span-full bg-blue-50 py-3 px-0 rounded-xl mt-4 grid grid-cols-3 sm:grid-cols-1 md:grid-cols-2  gap-4">
                    <label className="relative !flex gap-2 items-center p-3 rounded-lg bg-white shadow-sm cursor-pointer hover:bg-blue-100 transition">
                      <input type="checkbox" className="w-5 h-5 text-blue-600 border-gray-300 rounded focus:ring-blue-500" />
                      <span className="ml-3 text-sm font-medium text-gray-700">Login Enabled</span>
                    </label>
                    <label className="relative !flex gap-2 items-center p-3 rounded-lg bg-white shadow-sm cursor-pointer hover:bg-blue-100 transition">
                      <input type="checkbox" className="w-5 h-5 text-blue-600 border-gray-300 rounded focus:ring-blue-500" />
                      <span className="ml-3 text-sm font-medium text-gray-700">Email Verified</span>
                    </label>
                    <label className="relative !flex gap-2 items-center p-3 rounded-lg bg-white shadow-sm cursor-pointer hover:bg-blue-100 transition">
                      <input type="checkbox" className="w-5 h-5 text-blue-600 border-gray-300 rounded focus:ring-blue-500" />
                      <span className="ml-3 text-sm font-medium text-gray-700">Remote Access</span>
                    </label>
                  </div>

                </div>

                {/* --- FORM ACTIONS --- */}
                <div className="flex flex-col sm:flex-row justify-end items-center gap-4 mt-12 pt-8 border-t border-gray-100">
                  <button
                    type="button"
                    className="w-full sm:w-auto px-8 py-3 text-gray-600 font-semibold hover:text-gray-800 transition"
                  >
                    Cancel
                  </button>
                  <button
                    type="submit"
                    className="w-full sm:w-auto px-10 py-3 bg-blue-600 text-white font-bold rounded-xl shadow-lg shadow-blue-200 hover:bg-blue-700 hover:shadow-none transition-all active:scale-95"
                  >
                    Save Employee Details
                  </button>
                </div>
              </div>
            </form>
>>>>>>> Stashed changes
          </div>
        </div>
        );
};

        export default AddUserForm;