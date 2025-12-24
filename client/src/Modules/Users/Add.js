import React, { useEffect, useState } from "react";
import { useNavigate } from "react-router-dom";
import { toast } from "react-toastify";
import { API } from "../../Helpers/api.js";

const AddUserForm = ({ onSuccess, onClose }) => {
  const [formError, setFormError] = useState("");
  const [profileImageFile, setProfileImageFile] = useState(null);
  const [profileImagePreview, setProfileImagePreview] = useState("");
  const navigate = useNavigate();

  /* ================= REQUIRED FIELDS ================= */
  const requiredFields = [
    "firstName",
    "lastName",
    "gender",
    "dob",
    "email",
    "phone",
    "currentaddress",
    "city",
    "state",
    "pincode",
  ];

  const fieldLabel = {
    firstName: "First Name",
    lastName: "Last Name",
    gender: "Gender",
    dob: "Date of Birth",
    email: "Email",
    phone: "Phone",
    currentaddress: "Street",
    city: "City",
    state: "State",
    pincode: "Pincode",
  };

  const normalizeValue = (v) => String(v || "").trim();

  /* ================= SUBMIT ================= */
  const handleSubmit = async (e) => {
    e.preventDefault();
    setFormError("");

    const form = e.currentTarget;
    const formData = new FormData(form);
    const payload = {};

    for (const [k, v] of formData.entries()) {
      if (v instanceof File) continue;
      payload[k] = typeof v === "string" ? v.trim() : v;
    }

    payload.name = `${payload.firstName || ""} ${payload.lastName || ""}`.trim();
    formData.set("name", payload.name);

    const missing = requiredFields.find((k) => !normalizeValue(payload[k]));
    if (missing) {
      const msg = `${fieldLabel[missing]} is required`;
      setFormError(msg);
      toast.error(msg);
      return;
    }

    try {
      const res = await API.add(
        "employees/add",
        profileImageFile ? formData : payload
      );

      if (res?.status || res?.success) {
        toast.success(res.message || "Employee created successfully");
        form.reset();
        setProfileImageFile(null);
        setProfileImagePreview("");

        if (onSuccess) return onSuccess(res);
        navigate("/dashboard/users/employees", { replace: true });
      } else {
        toast.error(res.message || "Failed to create employee");
      }
    } catch {
      toast.error("Something went wrong");
    }
  };

  /* ================= IMAGE PREVIEW ================= */
  useEffect(() => {
    if (!profileImageFile) return setProfileImagePreview("");
    const url = URL.createObjectURL(profileImageFile);
    setProfileImagePreview(url);
    return () => URL.revokeObjectURL(url);
  }, [profileImageFile]);

  const handleProfileImageChange = (e) => {
    setProfileImageFile(e.target.files?.[0] || null);
  };

  return (
    /* ===== OVERLAY ===== */
    <div className="fixed inset-0 z-50 bg-black/40 flex justify-center items-start overflow-y-auto px-4 py-10">

      {/* ===== MODAL ===== */}
      <div className="relative w-full max-w-4xl bg-white rounded-xl shadow-xl">

        {/* ===== CLOSE BUTTON (FIXED TOP RIGHT) ===== */}
        <button
          type="button"
          onClick={() => (onClose ? onClose() : navigate(-1))}
          className="absolute top-4 right-4 w-9 h-9 rounded-full bg-red-600 text-white flex items-center justify-center hover:bg-red-700 transition"
        >
          ✕
        </button>

        {/* ===== CONTENT ===== */}
        <div className="p-6">

          <h2 className="text-xl font-semibold text-gray-800 mb-6">
            Add New Employee
          </h2>

          <form onSubmit={handleSubmit} noValidate>

            {/* ===== PROFILE ===== */}
            <div className="flex flex-col sm:flex-row gap-6 mb-8 addemployee-profile-page-box">
              <div className="w-[120px] h-[150px] border rounded-md bg-gray-100 overflow-hidden">
                <img
                  src={
                    profileImagePreview ||
                    "https://via.placeholder.com/120x150?text=Profile"
                  }
                  className="w-full h-full object-cover"
                  alt="Profile"
                />
              </div>

              <div>
                <p className="text-sm font-medium text-gray-700 mb-2 !mx-0">
                  Upload Profile Image
                </p>
                <input
                  type="file"
                  accept="image/*"
                  onChange={handleProfileImageChange}
                  className="text-sm !px-0"
                />
              </div>
            </div>

            {/* ===== PERSONAL INFO ===== */}
            <Section title="Personal Information" />

            <div className="grid grid-cols-1 md:grid-cols-2 gap-6">
              <Field label="First Name *" name="firstName" />
              <Field label="Last Name *" name="lastName" />
              <SelectField
                label="Gender *"
                name="gender"
                options={["Male", "Female", "Other"]}
              />
              <Field label="Date of Birth *" name="dob" type="date" />
              <Field label="Email *" name="email" type="email" />
              <Field label="Phone *" name="phone" />
              {/* <Field label="Password *" name="password" type="password" full /> */}
            </div>

            {/* ===== ADDRESS ===== */}
            <Section title="Current Address" />

            <div className="grid grid-cols-1 md:grid-cols-2 gap-6">
              <Field label="Street *" name="currentaddress" />
              <Field label="City *" name="city" />
              <Field label="State *" name="state" />
              <Field label="Pincode *" name="pincode" type="number" />
            </div>

            {/* ===== SUBMIT ===== */}
            <div className="mt-8 flex justify-end">
              <button
                type="submit"
                className="px-8 py-2 !mt-5 bg-blue-600 text-white rounded-md hover:bg-blue-700 add-employee-submit-button"
              >
                Submit
              </button>
            </div>

            {formError && (
              <div className="text-red-600 text-sm mt-3">{formError}</div>
            )}
          </form>
        </div>
      </div>
    </div>
  );
};

/* ================= SMALL COMPONENTS ================= */

const Section = ({ title }) => (
  <h3 className="text-base font-semibold text-gray-800 mt-8 mb-4">
    {title}
  </h3>
);

const Field = ({ label, name, type = "text", full }) => (
  <div className={full ? "md:col-span-2" : ""}>
    <label className="block text-sm font-medium text-gray-700 mb-1">
      {label}
    </label>
    <input
      type={type}
      name={name}
      className="w-full h-[42px] border border-gray-300 rounded-md px-3 focus:outline-none focus:ring-1 focus:ring-blue-500"
    />
  </div>
);

const SelectField = ({ label, name, options }) => (
  <div>
    <label className="block text-sm font-medium text-gray-700 mb-1">
      {label}
    </label>
    <select
      name={name}
      className="w-full h-[42px] border border-gray-300 rounded-md px-3 bg-white focus:outline-none focus:ring-1 focus:ring-blue-500"
    >
      <option value=""></option>
      {options.map((opt) => (
        <option key={opt}>{opt}</option>
      ))}
    </select>
  </div>
);

export default AddUserForm;
