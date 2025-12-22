import React, { useEffect, useState } from "react";
import { getData } from "../../../Helpers/api.js";

const Device = () => {
  const [selectedDevice, setSelectedDevice] = useState(null);
  const [showModal, setShowModal] = useState(false);
  const [deviceList, setDeviceList] = useState([]);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState("");

  const loadDevices = async () => {
    setLoading(true);
    setError("");
    try {
      const res = await getData("/device");
      setDeviceList(res?.devices || []);
    } catch (err) {
      setError("Failed to load devices.");
    } finally {
      setLoading(false);
    }
  };

  // ========================= COLORS & BADGES ========================= //
  const statusBadge = (status) => {
    const normalized = String(status || "").toUpperCase();
    const isOnline =
      normalized === "ONLINE" ||
      normalized === "ACTIVE" ||
      normalized === "TRUE" ||
      normalized === "ONLINE" ||
      normalized === "ON";
    return isOnline ? (
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

  const formatDate = (value) => {
    if (!value) return "-";
    const d = new Date(value);
    if (Number.isNaN(d.getTime())) return String(value);
    return d.toLocaleString();
  };

  useEffect(() => {
    loadDevices();
  }, []);

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
        {loading ? (
          <div className="bg-white p-5 rounded-xl shadow text-gray-600">
            Loading devices...
          </div>
        ) : null}
        {!loading && error ? (
          <div className="bg-white p-5 rounded-xl shadow text-red-600">
            {error}
          </div>
        ) : null}

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
                  <td className="p-3 font-semibold">
                    {device.deviceName || device.deviceId || device.name || "-"}
                  </td>
                  <td className="p-3">{device.userName || "-"}</td>
                  <td className="p-3">{device.employeeId}</td>
                  <td className="p-3">
                    {statusBadge(device.statusLabel || device.status)}
                  </td>
                  <td className="p-3">
                    {device.osVersion || device.androidVersion || "-"}
                  </td>
                  <td className="p-3">
                    {device.appVersion || device.appVer || "-"}
                  </td>
                  <td className="p-3 text-sm text-gray-600">
                    {formatDate(device.lastOnline || device.lastSeen)}
                  </td>
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
              <div className="grid grid-cols-2 gap-y-1 text-sm">
                <div className="text-gray-500 font-medium">Device</div>
                <div className="text-right font-semibold">
                  {device.deviceName || device.deviceId || device.name || "-"}
                </div>

                <div className="text-gray-500 font-medium">User</div>
                <div className="text-right">{device.userName || "-"}</div>

                <div className="text-gray-500 font-medium">Employee ID</div>
                <div className="text-right">{device.employeeId}</div>

                <div className="text-gray-500 font-medium">Status</div>
                <div className="text-right">
                  {statusBadge(device.statusLabel || device.status)}
                </div>

                <div className="text-gray-500 font-medium">Android</div>
                <div className="text-right">
                  {device.osVersion || device.androidVersion || "-"}
                </div>

                <div className="text-gray-500 font-medium">App Ver.</div>
                <div className="text-right">
                  {device.appVersion || device.appVer || "-"}
                </div>

                <div className="text-gray-500 font-medium">Last Online</div>
                <div className="text-right text-xs text-gray-600">
                  {formatDate(device.lastOnline || device.lastSeen)}
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
            className=" bg-white w-full sm:max-w-[800px] max-h-[95vh] overflow-y-auto rounded-t-2xl sm:rounded-2xl shadow-xl p-4 sm:p-6 relative !m-5"
          >
            {/* DRAG INDICATOR (Mobile UX) */}
            <div className="sm:hidden w-12 h-1.5 bg-gray-300 rounded-full mx-auto mb-3"></div>

            {/* CLOSE BUTTON */}
            <button
              onClick={() => setShowModal(false)}
              className="absolute top-3 right-4 text-xl text-gray-600 !m-0 device-page-popup-cut-button"
            >
              ✕
            </button>

            {/* HEADER */}
            <h2 className="text-lg sm:text-2xl font-bold">
              {selectedDevice.deviceName || selectedDevice.deviceId || selectedDevice.name || "-"}
            </h2>
            <p className="text-gray-500 text-sm">
              Android ID: {selectedDevice.deviceInfo?.androidId || selectedDevice.deviceId || "-"}
            </p>

            {/* ================= DEVICE STATUS (STACKED ON MOBILE) ================= */}
            <div className="mt-5 space-y-3 sm:space-y-0 sm:grid sm:grid-cols-2 md:grid-cols-3 sm:gap-4">

              <div className="p-4 bg-blue-50 rounded-lg">
                <h4 className="font-semibold text-sm">Device Owner</h4>
                <p className="text-sm">
                  {selectedDevice.isDeviceOwner ? "Device Owner" : "Not Active"}
                </p>
              </div>

              <div className="p-4 bg-green-50 rounded-lg">
                <h4 className="font-semibold text-sm">Camera</h4>
                {cameraBadge(!!selectedDevice.cameraDisabled)}
              </div>

              <div className="p-4 bg-yellow-50 rounded-lg">
                <h4 className="font-semibold text-sm">Location</h4>
                {locationBadge(
                  selectedDevice.locationAllowed !== undefined
                    ? selectedDevice.locationAllowed
                    : true
                )}
              </div>

              <div className="p-4 bg-purple-50 rounded-lg">
                <h4 className="font-semibold text-sm">Last Screenshot</h4>
                <p className="text-xs">
                  {formatDate(selectedDevice.lastScreenshotAt)}
                </p>
              </div>

              <div className="p-4 bg-red-50 rounded-lg">
                <h4 className="font-semibold text-sm">Battery</h4>
                <p className="text-sm">
                  {selectedDevice.battery ? `${selectedDevice.battery}%` : "-"}
                </p>
              </div>

              <div className="p-4 bg-gray-100 rounded-lg">
                <h4 className="font-semibold text-sm">Enrollment Date</h4>
                <p className="text-sm">
                  {formatDate(selectedDevice.enrollmentDate)}
                </p>
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
