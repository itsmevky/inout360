import React, { useState, useEffect } from "react";
import { useParams } from "react-router-dom"; // To extract the subject ID from the URL
import axios from "axios";
import { toast } from "react-toastify";
import Cookies from "js-cookie";
import Validator from "../../../Helpers/validators.js";
import { getData, putData } from "../../../Helpers/api.js";
import { ToastContainer } from "react-toastify";
import "react-toastify/dist/ReactToastify.css";
import { useNavigate } from "react-router-dom";
import rules from "./Rules.js";
import bcrypt from "bcryptjs"; // Import bcryptjs for hashing password

const EditsubjectForm = ({ id }) => {
  let subjectId = id;
  const [formData, setFormData] = useState({
    subjectname: "",
    subjectcode: "",
    description: "",
    classId: "",
    teacherId:""  
  });

  //Fetch subject data based on subjectId when the Component mounts
  useEffect(() => {
    const fetchsubjectdata = async () => {
      setLoading(true);
      try {
        //Use your subjectdata function to fetch subjects data
        const subjectdata = await getData(`/subjects/${id}`); // API endpoint to get subject by ID
        console.log("subjectdata", subjectdata)
        if (subjectdata) {
          setFormData({
            subjectname: subjectdata.subjectname || "",
            subjectcode: subjectdata.subjectcode || "",
            description: subjectdata.description || "",
            classId: subjectdata.classId || "",
            teacherId: subjectdata.teacherId || "", // Populate status
          });
        }
      } catch (error) {
        console.error("Error fetching subject data:", error);
      } finally {
        setLoading(false);
      }
    };

    fetchsubjectdata();
  }, [subjectId]); // Re-run when subjectId changes
  const validator = new Validator(rules);
  const handleSubmit = async (e) => {
    e.preventDefault();
    setLoading(true);
  
    try {
      // Clone formData to avoid direct state mutation
      const updatedFormData = { ...formData };
  
      // Optional: Perform validation if needed
      const validationErrors = await validator.validate(updatedFormData, rules);
      if (Object.keys(validationErrors).length > 0) {
        setErrors(validationErrors);
        toast.error("Please correct the errors in the form.");
        setLoading(false);
        return;
      }
  
      // Submit the updated data to the server
      await putData(`/subjects/${subjectId}`, updatedFormData);
  
      toast.success("Subject updated successfully!");
      setSuccess(true);
      navigate("/dashboard/getsubject");
    } catch (error) {
      setSuccess(false);
      console.error("Update Error:", error.response || error);
      const message = error?.response?.data?.message || "Error updating subject.";
      toast.error(message);
    } finally {
      setLoading(false);
    }
  };
  
  const [formVisible, setFormVisible] = useState(true); // State to control form visibility
  const [errors, setErrors] = useState({});
  const [touched, setTouched] = useState({
    subjectname: false,
    subjectcode: false,
    description: false,
    classId: false,
    teacherId:false
    
  });
  const navigate = useNavigate();
  const [success, setSuccess] = useState(false);
  const [loading, setLoading] = useState(false);

  const handleBlur = async (e) => {
    const { name, value } = e.target;
    setTouched({ ...touched, [name]: true });
    const fieldErrors = await validateFormField(name, value);
    setErrors((prevErrors) => ({
      ...prevErrors,
      [name]: fieldErrors[name],
    }));
  };

  const validateFormField = async (name, value) => {
    const fieldRule = { [name]: rules[name] };
    const fieldData = { [name]: value };
    const validationErrors = await validator.validate(fieldData, fieldRule);
    return validationErrors;
  };
  const getFieldClassName = (fieldName) => {
    return errors[fieldName] ? "field-error" : "field";
  };

  const encodeData = (data) => {
    return btoa(JSON.stringify(data));
  };

  const handleChange = (e) => {
    const { name, value } = e.target;
    setFormData({
      ...formData,
      [name]: value,
    });
  };

  return (
    <div>
      {formVisible && (
        <div className="addsubject-outer-section">
          <div className="addsubject-inner-section">
            <div className="addsubject-form-section">
              <form
                className="aj-crm-adding w-full max-w-lg mx-auto mt-8"
                onSubmit={handleSubmit}
              >
                <h2 className=" text-xl font-semibold mb-6 text-gray-800 ">
                  Edit Subject
                </h2>

                {/* subjectname */}
                <div className="first-left form-item">
                  <input
                    type="text"
                    placeholder=""
                    name="subjectname"
                    value={formData.subjectname}
                    onChange={handleChange}
                    onBlur={handleBlur}
                    className={getFieldClassName("subjectname")}
                  />
                  <label className="text-sm text-#000-200">
                  Subjectname<span className="text-red-500">*</span>
                  </label>
                </div>

                {/* subjectcode */}
                <div className="first-left form-item">
                  <input
                    type="text"
                    placeholder=""
                    name="subjectcode"
                    value={formData.subjectcode}
                    onChange={handleChange}
                    onBlur={handleBlur}
                    className={getFieldClassName("subjectcode")}
                  />
                  <label className="text-sm text-#000-500">Subjectcode</label>
                </div>

                {/* description */}
                <div className="first-left form-item">
                  <input
                    type="text"
                    placeholder=""
                    name="description"
                    value={formData.description}
                    onChange={handleChange}
                    onBlur={handleBlur}
                    className={getFieldClassName("description")}
                  />
                  <label className="text-sm text-#000-500">Description</label>
                </div>

                {/* classId */}
                <div className="first-left form-item">
                  <input
                    type="text"
                    placeholder=""
                    name="classId"
                    value={formData.classId}
                    onChange={handleChange}
                    onBlur={handleBlur}
                    className={getFieldClassName("classId")}
                  />
                  <label className="text-sm text-#000-500">Class</label>
                </div>


                {/* teacherId */}
                <div className="first-left form-item">
                  <input
                    type="text"
                    placeholder=""
                    name="teacherId"
                    value={formData.teacherId}
                    onChange={handleChange}
                    onBlur={handleBlur}
                    className={getFieldClassName("teacherId")}
                  />
                  <label className="text-sm text-#000-500">Teacher</label>
                </div>


                {/* Password */}
                {/* <div className="first-left form-item">
                <input
                  type="password"
                  placeholder=""
                  name="password"
                  value={formData.password}
                  onChange={handleChange}
                  onBlur={handleBlur}
                
                  className={getFieldClassName("password")}
                />
                <label className="block text-sm text-#000-500">
                  Password<span className="text-red-500">*</span>
                </label>
              </div> */}

                {/* Role */}
                {/* <div className="select-option-dropdown first-left form-item">
                  <select
                    name="role"
                    value={formData.role}
                    onChange={handleChange}
                    onBlur={handleBlur}
                    className={getFieldClassName("role")}
                  >
                    <option value="">select an option</option>
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
                {/* Status Dropdown */}
                {/* <div className="select-option-dropdown first-left form-item">
                  <select
                    name="status"
                    value={formData.status}
                    onChange={handleChange}
                    onBlur={handleBlur}
                    className={getFieldClassName("status")}
                  >
                    <option value="active">Active</option>
                    <option value="inactive">Inactive</option>
                    <option value="suspended">Suspended</option>
                  </select>
                  <span className="dropdown-icon">▼</span>
                  <label className={formData.status ? "selected" : ""}>
                    Status <span className="text-red-500">*</span>
                  </label>
                </div> */}

                {/* Submit Button */}
                <div className="flex justify-between">
                  {/* <button
                    type="rsesetpassword"
                    className="upclick px-4 mt-5 py-2 text-white text-sm font-medium rounded-md hover:bg-blue-700 focus:outline-none focus:ring-2 focus:ring-blue-500 focus:ring-offset-2"
                  >
                    Reset Password
                  </button> */}
                  <button
                    type="submit"
                    className="upclick px-4 mt-5 py-2 text-white text-sm font-medium rounded-md hover:bg-blue-700 focus:outline-none focus:ring-2 focus:ring-blue-500 focus:ring-offset-2"
                  >
                    Update
                  </button>
                </div>
              </form>
            </div>
          </div>
        </div>
      )}
      <ToastContainer position="top-right" autoClose={3000} />
      {loading && (
        <div className="loader-wrapper">
          <div className="loader"></div>
        </div>
      )}
    </div>
  );
};

export default EditsubjectForm;
