import React, { useState } from "react";
import { API } from "../helpers/api";
import Rules from "../modules/Users/Teachers/rules";
import Validator from "../helpers/validators";

// Simulated API calls (replace with async/await inside useEffect in real apps)
const moduleList = await API.getModuleList();
const roleList = await API.getRoleList();

const defaultActions = ["create", "read", "update", "delete"];

const dynamicModules = {};
moduleList.forEach((mod) => {
  dynamicModules[mod.toLowerCase()] = [...defaultActions];
});

const initialPermissions = {
  super_admin: {
    hierarchy: 1,
    modules: dynamicModules,
  },
};

const PermissionsForm = () => {
  const [permissions, setPermissions] = useState(initialPermissions);
  const [formData, setFormData] = useState({ role: "", hierarchy: "" });
  const [errors, setErrors] = useState({});
  const [touched, setTouched] = useState({});

  const validator = new Validator(Rules);

  const handleChange = (e) => {
    const { name, value } = e.target;
    setFormData((prev) => ({
      ...prev,
      [name]: value,
    }));
  };

  const handleBlur = async (e) => {
    const { name, value } = e.target;
    setTouched({ ...touched, [name]: true });
    const fieldErrors = await validator.validate(
      { [name]: value },
      { [name]: Rules[name] }
    );
    setErrors((prev) => ({
      ...prev,
      [name]: fieldErrors[name] || "",
    }));
  };

  const getFieldClassName = (fieldName) => {
    return errors[fieldName] ? "field-error" : "field";
  };

  const togglePermission = (role, module, action) => {
    setPermissions((prev) => {
      const updated = { ...prev };
      const perms = updated[role].modules[module];
      if (perms.includes(action)) {
        updated[role].modules[module] = perms.filter((p) => p !== action);
      } else {
        updated[role].modules[module] = [...perms, action];
      }
      return updated;
    });
  };

  const toggleAllModulePermissions = (role, moduleName) => {
    setPermissions((prev) => {
      const currentActions = prev[role].modules[moduleName];
      const allActions = ["create", "read", "update", "delete"];
      const updatedModules = {
        ...prev[role].modules,
        [moduleName]:
          currentActions.length === allActions.length ? [] : allActions,
      };

      return {
        ...prev,
        [role]: {
          ...prev[role],
          modules: updatedModules,
        },
      };
    });
  };

  const toggleAllPermissions = (role, action) => {
    setPermissions((prev) => {
      const updatedModules = { ...prev[role].modules };
      const allChecked = Object.values(updatedModules).every((actions) =>
        actions.includes(action)
      );

      Object.keys(updatedModules).forEach((module) => {
        const hasAction = updatedModules[module].includes(action);
        if (allChecked && hasAction) {
          updatedModules[module] = updatedModules[module].filter(
            (a) => a !== action
          );
        } else if (!allChecked && !hasAction) {
          updatedModules[module].push(action);
        }
      });

      return {
        ...prev,
        [role]: {
          ...prev[role],
          modules: updatedModules,
        },
      };
    });
  };
  const getFilteredPermissions = () => {
    const cleaned = {};

    for (const role in permissions) {
      const modules = permissions[role].modules;
      const filteredModules = {};

      for (const moduleName in modules) {
        const actions = modules[moduleName];
        if (actions.length > 0) {
          filteredModules[moduleName] = actions;
        }
      }

      // Only add role if it has at least one module with actions
      if (Object.keys(filteredModules).length > 0) {
        cleaned[role] = {
          ...permissions[role],
          modules: filteredModules,
        };
      }
    }

    return cleaned;
  };

  const handleSubmit = async (e) => {
    e.preventDefault();
    console.log(getFilteredPermissions, "getFilteredPermissions");

    const selectedRole = roleList.data.find(
      (role) => role.id === formData.role
    );

    if (!selectedRole) {
      console.error("Invalid role selected");
      return;
    }

    const roleId = selectedRole.id;
    const roleName = selectedRole.name;

    const roledata = {
      name: roleName,
      permissions: permissions.super_admin.modules,
      hierarchy: formData.hierarchy,
    };

    console.log(roledata, "roledata");

    try {
      await API.updatePermission(roleId, roledata);
      console.log("Permissions updated successfully");
      alert("Permissions updated successfully");
    } catch (error) {
      console.error("Error updating permissions:", error);
      alert("Failed to update permissions");
    }
  };

  return (
    <form onSubmit={handleSubmit} className="p-6 bg-white rounded-xl shadow-md">
      <h2 className="text-xl font-bold mb-4">Edit Permissions</h2>
      <div className="flex">
        <div className="AJ-floating-label-wrapper">
          <select
            name="role"
            value={formData.role}
            onChange={handleChange}
            onBlur={handleBlur}
            className={`${getFieldClassName(
              "role"
            )} AJ-floating-select AJ-floating-input`}
          >
            <option value="" disabled></option>
            {roleList.data.map((role) => (
              <option key={role.name} value={role.id}>
                {role.name}
              </option>
            ))}
          </select>
          <label className="AJ-floating-label">Role</label>
        </div>
        <div className="AJ-floating-label-wrapper">
          <select
            name="hierarchy"
            value={formData.hierarchy}
            onChange={handleChange}
            onBlur={handleBlur}
            className={`${getFieldClassName(
              "hierarchy"
            )} AJ-floating-select AJ-floating-input`}
          >
            <option value="" disabled></option>
            {roleList.data.map((role, index) => (
              <option key={index} value={index}>
                {index + 1}
              </option>
            ))}
          </select>

          <label className="AJ-floating-label">Hierarchy</label>
        </div>
      </div>

      <div className="overflow-x-auto">
        {Object.entries(permissions).map(([role, { modules }]) => (
          <div key={role} className="mb-6">
            <h3 className="text-lg font-semibold mb-2 capitalize">
              Permissions
            </h3>
            <table className="min-w-full table-auto border-collapse border border-gray-300">
              <thead>
                <tr className="bg-gray-100">
                  <th className="border border-gray-300 px-4 py-2 text-left">
                    <div className="flex items-center gap-2 capitalize">
                      <input
                        type="checkbox"
                        onChange={() => {
                          const updatedModules = {};
                          const isAllChecked = Object.values(modules).every(
                            (actions) =>
                              actions.includes("create") &&
                              actions.includes("read") &&
                              actions.includes("update") &&
                              actions.includes("delete")
                          );

                          Object.keys(modules).forEach((moduleName) => {
                            updatedModules[moduleName] = isAllChecked
                              ? []
                              : defaultActions;
                          });

                          setPermissions({
                            ...permissions,
                            [role]: {
                              ...permissions[role],
                              modules: updatedModules,
                            },
                          });
                        }}
                        checked={Object.values(modules).every(
                          (actions) =>
                            actions.includes("create") &&
                            actions.includes("read") &&
                            actions.includes("update") &&
                            actions.includes("delete")
                        )}
                        className="form-checkbox h-4 w-4 text-blue-600"
                      />
                      Module
                    </div>
                  </th>
                  {["create", "read", "update", "delete"].map((action) => (
                    <th
                      key={action}
                      className="text-center border border-gray-300 px-4 py-2"
                    >
                      <div className="flex items-center gap-2 capitalize">
                        <input
                          type="checkbox"
                          onChange={() => toggleAllPermissions(role, action)}
                          checked={Object.values(modules).every((a) =>
                            a.includes(action)
                          )}
                          className="form-checkbox h-4 w-4 text-blue-600"
                        />
                        {action}
                      </div>
                    </th>
                  ))}
                </tr>
              </thead>

              <tbody>
                {Object.entries(modules).map(([moduleName, actions]) => (
                  <tr key={moduleName} className="text-center">
                    <td className="border border-gray-300 px-4 py-2 text-left capitalize">
                      <div className="flex items-center gap-2">
                        <input
                          type="checkbox"
                          onChange={() =>
                            toggleAllModulePermissions(role, moduleName)
                          }
                          checked={["create", "read", "update", "delete"].every(
                            (action) => actions.includes(action)
                          )}
                          className="form-checkbox h-4 w-4 text-blue-600"
                        />
                        {moduleName}
                      </div>
                    </td>
                    {["create", "read", "update", "delete"].map((action) => (
                      <td
                        key={action}
                        className="border border-gray-300 px-4 py-2"
                      >
                        <input
                          type="checkbox"
                          checked={actions.includes(action)}
                          onChange={() =>
                            togglePermission(role, moduleName, action)
                          }
                          className="form-checkbox h-4 w-4 text-blue-600"
                        />
                      </td>
                    ))}
                  </tr>
                ))}
              </tbody>
            </table>
          </div>
        ))}
      </div>

      <button
        type="submit"
        className="mt-4 px-6 py-2 bg-blue-600 text-white rounded hover:bg-blue-700"
      >
        Update Permissions
      </button>
    </form>
  );
};

export default PermissionsForm;
