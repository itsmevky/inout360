import React, { useState, useEffect } from "react";
import Validator from "../../../Helpers/validators.js";
import { API } from "../../../Helpers/api.js";
import { toast, ToastContainer } from "react-toastify";
import "react-toastify/dist/ReactToastify.css";

import { useParams } from "react-router-dom";

import rules from "./Rules.js";

const Addfeilds = ({ selectedModule, selectedBusinessType }) => {
  const [fields, setFields] = useState([]);
  // const { businessType = "education", module = "student" } = useParams();

  const [businesstype, setBusinesstype] = useState([]);
  const [loading, setLoading] = useState(false);

  const { businessType, module } = useParams();
  const [errors, setErrors] = useState({});

  const [fieldAdded, setFieldAdded] = useState(false);
  const [manualKeyEdit, setManualKeyEdit] = useState({});

  const generateKeyFromLabel = (label) => {
    return label
      .toLowerCase()
      .replace(/\s+/g, "_")
      .replace(/[^a-z0-9_]/g, "");
  };

  const addField = () => {
    setFields([
      ...fields,
      {
        id: Date.now(),
        label: "",
        type: "text",
        placeholder: "",
        options: "",
        required: false,
        status: "active",
        group: false, // <-- Added here
        selectedGroup: "", // New field for group selection
      },
    ]);
  };

  useEffect(() => {
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
    if (key === "key") {
      setManualKeyEdit((prev) => ({ ...prev, [id]: true }));
    }

    setFields((prevFields) =>
      prevFields.map((f) => {
        if (f.id === id) {
          const updated = { ...f };

          // Toggle checkbox if it's the "group" key
          if (key === "group") {
            updated.group = !f.group;
            // Reset selectedGroup when group is unchecked
            if (!updated.group) {
              updated.selectedGroup = "";
            }
          } else {
            updated[key] = value;
          }

          // Auto-generate key from label unless manually edited
          if (key === "label" && !manualKeyEdit[id]) {
            updated.key = generateKeyFromLabel(value);
          }

          return updated;
        }
        return f;
      })
    );
  };

  const parseOptions = (optionText) => {
    return optionText
      .split("\n")
      .filter((line) => line.trim() !== "")
      .map((line) => {
        const [value, label] = line.split("|").map((s) => s.trim());
        return { value: value || label, label: label || value };
      });
  };

  const transformFieldsForAPI = () => {
    return fields.map((field) => {
      const parsedOptions = field.options
        ? field.options
            .split("\n")
            .filter((line) => line.trim() !== "")
            .map((line) => {
              const [_, label] = line.split("|").map((s) => s.trim());
              return label || _;
            })
        : [];

      const transformed = {
        key: field.label.toLowerCase().replace(/\s+/g, "_"),
        label: field.label,
        type:
          field.type === "select" || field.type === "multiselect"
            ? "dropdown"
            : field.type === "textarea"
            ? "text"
            : field.type === "file"
            ? "file"
            : field.type,
        required: field.required || false,
        options: parsedOptions,
        multiple: field.type === "multiselect",
        allowed_file_types:
          field.type === "file"
            ? ["jpg", "jpeg", "png", "pdf", "gif", "csv", "xlsx"]
            : [],
        max_file_size: field.type === "file" ? 1024 : 0,
        status: field.status || "active",
      };

      // 🔁 Include group info if group is selected
      if (field.group && field.selectedGroup) {
        transformed.group = field.selectedGroup;
      }

      return transformed;
    });
  };

  const [touched, setTouched] = useState({
    label: false,
    key: false,
    placeholder: false,
    type: false,
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
  // Get field class name based on error state
  const getFieldClassName = (fieldName) => {
    return errors[fieldName] ? "field-error" : "field";
  };
  const handleSubmit = async (e) => {
    e.preventDefault();
    setLoading(true);
    const isValid = await validateForm();

    // if (!isValid) {
    //   console.log(isValid, "isValid");
    //   setLoading(false);
    //   return;
    // }

    const transformedFields = transformFieldsForAPI();
    console.log(transformedFields, "transformedFields");
    const formData = {
      business_type: businessType || selectedBusinessType,
      module: module || selectedModule,
      fields: transformedFields,
      createdBy: "super_admin",
    };

    try {
      const result = await API.createFields(formData);
      if (result.status === true) {
        toast.success("Fields created successfully!");
        setFields([]);
      } else {
        toast.error(result.message || "Failed to create fields.");
      }
    } catch (error) {
      console.error("Error creating fields:", error);
      toast.error("An error occurred. Please try again.");
    } finally {
      setLoading(false);
    }
  };

  const renderInput = (field, index) => {
    const options = parseOptions(field.options || "");

    switch (field.type) {
      case "text":
        return (
          <input
            type="text"
            name={`field_${index}`}
            placeholder={field.placeholder}
          />
        );
      case "textarea":
        return (
          <textarea
            name={`field_${index}`}
            placeholder={field.placeholder}
            rows={3}
          />
        );
      case "select":
      case "multiselect":
        return (
          <select
            name={`field_${index}`}
            multiple={field.type === "multiselect"}
          >
            {options.map((opt, i) => (
              <option key={i} value={opt.value}>
                {opt.label}
              </option>
            ))}
          </select>
        );
      case "radio":
      case "checkbox":
        return (
          <div>
            {options.map((opt, i) => (
              <div key={i}>
                <input
                  type={field.type}
                  name={`${field.type}_${index}`}
                  value={opt.value}
                />
                <label style={{ marginLeft: "5px" }}>{opt.label}</label>
              </div>
            ))}
          </div>
        );
      default:
        return null;
    }
  };

  const renderPreview = () => {
    return (
      <div className="preview-section">
        <h3>Preview</h3>
        {fields.map((field, index) => (
          <div key={field.id} className="field-preview">
            <label>{field.label}</label>
            {renderInput(field, index)}
          </div>
        ))}
      </div>
    );
  };

  return (
    <div className="bg-white rounded">
      <ToastContainer />
      <form className="p-6">
        <input type="hidden" name="module" value={selectedModule} />
        <input type="hidden" name="businessType" value={selectedBusinessType} />

        <div>
          {fields.map((field, i) => {
            const showOptions = [
              "select",
              "multiselect",
              "radio",
              "checkbox",
            ].includes(field.type);

            return (
              <div key={field.id} className="mb-6 pb-6">
                <div className="AJ-crm-add-feild-heading-section mb-4">
                  <h2 className="text-lg font-semibold">Add Fields</h2>
                </div>

                {/* Label & Key Fields */}

                <div className="AJ-floating-label-wrapper">
                  <input
                    type="text"
                    name="label"
                    value={field.label}
                    autoComplete="off"
                    onChange={(e) =>
                      handleChange(field.id, "label", e.target.value)
                    }
                    onBlur={handleBlur}
                    className={`${getFieldClassName(
                      "label"
                    )} AJ-floating-input`}
                    placeholder=" "
                  />
                  <label className="AJ-floating-label">Label</label>
                </div>

                <div className="AJ-floating-label-wrapper">
                  <input
                    type="text"
                    value={field.key}
                    name="key"
                    autoComplete="off"
                    onChange={(e) =>
                      handleChange(field.id, "key", e.target.value)
                    }
                    onBlur={handleBlur}
                    className={`${getFieldClassName("key")} AJ-floating-input`}
                    placeholder=" "
                  />
                  <label className="AJ-floating-label">Key</label>
                </div>
                <div className="AJ-crm-field-row mt-4">
                  <label className=" AJ-floating-label-group">Group</label>
                  <input
                    type="checkbox"
                    checked={field.group}
                    onChange={() => handleChange(field.id, "group")}
                    className="mr-2"
                  />
                </div>
                {field.group && (
                  <div className="AJ-crm-field-row mt-2">
                    <label className="block mb-1 font-medium">
                      Select Group
                    </label>
                    <select
                      value={field.selectedGroup}
                      onChange={(e) =>
                        handleChange(field.id, "selectedGroup", e.target.value)
                      }
                      className="AJ-input w-full"
                    >
                      <option value="">-- Select Group --</option>
                      <option value="personal">Personal</option>
                      <option value="academic">Academic</option>
                      <option value="family">Family</option>
                      <option value="finance">Finance</option>
                    </select>
                  </div>
                )}

                {/* Placeholder & Type Fields */}

                <div className="AJ-floating-label-wrapper">
                  <input
                    type="text"
                    name="placeholder"
                    value={field.placeholder}
                    autoComplete="off"
                    onChange={(e) =>
                      handleChange(field.id, "placeholder", e.target.value)
                    }
                    onBlur={handleBlur}
                    className={`${getFieldClassName(
                      "placeholder"
                    )} AJ-floating-input`}
                    placeholder=" "
                  />
                  <label className="AJ-floating-label">Placeholder</label>
                </div>

                <div className="AJ-floating-label-wrapper">
                  <select
                    value={field.type}
                    name="type"
                    onChange={(e) =>
                      handleChange(field.id, "type", e.target.value)
                    }
                    onBlur={handleBlur}
                    className={`${getFieldClassName("type")} AJ-floating-input`}
                  >
                    <option value="text">Text</option>
                    <option value="textarea">Textarea</option>
                    <option value="select">Dropdown</option>
                    <option value="multiselect">Multi Select</option>
                    <option value="radio">Radio</option>
                    <option value="checkbox">Checkbox</option>
                    <option value="file">Attachment</option>
                    <option value="date">Date</option>
                    <option value="number">Number</option>
                    <option value="email">Email</option>
                    <option value="phone">Phone</option>
                  </select>
                  <label className="AJ-floating-label">Type</label>
                </div>

                {/* Options Field */}
                {["select", "radio", "multiselect"].includes(field.type) && (
                  <div className="AJ-crm-field-row mt-4">
                    <div className="AJ-floating-label-wrapper">
                      <label className="AJ-floating-label block mb-2">
                        Options (each line: `value | label`, e.g., `1 | Option
                        A`)
                      </label>
                      <textarea
                        className="w-full border p-2 rounded"
                        rows="3"
                        value={field.options}
                        onChange={(e) =>
                          handleChange(field.id, "options", e.target.value)
                        }
                      />
                    </div>
                  </div>
                )}

                {/* File Settings */}
                {field.type === "file" && (
                  <div className="grid grid-cols-1 md:grid-cols-2 gap-4 mt-4">
                    <div className="AJ-floating-label-wrapper">
                      <input
                        type="text"
                        value={field.allowed_file_types?.join(", ") || ""}
                        onChange={(e) =>
                          handleChange(
                            field.id,
                            "allowed_file_types",
                            e.target.value.split(",").map((ext) => ext.trim())
                          )
                        }
                        className="AJ-floating-input"
                        placeholder=" "
                      />
                      <label className="AJ-floating-label">
                        Allowed File Types (e.g., jpg, png)
                      </label>
                    </div>

                    <div className="AJ-floating-label-wrapper">
                      <input
                        type="number"
                        value={field.max_file_size}
                        onChange={(e) =>
                          handleChange(
                            field.id,
                            "max_file_size",
                            parseInt(e.target.value) || 0
                          )
                        }
                        className="AJ-floating-input"
                        placeholder=" "
                      />
                      <label className="AJ-floating-label">
                        Max File Size (MB)
                      </label>
                    </div>
                  </div>
                )}

                {/* Required, Multiple, Status */}
                <div className="grid grid-cols-1 md:grid-cols-2 gap-4 mt-4">
                  <div className="AJ-floating-label-wrapper flex items-center gap-2">
                    <label className=" AJ-floating-label-group">Required</label>
                    <input
                      type="checkbox"
                      checked={field.required}
                      onChange={(e) =>
                        handleChange(field.id, "required", e.target.checked)
                      }
                    />
                  </div>

                  {["checkbox", "file", "multiselect"].includes(field.type) && (
                    <div className="AJ-floating-label-wrapper flex items-center gap-2">
                      <label>Allow Multiple</label>
                      <input
                        type="checkbox"
                        checked={field.multiple}
                        onChange={(e) =>
                          handleChange(field.id, "multiple", e.target.checked)
                        }
                      />
                    </div>
                  )}
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
