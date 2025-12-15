import React, { useState } from "react";

const Device = () => {
  const [selectedDevice, setSelectedDevice] = useState(null);
  const [showModal, setShowModal] = useState(false);

  // ========================= SAMPLE DEVICE LIST ========================= //
  const deviceList = [
    {
      id: "DEV-1001",
      deviceName: "Samsung A52",
      userName: "Rahul Sharma",
      employeeId: "EMP-501",
      androidId: "fjs73hshs883",
      fcmStatus: "Active",
      ownerMode: "Device Owner",
      lastOnline: "2025-01-12 10:15 AM",
      enrolled: "2025-01-01",
      appVersion: "3.2.1",
      androidVersion: "13",
      online: true,
      battery: 822586,
      cameraBlocked: false,
      locationEnabled: true,
      lastScreenshot: "2025-01-12 09:45 AM",
    },
    {
      id: "DEV-2001",
      deviceName: "Vivo Y20",
      userName: "Amit Kumar",
      employeeId: "EMP-503",
      androidId: "8dhwi88sjsn2",
      fcmStatus: "Inactive",
      ownerMode: "Not Active",
      lastOnline: "2025-01-10 05:20 PM",
      enrolled: "2025-01-05",
      appVersion: "3.1.0",
      androidVersion: "12",
      online: false,
      employeeid: 27,
      cameraBlocked: true,
      locationEnabled: false,
      lastScreenshot: "2025-01-11 06:10 PM",
    },
    {
      id: "DEV-2001",
      deviceName: "Redmi k20",
      userName: "vivek Kumar",
      employeeId: "EMP-503",
      androidId: "8dhwi88sjsn2",
      fcmStatus: "Inactive",
      ownerMode: "Active",
      lastOnline: "2025-01-10 05:20 PM",
      enrolled: "2025-01-05",
      appVersion: "3.1.0",
      androidVersion: "12",
      online: false,
      employeeid: 27,
      cameraBlocked: true,
      locationEnabled: false,
      lastScreenshot: "2025-01-11 06:10 PM",
    }, {
      id: "DEV-2001",
      deviceName: "Apple 15 pro",
      userName: "Amit Kumar",
      employeeId: "EMP-503",
      androidId: "8dhwi88sjsn2",
      fcmStatus: "Inactive",
      ownerMode: "Not Active",
      lastOnline: "2025-01-10 05:20 PM",
      enrolled: "2025-01-05",
      appVersion: "3.1.0",
      androidVersion: "12",
      online: true,
      employeeid: 27,
      cameraBlocked: true,
      locationEnabled: false,
      lastScreenshot: "2025-01-11 06:10 PM",
    },
  ];

  // ========================= COLORS & BADGES ========================= //
  const statusBadge = (status) => {
    return status ? (
      <span className="px-3 py-1 bg-green-100 text-green-700 rounded-full text-xs font-semibold">Online</span>
    ) : (
      <span className="px-3 py-1 bg-red-100 text-red-600 rounded-full text-xs font-semibold">Offline</span>
    );
  };

  const cameraBadge = (blocked) => {
    return blocked ? (
      <span className="px-2 py-1 bg-red-200 text-red-700 rounded text-xs">Blocked</span>
    ) : (
      <span className="px-2 py-1 bg-green-200 text-green-700 rounded text-xs">Allowed</span>
    );
  };

  const locationBadge = (on) => {
    return on ? (
      <span className="px-2 py-1 bg-green-200 text-green-700 rounded text-xs">ON</span>
    ) : (
      <span className="px-2 py-1 bg-red-200 text-red-700 rounded text-xs">OFF</span>
    );
  };

  // ========================= OPEN MODAL ========================= //
  const openDeviceModal = (device) => {
    setSelectedDevice(device);
    setShowModal(true);
  };

  return (
    <div className="p-4">

      {/* PAGE HEADING */}
      <div className="bg-white p-4 rounded-lg shadow flex items-center gap-3 text-xl font-semibold text-gray-700 device-list-heading">
        <svg width="20"
          fill="navy-blue"
          xmlns="http://www.w3.org/2000/svg"
          viewBox="0 0 448 512">
          <path d="M128 136c0-22.1-17.9-40-40-40L40 96C17.9 96 0 113.9 0 136l0 48c0 22.1 17.9 40 40 40l48 0c22.1 0 40-17.9 40-40l0-48zm0 192c0-22.1-17.9-40-40-40l-48 0c-22.1 0-40 17.9-40 40l0 48c0 22.1 17.9 40 40 40l48 0c22.1 0 40-17.9 40-40l0-48zm32-192l0 48c0 22.1 17.9 40 40 40l48 0c22.1 0 40-17.9 40-40l0-48c0-22.1-17.9-40-40-40l-48 0c-22.1 0-40 17.9-40 40zM288 328c0-22.1-17.9-40-40-40l-48 0c-22.1 0-40 17.9-40 40l0 48c0 22.1 17.9 40 40 40l48 0c22.1 0 40-17.9 40-40l0-48zm32-192l0 48c0 22.1 17.9 40 40 40l48 0c22.1 0 40-17.9 40-40l0-48c0-22.1-17.9-40-40-40l-48 0c-22.1 0-40 17.9-40 40zM448 328c0-22.1-17.9-40-40-40l-48 0c-22.1 0-40 17.9-40 40l0 48c0 22.1 17.9 40 40 40l48 0c22.1 0 40-17.9 40-40l0-48z"></path>
        </svg>
        Device Management
      </div>

      {/* ========================= DEVICE TABLE ========================= */}
      <div className="mt-6 bg-white p-5 rounded-xl shadow">
        <table className="w-full border-collapse">
          <thead>
            <tr className="bg-gray-100 text-left text-gray-700">
              <th className="p-3">Device</th>
              <th className="p-3">User</th>
              <th className="p-3">Employee ID</th>
              <th className="p-3">Status</th>
              {/* <th className="p-3">Battery</th> */}
              <th className="p-3">Android</th>
              <th className="p-3">App Ver.</th>
              <th className="p-3">Last Online</th>
              <th className="p-3 text-center">Actions</th>
            </tr>
          </thead>

          <tbody>
            {deviceList.map((device) => (
              <tr key={device.id} className="hover:bg-gray-50 border-b">

                <td className="p-3 font-semibold">{device.deviceName}</td>

                <td className="p-3">{device.userName}</td>

                <td className="p-3">{device.employeeId}</td>

                <td className="p-3">{statusBadge(device.online)}</td>

                {/* <td className="p-3 font-semibold">{device.battery}%</td> */}

                <td className="p-3">{device.androidVersion}</td>

                <td className="p-3">{device.appVersion}</td>

                <td className="p-3 text-sm text-gray-600">{device.lastOnline}</td>

                <td className="p-3 text-center">
                  <button
                    onClick={() => openDeviceModal(device)}
                    className="px-3 py-1 bg-blue-600 text-white rounded hover:bg-blue-800"
                  >
                    View
                  </button>
                </td>
              </tr>
            ))}
          </tbody>
        </table>
      </div>

      {/* ========================= DEVICE DETAILS MODAL ========================= */}
      {showModal && selectedDevice && (
        <div className="fixed inset-0 bg-black/60 flex justify-center items-center z-50">
          <div className="bg-white w-[800px] rounded-xl shadow-xl p-6 relative">

            {/* CLOSE BUTTON */}
            <button
              onClick={() => setShowModal(false)}
              className="absolute top-3 right-3 text-gray-600 hover:text-black text-xl"
            >
              ✕
            </button>

            <h2 className="text-2xl font-bold">{selectedDevice.deviceName}</h2>
            <p className="text-gray-600">Android ID: {selectedDevice.androidId}</p>

            {/* ========================= DEVICE STATUS CARDS ========================= */}
            <div className="grid grid-cols-3 gap-4 mt-6">

              <div className="p-4 bg-blue-50 rounded">
                <h4 className="font-semibold">Device Owner</h4>
                <p>{selectedDevice.ownerMode}</p>
              </div>

              <div className="p-4 bg-green-50 rounded">
                <h4 className="font-semibold">Camera</h4>
                {cameraBadge(selectedDevice.cameraBlocked)}
              </div>

              <div className="p-4 bg-yellow-50 rounded">
                <h4 className="font-semibold">Location</h4>
                {locationBadge(selectedDevice.locationEnabled)}
              </div>

              <div className="p-4 bg-purple-50 rounded">
                <h4 className="font-semibold">Last Screenshot</h4>
                <p className="text-sm">{selectedDevice.lastScreenshot}</p>
              </div>

              <div className="p-4 bg-red-50 rounded">
                <h4 className="font-semibold">Employee Id</h4>
                <p className="text-lg">{selectedDevice.battery}</p>
              </div>

              <div className="p-4 bg-gray-100 rounded">
                <h4 className="font-semibold">Enrollment Date</h4>
                <p>{selectedDevice.enrolled}</p>
              </div>
            </div>

            {/* ========================= DEVICE CONTROLS ========================= */}
            <h3 className="mt-6 text-xl font-semibold">Device Controls</h3>

            <div className="grid grid-cols-3 gap-4 mt-3">
              <button className="p-3 bg-black text-white rounded hover:bg-gray-700">Lock Device</button>

              <button className="p-3 bg-orange-500 text-white rounded hover:bg-orange-700">Restart</button>
              <button className="p-3 bg-blue-500 text-white rounded hover:bg-blue-700">Disable Camera</button>
              <button className="p-3 bg-blue-500 text-white rounded hover:bg-blue-700">Disable Uninstall</button>
              <button className="p-3 bg-green-600 text-white rounded hover:bg-green-700">Remote Command</button>
            </div>

            {/* ========================= ACTION SHORTCUTS ========================= */}
            <h3 className="mt-6 text-xl font-semibold">More Actions</h3>

            <div className="grid grid-cols-2 gap-4 mt-3">
              <button className="p-3 bg-gray-200 rounded hover:bg-gray-300">
                View Activity Logs
              </button>

              <button className="p-3 bg-gray-200 rounded hover:bg-gray-300">
                View Installed Apps
              </button>

              <button className="p-3 bg-gray-200 rounded hover:bg-gray-300">
                View Location Timeline
              </button>

              <button className="p-3 bg-red-300 text-red-800 rounded hover:bg-red-400">
                Remove Device
              </button>
            </div>

          </div>
        </div>
      )}

    </div>
  );
};

export default Device;
