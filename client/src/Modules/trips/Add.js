import React, { useState } from "react";
import { toast, ToastContainer } from "react-toastify";
import "react-toastify/dist/ReactToastify.css";
import { API } from "../../Helpers/api.js";
import Validator from "../../Helpers/validators.js";
import tripRules from "./Rules.js";

const AddTripForm = () => {
  const initialFormData = {
    tripName: "",
    description: "",
    destination: "",
    tripDate: "",
    returnDate: "",
    tripCoordinator: "",
    transportationMode: "bus",
    estimatedCost: "",
    status: "scheduled",
    schoolId: "",
  };

  const [formData, setFormData] = useState(initialFormData);
  const [errors, setErrors] = useState({});
  const [loading, setLoading] = useState(false);
  const validator = new Validator(tripRules);

  const handleChange = (e) => {
    const { name, value } = e.target;
    setFormData((prev) => ({ ...prev, [name]: value }));
  };

  const handleBlur = async (e) => {
    const { name, value } = e.target;
    const fieldErrors = await validator.validate(
      { [name]: value },
      { [name]: tripRules[name] }
    );
    setErrors((prev) => ({
      ...prev,
      [name]: fieldErrors[name] || "",
    }));
  };

  const validateForm = async () => {
    const validationErrors = await validator.validate(formData, tripRules);
    setErrors(validationErrors);
    return Object.keys(validationErrors).length === 0;
  };

  const handleSubmit = async (e) => {
    e.preventDefault();
    setLoading(true);

    const isValid = await validateForm();
    if (!isValid) {
      toast.error("Please fix the validation errors.");
      setLoading(false);
      return;
    }

    try {
      const result = await API.CreateTrip(formData);
      if (result.status === true) {
        toast.success("Trip created successfully!");
        setFormData(initialFormData);
      } else {
        toast.error(result.message || "Failed to create trip.");
      }
    } catch (error) {
      console.error("Error creating trip:", error);
      toast.error("An error occurred. Please try again.");
    } finally {
      setLoading(false);
    }
  };

  const getFieldClassName = (fieldName) =>
    errors[fieldName] ? "field-error" : "field";

  return (
    <div className="adduser-outer-section">
      <div className="adduser-inner-section">
        <div className="adduser-form-section">
          <form
            onSubmit={handleSubmit}
            className="w-full max-w-lg mx-auto mt-8"
            noValidate
          >
            <h2 className="text-xl font-semibold mb-6 text-gray-800">
              Create New Trip
            </h2>

            {/* Trip Name */}
            <div className="form-item">
              <input
                type="text"
                name="tripName"
                value={formData.tripName}
                onChange={handleChange}
                onBlur={handleBlur}
                className={getFieldClassName("tripName")}
              />
              <label>
                Trip Name <span className="text-red-500">*</span>
              </label>
            </div>

            {/* Description */}
            <div className="form-item">
              <textarea
                name="description"
                value={formData.description}
                onChange={handleChange}
                onBlur={handleBlur}
                className={getFieldClassName("description")}
              />
              <label>Description</label>
            </div>

            {/* Destination */}
            <div className="form-item">
              <input
                type="text"
                name="destination"
                value={formData.destination}
                onChange={handleChange}
                onBlur={handleBlur}
                className={getFieldClassName("destination")}
              />
              <label>
                Destination <span className="text-red-500">*</span>
              </label>
            </div>

            {/* Trip Date */}
            <div className="form-item">
              <input
                type="date"
                name="tripDate"
                value={formData.tripDate}
                onChange={handleChange}
                onBlur={handleBlur}
                className={getFieldClassName("tripDate")}
              />
              <label>
                Trip Date <span className="text-red-500">*</span>
              </label>
            </div>

            {/* Return Date */}
            <div className="form-item">
              <input
                type="date"
                name="returnDate"
                value={formData.returnDate}
                onChange={handleChange}
                onBlur={handleBlur}
                className={getFieldClassName("returnDate")}
              />
              <label>Return Date</label>
            </div>

            {/* Trip Coordinator */}
            <div className="form-item">
              <input
                type="text"
                name="tripCoordinator"
                value={formData.tripCoordinator}
                onChange={handleChange}
                onBlur={handleBlur}
                className={getFieldClassName("tripCoordinator")}
              />
              <label>
                Trip Coordinator ID <span className="text-red-500">*</span>
              </label>
            </div>

            {/* School ID */}
            <div className="form-item">
              <input
                type="text"
                name="schoolId"
                value={formData.schoolId}
                onChange={handleChange}
                onBlur={handleBlur}
                className={getFieldClassName("schoolId")}
              />
              <label>
                School ID <span className="text-red-500">*</span>
              </label>
            </div>

            {/* Transportation Mode */}
            <div className="form-item">
              <select
                name="transportationMode"
                value={formData.transportationMode}
                onChange={handleChange}
                onBlur={handleBlur}
                className={getFieldClassName("transportationMode")}
              >
                <option value="bus">Bus</option>
                <option value="train">Train</option>
                <option value="flight">Flight</option>
                <option value="private">Private</option>
                <option value="other">Other</option>
              </select>
              <label>Transportation Mode</label>
            </div>

            {/* Estimated Cost */}
            <div className="form-item">
              <input
                type="number"
                name="estimatedCost"
                value={formData.estimatedCost}
                onChange={handleChange}
                onBlur={handleBlur}
                className={getFieldClassName("estimatedCost")}
              />
              <label>Estimated Cost</label>
            </div>

            {/* Status */}
            <div className="form-item">
              <select
                name="status"
                value={formData.status}
                onChange={handleChange}
                onBlur={handleBlur}
                className={getFieldClassName("status")}
              >
                <option value="scheduled">Scheduled</option>
                <option value="completed">Completed</option>
                <option value="cancelled">Cancelled</option>
              </select>
              <label>Status</label>
            </div>

            {/* Submit Button */}
            <div className="flex">
              <button
                type="submit"
                className="upclick px-4 mt-5 py-2 text-white bg-blue-600 text-sm font-medium rounded-md hover:bg-blue-700 focus:outline-none"
              >
                {loading ? "Creating..." : "Create Trip"}
              </button>
            </div>
          </form>
        </div>
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

export default AddTripForm;
