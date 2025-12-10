// Location/List.js
import React, { useState } from "react";
import { useNavigate } from "react-router-dom";
import { MdEdit, MdDelete } from "react-icons/md"; // <-- ICONS

const LocationList = () => {
  const navigate = useNavigate();

  // 🔹 Your static location data
  const [locations, setLocations] = useState([
    {
      id: 1,
      name: "Office Gate",
      lat: "28.6139",
      long: "77.2090",
      radius: "20",
    },
    {
      id: 2,
      name: "Warehouse",
      lat: "28.7041",
      long: "77.1025",
      radius: "15",
    },
  ]);

  // 🔹 Delete handler
  const handleDelete = (id) => {
    if (!window.confirm("Are you sure you want to delete this location?"))
      return;

    const updated = locations.filter((item) => item.id !== id);
    setLocations(updated);
  };

  return (
    <div className="p-4">
      <div className="flex justify-between items-center mb-4">
        <h2 className="text-xl font-bold mb-4">Geofence Location List</h2>

        {/* ADD BUTTON */}
        <button
          className="crm-buttonsection mb-4 hover:bg-[#018DD4]"
          onClick={() => navigate("/dashboard/users/location/add")}
        >
          + Add Location
        </button>
      </div>

      {/* TABLE */}
      <table className="w-full ">
        <thead className="bg-gray-200">
          <tr>
            <th className="p-2 bg-[#22374e] text-#fff">Name</th>
            <th className="p-2 ">Lat</th>
            <th className="p-2 ">Long</th>
            <th className="p-2 ">Radius (m)</th>
            <th className="p-2 ">Actions</th>
          </tr>
        </thead>

        <tbody>
          {locations.length === 0 ? (
            <tr>
              <td colSpan="5" className="text-center p-4">
                No locations found
              </td>
            </tr>
          ) : (
            locations.map((loc) => (
              <tr key={loc.id} className="bg-white">
                <td className="p-2 ">{loc.name}</td>
                <td className="p-2 ">{loc.lat}</td>
                <td className="p-2 ">{loc.long}</td>
                <td className="p-2 ">{loc.radius}</td>

                <td className="p-2  flex">
                  <button
                    className="text-blue-600 mr-3"
                    onClick={() =>
                      navigate(`/dashboard/users/location/edit/${loc.id}`)
                    }
                  >
                    <MdEdit
                      className="text-blue-600 cursor-pointer"
                      size={24}
                      title="Edit"
                    />
                  </button>

                  <button
                    className="text-red-600"
                    onClick={() => handleDelete(loc.id)}
                  >
                    <MdDelete
                      className="text-red-600 cursor-pointer"
                      size={24}
                      title="Delete"
                    />
                  </button>
                </td>
              </tr>
            ))
          )}
        </tbody>
      </table>
    </div>
  );
};

export default LocationList;
