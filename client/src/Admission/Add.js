import React, { useState, useEffect } from "react";
import { toast, ToastContainer } from "react-toastify";
import "react-toastify/dist/ReactToastify.css";
import { API, domainpath } from "../Helpers/api.js";
import Validator from "../Helpers/validators.js";
import Rules from "./Rules.js";

import { useNavigate, useParams } from "react-router-dom";
const Add = () => {
  const updateRulesWithDynamicFields = (dynamicData) => {
    const allFields = [
      ...(dynamicData.groups?.flatMap((group) => group.fields) || []),
      ...(dynamicData.metaFields || []),
    ];

    allFields.forEach((field) => {
      const {
        key,
        label,
        required,
        type,
        options,
        allowed_file_types,
        max_file_size,
      } = field;

      const rule = {
        required: !!required,
        type: "string",
        errorMessage: `${label} is required.`,
      };

      switch (type) {
        case "text":
        case "textarea":
          rule.type = "string";
          break;
        case "number":
          rule.type = "number";
          break;
        case "dropdown":

        case "radio":
          rule.type = "string";
          if (options?.length) rule.allowedValues = options;
          break;
        case "checkbox":
          rule.type = "boolean";
          break;
        case "email":
          rule.type = "string";
          rule.pattern = /^[^\s@]+@[^\s@]+\.[^\s@]+$/;
          rule.errorMessage = `A valid ${label} is required.`;
          break;
        case "phone":
          rule.type = "string";
          rule.pattern = /^[0-9]{10}$/;
          rule.errorMessage = `A valid 10-digit ${label} is required.`;
          break;
        case "attachment":
          rule.type = "file";
          if (allowed_file_types?.length)
            rule.allowedFileTypes = allowed_file_types;
          if (max_file_size) rule.maxFileSize = max_file_size;
          break;
        case "date":
          rule.type = "string";
          break;
        default:
          rule.type = "string";
      }

      Rules[key] = rule;
    });
  };

  const [formData, setFormData] = useState({});
  const [errors, setErrors] = useState({});
  const [formConfig, setformConfig] = useState([]);
  const [loading, setLoading] = useState(false);
  const [businesses, setBusinesses] = useState([]);

  const validator = new Validator(Rules);
  const navigate = useNavigate();
  const handleBlur = async (e) => {
    const { name, value } = e.target;
    const fieldErrors = await validator.validate(
      { [name]: value },
      { [name]: Rules[name] }
    );
    setErrors((prev) => ({
      ...prev,
      [name]: fieldErrors[name] || "",
    }));
  };
  const [initialFormData, setInitialFormData] = useState({});

  const validateForm = async () => {
    const validationErrors = await validator.validate(formData, Rules);
      console.log('validationErrors:', validationErrors); // ✅ correct usage

    setErrors(validationErrors);
    return Object.keys(validationErrors).length === 0;
  };
    {console.log('validationErrors')} 
  const [state, setState] = useState({
    formData: {},
    errors: {},
    loading: false,
    formConfig: [],
    businesses: [],
  });

  const updateState = (key, value) =>
    setState((prev) => ({ ...prev, [key]: value }));

  const handleChange = (e) => {
    const { name, value, multiple, options } = e.target;
    if (multiple) {
      const values = Array.from(options)
        .filter((o) => o.selected)
        .map((o) => o.value);
      setFormData((prev) => ({ ...prev, [name]: values }));
    } else {
      setFormData((prev) => ({ ...prev, [name]: value }));
    }
  };
  const handleSubmit = async (e) => {
    e.preventDefault();
    setLoading(true);
    const isValid = await validateForm(formData);
    console.log(isValid, "isValid");

    // if (!isValid) {
    //   setLoading(false);
    //   return;
    // }
    console.log("Form Data at Submit:", formData);

    try {
      await API.createAdmission(formData);
      toast.success("Form submitted!");
    } catch (err) {
      console.error(err);
      toast.error("Submit failed!");
    } finally {
      setLoading(false);
    }
  };

  const [verification, setVerification] = useState({});
  const [selectedFiles, setSelectedFiles] = useState({});

  const handleFileUpload = async (event) => {
    console.log("File upload event triggered:", event);

    const file = event.target.files[0];
    const fieldName = event.target.name;
    console.log("Selected file:", file);
    console.log("Field name:", fieldName);

    if (!file) {
      console.log("No file selected. Exiting upload.");
      return;
    }

    const formData = new FormData();
    formData.append("file", file);
    console.log("FormData created with file:", formData.get("file"));

    try {
      console.log("Sending file to:", domainpath + API.uploads.admission);
      const response = await fetch(domainpath + API.uploads.admission, {
        method: "POST",
        body: formData,
      });

      console.log("Fetch response received:", response);
      const data = await response.json();
      console.log("Response JSON parsed:", data);

      if (response.ok) {
        console.log("Upload successful. File path:", data?.filePath);

        setVerification((prev) => {
          const updated = {
            ...prev,
            [fieldName]: data?.filePath || "",
          };
          console.log("Updated verification state:", updated);
          return updated;
        });

        setSelectedFiles((prev) => {
          const updated = {
            ...prev,
            [fieldName]: file,
          };
          console.log("Updated selected files state:", updated);
          return updated;
        });
      } else {
        console.error("Upload failed:", data.message);
      }
    } catch (error) {
      console.error("Error uploading file:", error);
    }
  };

  const fetchFields = async () => {
    setLoading(true);
    try {
      const module = "admission";
      const business_Type = "education";
      const res = await API.getGlobalfields(module, business_Type, 1, 50);
      const globalFields = res?.data || [];

      setformConfig(globalFields);
      console.log("globalFields=================++++++>", globalFields);
      console.log("module=================++++++>", module);

      // ✅ Declare the variable here
      const newInitialFormData = {};

      // Loop through dynamic groups and fields
      globalFields?.groups?.forEach((group) => {
        group?.fields?.forEach((field) => {
          if (field?.key) {
            newInitialFormData[field.key] = ""; // Optionally use field.defaultValue
          }
        });
      });

      globalFields?.metaFields?.forEach((field) => {
        if (field?.key) {
          newInitialFormData[field.key] = ""; // Optionally use field.defaultValue
        }
      });

      // Store into state
      updateState("formData", newInitialFormData);

      // Optional: store separately if needed
      // setInitialFormData(newInitialFormData);

      updateRulesWithDynamicFields(globalFields);

      setTimeout(async () => {
        let validator = new Validator(Rules);
        const result = await validator.validate(newInitialFormData);
        // console.log(result);
      }, 100);
    } catch (err) {
      console.error("Error fetching global fields:", err);
    } finally {
      setLoading(false);
    }
  };

  useEffect(() => {
    fetchFields();
  }, []);

  const getFieldClassName = (fieldName) =>
    errors[fieldName] ? "field-error" : "field";

  return (
    <div className="AJ-section AJ-left-section">
      <div className="flex justify-between">
        <div className="AJ-crm-adding-title-section ">
          <h2 className="text-2xl font-bold  mb-4 px-3 ">Add Admissions</h2>
        </div>

        <div>
          <button
            className="crm-buttonsection"
            // onClick={toggleAddUserForm}
            onClick={() => navigate("/dashboard/users/admission")}
          >
            <svg
              fill="white"
              width={22}
              height={22}
              xmlns="http://www.w3.org/2000/svg"
              viewBox="0 0 576 512"
            >
              <path d="M288 32c-80.8 0-145.5 36.8-192.6 80.6C48.6 156 17.3 208 2.5 243.7c-3.3 7.9-3.3 16.7 0 24.6C17.3 304 48.6 356 95.4 399.4C142.5 443.2 207.2 480 288 480s145.5-36.8 192.6-80.6c46.8-43.5 78.1-95.4 93-131.1c3.3-7.9 3.3-16.7 0-24.6c-14.9-35.7-46.2-87.7-93-131.1C433.5 68.8 368.8 32 288 32zM144 256a144 144 0 1 1 288 0 144 144 0 1 1 -288 0zm144-64c0 35.3-28.7 64-64 64c-7.1 0-13.9-1.2-20.3-3.3c-5.5-1.8-11.9 1.6-11.7 7.4c.3 6.9 1.3 13.8 3.2 20.7c13.7 51.2 66.4 81.6 117.6 67.9s81.6-66.4 67.9-117.6c-11.1-41.5-47.8-69.4-88.6-71.1c-5.8-.2-9.2 6.1-7.4 11.7c2.1 6.4 3.3 13.2 3.3 20.3z" />
            </svg>
            View Admissions
          </button>
        </div>
      </div>
      <div className="">
        <form
          onSubmit={handleSubmit}
          className="w-full  mx-auto mt-8"
          noValidate
        >
          <div className="AJ-Form-block AJ-crm-personal">
            {formConfig?.groups?.map((section, index) => (
              <div key={index} className="">
                <div className="p-10">
                  <h3 className="text-xl font-bold">{section.label}</h3>
                </div>
                <div className="border-t border-gray-300 w-full my-2"></div>

                <div
                  className={`grid ${
                    section.groupLabel === "VERIFICATION & DOCUMENTS"
                      ? "grid-cols-1 space-y-4"
                      : "grid-cols-2 gap-y-1 gap-x-4"
                  }`}
                >
                  {section.fields.map((field) => {
                    if (field.type === "select" || field.type === "dropdown") {
                      return (
                        <div
                          key={field.name}
                          className="AJ-floating-label-wrapper"
                        >
                          <select
                            name={field.key}
                            value={formData[field.key] || ""}
                            onChange={handleChange}
                            onBlur={handleBlur}
                            className={`${getFieldClassName(
                              field.key
                            )} AJ-floating-select AJ-floating-input`}
                          >
                            {" "}
                            <option value="" disabled>
                              Select an option
                            </option>
                            {field.options.map((opt) => {
                              const [value, label] =
                                typeof opt === "string" && opt.includes("|")
                                  ? opt.split("|").map((part) => part.trim())
                                  : [opt, opt];

                              return (
                                <option key={value} value={value}>
                                  {label}
                                </option>
                              );
                            })}
                          </select>
                          <label className="AJ-floating-label">
                            {field.label}
                          </label>
                        </div>
                      );
                    }

                    if (field.type === "multiselect") {
                      return (
                        <div
                          key={field.name}
                          className="AJ-floating-label-wrapper"
                        >
                          <select
                            className="AJ-floating-select AJ-floating-input"
                            name={field.name}
                            multiple
                            value={formData[field.name]}
                            onChange={handleChange}
                          >
                            {field.options.map((opt) => (
                              <option key={opt.value} value={opt.value}>
                                {opt.label}
                              </option>
                            ))}
                          </select>
                          <label className="AJ-floating-label">
                            {field.label}
                          </label>
                        </div>
                      );
                    }

                    if (field.type === "textarea") {
                      return (
                        <div
                          key={field.name}
                          className="AJ-floating-label-wrapper"
                        >
                          <textarea
                            name={field.name}
                            value={formData[field.name]}
                            onChange={handleChange}
                            onBlur={handleBlur}
                            className={`${getFieldClassName(
                              field.name
                            )} AJ-floating-textarea AJ-floating-input`}
                          ></textarea>
                          <label className="AJ-floating-label">
                            {field.label}
                          </label>
                        </div>
                      );
                    }

                    if (field.type === "file") {
                      return (
                        <div
                          key={field.name}
                          className="file-upload flex justify-around"
                        >
                          <div className={`AJ-crm-${field.name}-label`}>
                            <label className="text-sm">{field.label} :</label>
                          </div>
                          <input
                            type="file"
                            name={field.name}
                            id={field.name}
                            accept=".pdf,.jpg,.jpeg,.png,.doc,.docx"
                            className="AJ-floating-input" // remove 'hidden' temporarily
                            onChange={handleFileUpload}
                          />

                          {/* <div className="AJ-crm-upload-point">
                            <label
                              htmlFor={field.name}
                              className="block text-xs border border-gray-300 rounded-md px-4 py-2 text-gray-600 bg-gray-100 text-center cursor-pointer hover:bg-gray-200"
                            >
                              {selectedFiles[field.name]
                                ? `${field.label}: ${
                                    selectedFiles[field.name].name
                                  }`
                                : " + Upload file"}
                            </label>
                          </div> */}
                        </div>
                      );
                    }

                    return (
                      <div
                        key={field.name}
                        className="AJ-floating-label-wrapper"
                      >
                        <input
                          type={field.type}
                          name={field.key}
                          value={formData[field.key]}
                          autoComplete="off"
                          onChange={handleChange}
                          onBlur={handleBlur}
                          className={`${getFieldClassName(
                            field.key
                          )} AJ-floating-input`}
                          placeholder=" "
                        />
                        <label className="AJ-floating-label">
                          {field.label}
                        </label>
                      </div>
                    );
                  })}
                  {/* Submit Button */}
                  {/* <div className="AJ-crm-save w-full md:w-auto mt-6">
                    <button
                      type="submit"
                      className="button-section w-full md:w-auto rounded"
                      disabled={loading}
                    >
                      {loading ? "Submitting..." : "Submit"}
                    </button>
                  </div> */}
                </div>
              </div>
            ))}
          </div>

            {/* Submit Button */}
                   <div className="AJ-crm-save w-full md:w-auto mt-6">
                    <button
                      type="submit"
                      className="button-section w-full md:w-auto rounded"
                      disabled={loading}
                    >
                      {loading ? "Submitting..." : "Submit"}
                    </button>
                  </div> 
        </form>
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

export default Add;
