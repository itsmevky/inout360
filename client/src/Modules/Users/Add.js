import React from "react";

const AddUserForm = () => {
  return (
    <div className="adduser-outer-section">
      <div className="adduser-inner-section">
        <form
          className="w-full max-w-5xl mx-auto mt-8 bg-white p-6 rounded-lg shadow-md"
          noValidate
        >
          <h2 className="text-lg font-semibold mb-6 text-gray-800">
            Add New Employee
          </h2>

          <div className="grid grid-cols-1 md:grid-cols-2 gap-x-6 gap-y-4">
            {/* ================= PROFILE PHOTO ================= */}
            <div className="flex items-center space-x-4 col-span-2 mb-4">
              <div className="w-[132px] h-[170px] border rounded-lg overflow-hidden flex items-center justify-center bg-gray-100">
                <img
                  src="https://via.placeholder.com/132x170.png?text=Photo"
                  alt="Profile"
                  className="object-cover w-full h-full"
                />
              </div>
              <div>
                <label className="block mb-2 text-sm font-medium text-gray-700">
                  Upload Profile Image
                </label>
                <input
                  type="file"
                  accept="image/*"
                  className="block w-full text-sm text-gray-600 file:mr-4 file:py-2 file:px-4 
                             file:rounded-lg file:border-0 
                             file:text-sm file:font-semibold 
                             file:bg-blue-50 file:text-blue-700 
                             hover:file:bg-blue-100"
                />
              </div>
            </div>

            {/* ================= PERSONAL INFORMATION ================= */}
            <div className="col-span-2">
              <h2 className="text-lg font-semibold mb-2">
                Personal Information
              </h2>
            </div>

            <div className="AJ-floating-label-wrapper mb-6">
              <input
                type="text"
                className="AJ-floating-input"
                placeholder=" "
              />
              <label className="AJ-floating-label">First Name *</label>
            </div>

            <div className="AJ-floating-label-wrapper mb-6">
              <input
                type="text"
                className="AJ-floating-input"
                placeholder=" "
              />
              <label className="AJ-floating-label">Last Name *</label>
            </div>

            <div className="AJ-floating-label-wrapper mb-6">
              <select className="AJ-floating-input">
                <option value="" disabled hidden></option>
                <option>Male</option>
                <option>Female</option>
                <option>Other</option>
              </select>
              <label className="AJ-floating-label">Gender *</label>
            </div>

            <div className="AJ-floating-label-wrapper mb-6">
              <input type="date" className="AJ-floating-input" />
              <label className="AJ-floating-label">Date of Birth *</label>
            </div>

            <div className="AJ-floating-label-wrapper mb-6">
              <input
                type="email"
                className="AJ-floating-input"
                placeholder=" "
              />
              <label className="AJ-floating-label">Email *</label>
            </div>

            <div className="AJ-floating-label-wrapper mb-6">
              <input
                type="text"
                className="AJ-floating-input"
                placeholder=" "
              />
              <label className="AJ-floating-label">Phone *</label>
            </div>

            <div className="AJ-floating-label-wrapper mb-6">
              <input
                type="password"
                className="AJ-floating-input"
                placeholder=" "
              />
              <label className="AJ-floating-label">Password *</label>
            </div>

            {/* ================= CURRENT ADDRESS ================= */}
            <div className="col-span-2">
              <h2 className="text-lg font-semibold mb-2">Current Address</h2>
            </div>

            <div className="AJ-floating-label-wrapper mb-6">
              <input
                type="text"
                className="AJ-floating-input"
                placeholder=" "
              />
              <label className="AJ-floating-label">Street *</label>
            </div>

            <div className="AJ-floating-label-wrapper mb-6">
              <input
                type="text"
                className="AJ-floating-input"
                placeholder=" "
              />
              <label className="AJ-floating-label">City *</label>
            </div>

            <div className="AJ-floating-label-wrapper mb-6">
              <input
                type="text"
                className="AJ-floating-input"
                placeholder=" "
              />
              <label className="AJ-floating-label">State *</label>
            </div>

            <div className="AJ-floating-label-wrapper mb-6">
              <input
                type="number"
                className="AJ-floating-input"
                placeholder=" "
              />
              <label className="AJ-floating-label">Pincode *</label>
            </div>

            {/* ================= PERMANENT ADDRESS ================= */}
            <div className="col-span-2">
              <h2 className="text-lg font-semibold mb-2">Permanent Address</h2>
            </div>

            <div className="AJ-floating-label-wrapper mb-6">
              <input
                type="text"
                className="AJ-floating-input"
                placeholder=" "
              />
              <label className="AJ-floating-label">Street *</label>
            </div>

            <div className="AJ-floating-label-wrapper mb-6">
              <input
                type="text"
                className="AJ-floating-input"
                placeholder=" "
              />
              <label className="AJ-floating-label">City *</label>
            </div>

            <div className="AJ-floating-label-wrapper mb-6">
              <input
                type="text"
                className="AJ-floating-input"
                placeholder=" "
              />
              <label className="AJ-floating-label">State *</label>
            </div>

            <div className="AJ-floating-label-wrapper mb-6">
              <input
                type="number"
                className="AJ-floating-input"
                placeholder=" "
              />
              <label className="AJ-floating-label">Pincode *</label>
            </div>

            {/* ================= PROFESSIONAL INFORMATION ================= */}
            <div className="col-span-2">
              <h2 className="text-lg font-semibold mb-2">
                Professional Information
              </h2>
            </div>

            <div className="AJ-floating-label-wrapper mb-6">
              <input
                type="text"
                className="AJ-floating-input"
                placeholder=" "
              />
              <label className="AJ-floating-label">Employee ID *</label>
            </div>

            <div className="AJ-floating-label-wrapper mb-6">
              <input
                type="text"
                className="AJ-floating-input"
                placeholder=" "
              />
              <label className="AJ-floating-label">RFID *</label>
            </div>

            <div className="AJ-floating-label-wrapper mb-6">
              <input type="date" className="AJ-floating-input" />
              <label className="AJ-floating-label">Joining Date *</label>
            </div>

            <div className="AJ-floating-label-wrapper mb-6">
              <input
                type="text"
                className="AJ-floating-input"
                placeholder=" "
              />
              <label className="AJ-floating-label">Designation *</label>
            </div>

            <div className="AJ-floating-label-wrapper mb-6">
              <input
                type="text"
                className="AJ-floating-input"
                placeholder=" "
              />
              <label className="AJ-floating-label">Department *</label>
            </div>

            <div className="AJ-floating-label-wrapper mb-6">
              <input
                type="text"
                className="AJ-floating-input"
                placeholder=" "
              />
              <label className="AJ-floating-label">Section *</label>
            </div>

            <div className="AJ-floating-label-wrapper mb-6">
              <input
                type="text"
                className="AJ-floating-input"
                placeholder=" "
              />
              <label className="AJ-floating-label">Shift *</label>
            </div>

            <div className="AJ-floating-label-wrapper mb-6">
              <select className="AJ-floating-input">
                <option value="" disabled hidden></option>
                <option>Full-time</option>
                <option>Part-time</option>
                <option>Contract</option>
                <option>Intern</option>
              </select>
              <label className="AJ-floating-label">Employment Type *</label>
            </div>

            <div className="AJ-floating-label-wrapper mb-6">
              <select className="AJ-floating-input">
                <option value="" disabled hidden></option>
                <option>Super Admin</option>
                <option>Admin</option>
                <option>HR</option>
                <option>Employee</option>
              </select>
              <label className="AJ-floating-label">Role *</label>
            </div>

            <div className="AJ-floating-label-wrapper mb-6">
              <select className="AJ-floating-input">
                <option>Active</option>
                <option>Inactive</option>
              </select>
              <label className="AJ-floating-label">Status *</label>
            </div>

            {/* ================= BANK DETAILS ================= */}
            <div className="col-span-2">
              <h2 className="text-lg font-semibold mb-2">Bank Details</h2>
            </div>

            <div className="AJ-floating-label-wrapper mb-6">
              <input
                type="text"
                className="AJ-floating-input"
                placeholder=" "
              />
              <label className="AJ-floating-label">Aadhar Card Number *</label>
            </div>

            <div className="AJ-floating-label-wrapper mb-6">
              <input
                type="text"
                className="AJ-floating-input"
                placeholder=" "
              />
              <label className="AJ-floating-label">PAN Card *</label>
            </div>

            <div className="AJ-floating-label-wrapper mb-6">
              <input
                type="text"
                className="AJ-floating-input"
                placeholder=" "
              />
              <label className="AJ-floating-label">Account Number *</label>
            </div>

            <div className="AJ-floating-label-wrapper mb-6">
              <input
                type="text"
                className="AJ-floating-input"
                placeholder=" "
              />
              <label className="AJ-floating-label">IFSC Code *</label>
            </div>

            <div className="AJ-floating-label-wrapper mb-6">
              <input
                type="text"
                className="AJ-floating-input"
                placeholder=" "
              />
              <label className="AJ-floating-label">Bank Name *</label>
            </div>

            <div className="AJ-floating-label-wrapper mb-6">
              <input
                type="text"
                className="AJ-floating-input"
                placeholder=" "
              />
              <label className="AJ-floating-label">Branch *</label>
            </div>

            {/* ================= EMERGENCY CONTACT ================= */}
            <div className="col-span-2">
              <h2 className="text-lg font-semibold mb-2">Emergency Contact</h2>
            </div>

            <div className="AJ-floating-label-wrapper mb-6">
              <input
                type="text"
                className="AJ-floating-input"
                placeholder=" "
              />
              <label className="AJ-floating-label">Name *</label>
            </div>

            <div className="AJ-floating-label-wrapper mb-6">
              <input
                type="text"
                className="AJ-floating-input"
                placeholder=" "
              />
              <label className="AJ-floating-label">Relation *</label>
            </div>

            <div className="AJ-floating-label-wrapper mb-6">
              <input
                type="text"
                className="AJ-floating-input"
                placeholder=" "
              />
              <label className="AJ-floating-label">Phone *</label>
            </div>

            {/* ================= SYSTEM ACCESS ================= */}
            <div className="col-span-2">
              <h2 className="text-lg font-semibold mb-2 !m-0">System Access</h2>
            </div>

            <div className="flex items-center space-x-2 mb-3 gap-2">
              <input type="checkbox" className="w-4 h-4" />
              <label className="text-sm text-gray-700 !m-0">Email Verified</label>
            </div>

            <div className="flex items-center space-x-2 mb-3 gap-2">
              <input type="checkbox" className="w-4 h-4" />
              <label className="text-sm text-gray-700 !m-0">Phone Verified</label>
            </div>

            <div className="flex items-center space-x-2 mb-3 gap-2">
              <input type="checkbox" className="w-4 h-4" />
              <label className="text-sm text-gray-700 !m-0">Login Enabled</label>
            </div>

            <div className="AJ-floating-label-wrapper mb-6 col-span-2">
              <input type="datetime-local" className="AJ-floating-input" />
              <label className="AJ-floating-label">Last Login</label>
            </div>
          </div>

          {/* ================= SUBMIT BUTTON ================= */}
          <div className="AJ-crm-save w-full md:col-span-2 mt-6">
            <button
              type="button"
              className="button-section w-full md:w-auto rounded"
            >
              Submit
            </button>
          </div>
        </form>
      </div>
    </div>
  );
};

export default AddUserForm;
