import React, { useState } from "react";
import { toast } from "react-toastify";
import Cookies from "js-cookie";
import Validator from "../../helpers/validators.js";
import { postData } from "../../helpers/api.js";
import { ToastContainer } from "react-toastify";
import "react-toastify/dist/ReactToastify.css";
import { useNavigate } from "react-router-dom";

const AddUserForm = () => {
  const [formData, setFormData] = useState({
    first_name: "",
    last_name: "",
    email: "",
    phone: "",
    password: "",
    role: "",
  });

  const [errors, setErrors] = useState({});
  const [touched, setTouched] = useState({
    first_name: false,
    email: false,
    phone: false,
    password: false,
    role: false,
  });
  const navigate = useNavigate();
  const [success, setSuccess] = useState(false);
  const [loading, setLoading] = useState(false);

  const rules = {
    first_name: {
      required: true,
      type: "string",
      errorMessage: "First name is required.",
    },
    last_name: {
      required: true,
      type: "string",
      errorMessage: "Last name is required.",
    },
    email: {
      required: true,
      type: "string",
      errorMessage: "Email is required.",
    },
    password: {
      required: true,
      type: "string",
      errorMessage: "Password is required.",
    },
    phone: {
      required: true,
      type: "string",
      errorMessage: "Contact Number is required.",
    },
    role: {
      required: true,
      type: "string",
      errorMessage: "Role is required.",
    },
  };

  const handleBlur = async (e) => {
    const { name, value } = e.target;
    setTouched({ ...touched, [name]: true });
    const fieldErrors = await validateFormField(name, value);
    setErrors((prevErrors) => ({
      ...prevErrors,
      [name]: fieldErrors[name],
    }));
  };

  const getFieldClassName = (fieldName) => {
    return errors[fieldName] ? "field-error" : "field";
  };

  const handleFocus = (e) => {
    const { name } = e.target;
    setTouched({ ...touched, [name]: false });
    setErrors({ ...errors, [name]: "" });
  };

  const handleChange = (e) => {
    const { name, value } = e.target;
    setFormData({
      ...formData,
      [name]: value,
    });
  };

  const validateFormField = async (name, value) => {
    const fieldRule = { [name]: rules[name] };
    const fieldData = { [name]: value };
    const validationErrors = await Validator.validate(fieldData, fieldRule);
    return validationErrors;
  };

  const validateform = async (formData) => {
    const validationErrors = await Validator.validate(formData, rules);
    if (Object.keys(validationErrors).length > 0) {
      setErrors(validationErrors);
      return true;
    }
    setErrors(validationErrors);
    return;
  };

  const sendData = async (data) => {
    try {
      setLoading(true);
      const result = await postData(`/user`, data);
      if (result.status === true) {
        const { user, accessToken } = result.data;
        localStorage.setItem("accesstoken", accessToken);
        Cookies.set("accesstoken", accessToken);
        const encodedUserDetails = btoa(JSON.stringify(user));
        Cookies.set("userdetail", encodedUserDetails);
        toast.success("User created successfully!");
        setTimeout(() => navigate("/login"), 1500);
      } else {
        toast.error(result.message || "Failed to create user.");
      }
    } catch (error) {
      console.error("Error creating user:", error);
      toast.error(
        "An error occurred while creating the user. Please try again."
      );
    } finally {
      setLoading(false);
    }
  };
  const encodeData = (data) => {
    return btoa(JSON.stringify(data));
  };

  const handleSubmit = async (e) => {
    e.preventDefault();
    setLoading(true);
    const validationErrors = await validateform(formData);
    if (validationErrors) {
      setLoading(false);
      return;
    }
    await sendData(formData);
    setLoading(false);
  };

  return (
    <div className="adduser-outer-section">
      <div className="adduser-inner-section">
        <div className="adduser-form-section">
          <form
            className=" aj-crm-adding w-full max-w-lg mx-auto mt-8 "
            onSubmit={handleSubmit}
          >
            <div>
              <h2 className=" text-xl font-semibold mb-6 text-gray-800 ">
                Add New User
              </h2>
            </div>

            {/* First Name */}
            <div className="first-left form-item">
              <input
                type="text"
                placeholder=""
                name="first_name"
                value={formData.first_name}
                onChange={handleChange}
                onBlur={handleBlur}
                onFocus={handleFocus}
                className={getFieldClassName("first_name")}
              />
              <label className="text-sm text-#000-200">
                First Name<span className="text-red-500">*</span>
              </label>
              {/* {errors.first_name && (
                <p className="text-red-500">{errors.first_name}</p>
              )} */}
            </div>

            {/* Last Name */}
            <div className="first-left form-item">
              <input
                type="text"
                placeholder=""
                name="last_name"
                value={formData.last_name}
                onChange={handleChange}
                onBlur={handleBlur}
                onFocus={handleFocus}
                className={getFieldClassName("last_name")}
              />
              <label className="text-sm text-#000-500">Last Name</label>
              {/* {errors.last_name && (
                <p className="text-red-500">{errors.last_name}</p>
              )} */}
            </div>

            {/* Email */}
            <div className="first-left form-item">
              <input
                type="text"
                placeholder=""
                name="email"
                value={formData.email}
                onChange={handleChange}
                onBlur={handleBlur}
                onFocus={handleFocus}
                className={getFieldClassName("email")}
              />
              <label className="block text-sm text-#000-500">
                Email<span className="text-red-500">*</span>
              </label>
              {/* {errors.email && <p className="text-red-500">{errors.email}</p>} */}
            </div>

            {/* Phone */}
            <div className="first-left form-item">
              <input
                type="number"
                placeholder=""
                name="phone"
                value={formData.phone}
                onChange={handleChange}
                onBlur={handleBlur}
                onFocus={handleFocus}
                className={getFieldClassName("phone")}
              />
              <label className="block text-sm text-#000-500">
                Phone Number<span className="text-red-500">*</span>
              </label>
              {/* {errors.phone && <p className="text-red-500">{errors.phone}</p>} */}
            </div>

            {/* Password */}
            <div className="first-left form-item">
              <input
                type="password"
                placeholder=""
                name="password"
                value={formData.password}
                onChange={handleChange}
                onBlur={handleBlur}
                onFocus={handleFocus}
                className={getFieldClassName("password")}
              />
              <label className="block text-sm text-#000-500">
                Password<span className="text-red-500">*</span>
              </label>
              {/* {errors.password && (
                <p className="text-red-500">{errors.password}</p>
              )} */}
            </div>

            {/* Role */}
            <div className="select-option-dropdown first-left form-item">
              <select
                name="role"
                value={formData.role}
                onChange={handleChange}
                onBlur={handleBlur}
                onFocus={handleFocus}
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
            </div>

            {/* Submit Button */}
            <div className="flex justify-end">
              <button
                type="submit"
                className="upclick px-4 mt-5 py-2  text-white text-sm font-medium rounded-md hover:bg-blue-700 focus:outline-none focus:ring-2 focus:ring-blue-500 focus:ring-offset-2"
              >
                Submit
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
