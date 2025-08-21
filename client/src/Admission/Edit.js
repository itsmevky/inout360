import React, { useState, useEffect } from "react";
import { useParams } from "react-router-dom";
import axios from "axios";
import { toast } from "react-toastify";
import Cookies from "js-cookie";
import Validator from "../Helpers/validators.js";
import { getData, putData } from "../Helpers/api.js";
import { ToastContainer } from "react-toastify";
import "react-toastify/dist/ReactToastify.css";
import { useNavigate } from "react-router-dom";
import rules from "./Rules.js";
import bcrypt from "bcryptjs"; // Import bcryptjs for hashing password

const Edit = ({ user }) => {
  const navigate = useNavigate(); // Correct usage of useNavigate

  let userId = user;
  const [formData, setFormData] = useState({
    first_name: "",
    last_name: "",
    email: "",
    phone: "",
    class_applied: "",
    status: "", // Add status here
  });

  // Fetch user data based on userId when the Component mounts
  useEffect(() => {
    const fetchformData = async () => {
      if (!userId) return; // Wait until userId is defined

      setLoading(true);
      try {
        const response = await getData(`/admission/${userId}`);
        if (response?.data) {
          setFormData((prevData) => ({
            ...prevData,
            first_name: response.data.first_name || "",
            last_name: response.data.last_name || "",
            email: response.data.email || "",
            phone: response.data.phone || "",
            class_applied:
              response.data.academic_info?.[0]?.class_applied || "",
            status: response.data.status || "",
          }));
        }
      } catch (error) {
        console.error("Error fetching admission data:", error);
      } finally {
        setLoading(false);
      }
    };

    fetchformData();
  }, [userId]);

  // Re-run when userId changes
  const validator = new Validator(rules);
  const handleSubmit = async (e) => {
    e.preventDefault();
    setLoading(true);

    try {
      // Use the singleuserUpdate function to update the user
      const response = await singleuserUpdate(userId, formData); // Call to your custom function

      if (response.status) {
        setSuccess(true);
        toast.success("User updated successfully!");
        navigate("/dashboard/users"); // Redirect to user list page after success
      } else {
        setSuccess(false);
        toast.error("Error updating user.");
      }
    } catch (error) {
      setSuccess(false);
      toast.error("Error updating user.");
    } finally {
      setLoading(false);
    }
  };
  const singleuserUpdate = async (id, data) => {
    try {
      const response = await putData(`/user/${id}`, data);
      return response; // Return the response so we can handle success/failure
    } catch (error) {
      console.error("Error updating user:", error);
      throw error; // Throw error for the calling function to catch
    }
  };
  const CLASS_OPTIONS = [
    { id: "1", name: "1" },
    { id: "2", name: "2" },
    { id: "3", name: "" },
  ];

  const [formVisible, setFormVisible] = useState(true); // State to control form visibility
  const [errors, setErrors] = useState({});
  const [touched, setTouched] = useState({
    first_name: false,
    email: false,
    phone: false,

    role: false,
    status: false,
  });

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
    return errors[fieldName] ? "aj-field-error" : "aj-field";
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
  useEffect(() => {
    console.log("Fetched User Data:", formData); // Debug check
  }, [formData]);

  return (
    <div>
      {formVisible && (
        <div className="AJ-adduser-form-section">
          <form
            className=" w-full max-w-lg mx-auto mt-8"
            onSubmit={handleSubmit}
          >
            <h2 className="AJ-text-xl AJ-font-semibold mb-6 AJ-text-gray-800">
              Edit User
            </h2>

            {/* First Name */}

            <div className="AJ-floating-label-wrapper">
              <input
                type="text"
                placeholder=" "
                name="first_name"
                value={formData.first_name}
                onChange={handleChange}
                onBlur={handleBlur}
                className={
                  getFieldClassName("first_name") + " AJ-floating-input"
                }
              />
              <label className="AJ-floating-label">
                First Name <span className="AJ-text-red-500">*</span>
              </label>
            </div>

            {/* Last Name */}

            <div className="AJ-floating-label-wrapper">
              <input
                type="text"
                placeholder=" "
                name="last_name"
                value={formData.last_name}
                onChange={handleChange}
                onBlur={handleBlur}
                className={
                  getFieldClassName("last_name") + " AJ-floating-input"
                }
              />
              <label className="AJ-floating-label">Last Name</label>
            </div>

            {/* Email */}

            <div className="AJ-floating-label-wrapper">
              <input
                type="text"
                placeholder=" "
                name="email"
                value={formData.email}
                onChange={handleChange}
                onBlur={handleBlur}
                className={getFieldClassName("email") + " AJ-floating-input"}
              />
              <label className="AJ-floating-label">
                Email <span className="AJ-text-red-500">*</span>
              </label>
            </div>

            <div className="AJ-flex AJ-justify-between">
              <button
                type="submit"
                className="AJ-upclick AJ-px-4 AJ-mt-5 AJ-py-2 AJ-text-white AJ-text-sm AJ-font-medium AJ-rounded-md AJ-hover:bg-blue-700 AJ-focus:outline-none AJ-focus:ring-2 AJ-focus:ring-blue-500 AJ-focus:ring-offset-2"
              >
                Update
              </button>
            </div>
            {/* Phone */}

            <div className="AJ-floating-label-wrapper">
              <input
                type="tel"
                name="phone"
                value={formData.phone}
                onChange={(e) =>
                  setFormData({ ...formData, phone: e.target.value })
                }
                className={getFieldClassName("phone") + " AJ-floating-input"}
              />

              <label className="AJ-floating-label">
                Phone Number <span className="AJ-text-red-500">*</span>
              </label>
            </div>

            <div className="AJ-floating-label-wrapper">
              <select
                name="class_applied"
                value={formData.class_applied}
                onChange={handleChange}
                onBlur={handleBlur}
                className={
                  getFieldClassName("class_applied") + " AJ-floating-input"
                }
              >
                {CLASS_OPTIONS.map((cls) => (
                  <option key={cls.id} value={cls.id}>
                    {cls.name}
                  </option>
                ))}
              </select>

              <label className={formData.class_applied ? "AJ-selected" : ""}>
                Class Applied <span className="AJ-text-red-500">*</span>
              </label>
            </div>

            {/* Status Dropdown */}

            <div className="AJ-floating-label-wrapper">
              <select
                name="status"
                value={formData.status}
                onChange={handleChange}
                onBlur={handleBlur}
                className={getFieldClassName("status") + " AJ-floating-input"}
              >
                <option value="active">Active</option>
                <option value="inactive">Inactive</option>
                <option value="suspended">Suspended</option>
              </select>
              <label className={formData.status ? "AJ-selected" : ""}>
                Status <span className="AJ-text-red-500">*</span>
              </label>
            </div>

            {/* Submit Button */}
          </form>
        </div>
      )}
      <ToastContainer position="top-right" autoClose={3000} />
      {loading && (
        <div className="AJ-loader-wrapper">
          <div className="AJ-loader"></div>
        </div>
      )}
    </div>
  );
};

export default Edit;
