import React, { useState, useEffect } from "react";
import Validator from "../../../Helpers/validators.js";
import { API } from "../../../Helpers/api.js";
import { toast, ToastContainer } from "react-toastify";
import "react-toastify/dist/ReactToastify.css";
import { useParams } from "react-router-dom";
import rules from "./Rules.js";

const Businesstype = () => {
  const [fields, setFields] = useState([]);
  const [businesstypeList, setBusinesstypeList] = useState([]);
  const [errors, setErrors] = useState({});
  const [loading, setLoading] = useState(false);
  const { businessType } = useParams();

  const validator = new Validator(rules);

  // ✅ Hardcoded tenant_id
  const tenant_id = "680f1770266ebf59aa7a498a";

  useEffect(() => {
    fetchBusinessTypes();
    if (fields.length === 0) addField();
  }, []);

  const fetchBusinessTypes = async () => {
    try {
      const response = await API.getAll("business_types");
      if (response?.data) {
        setBusinesstypeList(response.data);
      }
    } catch (err) {
      console.error("Error fetching business types:", err);
    }
  };

  const addField = () => {
    setFields([
      {
        id: Date.now(),
        type: "",
        display_name: "",
        modules: [""],
        roles: [""],
        // business_type: "",
        tenant_id: tenant_id,
        status: "active",
      },
    ]);
  };

  const handleChange = (id, key, value) => {
    setFields((prevFields) =>
      prevFields.map((field) =>
        field.id === id ? { ...field, [key]: value } : field
      )
    );
  };

  const handleArrayChange = (id, key, index, value) => {
    setFields((prevFields) =>
      prevFields.map((field) => {
        if (field.id !== id) return field;
        const updatedArray = [...field[key]];
        updatedArray[index] = value;
        return { ...field, [key]: updatedArray };
      })
    );
  };

  const addInputField = (id, key) => {
    setFields((prevFields) =>
      prevFields.map((field) =>
        field.id === id ? { ...field, [key]: [...field[key], ""] } : field
      )
    );
  };

  const removeInputField = (id, key, index) => {
    setFields((prevFields) =>
      prevFields.map((field) => {
        if (field.id !== id) return field;
        const updatedArray = field[key].filter((_, i) => i !== index);
        return { ...field, [key]: updatedArray };
      })
    );
  };

  const getFieldClassName = (fieldName) =>
    errors[fieldName] ? "field-error" : "field";

  const validateForm = async () => {
    const field = fields[0];
    const validationErrors = await validator.validate(field, rules);
    setErrors(validationErrors);
    return Object.keys(validationErrors).length === 0;
  };

  const handleSubmit = async (e) => {
    e.preventDefault();
    setLoading(true);

    const isValid = await validateForm();
    if (!isValid) {
      setLoading(false);
      return;
    }

    const field = fields[0];
    const formData = {
      type: field.type,
      tenant_id: tenant_id, // ✅ static tenant ID
      display_name: field.display_name,
      modules: field.modules.filter((mod) => mod.trim() !== ""),
      roles: field.roles.filter((role) => role.trim() !== ""),
      // business_type: field.business_type,
      status: field.status,
    };

    try {
      const result = await API.add("business_types", formData);
      if (result.status === true) {
        toast.success("Business Type Added successfully!");
        setFields([]);
        addField();
      } else {
        toast.error(result.message || "Failed to Add Business Type.");
      }
    } catch (error) {
      console.error("Error Adding Business Type:", error);
      toast.error("An error occurred. Please try again.");
    } finally {
      setLoading(false);
    }
  };

  return (
    <div className="bg-white rounded">
      <ToastContainer />
      <form className="p-6" onSubmit={handleSubmit}>
        {fields.map((field) => (
          <div key={field.id} className="mb-6 pb-6 border-b">
            <h2 className="text-lg font-semibold mb-4">Add Business Type</h2>

            {/* Type */}
            <div className="AJ-floating-label-wrapper">
              <input
                type="text"
                name="type"
                value={field.type}
                autoComplete="off"
                onChange={(e) => handleChange(field.id, "type", e.target.value)}
                className={`${getFieldClassName("type")} AJ-floating-input`}
                placeholder=" "
              />
              <label className="AJ-floating-label">Type</label>
            </div>

            {/* Display Name */}
            <div className="AJ-floating-label-wrapper">
              <input
                type="text"
                name="display_name"
                value={field.display_name}
                autoComplete="off"
                onChange={(e) =>
                  handleChange(field.id, "display_name", e.target.value)
                }
                className={`${getFieldClassName(
                  "display_name"
                )} AJ-floating-input`}
                placeholder=" "
              />
              <label className="AJ-floating-label">Display Name</label>
            </div>

            {/* Modules */}
            <div className="AJ-floating-label-wrapper mb-4">
              <label className="AJ-floating-label">Modules</label>
              {field.modules.map((mod, idx) => (
                <div key={idx} className="flex items-center gap-2 mt-2">
                  <input
                    type="text"
                    value={mod}
                    onChange={(e) =>
                      handleArrayChange(
                        field.id,
                        "modules",
                        idx,
                        e.target.value
                      )
                    }
                    className="AJ-floating-input"
                  />
                  <button
                    type="button"
                    onClick={() => removeInputField(field.id, "modules", idx)}
                    className="text-red-500"
                  >
                    ×
                  </button>
                </div>
              ))}
              <button
                type="button"
                className="mt-2 text-sm text-blue-600"
                onClick={() => addInputField(field.id, "modules")}
              >
                + Add Module
              </button>
            </div>

            {/* Roles */}
            <div className="AJ-floating-label-wrapper mb-4">
              <label className="AJ-floating-label">Roles</label>
              {field.roles.map((role, idx) => (
                <div key={idx} className="flex items-center gap-2 mt-2">
                  <input
                    type="text"
                    value={role}
                    onChange={(e) =>
                      handleArrayChange(field.id, "roles", idx, e.target.value)
                    }
                    className="AJ-floating-input"
                  />
                  <button
                    type="button"
                    onClick={() => removeInputField(field.id, "roles", idx)}
                    className="text-red-500"
                  >
                    ×
                  </button>
                </div>
              ))}
              <button
                type="button"
                className="mt-2 text-sm text-blue-600"
                onClick={() => addInputField(field.id, "roles")}
              >
                + Add Role
              </button>
            </div>

            {/* Status */}
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
        ))}

        {/* Submit */}
        <div className="AJ-crm-save w-full md:w-auto mt-6">
          <button
            type="submit"
            disabled={loading}
            className="button-section w-full md:w-auto rounded"
          >
            {loading ? "Saving..." : "Add"}
          </button>
        </div>
      </form>
    </div>
  );
};

export default Businesstype;
