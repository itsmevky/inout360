import React, { useState } from "react";
import { useEffect } from "react"; // Add this if not imported
import { toast, ToastContainer } from "react-toastify";
import "react-toastify/dist/ReactToastify.css";
import { API } from "../../../Helpers/api.js";
import Validator from "../../../Helpers/validators.js";
import rules from "./Rules.js";

const AddsubjectForm = () => {
  const initialFormData = {
    subjectname: "",
    subjectcode: "",
    description: "",
    classId: "",
    teacherId: ""
  };

  const [formData, setFormData] = useState(initialFormData);
  const [teachers, setTeachers] = useState([]); // State to store fetched teachers
  const [errors, setErrors] = useState({});
  const [touched, setTouched] = useState({
    subjectname: false,
    subjectcode: false,
    description: false,
    classId: false,
    teacherId: false
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
   console.log("handleSubmit", handleSubmit)
      const isValid = await validateForm();
      if (!isValid) {
        setLoading(false);
        return;
      }

    try {
      console.log("Submitting data:", formData);
      const result = await API.createsubject(formData);
      console.log("API Response:", result);

      if (result.status === true) {
        toast.success("Subject created successfully!");
        setFormData(initialFormData); 
      } else {
        toast.error(result.message || "Failed to create Subject.");
      }
    } catch (error) {
      console.error("Error creating Subject:", error);
      toast.error(
        "An error occurred while creating the Subject. Please try again."
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
                Add New Subject
              </h2>
            </div>

            {/* SubjectName */}
            <div className="first-left form-item">
              <input
                type="text"
                name="subjectname"
                value={formData.subjectname}
                onChange={handleChange}
                onBlur={handleBlur}
                className={getFieldClassName("subjectname")}
              />
              <label>
              SubjectName<span className="text-red-500">*</span>
              </label>
            </div>

            {/* SubjectCode*/}
            <div className="first-left form-item">
              <input
                type="text"
                name="subjectcode"
                value={formData.subjectcode}
                onChange={handleChange}
                onBlur={handleBlur}
                className={getFieldClassName("subjectcode")}
              />
              <label>SubjectCode</label>
            </div>

           {/* description */}
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

           {/* classId */}
           <div className="first-left form-item">
              <input
                type="text"
                name="classId"
                value={formData.classId}
                onChange={handleChange}
                onBlur={handleBlur}
                className={getFieldClassName("classId")}
              />
              <label>Class</label>
            </div>

            {/* teacherId */}
            {/* <div className="first-left form-item">
              <input
                type="text"
                name="teacherId"
                value={formData.teacherId}
                onChange={handleChange}
                onBlur={handleBlur}
                className={getFieldClassName("teacherId")}
              />
              <label>Teacher</label>
            </div> */}

            {/* Teacher */}
            <div className="select-option-dropdown first-left form-item">
              <select
                name="teacherId"
                value={formData.teacherId}
                onChange={handleChange}
                onBlur={handleBlur}
                className={getFieldClassName("teacherId")}
              >
                <option value="">Select Teacher</option>
                {teachers.map((teacher) => (
                  <option key={teacher._id} value={teacher._id}>
                    {teacher.name} {/* Assuming teacher has a name field */}
                  </option>
                ))}
              </select>
              <span className="dropdown-icon">▼</span>
              <label className={formData.teacherId ? "selected" : ""}>
                Teacher <span className="text-red-500">*</span>
              </label>
            </div>

            {/* Status */}
            {/* <div className="select-option-dropdown first-left form-item">
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
            </div> */}

            {/* Submit Button */}
            <div className="flex">
              <button
                type="submit"
                className="upclick px-4 mt-5 py-2 text-white text-sm font-medium rounded-md hover:bg-blue-700 focus:outline-none"
              >
                {loading ? "Creating..." : "Create Subject"}
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

export default AddsubjectForm;
