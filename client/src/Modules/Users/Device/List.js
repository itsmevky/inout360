import React, { useEffect, useState } from "react";
import { deleteData, getData, postData, putData } from "../../../Helpers/api.js";

const Device = () => {
  const [selectedDevice, setSelectedDevice] = useState(null);
  const [showModal, setShowModal] = useState(false);
  const [deviceList, setDeviceList] = useState([]);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState("");

  const ITEMS_PER_PAGE = 15;
  const [currentPage, setCurrentPage] = useState(1);

  // 🔥 NEW: Sorting state
  const [sortOrder, setSortOrder] = useState("new"); // new | old

  // ========================= LOAD DEVICES ========================= //
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

  useEffect(() => {
    loadDevices();
  }, []);

  useEffect(() => {
    setCurrentPage(1);
  }, [deviceList, sortOrder]);

  // ========================= HELPERS ========================= //
  const getDeviceDate = (device) => {
    return new Date(
      device?.createdAt ||
        device?.enrollmentDate ||
        device?.lastOnline ||
        device?.lastSeen ||
        0
    ).getTime();
  };

  const statusBadge = (status) => {
    const normalized = String(status || "").toUpperCase();
    const isOnline =
      normalized === "ONLINE" ||
      normalized === "ACTIVE" ||
      normalized === "TRUE" ||
      normalized === "ON";

    return isOnline ? (
      <span className="px-3 py-1 bg-green-100 text-green-700 rounded-full text-xs font-semibold">
        Online
      </span>
    ) : (
      <span className="px-3 py-1 bg-red-100 text-red-600 rounded-full text-xs font-semibold">
        Offline
      </span>
    );
  };

  const cameraBadge = (blocked) =>
    blocked ? (
      <span className="px-2 py-1 bg-red-200 text-red-700 rounded text-xs">
        Blocked
      </span>
    ) : (
      <span className="px-2 py-1 bg-green-200 text-green-700 rounded text-xs">
        Allowed
      </span>
    );

  const locationBadge = (on) =>
    on ? (
      <span className="px-2 py-1 bg-green-200 text-green-700 rounded text-xs">
        ON
      </span>
    ) : (
      <span className="px-2 py-1 bg-red-200 text-red-700 rounded text-xs">
        OFF
      </span>
    );

  const formatDate = (value) => {
    if (!value) return "-";
    const d = new Date(value);
    if (Number.isNaN(d.getTime())) return String(value);
    return d.toLocaleString();
  };

  const getPolicyValue = (device, field) => {
    if (!device) return false;
    if (typeof device[field] === "boolean") return device[field];
    if (typeof device?.devicePolicyState?.[field] === "boolean") {
      return device.devicePolicyState[field];
    }
    return false;
  };

  // ========================= SORT + PAGINATION ========================= //
  const sortedDeviceList = [...deviceList].sort((a, b) => {
    const dateA = getDeviceDate(a);
    const dateB = getDeviceDate(b);
    return sortOrder === "new" ? dateB - dateA : dateA - dateB;
  });

  const totalPages = Math.ceil(sortedDeviceList.length / ITEMS_PER_PAGE) || 1;

  const paginatedDeviceList = sortedDeviceList.slice(
    (currentPage - 1) * ITEMS_PER_PAGE,
    currentPage * ITEMS_PER_PAGE
  );

  // ========================= MODAL ACTIONS ========================= //
  const openDeviceModal = (device) => {
    setSelectedDevice(device);
    setShowModal(true);
  };

  const togglePolicy = async (field) => {
    if (!selectedDevice?.id) return;
    try {
      const res = await putData(`/device/${selectedDevice.id}/policy/toggle`, {
        field,
      });
      if (res?.status && res?.data) {
        setDeviceList((prev) =>
          prev.map((d) => (d.id === res.data.id ? res.data : d))
        );
        setSelectedDevice(res.data);
      }
    } catch {}
  };

  const resolveUserId = (device) =>
    typeof device?.userId === "string"
      ? device.userId
      : device?.userId?._id || device?.userId?.id || null;

  const removeDevice = async () => {
    if (!selectedDevice) return;
    const userId = resolveUserId(selectedDevice);
    const deviceId =
      selectedDevice.deviceId || selectedDevice.id || selectedDevice._id;

    if (!window.confirm("Remove this device?")) return;

    try {
      const res = userId
        ? await postData("/device/uninstall", {
            deviceId,
            userId,
            action: "uninstall",
          })
        : await deleteData(`/device/${deviceId}`);

      if (res?.status) {
        await loadDevices();
        setShowModal(false);
      }
    } catch {}
  };

  // ========================= RENDER ========================= //
  return (
    <div className="p-4">
      {/* HEADER */}
      <div className="bg-white p-4 rounded-lg shadow flex justify-between items-center">
        <h2 className="text-xl font-semibold text-gray-700">
          Device Management
        </h2>

        {/* 🔥 SORT DROPDOWN */}
        <select
          value={sortOrder}
          onChange={(e) => setSortOrder(e.target.value)}
          className="border rounded-lg px-3 py-2 text-sm"
        >
          <option value="new">Newest First</option>
          <option value="old">Oldest First</option>
        </select>
      </div>

      {/* TABLE */}
      <div className="mt-6 bg-white rounded-xl shadow p-5">
        {loading && <p>Loading devices...</p>}
        {!loading && error && <p className="text-red-600">{error}</p>}

        {!loading && (
          <table className="w-full hidden lg:table">
            <thead>
              <tr className="bg-gray-100 text-gray-700">
                <th className="p-3">Device</th>
                <th className="p-3">User</th>
                <th className="p-3">Employee</th>
                <th className="p-3">Status</th>
                <th className="p-3">Android</th>
                <th className="p-3">App</th>
                <th className="p-3">Last Online</th>
                <th className="p-3 text-center">Action</th>
              </tr>
            </thead>
            <tbody>
              {paginatedDeviceList.map((device) => (
                <tr key={device.id} className="border-b hover:bg-gray-50">
                  <td className="p-3 font-semibold">
                    {device.deviceName || device.deviceId || "-"}
                  </td>
                  <td className="p-3">{device.userName || "-"}</td>
                  <td className="p-3">{device.employeeId || "-"}</td>
                  <td className="p-3">
                    {statusBadge(device.statusLabel || device.status)}
                  </td>
                  <td className="p-3">
                    {device.osVersion || device.androidVersion || "-"}
                  </td>
                  <td className="p-3">{device.appVersion || "-"}</td>
                  <td className="p-3 text-sm">
                    {formatDate(device.lastOnline || device.lastSeen)}
                  </td>
                  <td className="p-3 text-center">
                    <button
                      onClick={() => openDeviceModal(device)}
                      className="px-3 py-1 bg-gray-100 rounded-lg"
                    >
                      View
                    </button>
                  </td>
                </tr>
              ))}
            </tbody>
          </table>
        )}

        {/* MOBILE LIST (FIXED PAGINATION ✅) */}
        <div className="lg:hidden space-y-3">
          {paginatedDeviceList.map((device) => (
            <div key={device.id} className="border rounded-lg p-3">
              <div className="font-semibold">
                {device.deviceName || device.deviceId}
              </div>
              <div className="text-sm text-gray-600">
                {formatDate(device.createdAt)}
              </div>
              <div className="mt-2">
                <button
                  onClick={() => openDeviceModal(device)}
                  className="text-blue-600 text-sm"
                >
                  View Details
                </button>
              </div>
            </div>
          ))}
        </div>

        {/* PAGINATION */}
        <div className="flex justify-between items-center mt-4">
          <p className="text-sm text-gray-600">
            Showing {(currentPage - 1) * ITEMS_PER_PAGE + 1} –
            {Math.min(currentPage * ITEMS_PER_PAGE, deviceList.length)} of{" "}
            {deviceList.length}
          </p>

          <div className="flex gap-2">
            <button
              onClick={() => setCurrentPage((p) => Math.max(p - 1, 1))}
              disabled={currentPage === 1}
              className="px-3 py-1 border rounded disabled:opacity-50"
            >
              Prev
            </button>
            <button
              onClick={() =>
                setCurrentPage((p) => Math.min(p + 1, totalPages))
              }
              disabled={currentPage === totalPages}
              className="px-3 py-1 border rounded disabled:opacity-50"
            >
              Next
            </button>
          </div>
        </div>
      </div>

      {/* MODAL (UNCHANGED CORE LOGIC) */}
      {showModal && selectedDevice && (
        <div className="fixed inset-0 bg-black/60 flex justify-center items-center z-50">
          <div className="bg-white p-6 rounded-xl w-full max-w-xl relative">
            <button
              onClick={() => setShowModal(false)}
              className="absolute top-3 right-4"
            >
              ✕
            </button>

            <h2 className="text-xl font-bold mb-4">
              {selectedDevice.deviceName}
            </h2>

            <div className="grid grid-cols-2 gap-3">
              <div>
                <strong>Camera</strong>
                {cameraBadge(getPolicyValue(selectedDevice, "cameraDisabled"))}
              </div>
              <div>
                <strong>Location</strong>
                {locationBadge(selectedDevice.locationAllowed)}
              </div>
            </div>

            <div className="mt-4 grid grid-cols-2 gap-3">
              <button
                onClick={() => togglePolicy("cameraDisabled")}
                className="py-2 bg-blue-600 text-white rounded"
              >
                Toggle Camera
              </button>

              <button
                onClick={removeDevice}
                className="py-2 bg-red-500 text-white rounded"
              >
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
