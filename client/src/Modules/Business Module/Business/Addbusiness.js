import React, { useState, useEffect } from "react";
import Validator from "../../../Helpers/validators.js";
import { API } from "../../../Helpers/api.js";
import { toast, ToastContainer } from "react-toastify";
import "react-toastify/dist/ReactToastify.css";

import { useParams } from "react-router-dom";

import rules from "./Rules.js";

const Addfeilds = ({}) => {
  const [fields, setFields] = useState([]);
  // const { businessType = "education", module = "student" } = useParams();
  const [selectedBusinessType, setselectedBusinessType] = useState("");
  const [moduleOptions, setModuleOptions] = useState([]);

  const [businesstype, setBusinesstype] = useState([]);
  const [loading, setLoading] = useState(false);
  const [SelectedStatus, setSelectedStatus] = useState("");
  const { businessType, module } = useParams();
  const [errors, setErrors] = useState({});
  const [selectedModule, setselectedModule] = useState("");
  const [fieldAdded, setFieldAdded] = useState(false);
  const [manualKeyEdit, setManualKeyEdit] = useState({});

  const addField = () => {
    setFields((prev) => [
      ...prev,
      {
        id: Date.now(),
        name: "",
        subdomain: "",
        domain: "",
        business_type: "",
        selectedModule: "",
        database: "",
        required: false,
        status: "active",
      },
    ]);
  };

  useEffect(() => {
    fetchBusinesstypes();
    if (!fieldAdded) {
      addField();
      setFieldAdded(true);
    }
  }, [fieldAdded]);

  const validator = new Validator(rules);
  // Validate the entire form
  const validateForm = async () => {
    const validationErrors = await validator.validate({ fields }, rules);
    setErrors(validationErrors);
    return Object.keys(validationErrors).length === 0;
  };

  const handleChange = (id, key, value) => {
    setFields((prevFields) =>
      prevFields.map((field) =>
        field.id === id ? { ...field, [key]: value } : field
      )
    );
  };
  const transformFieldsForAPI = () => {
    return fields.map((field) => ({
      name: field.name,
      subdomain: field.subdomain,
      domain: field.domain,
      business_type: field.business_type,
      module: field.selectedModule,
      database: field.database,
      required: field.required || false,
      status: field.status || "active",
    }));
  };
  const handleModuleList = (type) => {
    setselectedBusinessType(type);
    const found = businesstype.find((item) => item.type === type);
    setModuleOptions(found ? found.modules : []);
  };

  const handleListStatusChange = (event, fieldId) => {
    const value = event.target.value;
    setSelectedStatus(value);
    handleModuleList(value);
    handleChange(fieldId, "business_type", value); // <-- Update field object
  };
  const fetchBusinesstypes = async () => {
    try {
      const responseData = await API.getAll("business_types"); // matches GET /api/business-types

      if (responseData && responseData.data) {
        setBusinesstype(responseData.data); // assuming it's an array
      } else {
        toast.warn("No business types found.");
      }
    } catch (error) {
      console.error("❌ Error fetching business types:", error);
      toast.error("Failed to load business types.");
    }
  };

  const handleModuleChange = (event, fieldId) => {
    const value = event.target.value;
    console.log(`🔄 Module changed to: ${value} for field ${fieldId}`);

    setselectedModule(value);
    handleChange(fieldId, "selectedModule", value); // updates local form state
  };
  const [touched, setTouched] = useState({
    name: false,
    subdomain: false,
    domain: false,
    database: false,
    required: false,
    status: false,
  });
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
  // const fetchBusinesstypes = async () => {
  //   try {
  //     const responseData = await API.getBusinessTypes();
  //     if (responseData && responseData.data) {
  //       const updatedData = responseData.data.map((user) => ({
  //         ...user,
  //         type: user.type.charAt(0).toUpperCase() + user.type.slice(1),
  //       }));
  //       setBusinesstype(updatedData);
  //     }
  //   } catch (error) {
  //     console.error("Error fetching business types", error);
  //   }
  // };

  // const handleListStatusChange = (event, fieldId) => {
  //   const value = event.target.value;
  //   setSelectedStatus(value);
  //   handleModuleList(value);
  //   handleChange(fieldId, "business_type", value); // <-- Update field object
  // };
  // const handleModuleChange = (event, fieldId) => {
  //   const value = event.target.value;
  //   setselectedModule(value);
  //   handleChange(fieldId, "selectedModule", value); // <-- Update field object
  // };
  // Get field class name based on error state
  const getFieldClassName = (fieldName) => {
    return errors[fieldName] ? "field-error" : "field";
  };

  const handleSubmit = async (e) => {
    e.preventDefault();
    setLoading(true);

    const isValid = await validateForm();
    // if (!isValid) {
    //   console.log("❌ Form is invalid");
    //   setLoading(false);
    //   return;
    // }

    const transformedFields = transformFieldsForAPI();
    console.log("🛠️ transformedFields:", transformedFields);

    const formData = {
      business_type: businessType || selectedBusinessType,
      tenant_id: "680f1770266ebf59aa7a498a",
      modules: [],
      user_roles: [],
      ...transformedFields[0],
      createdBy: "super_admin",
    };

    try {
      const result = await API.add("businesses", formData); // ✅ Use API.add
      if (result.status === true) {
        toast.success("Business added successfully!");
        setFields([]);
      } else {
        toast.error(result.message || "Failed to add business.");
      }
    } catch (error) {
      console.error("Error adding business:", error);
      toast.error("An error occurred. Please try again.");
    } finally {
      setLoading(false);
    }
  };

  return (
    <div className="bg-white rounded">
      <ToastContainer />
      <form className="p-6">
        <div>
          {fields.map((field, index) => {
            return (
              <div key={field.id} className="mb-6 pb-6">
                <div className="AJ-crm-add-feild-heading-section mb-4">
                  <h2 className="text-lg font-semibold">Add Business</h2>
                </div>

                <div className="AJ-floating-label-wrapper">
                  <input
                    type="text"
                    name="name"
                    value={field.name}
                    autoComplete="off"
                    onChange={(e) =>
                      handleChange(field.id, "name", e.target.value)
                    }
                    onBlur={handleBlur}
                    className={`${getFieldClassName("name")} AJ-floating-input`}
                    placeholder=" "
                  />
                  <label className="AJ-floating-label">Name</label>
                </div>

                <div className="AJ-floating-label-wrapper">
                  <input
                    type="text"
                    value={field.subdomain}
                    name="key"
                    autoComplete="off"
                    onChange={(e) =>
                      handleChange(field.id, "subdomain", e.target.value)
                    }
                    onBlur={handleBlur}
                    className={`${getFieldClassName(
                      "subdomain"
                    )} AJ-floating-input`}
                    placeholder=" "
                  />
                  <label className="AJ-floating-label">Subdomain</label>
                </div>

                <div className="AJ-floating-label-wrapper">
                  <input
                    type="text"
                    name="domain"
                    value={field.domain}
                    autoComplete="off"
                    onChange={(e) =>
                      handleChange(field.id, "domain", e.target.value)
                    }
                    onBlur={handleBlur}
                    className={`${getFieldClassName(
                      "domain"
                    )} AJ-floating-input`}
                    placeholder=" "
                  />
                  <label className="AJ-floating-label">Domain</label>
                </div>
                <div className="AJ-floating-label-wrapper">
                  <select
                    name="business_type"
                    placeholder="Select Business Type"
                    value={field.business_type}
                    onChange={(e) => handleListStatusChange(e, field.id)}
                    className="AJ-floating-input bg-white"
                  >
                    <option>Select Business Type</option>
                    {businesstype.map((types) => (
                      <option value={types.type}>{types.display_name}</option>
                    ))}
                  </select>
                  <label className="AJ-floating-label">
                    Select Business Type
                  </label>
                </div>
                <div className="AJ-floating-label-wrapper ">
                  <select
                    name="module"
                    placeholder="Select Module"
                    value={field.selectedModule}
                    onChange={(e) => handleModuleChange(e, field.id)}
                    className="AJ-floating-input bg-white"
                  >
                    <option>Select Module</option>
                    {moduleOptions.map((module) => (
                      <option key={module} value={module}>
                        {module.charAt(0).toUpperCase() + module.slice(1)}
                      </option>
                    ))}
                  </select>
                  <label className="AJ-floating-label">Select Module</label>
                </div>
                <div className="AJ-floating-label-wrapper">
                  <input
                    type="text"
                    name="database"
                    value={field.database}
                    autoComplete="off"
                    onChange={(e) =>
                      handleChange(field.id, "database", e.target.value)
                    }
                    onBlur={handleBlur}
                    className={`${getFieldClassName(
                      "database"
                    )} AJ-floating-input`}
                    placeholder=" "
                  />
                  <label className="AJ-floating-label">Database</label>
                </div>

                <div className="grid grid-cols-1 md:grid-cols-2 gap-4 mt-4">
                  <div className="AJ-floating-label-wrapper flex items-center gap-2">
                    <div className="AJ-section-group"> Required</div>
                    <div>
                      <input
                        type="checkbox"
                        checked={field.required}
                        onChange={(e) =>
                          handleChange(field.id, "required", e.target.checked)
                        }
                      />
                    </div>
                  </div>
                </div>
                <div className="grid grid-cols-1 md:grid-cols-2 gap-4 mt-4">
                  {/* Submit Button */}
                  <div className="AJ-crm-save w-full md:w-auto mt-6">
                    <button
                      type="submit"
                      onClick={(e) => handleSubmit(e)}
                      disabled={loading}
                      className="button-section w-full md:w-auto rounded"
                    >
                      {loading ? "Saving..." : "Add"}
                    </button>
                  </div>
                  <div className="AJ-floating-label-wrapper">
                    <select
                      value={field.status}
                      onChange={(e) =>
                        handleChange(field.id, "status", e.target.value)
                      }
                      className="AJ-floating-input"
                    >
                      <option value="active">Active</option>
                      <option value="disable">Disable</option>
                    </select>
                    <label className="AJ-floating-label">Status</label>
                  </div>
                </div>
              </div>
            );
          })}
        </div>
      </form>
    </div>
  );
};

export default Addfeilds;
