import React, { useState, useEffect } from "react";
import { useNavigate } from "react-router-dom";
import { toast, ToastContainer } from "react-toastify";
import { getData, putData, API } from "../../../Helpers/api.js";
import Validator from "../../../Helpers/validators.js";
import rules from "./Rules.js";
import "react-toastify/dist/ReactToastify.css";

const EditBusinessForm = ({ user }) => {
  let userId = user;
  console.log("userId=====>", userId);

  const [formData, setFormData] = useState({
    name: "",
    subdomain: "",
    domain: "",
    database: "",
    required: false,
    status: "active",
    business_type: "",
    // Changed from string to array
    // Added user_roles
  });

  const [businesstype, setBusinesstype] = useState([]);
  const [moduleOptions, setModuleOptions] = useState([]);
  const [errors, setErrors] = useState({});
  const [touched, setTouched] = useState({});
  const [loading, setLoading] = useState(false);

  const navigate = useNavigate();
  const validator = new Validator(rules);

  useEffect(() => {
    if (userId) {
      fetchBusiness();
      fetchBusinesstypes();
    }
  }, [userId]);

  const fetchBusiness = async () => {
    setLoading(true);
    try {
      const response = await getData(`/businesses/${userId}`);
      const data = response.data;
      console.log("data--->", data);

      if (data) {
        const updatedData = {
          name: data.name || "",
          subdomain: data.subdomain || "",
          domain: data.domain || "",
          database: data.database || "",
          required: data.required || false,
          status: data.status || "active",
          business_type: data.business_type || "",
        };

        setFormData(updatedData);

        if (data.business_type) {
          handleModuleList(data.business_type);
        }
      }
    } catch (err) {
      toast.error("Failed to fetch business details.");
    } finally {
      setLoading(false);
    }
  };

  const fetchBusinesstypes = async () => {
    try {
      const responseData = await API.getBusinessTypes();
      if (responseData?.data) {
        const updatedData = responseData.data.map((type) => ({
          ...type,
          type: type.type.charAt(0).toUpperCase() + type.type.slice(1),
        }));
        setBusinesstype(updatedData);
      }
    } catch (error) {
      console.error("Error fetching business types", error);
    }
  };

  const handleModuleList = (type) => {
    const found = businesstype.find(
      (item) => item.type.toLowerCase() === type.toLowerCase()
    );
    setModuleOptions(found ? found.modules : []);
  };

  // Support for multi-select inputs (modules, user_roles)
  const handleChange = (e) => {
    const { name, value, type, checked, multiple, options } = e.target;

    let finalValue;

    if (type === "checkbox" && name === "required") {
      finalValue = checked;
    } else if (multiple) {
      // For multi-select, gather all selected options
      finalValue = Array.from(options)
        .filter((o) => o.selected)
        .map((o) => o.value);
    } else {
      finalValue = value;
    }

    setFormData((prev) => ({
      ...prev,
      [name]: finalValue,
    }));

    if (name === "business_type") {
      handleModuleList(value);
    }
  };

  const handleBlur = async (e) => {
    const { name, value } = e.target;
    setTouched((prev) => ({ ...prev, [name]: true }));
    const fieldErrors = await validator.validate(
      { [name]: value },
      { [name]: rules[name] }
    );
    setErrors((prev) => ({ ...prev, [name]: fieldErrors[name] }));
  };

  const validateFormData = async (data) => {
    return await validator.validate(data, rules);
  };

  const getFieldClassName = (fieldName) => {
    return errors[fieldName] ? "field-error" : "field";
  };

  const handleSubmit = async (e) => {
    e.preventDefault();
    setLoading(true);

    const formErrors = await validateFormData(formData);
    if (Object.keys(formErrors).length > 0) {
      setErrors(formErrors);
      setLoading(false);
      return;
    }

    try {
      const response = await putData(`/businesses/${userId}`, formData);
      if (response?.status) {
        toast.success("Business updated successfully!");
        navigate("/dashboard/business");
      } else {
        toast.error(response?.message || "Update failed.");
      }
    } catch (err) {
      toast.error("An error occurred while updating.");
    } finally {
      setLoading(false);
    }
  };

  return (
    <div className="adduser-outer-section">
      <div className="adduser-inner-section">
        <div className="adduser-form-section">
          <form
            className="AJ-crm-adding w-full max-w-lg mx-auto mt-8"
            onSubmit={handleSubmit}
          >
            <h2 className="text-xl font-semibold mb-6 text-gray-800">
              Edit Business
            </h2>

            {/* Name */}
            <div className="AJ-floating-label-wrapper mb-6 pb-6">
              <input
                type="text"
                name="name"
                placeholder=" "
                value={formData.name}
                onChange={handleChange}
                onBlur={handleBlur}
                className={`${getFieldClassName("name")} AJ-floating-input`}
              />
              <label className="AJ-floating-label">Name</label>
            </div>

            {/* Subdomain */}
            <div className="AJ-floating-label-wrapper mb-6 pb-6">
              <input
                type="text"
                name="subdomain"
                placeholder=" "
                value={formData.subdomain}
                onChange={handleChange}
                onBlur={handleBlur}
                className={`${getFieldClassName(
                  "subdomain"
                )} AJ-floating-input`}
              />
              <label className="AJ-floating-label">Subdomain</label>
            </div>

            {/* Domain */}
            <div className="AJ-floating-label-wrapper mb-6 pb-6">
              <input
                type="text"
                name="domain"
                placeholder=" "
                value={formData.domain}
                onChange={handleChange}
                onBlur={handleBlur}
                className={`${getFieldClassName("domain")} AJ-floating-input`}
              />
              <label className="AJ-floating-label">Domain</label>
            </div>

            {/* Business Type */}
            <div className="AJ-floating-label-wrapper mb-6 pb-6">
              <select
                name="business_type"
                value={formData.business_type}
                onChange={handleChange}
                className="AJ-floating-input bg-white"
              >
                <option value="">Select Business Type</option>
                {businesstype.map((bt) => (
                  <option key={bt.type} value={bt.type}>
                    {bt.display_name}
                  </option>
                ))}
              </select>
              <label className="AJ-floating-label">Select Business Type</label>
            </div>

            {/* User Roles Multi-select */}

            {/* Database */}
            <div className="AJ-floating-label-wrapper mb-6 pb-6">
              <input
                type="text"
                name="database"
                placeholder=" "
                value={formData.database}
                onChange={handleChange}
                onBlur={handleBlur}
                className={`${getFieldClassName("database")} AJ-floating-input`}
              />
              <label className="AJ-floating-label">Database</label>
            </div>

            {/* Required */}
            <div className="flex items-center gap-3 mb-4">
              <label className="text-sm font-medium">Required</label>
              <input
                type="checkbox"
                name="required"
                checked={formData.required}
                onChange={handleChange}
              />
            </div>

            {/* Status */}
            <div className="AJ-floating-label-wrapper mb-6 pb-6">
              <select
                name="status"
                value={formData.status}
                onChange={handleChange}
                className="AJ-floating-input"
              >
                <option value="active">Active</option>
                <option value="disable">Disable</option>
              </select>
              <label className="AJ-floating-label">Status</label>
            </div>

            {/* Submit */}
            <div className="AJ-crm-save w-full md:w-auto mt-6">
              <button
                type="submit"
                disabled={loading}
                className="button-section w-full md:w-auto rounded"
              >
                {loading ? "Saving..." : "Save Changes"}
              </button>
            </div>
          </form>
        </div>
      </div>
      <ToastContainer />
    </div>
  );
};

export default EditBusinessForm;
