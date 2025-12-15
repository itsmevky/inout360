import React, { useState } from "react";

const Settings = () => {
    const defaultDevice = {
        cameraEnabled: true,
        uninstallAllowed: false,
        locationEnabled: true,
        screenshotAllowed: false,
        blockUnknownApps: true,
        autoSync: true,
    };

    const defaultAlerts = {
        appInstallAlert: true,
        appUninstallAlert: true,
        screenshotAlert: false,
        cameraActivityAlert: false,
    };

    const defaultSystem = {
        apiUrl: "",
        unitLocation: "",
        apkFile: null,
        logoFile: null,
    };

    const [deviceSettings, setDeviceSettings] = useState(defaultDevice);
    const [alerts, setAlerts] = useState(defaultAlerts);
    const [systemConfig, setSystemConfig] = useState(defaultSystem);

    const [isChanged, setIsChanged] = useState(false);

    const toggle = (setter, key) => {
        setIsChanged(true);
        setter((prev) => ({ ...prev, [key]: !prev[key] }));
    };

    const handleConfigChange = (key, value) => {
        setIsChanged(true);
        setSystemConfig((prev) => ({ ...prev, [key]: value }));
    };

    const handleSave = () => {
        setIsChanged(false);
        alert("Changes Saved Successfully!");
    };

    const handleCancel = () => {
        setDeviceSettings(defaultDevice);
        setAlerts(defaultAlerts);
        setSystemConfig(defaultSystem);
        setIsChanged(false);
    };

    return (
        <div className="p-4">
            <div className="bg-white p-4 rounded-lg shadow flex items-center gap-3 text-xl font-semibold text-gray-700 setting-list-heading">
                <svg width="22" fill="navy-blue" xmlns="http://www.w3.org/2000/svg" viewBox="0 0 448 512">
                    <path d="M128 136c0-22.1-17.9-40-40-40L40 96C17.9 96 0 113.9 0 136l0 48c0 22.1 17.9 40 40 40l48 0c22.1 0 40-17.9 40-40l0-48zm0 192c0-22.1-17.9-40-40-40l-48 0c-22.1 0-40 17.9-40 40l0 48c0 22.1 17.9 40 40 40l48 0c22.1 0 40-17.9 40-40l0-48zm32-192l0 48c0 22.1 17.9 40 40 40l48 0c22.1 0 40-17.9 40-40l0-48c0-22.1-17.9-40-40-40l-48 0c-22.1 0-40 17.9-40 40zM288 328c0-22.1-17.9-40-40-40l-48 0c-22.1 0-40 17.9-40 40l0 48c0 22.1 17.9 40 40 40l48 0c22.1 0 40-17.9 40-40l0-48zm32-192l0 48c0 22.1 17.9 40 40 40l48 0c22.1 0 40-17.9 40-40l0-48c0-22.1-17.9-40-40-40zM448 328c0-22.1-17.9-40-40-40l-48 0c-22.1 0-40 17.9-40 40l0 48c0 22.1 17.9 40 40 40l48 0c22.1 0 40-17.9 40-40l0-48z"></path>
                </svg>
                System Settings
            </div>
            <div className="min-h-screen">

                {/* ========= TOP SECTION ========= */}
                <div className="bg-white p-6 rounded-xl shadow-sm border border-gray-200">
                    <h2 className="text-xl font-bold text-gray-800">System Configuration</h2>
                    <p className="text-sm text-gray-500 mt-1">API, Logo, APK, Location settings</p>

                    <div className="grid grid-cols-1 md:grid-cols-2 gap-6 mt-6">

                        {/* API URL */}
                        <div>
                            <label className="setting-System-Configuration text-gray-700 font-semibold">API Endpoint URL</label>
                            <input
                                type="text"
                                value={systemConfig.apiUrl}
                                placeholder="https://your-backend.com/api/"
                                onChange={(e) => handleConfigChange("apiUrl", e.target.value)}
                                className="w-full mt-2 border border-gray-400 p-3 rounded-lg bg-gray-50 focus:ring-2 focus:ring-blue-400"
                            />
                        </div>

                        {/* Unit Location */}
                        <div>
                            <label className="setting-System-Configuration text-gray-700 font-semibold">Unit Location</label>
                            <select
                                value={systemConfig.unitLocation}
                                onChange={(e) => handleConfigChange("unitLocation", e.target.value)}
                                className="w-full mt-2 border border-gray-400 p-3 rounded-lg bg-gray-50 focus:ring-2 focus:ring-blue-400"
                            >
                                <option value="">Select Unit</option>
                                <option>Mumbai</option>
                                <option>Delhi</option>
                                <option>Pune</option>
                                <option>Bangalore</option>
                            </select>
                        </div>

                        {/* APK Upload */}
                        <div>
                            <label className="setting-System-Configuration text-gray-700 font-semibold">Upload APK File</label>
                            <input
                                type="file"
                                accept=".apk"
                                onChange={(e) => handleConfigChange("apkFile", e.target.files[0])}
                                className="w-full mt-2 border border-gray-400 p-3 rounded-lg bg-gray-50 "
                            />
                        </div>

                        {/* Logo Upload */}
                        <div>
                            <label className="setting-System-Configuration text-gray-700 font-semibold">Company Logo</label>
                            <input
                                type="file"
                                accept="image/*"
                                onChange={(e) => handleConfigChange("logoFile", e.target.files[0])}
                                className="w-full mt-2 border p-3 border-gray-400  rounded-lg bg-gray-50"
                            />

                            {systemConfig.logoFile && (
                                <img
                                    src={URL.createObjectURL(systemConfig.logoFile)}
                                    className="mt-3 w-24 h-24 object-contain rounded-lg shadow border"
                                    alt="Preview"
                                />
                            )}
                        </div>

                    </div>
                </div>

                {/* ========= FLEX BOTTOM CARDS ========= */}
                <div className="grid grid-cols-1 lg:grid-cols-2 gap-6 mt-8">

                    {/* Device Controls */}
                    <div className="bg-white rounded-xl shadow-sm border border-gray-200 p-6">
                        <h2 className="text-xl font-bold text-gray-800">Device Controls</h2>
                        <p className="text-sm text-gray-500 mt-1">Hardware access & restrictions</p>

                        <div className="mt-6 space-y-4 flex flex-col">
                            {[
                                ["Camera Access", "cameraEnabled"],
                                ["Allow App Uninstall", "uninstallAllowed"],
                                ["Location Access", "locationEnabled"],
                                ["Allow Screenshots", "screenshotAllowed"],
                                ["Block Unknown Apps", "blockUnknownApps"],
                                ["Auto Sync Enable", "autoSync"],
                            ].map(([label, key]) => (
                                <div key={key} className="flex items-center justify-between p-3.5 bg-gray-10 border rounded-lg setting-rows ">
                                    <span className="text-gray-800">{label}</span>

                                    <label className="relative inline-flex items-center cursor-pointer setting-device-control">
                                        <input
                                            type="checkbox"
                                            checked={deviceSettings[key]}
                                            onChange={() => toggle(setDeviceSettings, key)}
                                            className="sr-only peer"
                                        />
                                        <div className="w-12 h-6 bg-gray-300 rounded-full peer-checked:bg-blue-600 transition"></div>
                                        <div className="absolute w-4 h-4 bg-white rounded-full left-1 top-1 transition-all peer-checked:translate-x-6 shadow"></div>
                                    </label>
                                </div>
                            ))}
                        </div>
                    </div>

                    {/* Alerts */}
                    <div className="bg-white rounded-xl shadow-sm border border-gray-200 p-6">
                        <h2 className="text-xl font-bold text-gray-800">Alerts & Notifications</h2>
                        <p className="text-sm text-gray-500 mt-1">Activity alerts</p>

                        <div className="mt-6 space-y-4 flex flex-col ">
                            {[
                                ["App Install Alert", "appInstallAlert"],
                                ["App Uninstall Alert", "appUninstallAlert"],
                                ["Screenshot Alert", "screenshotAlert"],
                                ["Camera Activity Alert", "cameraActivityAlert"],
                            ].map(([label, key]) => (
                                <div key={key} className="flex items-center justify-between p-4 bg-gray-50 border rounded-lg setting-rows">
                                    <span className="text-gray-800">{label}</span>

                                    <label className="relative inline-flex items-center cursor-pointer setting-Notification-aleart-control">
                                        <input
                                            type="checkbox"
                                            checked={alerts[key]}
                                            onChange={() => toggle(setAlerts, key)}
                                            className="sr-only peer"
                                        />
                                        <div className="w-12 h-6 bg-gray-300 rounded-full peer-checked:bg-green-600 transition"></div>
                                        <div className="absolute w-4 h-4 bg-white rounded-full left-1 top-1 transition-all peer-checked:translate-x-6 shadow"></div>
                                    </label>
                                </div>
                            ))}
                        </div>
                    </div>
                </div>

                {/* ========= SAVE / CANCEL BUTTONS ========= */}
                {isChanged && (
                    <div className="mt-8 flex gap-4 justify-end">
                        <button
                            onClick={handleCancel}
                            className="px-6 py-3 border border-gray-300 rounded-xl hover:bg-gray-100 transition"
                        >
                            Cancel
                        </button>

                        <button
                            onClick={handleSave}
                            className="px-6 py-3 bg-blue-600 text-white rounded-xl hover:bg-blue-700 transition"
                        >
                            Save Changes
                        </button>
                    </div>
                )}

            </div>
        </div>
    );
};

export default Settings;
