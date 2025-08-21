import React, { useState } from "react";
import { toast, ToastContainer } from "react-toastify";
import "react-toastify/dist/ReactToastify.css";
import { API } from "../../../Helpers/api.js";
import Validator from "../../../Helpers/validators.js";
import rules from "./Rules.js";

const AddDepartment = () => {
  const initialFormData = {
    name: "",
    code: "",
    head: "",
    head: "",
    departmentType: "",
    subDepartments: "",
  };

  const [formData, setFormData] = useState(initialFormData);
  const [errors, setErrors] = useState({});
  const [touched, setTouched] = useState({
    name: false,
    code: false,
    phone: false,
    password: false,
    role: false,
  });
  const [loading, setLoading] = useState(false);
  const validator = new Validator(rules);

  // Handle input change
  const handleChange = (e) => {
    const { name, value } = e.target;
    setFormData((prev) => ({
      ...prev,
      [name]: value,
    }));
  };

  // Validate input field on blur
  const handleBlur = async (e) => {
    const { name, value } = e.target;
    setTouched({ ...touched, [name]: true });
    const fieldErrors = await validator.validate(
      { [name]: value },
      { [name]: rules[name] }
    );
    setErrors((prev) => ({
      ...prev,
      [name]: fieldErrors[name] || "",
    }));
  };

  // Validate the entire form
  const validateForm = async () => {
    const validationErrors = await validator.validate(formData, rules);
    setErrors(validationErrors);
    return Object.keys(validationErrors).length === 0;
  };

  // Submit form
  const handleSubmit = async (e) => {
    e.preventDefault();
    setLoading(true);

    const isValid = await validateForm();
    if (!isValid) {
      setLoading(false);
      return;
    }

    try {
      console.log("Submitting data:", formData);
      const result = await API.createDepartment(formData);
      console.log("API Response:", result);

      if (result.status === true) {
        toast.success("Department created successfully!");
        setFormData(initialFormData); // Reset form
      } else {
        toast.error(result.message || "Failed to create user.");
      }
    } catch (error) {
      console.error("Error creating Department:", error);
      toast.error(
        "An error occurred while creating the Department. Please try again."
      );
    } finally {
      setLoading(false);
    }
  };

  // Get field class name based on error state
  const getFieldClassName = (fieldName) => {
    return errors[fieldName] ? "field-error" : "field";
  };

  return (
    <div className="adduser-outer-section">
      <div className="adduser-inner-section">
        <div className="adduser-form-section">
          <form
            className="w-full max-w-lg mx-auto mt-8"
            onSubmit={handleSubmit}
          >
            <div>
              <h2 className="text-xl font-semibold mb-6 text-gray-800">
                Add New Department
              </h2>
            </div>

            {/*Code */}
            <div className="first-left form-item">
              <input
                type="number"
                name="code"
                value={formData.code}
                onChange={handleChange}
                onBlur={handleBlur}
                className={getFieldClassName("code")}
              />
              <label>
                Code <span className="text-red-500">*</span>
              </label>
            </div>

            {/* Name */}
            <div className="first-left form-item">
              <input
                type="text"
                name="name"
                value={formData.name}
                onChange={handleChange}
                onBlur={handleBlur}
                className={getFieldClassName("name")}
              />
              <label>
                Name <span className="text-red-500">*</span>
              </label>
            </div>

            {/* Head */}
            <div className="first-left form-item">
              <input
                type="text"
                name="head"
                value={formData.head}
                onChange={handleChange}
                onBlur={handleBlur}
                className={getFieldClassName("head")}
              />
              <label>
                Head <span className="text-red-500">*</span>
              </label>
            </div>

            {/* Description*/}
            <div className="first-left form-item">
              <input
                type="text"
                name="description"
                value={formData.description}
                onChange={handleChange}
                onBlur={handleBlur}
                className={getFieldClassName("description")}
              />
              <label>Description</label>
            </div>

            {/* Department type */}
            <div className="first-left form-item">
              <input
                type="text"
                name="departmentType"
                value={formData.departmentType}
                onChange={handleChange}
                onBlur={handleBlur}
                className={getFieldClassName("description")}
              />
              <label>
                DepartmentType <span className="text-red-500">*</span>
              </label>
            </div>

            {/* Role */}
            {/* <div className="select-option-dropdown first-left form-item">
              <select
                name="role"
                value={formData.role}
                onChange={handleChange}
                onBlur={handleBlur}
                className={getFieldClassName("role")}
              >
                <option value="" disabled></option>
                <option value="admin">Admin</option>
                <option value="student">Student</option>
                <option value="teacher">Teacher</option>
                <option value="parent">Parent</option>
              </select>
              <span className="dropdown-icon">▼</span>
              <label className={formData.role ? "selected" : ""}>
                Role <span className="text-red-500">*</span>
              </label>
            </div> */}

            {/* Status */}
            <div className="select-option-dropdown first-left form-item">
              <select
                name="status"
                value={formData.status}
                onChange={handleChange}
                onBlur={handleBlur}
                className={getFieldClassName("status")}
              >
                <option value="" disabled></option>
                <option value="Active">Active</option>
                <option value="Disabled">Disabled</option>
                <option value="Blocked">Blocked</option>
                <option value="Trash">Trash</option>
              </select>
              <span className="dropdown-icon">▼</span>
              <label className={formData.status ? "selected" : ""}>
                Status <span className="text-red-500">*</span>
              </label>
            </div>

            {/* Submit Button */}
            <div className="flex">
              <button
                type="submit"
                className="upclick px-4 mt-5 py-2 text-white text-sm font-medium rounded-md hover:bg-blue-700 focus:outline-none"
              >
                {loading ? "Creating..." : "Create Department"}
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

export default AddDepartment;
