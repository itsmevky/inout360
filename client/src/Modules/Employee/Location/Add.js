// Location/Add.js
import React, { useState } from "react";
import { useNavigate } from "react-router-dom";
import { MdAddLocationAlt } from "react-icons/md";

const LocationAdd = () => {
  const navigate = useNavigate();
  const [form, setForm] = useState({
    name: "",
    lat: "",
    long: "",
    radius: "",
  });

  const save = () => {
    console.log("Save Location:", form);
    navigate("/dashboard/users/location"); // redirect to list
  };

  return (
    <div className="p-6 flex justify-center">
      <div className="bg-white shadow-xl rounded-lg p-6 w-full  border border-gray-200">
        {/* Heading */}
        <div className="flex items-center mb-6 justify-between grid sm:grid-cols-3 gap-2">
          <div className="flex gap-3">
            <MdAddLocationAlt className="text-blue-600" size={30} />
            <h2 className="text-xl font-semibold ml-2">Add New Location</h2>
          </div>
          <div></div>
          <div className="mt-8 flex gap-2.5 ">
            <button
              onClick={save}
              className="w-1/2 py-2 px-2 rounded-lg bg-[#018DD4] text-white hover:bg-blue-700 transition shadow-md  min-w-[140px]"
            >
              Save Location
            </button>
            <button
              onClick={() => navigate("/dashboard/users/location")}
              className="w-1/2 py-2 rounded-lg border border-gray-400 hover:bg-gray-100 transition min-w-[140px]"
            >
              Cancel
            </button>
          </div>
        </div>

        {/* Form Inputs */}
        <div className="space-y-5  grid lg:grid-cols-5 md:grid-cols-3 sm:grid-cols-2  md:gap-2 gap-4 items-end">
          {/* Name */}
          <div className="">
            <label className="block text-gray-600 mb-1 font-medium">
              Location Name
            </label>
            <input
              type="text"
              className="border rounded-lg p-3 md:p-2 w-full outline-none"
              placeholder="e.g., Office Entry Gate"
              value={form.name}
              onChange={(e) => setForm({ ...form, name: e.target.value })}
            />
          </div>

          {/* Latitude */}
          <div className="">
            <label className="block text-gray-600 mb-1 font-medium">Lat</label>
            <input
              type="text"
              className="border rounded-lg p-3 md:p-2 w-full outline-none"
              placeholder="Enter Lat"
              value={form.lat}
              onChange={(e) => setForm({ ...form, lat: e.target.value })}
            />
          </div>

          {/* Longitude */}
          <div className="">
            <label className="block text-gray-600 mb-1 font-medium">Long</label>
            <input
              type="text"
              className="border rounded-lg p-3 md:p-2 w-full outline-none"
              placeholder="Enter Long"
              value={form.long}
              onChange={(e) => setForm({ ...form, long: e.target.value })}
            />
          </div>

          {/* Radius */}
          <div className="">
            <label className="block text-gray-600 mb-1 font-medium">
              Radius (in meters)
            </label>
            <input
              type="text"
              className="border rounded-lg p-3 md:p-2 w-full outline-none"
              placeholder="e.g., 20"
              value={form.radius}
              onChange={(e) => setForm({ ...form, radius: e.target.value })}
            />
          </div>
          {/* Buttons */}
        </div>
      </div>
    </div>
  );
};

export default LocationAdd;
