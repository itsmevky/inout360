import React, { useEffect, useState } from "react";
import { API } from "../../../Helpers/api"; // your API handler
import Validator from "../../../Helpers/validators"; // if you're using it

const FormDisplay = ({ module = "student", businessType = "education" }) => {
  const [loading, setLoading] = useState(false);
  const [globalFields, setGlobalFields] = useState([]);
  const [formFields, setFormFields] = useState([]);
  const [formName, setFormName] = useState("");
  const [formData, setFormData] = useState({});
  const [error, setError] = useState(null);

  const fetchAll = async () => {
    setLoading(true);
    try {
      console.log("🔄 Starting fetch for global-fields and form");

      // ✅ Fetch Global Fields
      const globalRes = await API.getAll("global-fields", {
        business_type: businessType,
        module,
        page: 1,
        limit: 1,
      });

      console.log("✅ Global fields API response:", globalRes);

      const globalData = globalRes?.data?.[0] || {};
      console.log("📦 Parsed globalData:", globalData);

      const grouped = {};
      (globalData?.fields || []).forEach((field) => {
        const group = field.group || "default";
        if (!grouped[group]) grouped[group] = [];
        grouped[group].push(field);
      });

      console.log("🧩 Grouped global fields:", grouped);
      setGlobalFields(grouped);

      // ✅ Fetch Dynamic Form (try getAll first)
      let form = null;
      let formRes = await API.getAll("form", {
        business_type: businessType,
        module,
        page: 1,
        limit: 1,
      });

      console.log("✅ Form API response (getAll):", formRes);

      if (!formRes?.data?.length) {
        console.warn("⚠️ No form found in getAll. Trying fallback...");

        try {
          const fallbackRes = await API.getSingleForm({
            business_type: businessType,
            module,
          });

          console.log("✅ Fallback single form API response:", fallbackRes);
          form = fallbackRes?.data;
        } catch (fallbackErr) {
          console.error("❌ Fallback form fetch failed:", fallbackErr);
        }
      } else {
        form = formRes?.data?.[0];
      }

      if (!form) {
        setError("No form found for the selected module and business type.");
        return;
      }

      console.log("📦 Final parsed form data:", form);

      setFormFields(form?.fields || []);
      setFormName(form?.name || "");

      // ✅ Initialize form data
      const initialData = {};
      [...(form?.fields || []), ...(globalData?.fields || [])].forEach((f) => {
        if (f?.key) initialData[f.key] = "";
      });

      console.log("📝 Initialized formData:", initialData);

      setFormData(initialData);
    } catch (err) {
      console.error("❌ Error fetching data:", err);
      setError("Failed to load form");
    } finally {
      console.log("✅ Fetch complete");
      setLoading(false);
    }
  };

  useEffect(() => {
    fetchAll();
  }, [module, businessType]);

  if (loading) return <div>Loading...</div>;
  if (error) return <div className="text-red-500">{error}</div>;

  return (
    <div className="p-4">
      <h2 className="text-xl font-bold mb-4">Dynamic Form: {formName}</h2>

      {/* 🔹 Render Global Fields */}
      <div className="mb-6">
        {Object.entries(globalFields).map(([group, fields]) => (
          <div key={group} className="mb-4">
            <h4 className="text-md font-medium text-blue-600">{group}</h4>
            <div className="grid grid-cols-2 gap-4">
              {fields.map((field) => (
                <div key={field.key} className="AJ-floating-label-wrapper">
                  <input
                    type="text"
                    id={field.key}
                    placeholder=" "
                    value={formData[field.key]}
                    onChange={(e) =>
                      setFormData({ ...formData, [field.key]: e.target.value })
                    }
                    className="AJ-floating-input  px-2 py-1 rounded"
                  />
                  <label htmlFor={field.key} className="AJ-floating-label">
                    {field.label}
                  </label>
                </div>
              ))}
            </div>
          </div>
        ))}
      </div>

      {/* 🔹 Render Dynamic Form Fields */}
      <div className="mb-6">
        <div className="grid grid-cols-2 gap-4">
          {formFields.map((field) => (
            <div key={field.key} className="AJ-floating-label-wrapper">
              <input
                type="text"
                id={field.key}
                placeholder=" "
                value={formData[field.key]}
                onChange={(e) =>
                  setFormData({ ...formData, [field.key]: e.target.value })
                }
                className="AJ-floating-input  px-2 py-1 rounded"
              />
              <label htmlFor={field.key} className="AJ-floating-label">
                {field.label}
              </label>
            </div>
          ))}
        </div>
      </div>

      {/* 🔘 Submit Button */}
      <button
        className="bg-blue-600 text-white px-4 py-2 rounded"
        onClick={() => console.log("Form Data:", formData)}
      >
        Submit
      </button>
    </div>
  );
};

export default FormDisplay;
