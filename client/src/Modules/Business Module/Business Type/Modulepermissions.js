import React, { useState, useEffect } from "react";
import Validator from "../../../Helpers/validators.js";
import { API } from "../../../Helpers/api.js";
import { toast, ToastContainer } from "react-toastify";
import "react-toastify/dist/ReactToastify.css";

import { useParams } from "react-router-dom";

const rules = {
  modules: {
    required: true,
    message: "module is required",
    minLength: 3,
    maxLength: 100,
  },
};

const Modulepermissions = ({ businesstypeId }) => {
  const [fields, setFields] = useState([]);
  const [businesstypedata, setbusinesstypedata] = useState([]);
  const [checkedModules, setCheckedModules] = useState([]);
  // const { businessType = "education", module = "student" } = useParams();
  const [modulelist, setModulelist] = useState([]);
  const [selectedModule, setselectedModule] = useState([]);
  const [selectedBusinessType, setselectedBusinessType] = useState([]);
  const [businesstype, setBusinesstype] = useState([]);
  const [loading, setLoading] = useState(false);

  const { businessType, module } = useParams();
  const [errors, setErrors] = useState({});

  const [fieldAdded, setFieldAdded] = useState(false);
  const [manualKeyEdit, setManualKeyEdit] = useState({});

  const modulePermission = async (businesstypeId) => {
    var modules = await API.getModuleList();
    setModulelist(modules);
    var businesstype = await API.getBusinessTypes(businesstypeId);
    setbusinesstypedata(businesstype?.data);
    const businesstypemodules = businesstype?.data?.modules;
    console.log(modules, "modules");
    console.log(businesstype, "businesstype");
    const commonModules = modules.filter((module) =>
      businesstypemodules.includes(module)
    );
    setCheckedModules(commonModules);
    console.log(checkedModules, "checkedModules");
    setFields((prev) => [
      ...prev,
      {
        modules: checkedModules,
      },
    ]);
  };

  useEffect(() => {
    if (!fieldAdded) {
      modulePermission(businesstypeId);
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
    return fields.map((field) => {
      const transformed = {
        modules: checkedModules,
      };

      return transformed;
    });
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
    businesstypedata.modules = transformedFields[0].modules;
    delete businesstypedata.id;
    const formData = businesstypedata;

    try {
      const result = await API.UpdateBusinessType(businesstypeId, formData);
      if (result.status === true) {
        toast.success("Updated successfully!");
        setFields([]);
      } else {
        toast.error(result.message || "Failed to Update.");
      }
    } catch (error) {
      console.error("Error in Updating:", error);
      toast.error("An error occurred. Please try again.");
    } finally {
      setLoading(false);
    }
  };
  const allModulesSelected = modulelist.every((module) =>
    checkedModules.includes(module)
  );
  const handleSelectAll = () => {
    setCheckedModules(allModulesSelected ? [] : [...modulelist]);
  };
  const handleCheckboxChange = (module) => {
    setCheckedModules(
      (prevChecked) =>
        prevChecked.includes(module)
          ? prevChecked.filter((item) => item !== module) // Uncheck if already checked
          : [...prevChecked, module] // Check if not checked
    );
  };
  console.log(checkedModules, "checkedModules");
  return (
    <div className="bg-white rounded ">
      <ToastContainer />
      <form className="p-6 space-y-6">
        {fields.map((field, index) => {
          return (
            <div key={field.id} className="space-y-6">
              {/* Section Header */}
              <div className="AJ-crm-add-feild-heading-section">
                <h2 className="text-lg font-semibold">Edit Permissions</h2>
              </div>

              {/* Select All */}
              <div className="flex items-center space-x-2">
                <input
                  type="checkbox"
                  checked={checkedModules.includes(module)}
                  onChange={() => handleSelectAll(module)}
                  className="form-checkbox h-4 w-4 text-blue-600"
                />
                <label className="text-sm font-medium">
                  Select All Modules
                </label>
              </div>

              {/* Scrollable Checkbox Grid */}
              <div className="aj-default-padding max-h-100 overflow-y-auto border rounded p-4">
                <div className="grid grid-cols-1 flex aj-default-padding sm:grid-cols-2 md:grid-cols-3 lg:grid-cols-6 gap-3">
                  {modulelist.map((module) => (
                    <label
                      key={module}
                      className="flex items-center space-x-2 gap-4 text-sm"
                    >
                      <input
                        type="checkbox"
                        checked={checkedModules.includes(module)}
                        onChange={() => handleCheckboxChange(module)}
                        className="form-checkbox h-4 w-4 text-blue-600"
                      />
                      <span className="capitalize">
                        {module.replaceAll("_", " ").replaceAll("-", " ")}
                      </span>
                    </label>
                  ))}
                </div>
              </div>

              {/* Submit Button */}
            </div>
          );
        })}
        <div className="aj-button-section flex align-center ">
          <button
            type="submit"
            onClick={(e) => handleSubmit(e)}
            disabled={loading}
            className=" rounded px-6 py-2 my-5 "
          >
            {loading ? "Updating..." : "Update Permissions"}
          </button>
        </div>
      </form>
    </div>
  );
};

export default Modulepermissions;
