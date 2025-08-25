import React, { useState, useEffect } from "react";
import { toast, ToastContainer } from "react-toastify";
import "react-toastify/dist/ReactToastify.css";
import { useNavigate, useParams } from "react-router-dom";
import Validator from "../../../Helpers/validators.js";
import { getData, putData } from "../../../Helpers/api.js";
import rules from "../Rules.js";

const EditSectionForm = () => {
  const { id } = useParams(); // Section ID from URL
  const navigate = useNavigate();

  const [formData, setFormData] = useState({
    name: "",
    code: "",
    description: "",
    supervisorId: "",
    status: "",
  });

  const [errors, setErrors] = useState({});
  const [loading, setLoading] = useState(false);
  const validator = new Validator(rules);

  // Fetch section data
  useEffect(() => {
    const fetchSection = async () => {
      setLoading(true);
      try {
        const section = await getData(`/sections/${id}`);
        if (section) {
          setFormData({
            name: section.name || "",
            code: section.code || "",
            description: section.description || "",
            supervisorId: section.supervisorId || "",
            status: section.status || "",
          });
        }
      } catch (error) {
        console.error("❌ Error fetching section:", error);
        toast.error("Failed to fetch section details.");
      } finally {
        setLoading(false);
      }
    };

    fetchSection();
  }, [id]);

  // Handle field changes
  const handleChange = (e) => {
    const { name, value } = e.target;
    setFormData((prev) => ({ ...prev, [name]: value }));
  };

  // Handle blur validation
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

  // Full form validation
  const validateForm = async () => {
    const validationErrors = await validator.validate(formData, rules);
    setErrors(validationErrors);
    return Object.keys(validationErrors).length === 0;
  };
  
  // Submit handler
  const handleSubmit = async (e) => {
    e.preventDefault();
    setLoading(true);

    const isValid = await validateForm();
    if (!isValid) {
      console.warn("❌ Validation Failed");
      setLoading(false);
      return;
    }

    try {
      const response = await putData(`/sections/${id}`, formData);
      if (response.success || response.status) {
        toast.success("✅ Section updated successfully!");
        navigate("/dashboard/sections"); // redirect back to section list
      } else {
        toast.error(response.message || "❌ Failed to update section.");
      }
    } catch (error) {
      console.error("❌ Error updating section:", error);
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
            <h2 className="text-lg font-semibold mb-6 text-gray-800">
              Edit Section
            </h2>

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
                  className={`${getFieldClassName("status")} AJ-floating-input`}
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
                {loading ? "Updating..." : "Update"}
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

export default EditSectionForm;
