import React, { useState, useEffect, useRef } from "react";
import { useNavigate } from "react-router-dom";
import { toast, ToastContainer } from "react-toastify";
import { putData } from "../../../Helpers/api.js";

const EditUserForm = ({ user }) => {
  const navigate = useNavigate();
  const fileRef = useRef(null);

  const [formData, setFormData] = useState({});
  const [loading, setLoading] = useState(false);
  const [open, setOpen] = useState(false);

  const [profileFile, setProfileFile] = useState(null);
  const [profilePreview, setProfilePreview] = useState("");

  /* ================= PREFILL ================= */
  useEffect(() => {
    if (!user) return;

    const fullName = user.name || "";
    const [firstName = "", ...rest] = fullName.split(" ");

    setFormData({
      firstName: user.firstName || firstName,
      lastName: user.lastName || rest.join(" "),
      gender: user.gender || "",
      dob: user.dob ? user.dob.split("T")[0] : "",
      email: user.email || "",
      phone: user.phone || "",
      currentaddress: user.currentaddress || "",
      permanentaddress: user.permanentaddress || "",
      state: user.state || "",
      city: user.city || "",
      pincode: user.pincode || "",
      joiningDate: user.joiningDate ? user.joiningDate.split("T")[0] : "",
      designation: user.designation || "",
      shift: user.shift || "",
      department: user.department || "",
      section: user.section || "",
      rfid: user.rfid || "",
      role: user.role || "",
      aadharcardnumber: user.aadharcardnumber || "",
      pancard: user.pancard || "",
      accountNumber: user.accountNumber || "",
      ifscCode: user.ifscCode || "",
    });

    setProfilePreview(user?.photo || "");
    document.body.style.overflow = "hidden";
    setTimeout(() => setOpen(true), 50);

    return () => (document.body.style.overflow = "auto");
  }, [user]);

  /* ================= IMAGE HANDLERS ================= */
  const handleProfileSelect = (e) => {
    const file = e.target.files[0];
    if (!file) return;

    setProfileFile(file);
    setProfilePreview(URL.createObjectURL(file));
  };

  const cancelProfileChange = () => {
    setProfileFile(null);
    setProfilePreview(user?.photo || "");
    if (fileRef.current) fileRef.current.value = "";
  };

  /* ================= FORM HANDLERS ================= */
  const handleChange = (e) =>
    setFormData({ ...formData, [e.target.name]: e.target.value });

  const handleClose = () => {
    setOpen(false);
    setTimeout(() => navigate("/dashboard/users"), 200);
  };

  const handleSubmit = async (e) => {
    e.preventDefault();
    setLoading(true);

    try {
      const payload = new FormData();

      Object.entries(formData).forEach(([k, v]) => payload.append(k, v));
      if (profileFile) payload.append("profileImage", profileFile);

      const res = await putData(`/employee/${user?._id}`, payload);

      if (res?.success || res?.status === 200) {
        toast.success("Employee updated successfully");
        handleClose();
      } else {
        toast.error(res.message || "Update failed");
      }
    } catch {
      toast.error("Something went wrong");
    } finally {
      setLoading(false);
    }
  };

  /* ================= UI ================= */
  return (
    <>
      {/* OVERLAY */}
      <div className="fixed inset-0 z-50 flex items-center justify-center bg-black/60 backdrop-blur-sm !m-0">
        {/* MODAL */}
        <div
          className={`
            relative w-full max-w-4xl mx-4
            bg-white rounded-xl shadow-2xl
            max-h-[90vh] overflow-y-auto
            transform transition-all duration-300
            ${open ? "scale-100 opacity-100" : "scale-90 opacity-0"}
          `}
        >
          {/* CLOSE */}
          <button
            onClick={handleClose}
            className="absolute top-4 right-4 text-red-500 text-2xl font-bold employee-editpopup-cut-button"
          >
            ✕
          </button>

          <form onSubmit={handleSubmit} className="p-4 sm:p-6">
            <h2 className="text-xl font-semibold mb-6">Edit Employee</h2>

            {/* ================= PROFILE SECTION ================= */}
            <div className="flex items-center gap-6 mb-8">
              <div className="w-[120px] h-[150px] border rounded-md overflow-hidden bg-gray-100">
                <img
                  src={
                    profilePreview ||
                    "https://via.placeholder.com/120x150?text=Profile"
                  }
                  className="w-full h-full object-cover"
                  alt="Profile"
                />
              </div>

              <div className="flex flex-col gap-2">
                <input
                  type="file"
                  accept="image/*"
                  ref={fileRef}
                  onChange={handleProfileSelect}
                  className="hidden"
                />

                <button
                  type="button"
                  onClick={() => fileRef.current.click()}
                  className="px-3 py-2 text-sm bg-blue-600 text-white rounded-md"
                >
                  {profileFile ? "Change Image" : "Choose Image"}
                </button>

                {profileFile && (
                  <button
                    type="button"
                    onClick={cancelProfileChange}
                    className="px-3 py-2 text-sm border border-gray-400 rounded-md hover:bg-gray-100"
                  >
                    Cancel
                  </button>
                )}
              </div>
            </div>

            {/* ================= FORM FIELDS ================= */}
            <div className="grid grid-cols-1 sm:grid-cols-2 gap-4">
              {Object.entries(formData).map(([key, value]) => (
                <Field
                  key={key}
                  label={key.replace(/([A-Z])/g, " $1")}
                  name={key}
                  value={value}
                  onChange={handleChange}
                />
              ))}
            </div>

            {/* ACTIONS */}
            <div className="mt-8 flex justify-end">
              <button
                type="submit"
                disabled={loading}
                className="px-8 py-2 bg-blue-600 text-white rounded-md"
              >
                {loading ? "Updating..." : "Update"}
              </button>
            </div>
          </form>
        </div>
      </div>

      <ToastContainer />
    </>
  );
};

/* ================= FIELD ================= */
const Field = ({ label, name, value, onChange }) => (
  <div>
    <label className="block text-sm font-medium mb-1 capitalize">
      {label}
    </label>
    <input
      type="text"
      name={name}
      value={value || ""}
      onChange={onChange}
      className="w-full border rounded-md px-3 py-2 focus:ring-1 focus:ring-blue-500"
    />
  </div>
);

export default EditUserForm;
