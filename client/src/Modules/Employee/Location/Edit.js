// Location/Edit.js
import React, { useState } from "react";
import { useNavigate, useParams } from "react-router-dom";
import { MdEditLocationAlt } from "react-icons/md";

const LocationEdit = () => {
  const { id } = useParams();
  const navigate = useNavigate();

  // Prefilled example data
  const [form, setForm] = useState({
    name: "Office Gate",
    lat: "28.6139",
    long: "77.2090",
    radius: "20",
  });

  const update = () => {
    console.log("Update Location:", form);
    navigate("/dashboard/users/location");
  };

  return (
    <div className="p-6 flex justify-center">
      <div className="bg-white shadow-xl rounded-lg p-6 w-full border border-gray-200">
        {/* Heading */}
        <div className="flex items-center mb-6 justify-between">
          <div className="flex items-center">
            <MdEditLocationAlt className="text-orange-600" size={30} />
            <h2 className="text-2xl font-semibold ml-2">Edit Location</h2>
          </div>

          {/* Buttons */}
          <div className="mt-8 flex gap-3">
            <button
              onClick={update}
              className="py-3 rounded-lg bg-[#018DD4] text-white hover:bg-blue-700 transition shadow-md min-w-[120px]"
            >
              Update
            </button>
            <button
              onClick={() => navigate("/dashboard/users/location")}
              className="py-3 rounded-lg border border-gray-400 hover:bg-gray-100 transition min-w-[120px]"
            >
              Cancel
            </button>
          </div>
        </div>

        {/* Form Inputs */}
        <div className="grid grid-cols-5 gap-4 items-end">
          {/* Name */}
          <div>
            <label className="block text-gray-600 mb-1 font-medium">
              Location Name
            </label>
            <input
              type="text"
              className="border rounded-lg p-3 w-full outline-none"
              value={form.name}
              onChange={(e) => setForm({ ...form, name: e.target.value })}
            />
          </div>

          {/* Latitude */}
          <div>
            <label className="block text-gray-600 mb-1 font-medium">Lat</label>
            <input
              type="text"
              className="border rounded-lg p-3 w-full outline-none"
              value={form.lat}
              onChange={(e) => setForm({ ...form, lat: e.target.value })}
            />
          </div>

          {/* Longitude */}
          <div>
            <label className="block text-gray-600 mb-1 font-medium">Long</label>
            <input
              type="text"
              className="border rounded-lg p-3 w-full outline-none"
              value={form.long}
              onChange={(e) => setForm({ ...form, long: e.target.value })}
            />
          </div>

          {/* Radius */}
          <div>
            <label className="block text-gray-600 mb-1 font-medium">
              Radius (in meters)
            </label>
            <input
              type="text"
              className="border rounded-lg p-3 w-full outline-none"
              value={form.radius}
              onChange={(e) => setForm({ ...form, radius: e.target.value })}
            />
          </div>
        </div>
      </div>
    </div>
  );
};

export default LocationEdit;
