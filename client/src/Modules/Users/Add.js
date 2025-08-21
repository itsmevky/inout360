import React, { useState, useEffect } from "react";
import { toast, ToastContainer } from "react-toastify";
import "react-toastify/dist/ReactToastify.css";
import { API } from "../../Helpers/api.js";
import Validator from "../../Helpers/validators.js";
import rules from "./Rules.js";

const AddUserForm = () => {
  const initialFormData = {
    firstName: "",
    lastName: "",
    email: "",
    password: "",
    phone: "",
    gender: "",
    address: "",
    dob: "",
    joiningDate: "",
    designation: "",
    section: "",
    shift: "",
  };

  const [formData, setFormData] = useState(initialFormData);
  const [errors, setErrors] = useState({});
  const [loading, setLoading] = useState(false);
  const [businesses, setBusinesses] = useState([]); // New state for businesses
  const validator = new Validator(rules);

  const handleChange = (e) => {
    const { name, value } = e.target;

    if (name === "business") {
      const selectedBusiness = businesses.find((b) => b.name === value);
      setFormData((prev) => ({
        ...prev,
        business: value,
        business_types: selectedBusiness?.business_type || "", // Change to business type name
        tenant_id: selectedBusiness?.id || "",
      }));
    } else {
      setFormData((prev) => ({ ...prev, [name]: value }));
    }
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
    setLoading(true);

    console.log("📨 Form Submit Clicked");

    const isValid = await validateForm();
    // if (!isValid) {
    //   console.warn("❌ Validation Failed");
    //   setLoading(false);
    //   return;
    // }
    try {
      console.log("📦 Submitting employee data:", formData);

      // ✅ Use the employee add endpoint here
      const result = await API.add("employees/add", formData);

      console.log("✅ API Response:", result);

      if (result.status === true || result.success === true) {
        toast.success("✅ Employee created successfully!");
        setFormData(initialFormData);
      } else {
        toast.error(result.message || "❌ Failed to create employee.");
      }
    } catch (error) {
      console.error("❌ Error creating employee:", error);
      toast.error("An error occurred. Please try again.");
    } finally {
      setLoading(false);
    }
  };

  const getFieldClassName = (fieldName) =>
    errors[fieldName] ? "field-error" : "field";

  return (
    <div className="adduser-outer-section">
      <div className="adduser-inner-section">
        <div className="adduser-form-section">
          <form
            onSubmit={handleSubmit}
            className="w-full max-w-5xl mx-auto mt-8"
            noValidate
          >
            <div>
              <h2 className="text-lg font-semibold mb-6 text-gray-800">
                Add New Employee
              </h2>
            </div>

            {/* FORM GRID: 2 columns on medium+ screens */}
            <div className="grid grid-cols-1 md:grid-cols-2 gap-x-6 gap-y-4">
              {/* First Name */}
              <div className="AJ-floating-label-wrapper mb-6">
                <input
                  type="text"
                  name="firstName"
                  value={formData.firstName}
                  onChange={handleChange}
                  onBlur={handleBlur}
                  className={`${getFieldClassName(
                    "first_name"
                  )} AJ-floating-input`}
                  placeholder=" "
                />
                <label className="AJ-floating-label">
                  First Name <span className="text-red-500">*</span>
                </label>
              </div>

              {/* Last Name */}
              <div className="AJ-floating-label-wrapper mb-6">
                <input
                  type="text"
                  name="lastName"
                  value={formData.lastName}
                  onChange={handleChange}
                  onBlur={handleBlur}
                  className={`${getFieldClassName(
                    "lastName"
                  )} AJ-floating-input`}
                  placeholder=" "
                />
                <label className="AJ-floating-label">Last Name</label>
              </div>

              {/* Email */}
              <div className="AJ-floating-label-wrapper mb-6">
                <input
                  type="email"
                  name="email"
                  value={formData.email}
                  onChange={handleChange}
                  onBlur={handleBlur}
                  className={`${getFieldClassName("email")} AJ-floating-input`}
                  placeholder=" "
                />
                <label className="AJ-floating-label">
                  Email <span className="text-red-500">*</span>
                </label>
              </div>

              {/* Password */}
              <div className="AJ-floating-label-wrapper mb-6">
                <input
                  type="password"
                  name="password"
                  value={formData.password}
                  onChange={handleChange}
                  onBlur={handleBlur}
                  className={`${getFieldClassName(
                    "password"
                  )} AJ-floating-input`}
                  placeholder=" "
                />
                <label className="AJ-floating-label">
                  Password <span className="text-red-500">*</span>
                </label>
              </div>

              {/* Phone Number */}
              <div className="AJ-floating-label-wrapper mb-6">
                <input
                  type="number"
                  name="phone"
                  value={formData.phone}
                  onChange={handleChange}
                  onBlur={handleBlur}
                  className={`${getFieldClassName("phone")} AJ-floating-input`}
                  placeholder=" "
                />
                <label className="AJ-floating-label">
                  Phone Number <span className="text-red-500">*</span>
                </label>
              </div>

              {/* Gender */}
              <div className="AJ-floating-label-wrapper mb-6">
                <input
                  type="text"
                  name="gender"
                  value={formData.gender}
                  onChange={handleChange}
                  onBlur={handleBlur}
                  className={`${getFieldClassName("gender")} AJ-floating-input`}
                  placeholder=" "
                />
                <label className="AJ-floating-label">Gender</label>
              </div>

              {/* Address */}
              <div className="AJ-floating-label-wrapper mb-6">
                <input
                  type="text"
                  name="address"
                  value={formData.address}
                  onChange={handleChange}
                  onBlur={handleBlur}
                  className={`${getFieldClassName(
                    "address"
                  )} AJ-floating-input`}
                  placeholder=" "
                />
                <label className="AJ-floating-label">Address</label>
              </div>

              {/* Date of Birth */}
              <div className="AJ-floating-label-wrapper mb-6">
                <input
                  type="date"
                  name="dob"
                  value={formData.dob}
                  onChange={handleChange}
                  onBlur={handleBlur}
                  className={`${getFieldClassName("dob")} AJ-floating-input`}
                  placeholder=" "
                />
                <label className="AJ-floating-label">Date of Birth</label>
              </div>

              {/* Joining Date */}
              <div className="AJ-floating-label-wrapper mb-6">
                <input
                  type="date"
                  name="joiningDate"
                  value={formData.joiningDate}
                  onChange={handleChange}
                  onBlur={handleBlur}
                  className={`${getFieldClassName(
                    "joiningDate"
                  )} AJ-floating-input`}
                  placeholder=" "
                />
                <label className="AJ-floating-label">Joining Date</label>
              </div>

              {/* Designation */}
              <div className="AJ-floating-label-wrapper mb-6">
                <input
                  type="text"
                  name="designation"
                  value={formData.designation}
                  onChange={handleChange}
                  onBlur={handleBlur}
                  className={`${getFieldClassName(
                    "designation"
                  )} AJ-floating-input`}
                  placeholder=" "
                />
                <label className="AJ-floating-label">Designation</label>
              </div>

              {/* Section */}
              <div className="AJ-floating-label-wrapper mb-6">
                <input
                  type="text"
                  name="section"
                  value={formData.section}
                  onChange={handleChange}
                  onBlur={handleBlur}
                  className={`${getFieldClassName(
                    "section"
                  )} AJ-floating-input`}
                  placeholder=" "
                />
                <label className="AJ-floating-label">Section</label>
              </div>

              {/* Shift */}
              <div className="AJ-floating-label-wrapper mb-6">
                <input
                  type="text"
                  name="shift"
                  value={formData.shift}
                  onChange={handleChange}
                  onBlur={handleBlur}
                  className={`${getFieldClassName("shift")} AJ-floating-input`}
                  placeholder=" "
                />
                <label className="AJ-floating-label">Shift</label>
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
