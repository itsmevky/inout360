import React, { useState } from "react";
import { toast, ToastContainer } from "react-toastify";
import "react-toastify/dist/ReactToastify.css";
import { API } from "../../../Helpers/api.js";
import Validator from "../../../Helpers/validators.js";
import rules from "./Rules.js";

const AddUserForm = () => {
  const initialFormData = {
   class_id: "",
    subject: "",
    term: "",
    topics: "",
    uploadedBy: "",
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
    e.preventDefault(); // prevent default form submit
    setLoading(true);

    console.log("Form Submit Clicked");

    const isValid = await validateForm();
    // if (!isValid) {
    //   console.log("Validation Failed");
    //   setLoading(false);
    //   return;
    // }

    try {
      console.log("Submitting data:", formData);
      const result = await API.Createroom(formData);
      console.log("API Response:", result);

      if (result.status === true) {
        toast.success("Room created successfully!");
        setFormData(initialFormData); 
      } else {
        toast.error(result.message || "Failed to create room.");
      }
    } catch (error) {
      console.error("Error creating room:", error);
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
            className="w-full max-w-lg mx-auto mt-8"
            noValidate
          >
            <div>
              <h2 className="text-xl font-semibold mb-6 text-gray-800">
                Add New Syllabus
              </h2>
            </div>

            {/* Class_Id */}
            <div className="first-left form-item">
              <input
                type="number"
                name="class_id"
                value={formData.class_id}
                onChange={handleChange}
                onBlur={handleBlur}
                className={getFieldClassName("class_id")}
              />
              <label>
              Class_Id <span className="text-red-500">*</span>
              </label>
            </div>

            {/* Subject */}
            <div className="first-left form-item">
              <input
                type="text"
                name="subject"
                value={formData.subject}
                onChange={handleChange}
                onBlur={handleBlur}
                className={getFieldClassName("subject")}
              />
              <label>Subject<span className="text-red-500">*</span></label>
            </div>

            {/* Term */}
            <div className="first-left form-item">
              <input
                type="number"
                name="term"
                value={formData.term}
                onChange={handleChange}
                onBlur={handleBlur}
                className={getFieldClassName("term")}
              />
              <label>
                Term 
              </label>
            </div>

            {/* Topics */}
            <div className="first-left form-item">
              <input
                type="number"
                name="topics"
                value={formData.topics}
                onChange={handleChange}
                onBlur={handleBlur}
                className={getFieldClassName("topics")}
              />
              <label>
               Topics 
              </label>
            </div>

          

            {/* Type */}
            {/* <div className="form-item first-left select-option-dropdown">
              <select
                name="type"
                value={formData.type}
                onChange={handleChange}
                onBlur={handleBlur}
                className={getFieldClassName("type")}
              >
                <option value="" disabled>
                  Select Type
                </option>
                <option value="Classroom">Classroom</option>
                <option value="Laboratory">Laboratory</option>
                <option value="Library">Library</option>
                <option value="Office">Office</option>
                <option value="Auditorium">Auditorium</option>
                <option value="Other">Other</option>
              </select>
              <label className={formData.type ? "selected" : ""}>
                Type <span className="text-red-500">*</span>
              </label>
            </div> */}

            {/* Status */}
            <div className="form-item first-left select-option-dropdown">
              <select
                name="status"
                value={formData.status}
                onChange={handleChange}
                onBlur={handleBlur}
                className={getFieldClassName("status")}
              >
                <option value="" disabled>
                  Select Status
                </option>
                <option value="Active">Active</option>
                <option value="Disabled">Disabled</option>
                <option value="Blocked">Blocked</option>
                <option value="Trash">Trash</option>
              </select>
              <label className={formData.status ? "selected" : ""}>
                Status <span className="text-red-500">*</span>
              </label>
            </div>

            {/* Submit Button */}
            <div className="flex">
              <button
                type="submit"
                className="upclick px-4 mt-5 py-2 text-white bg-blue-600 text-sm font-medium rounded-md hover:bg-blue-700 focus:outline-none"
              >
                {loading ? "Creating..." : "Create Room"}
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
