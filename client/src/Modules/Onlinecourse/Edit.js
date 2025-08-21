import React, { useState, useEffect } from "react";
import { useNavigate, useParams } from "react-router-dom";
import { toast, ToastContainer } from "react-toastify";
import Cookies from "js-cookie";
import Validator from "../../Helpers/validators.js";
import { getData, putData } from "../../Helpers/api.js";
import "react-toastify/dist/ReactToastify.css";
import rules from "./Rules.js";

const ClassForm = ({ user }) => {
  const userId = user;
  const navigate = useNavigate();

  const [formData, setFormData] = useState({
    className: "",
    description: "",
    capacity: "",
    rooms: "",
    teacherId: "",
    feeIds: "",
    utilities: "",
  });

  const [loading, setLoading] = useState(false);
  const [success, setSuccess] = useState(false);
  const [formVisible, setFormVisible] = useState(true);
  const [errors, setErrors] = useState({});
  const [touched, setTouched] = useState({
    className: false,
    description: false,
    capacity: false,
    rooms: false,
    teacherId: false,
    feeIds: false,
    utilities: false,
  });

  const validator = new Validator(rules);

  useEffect(() => {
    const fetchClassData = async () => {
      setLoading(true);
      try {
        const classdata = await getData(`/class/${userId}`);
        if (classdata) {
          setFormData({
            className: classdata.className || "",
            description: classdata.description || "",
            capacity: classdata.capacity || "",
            rooms: classdata.rooms || "",
            teacherId: classdata.teacherId || "",
            feeIds: classdata.feeIds || "",
            utilities: classdata.utilities || "",
          });
        }
      } catch (error) {
        console.error("Error fetching class data:", error);
      } finally {
        setLoading(false);
      }
    };

    fetchClassData();
  }, [userId]);

  const handleSubmit = async (e) => {
    e.preventDefault();
    setLoading(true);

    try {
      const response = await putData(`/class/${userId}`, formData);
      setSuccess(true);
      toast.success("Class updated successfully!");
      navigate("/dashboard/getusers");
    } catch (error) {
      setSuccess(false);
      toast.error("Error updating class.");
    } finally {
      setLoading(false);
    }
  };

  const handleChange = (e) => {
    const { name, value } = e.target;
    setFormData((prev) => ({
      ...prev,
      [name]: value,
    }));
  };

  const handleBlur = async (e) => {
    const { name, value } = e.target;
    setTouched((prev) => ({ ...prev, [name]: true }));
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

  const getFieldClassName = (fieldName) =>
    errors[fieldName] ? "field-error" : "field";

  return (
    <div>
      {formVisible && (
        <div className="adduser-outer-section">
          <div className="adduser-inner-section">
            <div className="adduser-form-section">
              <form
                className="aj-crm-adding w-full max-w-lg mx-auto mt-8"
                onSubmit={handleSubmit}
              >
                <h2 className="text-xl font-semibold mb-6 text-gray-800">
                  Edit Class
                </h2>

                {/* Class Name */}
                <div className="form-item">
                  <input
                    type="text"
                    name="className"
                    value={formData.className}
                    onChange={handleChange}
                    onBlur={handleBlur}
                    className={getFieldClassName("className")}
                  />
                  <label className="text-sm text-gray-600">
                    Class Name <span className="text-red-500">*</span>
                  </label>
                </div>

                {/* Description */}
                <div className="form-item">
                  <input
                    type="text"
                    name="description"
                    value={formData.description}
                    onChange={handleChange}
                    onBlur={handleBlur}
                    className={getFieldClassName("description")}
                  />
                  <label className="text-sm text-gray-600">Description</label>
                </div>

                {/* Capacity */}
                <div className="form-item">
                  <input
                    type="text"
                    name="capacity"
                    value={formData.capacity}
                    onChange={handleChange}
                    onBlur={handleBlur}
                    className={getFieldClassName("capacity")}
                  />
                  <label className="text-sm text-gray-600">
                    Capacity <span className="text-red-500">*</span>
                  </label>
                </div>

                {/* Rooms */}
                <div className="form-item">
                  <input
                    type="number"
                    name="rooms"
                    value={formData.rooms}
                    onChange={handleChange}
                    onBlur={handleBlur}
                    className={getFieldClassName("rooms")}
                  />
                  <label className="text-sm text-gray-600">
                    Rooms <span className="text-red-500">*</span>
                  </label>
                </div>

                {/* Teacher ID */}
                <div className="form-item">
                  <input
                    type="text"
                    name="teacherId"
                    value={formData.teacherId}
                    onChange={handleChange}
                    onBlur={handleBlur}
                    className={getFieldClassName("teacherId")}
                  />
                  <label className="text-sm text-gray-600">
                    Teacher <span className="text-red-500">*</span>
                  </label>
                </div>

                {/* Fee IDs */}
                <div className="form-item">
                  <input
                    type="text"
                    name="feeIds"
                    value={formData.feeIds}
                    onChange={handleChange}
                    onBlur={handleBlur}
                    className={getFieldClassName("feeIds")}
                  />
                  <label className="text-sm text-gray-600">
                    Fee  <span className="text-red-500">*</span>
                  </label>
                </div>

                {/* Utilities */}
                <div className="form-item">
                  <input
                    type="text"
                    name="utilities"
                    value={formData.utilities}
                    onChange={handleChange}
                    onBlur={handleBlur}
                    className={getFieldClassName("utilities")}
                  />
                  <label className="text-sm text-gray-600">
                    Utilities <span className="text-red-500">*</span>
                  </label>
                </div>

                {/* Submit Button */}
                <div className="flex justify-end">
                  <button
                    type="submit"
                    className="upclick px-4 mt-5 py-2 text-white text-sm font-medium rounded-md bg-blue-600 hover:bg-blue-700"
                  >
                    Update
                  </button>
                </div>
              </form>
            </div>
          </div>
        </div>
      )}

      <ToastContainer position="top-right" autoClose={3000} />

      {loading && (
        <div className="loader-wrapper">
          <div className="loader">Loading...</div>
        </div>
      )}
    </div>
  );
};

export default ClassForm;
