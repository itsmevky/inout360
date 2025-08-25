import React, { useState } from "react";
import { toast, ToastContainer } from "react-toastify";
import "react-toastify/dist/ReactToastify.css";
import { API } from "../../../Helpers/api.js";
import Validator from "../../../Helpers/validators.js";
import rules from "../Rules.js";

const AddSectionForm = () => {
  const initialFormData = {
    name: "",
    code: "",
    description: "",
    supervisorId: "",
    status: "",
  };

  const [formData, setFormData] = useState(initialFormData);
  const [errors, setErrors] = useState({});
  const [loading, setLoading] = useState(false);
  const validator = new Validator(rules);

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
    setLoading(true);

    console.log("📨 Section Form Submit Clicked");

    const isValid = await validateForm();
    if (!isValid) {
      console.warn("❌ Validation Failed");
      setLoading(false);
      return;
    }

    try {
      const sectionData = { ...formData };

      console.log("📦 Submitting section data:", sectionData);

      const result = await API.add("sections", sectionData);

      console.log("✅ API Response ------>:", result);

      if (result.status === true || result.success === true) {
        toast.success("✅ Section created successfully!");
        setFormData(initialFormData);
      } else {
        toast.error(result.message || "❌ Failed to create section.");
      }
    } catch (error) {
      console.error("❌ Error creating section:", error);
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
            className="w-full max-w-5xl mx-auto mt-8 bg-white"
            noValidate
          >
            <div>
              <h2 className="text-lg font-semibold mb-6 text-gray-800">
                Add New Section
              </h2>
            </div>

            {/* FORM GRID */}
            <div className="grid grid-cols-1 md:grid-cols-2 gap-x-6 gap-y-4">
              {/* Section Name */}
              <div className="AJ-floating-label-wrapper mb-6">
                <input
                  type="text"
                  name="name"
                  value={formData.name}
                  onChange={handleChange}
                  onBlur={handleBlur}
                  className={`${getFieldClassName("name")} AJ-floating-input`}
                  placeholder=" "
                />
                <label className="AJ-floating-label">
                  Section Name <span className="text-red-500">*</span>
                </label>
              </div>

              {/* Section Code */}
              <div className="AJ-floating-label-wrapper mb-6">
                <input
                  type="text"
                  name="code"
                  value={formData.code}
                  onChange={handleChange}
                  onBlur={handleBlur}
                  className={`${getFieldClassName("code")} AJ-floating-input`}
                  placeholder=" "
                />
                <label className="AJ-floating-label">
                  Section Code <span className="text-red-500">*</span>
                </label>
              </div>

              {/* Description */}
              <div className="AJ-floating-label-wrapper mb-6 md:col-span-2">
                <textarea
                  name="description"
                  value={formData.description}
                  onChange={handleChange}
                  onBlur={handleBlur}
                  className={`${getFieldClassName(
                    "description"
                  )} AJ-floating-input`}
                  placeholder=" "
                  rows="3"
                />
                <label className="AJ-floating-label">Description</label>
              </div>

              {/* Supervisor ID */}
              <div className="AJ-floating-label-wrapper mb-6">
                <input
                  type="text"
                  name="supervisorId"
                  value={formData.supervisorId}
                  onChange={handleChange}
                  onBlur={handleBlur}
                  className={`${getFieldClassName(
                    "supervisorId"
                  )} AJ-floating-input`}
                  placeholder=" "
                />
                <label className="AJ-floating-label">
                  Supervisor ID <span className="text-red-500">*</span>
                </label>
              </div>

              {/* Status */}
              <div className="AJ-floating-label-wrapper mb-6">
                <select
                  name="status"
                  value={formData.status}
                  onChange={handleChange}
                  onBlur={handleBlur}
                  className={`${getFieldClassName(
                    "status"
                  )} AJ-floating-input`}
                >
                  <option value="" disabled hidden></option>
                  <option value="active">active</option>
                  <option value="inactive">inactive</option>
                </select>
                <label className="AJ-floating-label">Status</label>
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

export default AddSectionForm;
