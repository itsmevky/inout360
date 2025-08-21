import React, { useState, useEffect } from "react";
import { useParams } from "react-router-dom";
import axios from "axios";
import { toast } from "react-toastify";
import Cookies from "js-cookie";
import Validator from "../../Helpers/validators.js";
import { getData, putData } from "../../Helpers/api.js";
import { ToastContainer } from "react-toastify";
import "react-toastify/dist/ReactToastify.css";
import { useNavigate } from "react-router-dom";
import rules from "./Rules.js";
import bcrypt from "bcryptjs"; // Import bcryptjs for hashing password

const EditRoomForm = ({ room }) => {
  let roomId = room;
  const [formData, setFormData] = useState({
    room_number: "",
    room_name: "",
    floor: "",
    capacity: "",
    type: "",
    status: "", // Add status here
  });

  // Fetch user data based on userId when the Component mounts
  useEffect(() => {
    const fetchformData = async () => {
      if (!roomId) return; // Wait until userId is defined

      setLoading(true);
      try {
        const formData = await getData(`/rooms/${roomId}`);
        if (formData) {
          setFormData((prevData) => ({
            ...prevData,
            room_number: formData.room_number || "",
            room_name: formData.room_name || "",
            floor: formData.floor || "",
            capacity: formData.capacity || "",
            type: formData.type || "",
            status: formData.status || "",
          }));
        }
      } catch (error) {
        console.error("Error fetching user data:", error);
      } finally {
        setLoading(false);
      }
    };

    fetchformData();
  }, [roomId]);
  // Re-run when userId changes
  const validator = new Validator(rules);
  const handleSubmit = async (e) => {
    e.preventDefault();
    setLoading(true);

    try {
      const response = await putData(`/rooms/${roomId}`, formData); // Assuming PUT request to update
      setSuccess(true);
      toast.success("Room updated successfully!");
      navigate("/dashboard/getusers"); // Redirect to user list page after success
    } catch (error) {
      setSuccess(false);
      toast.error("Error updating room.");
    } finally {
      setLoading(false);
    }
  };
  const [formVisible, setFormVisible] = useState(true); // State to control form visibility
  const [errors, setErrors] = useState({});
  const [touched, setTouched] = useState({
    room_number: false,
    room_name: false,
    floor: false,
    capacity: false,
    type: false,
    status: false,
  });
  const navigate = useNavigate();
  const [success, setSuccess] = useState(false);
  const [loading, setLoading] = useState(false);

  const handleBlur = async (e) => {
    const { name, value } = e.target;
    setTouched({ ...touched, [name]: true });
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
  const getFieldClassName = (fieldName) => {
    return errors[fieldName] ? "field-error" : "field";
  };

  const encodeData = (data) => {
    return btoa(JSON.stringify(data));
  };

  const handleChange = (e) => {
    const { name, value } = e.target;
    setFormData({
      ...formData,
      [name]: value,
    });
  };
  useEffect(() => {
    console.log("Fetched User Data:", formData); // Debug check
  }, [formData]);

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
                <h2 className=" text-xl font-semibold mb-6 text-gray-800 ">
                  Edit Room
                </h2>

                {/* ROOM NUMBER */}
                <div className="first-left form-item">
                  <input
                    type="number"
                    placeholder=""
                    name="room_number"
                    value={formData.room_number}
                    onChange={handleChange}
                    onBlur={handleBlur}
                    className={getFieldClassName("room_number")}
                  />
                  <label className="text-sm text-#000-200">
                    Room_number<span className="text-red-500">*</span>
                  </label>
                </div>

                {/* ROOM NAME */}
                <div className="first-left form-item">
                  <input
                    type="text"
                    placeholder=""
                    name="room_name"
                    value={formData.room_name}
                    onChange={handleChange}
                    onBlur={handleBlur}
                    className={getFieldClassName("room_name")}
                  />
                  <label className="text-sm text-#000-500">Room_name</label>
                </div>

                {/* FLOOR */}
                <div className="first-left form-item">
                  <input
                    type="number"
                    placeholder=""
                    name="floor"
                    value={formData.floor}
                    onChange={handleChange}
                    onBlur={handleBlur}
                    className={getFieldClassName("floor")}
                  />
                  <label className="block text-sm text-#000-500">Floor</label>
                </div>

                {/* CAPACITY */}
                <div className="first-left form-item">
                  <input
                    type="number"
                    placeholder=""
                    name="capacity"
                    value={formData.capacity}
                    onChange={handleChange}
                    onBlur={handleBlur}
                    className={getFieldClassName("capacity")}
                  />
                  <label className="block text-sm text-#000-500">
                    Capacity
                  </label>
                </div>

                {/* type */}
                <div className="select-option-dropdown first-left form-item">
                  <select
                    name="type"
                    value={formData.type}
                    onChange={handleChange}
                    onBlur={handleBlur}
                    className={getFieldClassName("type")}
                  >
                    <option value="">select an option</option>
                    <option value="Classroom">Classroom</option>
                    <option value="Laboratory">Laboratory</option>
                    <option value="Library">Library</option>
                    <option value="Office">Office</option>
                    <option value="Auditorium">Auditorium</option>
                    <option value="Other">Other</option>
                  </select>
                  <span className="dropdown-icon">▼</span>
                  <label className={formData.type ? "selected" : ""}>
                    Type <span className="text-red-500">*</span>
                  </label>
                </div>
                {/* Status Dropdown */}
                <div className="select-option-dropdown first-left form-item">
                  <select
                    name="status"
                    value={formData.status}
                    onChange={handleChange}
                    onBlur={handleBlur}
                    className={getFieldClassName("status")}
                  >
                    <option value="active">Active</option>
                    <option value="inactive">Inactive</option>
                    <option value="suspended">Suspended</option>
                  </select>
                  <span className="dropdown-icon">▼</span>
                  <label className={formData.status ? "selected" : ""}>
                    Status <span className="text-red-500">*</span>
                  </label>
                </div>

                {/* Submit Button */}
                <div className="flex justify-between">
                  <button
                    type="submit"
                    className="upclick px-4 mt-5 py-2 text-white text-sm font-medium rounded-md hover:bg-blue-700 focus:outline-none focus:ring-2 focus:ring-blue-500 focus:ring-offset-2"
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
          <div className="loader"></div>
        </div>
      )}
    </div>
  );
};

export default EditRoomForm;
