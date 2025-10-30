import React, { useState } from "react";
import { toast, ToastContainer } from "react-toastify";
import "react-toastify/dist/ReactToastify.css";
import { API } from "../../Helpers/api.js";
import Validator from "../../Helpers/validators.js";
import rules from "./Rules.js";
import { useNavigate } from "react-router-dom";

const AddUserForm = () => {
  const initialFormData = {
    firstName: "",
    lastName: "",
    gender: "",
    dob: "",
    email: "",
    phone: "",
    currentaddress: "",
    permanentaddress: "",
    state: "",
    city: "",
    pincode: "",
    joiningDate: "",
    designation: "",
    section: "",
    shift: "",
    role: "",
    aadharcardnumber: "",
    pancard: "",
    accountNumber: "",
    ifscCode: "",
  };

  const [formData, setFormData] = useState(initialFormData);
  const [errors, setErrors] = useState({});
  const [loading, setLoading] = useState(false);
  const validator = new Validator(rules);
    const navigate = useNavigate();

  // ------------------ HANDLERS ------------------ //
  const handleChange = (e) => {
    const { name, value } = e.target;
    setFormData((prev) => ({ ...prev, [name]: value }));
  };

  const handleBlur = async (e) => {
    const { name, value } = e.target;
    const fieldErrors = await validator.validate(
      { [name]: value },
      { [name]: rules[name] }
    );
    setErrors((prev) => ({
      ...prev,
      [name]: fieldErrors[name] || "",
    }));
  };

  const validateForm = async () => {
    const validationErrors = await validator.validate(formData, rules);
    setErrors(validationErrors);
    return Object.keys(validationErrors).length === 0;
  };

  const handleSubmit = async (e) => {
    e.preventDefault();

    const isValid = await validateForm();
    if (!isValid) {
      toast.error("Please fill all required fields correctly!");
      return;
    }

    setLoading(true);
    try {
      console.log("📦 Submitting employee data:", formData);
      const result = await API.add("employees/add", formData);
      console.log("✅ API Response:", result);

      if (
        result.status === true ||
        result.success === true ||
        result.message === "Employee created successfully"
      ) {
        toast.success("✅ Employee created successfully!");
        setFormData(initialFormData);

        // ✅ Redirect after a short delay
        setTimeout(() => {
          navigate("/dashboard/users/employees");
        }, 1500);
      } else {
        toast.error(result.message || "❌ Failed to create employee.");
      }
    } catch (error) {
      console.error("❌ Error creating employee:", error);
      toast.error(error?.response?.data?.message || "Server error");
    } finally {
      setLoading(false);
    }
  };

  const getFieldClassName = (fieldName) =>
    errors[fieldName] ? "field-error" : "field";

  // ------------------ RENDER ------------------ //
  return (
    <div className="adduser-outer-section">
      <div className="adduser-inner-section">
        <div className="adduser-form-section flex justify-center">
          <form
            onSubmit={handleSubmit}
            className="w-full max-w-5xl mx-auto mt-8 bg-white p-6 rounded-lg shadow-md"
            noValidate
          >
            <h2 className="text-lg font-semibold mb-6 text-gray-800">
              Add New Employee
            </h2>

            <div className="grid grid-cols-1 md:grid-cols-2 gap-x-6 gap-y-4">
              {/* PERSONAL DETAILS */}
              <div className="AJ-floating-label-wrapper mb-6">
                <input
                  type="text"
                  name="firstName"
                  value={formData.firstName}
                  onChange={handleChange}
                  className="AJ-floating-input"
                  placeholder=" "
                />
                <label className="AJ-floating-label">First Name *</label>
              </div>

              <div className="AJ-floating-label-wrapper mb-6">
                <input
                  type="text"
                  name="lastName"
                  value={formData.lastName}
                  onChange={handleChange}
                  className="AJ-floating-input"
                  placeholder=" "
                />
                <label className="AJ-floating-label">Last Name *</label>
              </div>

              <div className="AJ-floating-label-wrapper mb-6">
                <select
                  name="gender"
                  value={formData.gender}
                  onChange={handleChange}
                  className="AJ-floating-input"
                >
                  <option value="" disabled hidden></option>
                  <option value="Male">Male</option>
                  <option value="Female">Female</option>
                  <option value="Other">Other</option>
                </select>
                <label className="AJ-floating-label">Gender *</label>
              </div>

              <div className="AJ-floating-label-wrapper mb-6">
                <input
                  type="date"
                  name="dob"
                  value={formData.dob}
                  onChange={handleChange}
                  className="AJ-floating-input"
                />
                <label className="AJ-floating-label">Date of Birth *</label>
              </div>

              {/* CONTACT */}
              <div className="AJ-floating-label-wrapper mb-6">
                <input
                  type="email"
                  name="email"
                  value={formData.email}
                  onChange={handleChange}
                  className="AJ-floating-input"
                  placeholder=" "
                />
                <label className="AJ-floating-label">Email *</label>
              </div>

              <div className="AJ-floating-label-wrapper mb-6">
                <input
                  type="number"
                  name="phone"
                  value={formData.phone}
                  onChange={handleChange}
                  className="AJ-floating-input"
                  placeholder=" "
                />
                <label className="AJ-floating-label">Phone *</label>
              </div>

              {/* ADDRESS */}
              <div className="AJ-floating-label-wrapper mb-6">
                <input
                  type="text"
                  name="currentaddress"
                  value={formData.currentaddress}
                  onChange={handleChange}
                  className="AJ-floating-input"
                />
                <label className="AJ-floating-label">Current Address *</label>
              </div>

              <div className="AJ-floating-label-wrapper mb-6">
                <input
                  type="text"
                  name="permanentaddress"
                  value={formData.permanentaddress}
                  onChange={handleChange}
                  className="AJ-floating-input"
                />
                <label className="AJ-floating-label">Permanent Address *</label>
              </div>

              <div className="AJ-floating-label-wrapper mb-6">
                <input
                  type="text"
                  name="state"
                  value={formData.state}
                  onChange={handleChange}
                  className="AJ-floating-input"
                />
                <label className="AJ-floating-label">State *</label>
              </div>

              <div className="AJ-floating-label-wrapper mb-6">
                <input
                  type="text"
                  name="city"
                  value={formData.city}
                  onChange={handleChange}
                  className="AJ-floating-input"
                />
                <label className="AJ-floating-label">City *</label>
              </div>

              <div className="AJ-floating-label-wrapper mb-6">
                <input
                  type="number"
                  name="pincode"
                  value={formData.pincode}
                  onChange={handleChange}
                  className="AJ-floating-input"
                />
                <label className="AJ-floating-label">Pincode *</label>
              </div>

              {/* PROFESSIONAL INFO */}
              <div className="AJ-floating-label-wrapper mb-6">
                <input
                  type="date"
                  name="joiningDate"
                  value={formData.joiningDate}
                  onChange={handleChange}
                  className="AJ-floating-input"
                />
                <label className="AJ-floating-label">Joining Date *</label>
              </div>

              <div className="AJ-floating-label-wrapper mb-6">
                <input
                  type="text"
                  name="designation"
                  value={formData.designation}
                  onChange={handleChange}
                  className="AJ-floating-input"
                />
                <label className="AJ-floating-label">Designation *</label>
              </div>

              <div className="AJ-floating-label-wrapper mb-6">
                <input
                  type="text"
                  name="section"
                  value={formData.section}
                  onChange={handleChange}
                  className="AJ-floating-input"
                />
                <label className="AJ-floating-label">Section *</label>
              </div>

              <div className="AJ-floating-label-wrapper mb-6">
                <input
                  type="text"
                  name="shift"
                  value={formData.shift}
                  onChange={handleChange}
                  className="AJ-floating-input"
                />
                <label className="AJ-floating-label">Shift *</label>
              </div>

              <div className="AJ-floating-label-wrapper mb-6">
                <select
                  name="role"
                  value={formData.role}
                  onChange={handleChange}
                  className="AJ-floating-input"
                >
                  <option value="" disabled hidden></option>
                  <option value="superadmin">Super Admin</option>
                  <option value="admin">Admin</option>
                  <option value="hr">HR</option>
                  <option value="employee">Employee</option>
                </select>
                <label className="AJ-floating-label">Role *</label>
              </div>

              {/* BANKING DETAILS */}
              <div className="AJ-floating-label-wrapper mb-6">
                <input
                  type="text"
                  name="aadharcardnumber"
                  value={formData.aadharcardnumber}
                  onChange={handleChange}
                  className="AJ-floating-input"
                />
                <label className="AJ-floating-label">Aadhar Number *</label>
              </div>

              <div className="AJ-floating-label-wrapper mb-6">
                <input
                  type="text"
                  name="pancard"
                  value={formData.pancard}
                  onChange={handleChange}
                  className="AJ-floating-input"
                />
                <label className="AJ-floating-label">PAN Card *</label>
              </div>

              <div className="AJ-floating-label-wrapper mb-6">
                <input
                  type="text"
                  name="accountNumber"
                  value={formData.accountNumber}
                  onChange={handleChange}
                  className="AJ-floating-input"
                />
                <label className="AJ-floating-label">Account Number *</label>
              </div>

              <div className="AJ-floating-label-wrapper mb-6">
                <input
                  type="text"
                  name="ifscCode"
                  value={formData.ifscCode}
                  onChange={handleChange}
                  className="AJ-floating-input"
                />
                <label className="AJ-floating-label">IFSC Code *</label>
              </div>
            </div>

            {/* Submit Button */}
            <div className="AJ-crm-save w-full md:col-span-2 mt-6">
              <button
                type="submit"
                className="button-section w-full md:w-auto rounded"
                disabled={loading}
              >
                {loading ? "Creating..." : "Submit"}
              </button>
            </div>
          </form>
        </div>
      </div>

      <ToastContainer position="top-right" autoClose={3000} />
      {loading && (
        <div className="loader-wrapper">
          <div className="loader"></div>
        </div>
      )}
    </div>
  );
};

export default AddUserForm;
