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
      <div className="mt-6">

        {/* ================= DESKTOP TABLE ================= */}
        <div className="hidden lg:block bg-white p-5 rounded-xl shadow">
          <table className="w-full border-collapse">
            <thead>
              <tr className="bg-gray-100 text-left text-gray-700">
                <th className="p-3">Device</th>
                <th className="p-3">User</th>
                <th className="p-3">Employee ID</th>
                <th className="p-3">Status</th>
                <th className="p-3">Android</th>
                <th className="p-3">App Ver.</th>
                <th className="p-3">Last Online</th>
                <th className="p-3 text-center">Actions</th>
              </tr>
            </thead>

            <tbody>
              {deviceList.map((device) => (
                <tr key={device.id} className="border-b hover:bg-gray-50">
                  <td className="p-3 font-semibold">{device.deviceName}</td>
                  <td className="p-3">{device.userName}</td>
                  <td className="p-3">{device.employeeId}</td>
                  <td className="p-3">{statusBadge(device.online)}</td>
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

        {/* ================= MOBILE + TABLET STACKED TABLE ================= */}
        <div className="block lg:hidden space-y-5 md:flex md:flex-col md:gap-2 sm:flex sm:flex-col sm:gap-2">
          {deviceList.map((device) => (
            <div
              key={device.id}
              className="bg-white rounded-xl border shadow p-2 !mt-2 !mb-2"
            >
              {/* CHECKBOX ROW */}
              {/* <div className="flex justify-between items-center mb-3">
                <input type="checkbox" />
                <input type="checkbox" />
              </div> */}

              {/* LABEL / VALUE TABLE */}
              <div className="grid grid-cols-2 gap-y-2 text-sm">
                <div className="text-gray-500 font-medium">Device</div>
                <div className="text-right font-semibold">{device.deviceName}</div>

                <div className="text-gray-500 font-medium">User</div>
                <div className="text-right">{device.userName}</div>

                <div className="text-gray-500 font-medium">Employee ID</div>
                <div className="text-right">{device.employeeId}</div>

                <div className="text-gray-500 font-medium">Status</div>
                <div className="text-right">{statusBadge(device.online)}</div>

                <div className="text-gray-500 font-medium">Android</div>
                <div className="text-right">{device.androidVersion}</div>

                <div className="text-gray-500 font-medium">App Ver.</div>
                <div className="text-right">{device.appVersion}</div>

                <div className="text-gray-500 font-medium">Last Online</div>
                <div className="text-right text-xs text-gray-600">
                  {device.lastOnline}
                </div>
              </div>

              {/* ACTIONS */}
              <div className="flex justify-end gap-4 mt-4">
                <button
                  onClick={() => openDeviceModal(device)}
                  className="text-blue-700 font-semibold"
                >
                  View
                </button>
              </div>
            </div>
          ))}
        </div>

      </div>


      {/* ========================= DEVICE DETAILS MODAL ========================= */}
      {showModal && selectedDevice && (
        <div className="fixed inset-0 bg-black/60 z-50 flex items-end sm:items-center justify-center">

          {/* MODAL CONTAINER */}
          <div
            className="
        bg-white 
        w-full 
        sm:max-w-[800px] 
        max-h-[95vh] 
        overflow-y-auto 
        rounded-t-2xl sm:rounded-2xl
        shadow-xl
        p-4 sm:p-6
        relative
      "
          >
            {/* DRAG INDICATOR (Mobile UX) */}
            <div className="sm:hidden w-12 h-1.5 bg-gray-300 rounded-full mx-auto mb-3"></div>

            {/* CLOSE BUTTON */}
            <button
              onClick={() => setShowModal(false)}
              className="absolute top-3 right-4 text-xl text-gray-600"
            >
              ✕
            </button>

            {/* HEADER */}
            <h2 className="text-lg sm:text-2xl font-bold">
              {selectedDevice.deviceName}
            </h2>
            <p className="text-gray-500 text-sm">
              Android ID: {selectedDevice.androidId}
            </p>

            {/* ================= DEVICE STATUS (STACKED ON MOBILE) ================= */}
            <div className="mt-5 space-y-3 sm:space-y-0 sm:grid sm:grid-cols-2 md:grid-cols-3 sm:gap-4">

              <div className="p-4 bg-blue-50 rounded-lg">
                <h4 className="font-semibold text-sm">Device Owner</h4>
                <p className="text-sm">{selectedDevice.ownerMode}</p>
              </div>

              <div className="p-4 bg-green-50 rounded-lg">
                <h4 className="font-semibold text-sm">Camera</h4>
                {cameraBadge(selectedDevice.cameraBlocked)}
              </div>

              <div className="p-4 bg-yellow-50 rounded-lg">
                <h4 className="font-semibold text-sm">Location</h4>
                {locationBadge(selectedDevice.locationEnabled)}
              </div>

              <div className="p-4 bg-purple-50 rounded-lg">
                <h4 className="font-semibold text-sm">Last Screenshot</h4>
                <p className="text-xs">{selectedDevice.lastScreenshot}</p>
              </div>

              <div className="p-4 bg-red-50 rounded-lg">
                <h4 className="font-semibold text-sm">Battery</h4>
                <p className="text-sm">{selectedDevice.battery}%</p>
              </div>

              <div className="p-4 bg-gray-100 rounded-lg">
                <h4 className="font-semibold text-sm">Enrollment Date</h4>
                <p className="text-sm">{selectedDevice.enrolled}</p>
              </div>
            </div>

            {/* ================= DEVICE CONTROLS ================= */}
            <h3 className="mt-6 text-base sm:text-xl font-semibold">
              Device Controls
            </h3>

            <div className="mt-3 grid grid-cols-1 sm:grid-cols-2 md:grid-cols-3 gap-3">
              <button className="w-full py-3 bg-black text-white rounded-lg">
                Lock Device
              </button>

              <button className="w-full py-3 bg-orange-500 text-white rounded-lg">
                Restart
              </button>

              <button className="w-full py-3 bg-blue-500 text-white rounded-lg">
                Disable Camera
              </button>

              <button className="w-full py-3 bg-blue-500 text-white rounded-lg">
                Disable Uninstall
              </button>

              <button className="w-full py-3 bg-green-600 text-white rounded-lg">
                Remote Command
              </button>
            </div>

            {/* ================= MORE ACTIONS ================= */}
            <h3 className="mt-6 text-base sm:text-xl font-semibold">
              More Actions
            </h3>

            <div className="mt-3 grid grid-cols-1 sm:grid-cols-2 gap-3">
              <button className="w-full py-3 bg-gray-200 rounded-lg">
                View Activity Logs
              </button>

              <button className="w-full py-3 bg-gray-200 rounded-lg">
                View Installed Apps
              </button>

              <button className="w-full py-3 bg-gray-200 rounded-lg">
                View Location Timeline
              </button>

              <button className="w-full py-3 bg-red-300 text-red-800 rounded-lg">
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
