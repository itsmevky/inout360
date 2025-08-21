import React, { useState } from "react";
import { toast, ToastContainer } from "react-toastify";
import "react-toastify/dist/ReactToastify.css";
import { API } from "../../Helpers/api.js";
import Validator from "../../Helpers/validators.js";
import rules from "./Rules.js";

const AddUserForm = () => {
  const initialFormData = {
    className: "",
    description: "",
    capacity: "",
    rooms: "",
    teacherId: "",
    feeIds: "",
    utilities: "",
  };

  const [formData, setFormData] = useState(initialFormData);
  const [errors, setErrors] = useState({});
  const [touched, setTouched] = useState({
    className: false,
    description: false,
    capacity: false,
    rooms: false,
    teacherId: false,
    feeIds: false,
    utilities: false,
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

  //Validate the entire form
  const validateForm = async () => {
    const validationErrors = await validator.validate(formData, rules);
    setErrors(validationErrors);
    return Object.keys(validationErrors).length === 0;
  };

  // Submit form
  const handleSubmit = async (e) => {
    e.preventDefault();
    setLoading(true);
    console.log("jdbdkgldzkgjdlkzgd", setLoading);
    // const isValid = await validateForm();
    // if (!isValid) {
    //   setLoading(false);
    //   return;
    // }

    try {
      console.log("Submitting data:", formData);
      const result = await API.Createclass(formData);
      console.log("API Response:", result);

      if (result.status === true) {
        toast.success("class created successfully!");
        setFormData(initialFormData); // Reset form
      } else {
        toast.error(result.message || "Failed to create class.");
      }
    } catch (error) {
      console.error("Error creating class:", error);
      toast.error(
        "An error occurred while creating the class. Please try again."
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
                Add New Class
              </h2>
            </div>

            {/* ClassName */}
            <div className="first-left form-item">
              <input
                type="text"
                name="className"
                value={formData.className}
                onChange={handleChange}
                onBlur={handleBlur}
                className={getFieldClassName("className")}
              />
              <label>
                ClassName<span className="text-red-500">*</span>
              </label>
            </div>

            {/* Description */}
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

            {/* Capacity */}
            <div className="first-left form-item">
              <input
                type="number"
                name="capacity"
                value={formData.capacity}
                onChange={handleChange}
                onBlur={handleBlur}
                className={getFieldClassName("capacity")}
              />
              <label>
                Capacity <span className="text-red-500">*</span>
              </label>
            </div>

            {/* Room */}
            <div className="first-left form-item">
              <input
                type="number"
                name="rooms"
                value={formData.rooms}
                onChange={handleChange}
                onBlur={handleBlur}
                className={getFieldClassName("rooms")}
              />
              <label>
                Room <span className="text-red-500">*</span>
              </label>
            </div>
{/* 
             <div className="first-left form-item">
              <input
                type="text"
                name="teacherId"
                value={formData.teacherId}
                onChange={handleChange}
                onBlur={handleBlur}
                className={getFieldClassName("teacherId")}
              />
              <label>
                Teacher <span className="text-red-500">*</span>
              </label>
            </div> */}

              {/* teacher */}
            <div className="select-option-dropdown first-left form-item">
              <select
                name="Teacher"
                value={formData.teacherId}
                onChange={handleChange}
                onBlur={handleBlur}
                className={getFieldClassName("teacherId")}
              >
                <option value="Ashish">Ashish</option>
                <option value="Amit">Amit</option>   
                <option value="Akshu">Akshu</option>
                <option value="Akshu">Lalita</option>

               
              </select>
              <span className="dropdown-icon">▼</span>
              <label className={formData.teacherId ? "selected" : ""}>
                Teacher <span className="text-red-500">*</span>
              </label>
              </div>  

            

            {/* FeeIds */}
            <div className="first-left form-item">
              <input
                type="text"
                name="feeIds"
                value={formData.feeIds}
                onChange={handleChange}
                onBlur={handleBlur}
                className={getFieldClassName("feeIds")}
              />
              <label>
                Fee <span className="text-red-500">*</span>
              </label>
            </div>

            {/* utilities */}
            <div className="first-left form-item">
              <input
                type="text"
                name="utilities"
                value={formData.utilities}
                onChange={handleChange}
                onBlur={handleBlur}
                className={getFieldClassName("utilities")}
              />
              <label>
                Utilities <span className="text-red-500">*</span>
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
                {loading ? "Creating..." : "Create class"}
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
