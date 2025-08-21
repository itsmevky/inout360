import React, { useState, useEffect } from "react";
import { useParams } from "react-router-dom";
import axios from "axios";
import { toast } from "react-toastify";
import Cookies from "js-cookie";
import Validator from "../../Helpers/validators.js";
import { getData, putData } from "../../Helpers/api.js";
import { ToastContainer } from "react-toastify";
import "react-toastify/dist/ReactToastify.css";
import { useNavigate } from "react-router-dom";
import rules from "./Rules.js";
import bcrypt from "bcryptjs"; // Import bcryptjs for hashing password

const EditUserForm = ({ user }) => {
  const navigate = useNavigate(); // Correct usage of useNavigate

  let userid = user;
  console.log("user---------------ffffffffffffffff", user);
  const [formData, setFormData] = useState({
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
  });

  // Fetch user data based on userid when the Component mounts
  useEffect(() => {
    if (user) {
      setFormData({
        firstName: user.firstName || "",
        lastName: user.lastName || "",
        email: user.email || "",
        password: user.password || "", // Do not pre-fill password
        phone: user.phone || "",
        gender: user.gender || "",
        address: user.address || "",
        dob: user.dob ? user.dob.split("T")[0] : "",
        joiningDate: user.joiningDate ? user.joiningDate.split("T")[0] : "",
        designation: user.designation || "",
        section: user.section || "",
        shift: user.shift || "",
      });
    }
  }, [user]);

  // Re-run when userid changes
  const validator = new Validator(rules);
  const handleSubmit = async (e) => {
    e.preventDefault();
    setLoading(true);

    try {
      // Use the singleuserUpdate function to update the user
      const response = await singleuserUpdate(userid, formData); // Call to your custom function

      if (response.status) {
        setSuccess(true);
        toast.success("Employee updated successfully!");
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
      const response = await putData(`/employees/${id}`, data);
      return response; // Return the response so we can handle success/failure
    } catch (error) {
      console.error("Error updating user:", error);
      throw error; // Throw error for the calling function to catch
    }
  };

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
            className="w-full max-w-5xl mx-auto mt-8"
            onSubmit={handleSubmit}
          >
            <div>
              <h2 className="text-lg font-semibold mb-6 text-gray-800">
                Edit Employee
              </h2>
            </div>

            {/* FORM GRID */}
            <div className="grid grid-cols-1 md:grid-cols-2 gap-x-6 gap-y-4">
              {/* First Name */}
              <div className="AJ-floating-label-wrapper">
                <input
                  type="text"
                  placeholder=" "
                  name="firstName"
                  value={formData.firstName}
                  onChange={handleChange}
                  onBlur={handleBlur}
                  className={
                    getFieldClassName("firstName") + " AJ-floating-input"
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
                  name="lastName"
                  value={formData.lastName}
                  onChange={handleChange}
                  onBlur={handleBlur}
                  className={
                    getFieldClassName("lastName") + "AJ-floating-input"
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

              {/* Password */}
              <div className="AJ-floating-label-wrapper">
                <input
                  type="number"
                  placeholder=" "
                  name="password"
                  value={formData.password}
                  onChange={handleChange}
                  onBlur={handleBlur}
                  className={
                    getFieldClassName("password") + " AJ-floating-input"
                  }
                />
                <label className="AJ-floating-label">
                  Password <span className="AJ-text-red-500">*</span>
                </label>
              </div>

              {/* Phone */}
              <div className="AJ-floating-label-wrapper">
                <input
                  type="phone"
                  placeholder=" "
                  name="phone"
                  value={formData.phone}
                  onChange={handleChange}
                  onBlur={handleBlur}
                  className={getFieldClassName("phone") + " AJ-floating-input"}
                />
                <label className="AJ-floating-label">
                  Phone <span className="AJ-text-red-500">*</span>
                </label>
              </div>

              {/* Gender */}
              <div className="AJ-floating-label-wrapper">
                <input
                  type="text"
                  placeholder=" "
                  name="gender"
                  value={formData.gender}
                  onChange={handleChange}
                  onBlur={handleBlur}
                  className={getFieldClassName("gender") + " AJ-floating-input"}
                />
                <label className="AJ-floating-label">Gender</label>
              </div>

              {/* Address */}
              <div className="AJ-floating-label-wrapper">
                <input
                  type="text"
                  placeholder=" "
                  name="address"
                  value={formData.address}
                  onChange={handleChange}
                  onBlur={handleBlur}
                  className={
                    getFieldClassName("address") + " AJ-floating-input"
                  }
                />
                <label className="AJ-floating-label">Address</label>
              </div>

              {/* Date of Birth */}
              <div className="AJ-floating-label-wrapper">
                <input
                  type="date"
                  placeholder=" "
                  name="dob"
                  value={formData.dob}
                  onChange={handleChange}
                  onBlur={handleBlur}
                  className={getFieldClassName("dob") + " AJ-floating-input"}
                />
                <label className="AJ-floating-label">Date of Birth</label>
              </div>

              {/* Joining Date */}
              <div className="AJ-floating-label-wrapper">
                <input
                  type="date"
                  placeholder=" "
                  name="joiningDate"
                  value={formData.joiningDate}
                  onChange={handleChange}
                  onBlur={handleBlur}
                  className={
                    getFieldClassName("joiningDate") + " AJ-floating-input"
                  }
                />
                <label className="AJ-floating-label">Joining Date</label>
              </div>

              {/* Designation */}
              <div className="AJ-floating-label-wrapper">
                <input
                  type="text"
                  placeholder=" "
                  name="designation"
                  value={formData.designation}
                  onChange={handleChange}
                  onBlur={handleBlur}
                  className={
                    getFieldClassName("designation") + " AJ-floating-input"
                  }
                />
                <label className="AJ-floating-label">Designation</label>
              </div>

              {/* Section */}
              <div className="AJ-floating-label-wrapper">
                <input
                  type="text"
                  placeholder=" "
                  name="section"
                  value={formData.section}
                  onChange={handleChange}
                  onBlur={handleBlur}
                  className={
                    getFieldClassName("section") + " AJ-floating-input"
                  }
                />
                <label className="AJ-floating-label">Section</label>
              </div>

              {/* Shift */}
              <div className="AJ-floating-label-wrapper">
                <input
                  type="text"
                  placeholder=" "
                  name="shift"
                  value={formData.shift}
                  onChange={handleChange}
                  onBlur={handleBlur}
                  className={getFieldClassName("shift") + " AJ-floating-input"}
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
                {loading ? "Updating..." : "Submit"}
              </button>
            </div>
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

export default EditUserForm;
