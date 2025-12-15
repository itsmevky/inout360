import React, { useState } from "react";

const ActivityPage = () => {

    // ============================================================
    // STATIC CAMERA & APP ACTIVITY DATA
    // ============================================================
    const camActivityData = [
        {
            id: "A001",
            user: "Rahul",
            type: "screenshot",
            deviceId: "DEV-1001",
            employeeId: "EMP-501",
            timestamp: "2025-01-12 10:15 AM",
            media: "https://picsum.photos/200?random=1"
        },
        {
            id: "A002",
            user: "Rahul",
            type: "screenshot",
            deviceId: "DEV-1001",
            employeeId: "EMP-501",
            timestamp: "2025-01-14 02:10 PM",
            media: "https://picsum.photos/200?random=2"
        },
        {
            id: "A003",
            user: "Simran",
            type: "screenshot",
            deviceId: "DEV-1002",
            employeeId: "EMP-502",
            timestamp: "2025-01-14 03:45 PM",
            media: "https://picsum.photos/200?random=3"
        },
        {
            id: "A004",
            user: "Amit",
            type: "screenshot",
            deviceId: "DEV-1003",
            employeeId: "EMP-503",
            timestamp: "2025-01-15 09:20 AM",
            media: "https://picsum.photos/200?random=4"
        },
        {
            id: "A005",
            user: "Neha",
            type: "screenshot",
            deviceId: "DEV-1004",
            employeeId: "EMP-504",
            timestamp: "2025-01-15 11:15 AM",
            media: "https://picsum.photos/200?random=8"
        },
        {
            id: "A006",
            user: "Arjun",
            type: "screenshot",
            deviceId: "DEV-1005",
            employeeId: "EMP-505",
            timestamp: "2025-01-15 11:30 AM",
            media: "https://picsum.photos/200?random=9"
        },

        {
            id: "A007",
            user: "Amit",
            type: "take_picture",
            deviceId: "DEV-1001",
            employeeId: "EMP-503",
            timestamp: "2025-01-12 11:00 AM",
            media: "https://picsum.photos/200?random=5"
        },
        {
            id: "A008",
            user: "Simran",
            type: "take_picture",
            deviceId: "DEV-1002",
            employeeId: "EMP-502",
            timestamp: "2025-01-13 12:22 PM",
            media: "https://picsum.photos/200?random=6"
        },

        {
            id: "A011",
            user: "Simran",
            type: "video",
            deviceId: "DEV-1002",
            employeeId: "EMP-502",
            timestamp: "2025-01-12 11:30 AM",
            media: "https://picsum.photos/200?random=7"
        },

        {
            id: "A014",
            user: "Karan",
            type: "app_install",
            deviceId: "DEV-2001",
            employeeId: "EMP-504",
            timestamp: "2025-01-13 01:22 PM",
            appName: "Pidilite"
        },
        {
            id: "A015",
            user: "Raj Kumar",
            type: "app_install",
            deviceId: "DEV-2001",
            employeeId: "EMP-504",
            timestamp: "2025-01-13 01:22 PM",
            appName: "Pidilite"
        },
        {
            id: "A016",
            user: "Payal",
            type: "app_install",
            deviceId: "DEV-2001",
            employeeId: "EMP-504",
            timestamp: "2025-01-13 01:22 PM",
            appName: "Pidilite"
        },

        {
            id: "A018",
            user: "Pooja",
            type: "app_uninstall",
            deviceId: "DEV-2002",
            employeeId: "EMP-505",
            timestamp: "2025-01-13 02:41 PM",
            appName: "Pidilite"
        },
    ];

    // ============================================================
    // COLUMN WIDTH CONFIG
    // ============================================================
    const columnWidths = {
        srNo: "5%",
        user: "15%",
        activity: "15%",
        device: "15%",
        emp: "12%",
        time: "15%",
        action: "12%"
    };

    // ============================================================
    // COUNTS
    // ============================================================
    const counts = {
        cameraTotal: camActivityData.filter(a =>
            ["screenshot", "take_picture", "video"].includes(a.type)
        ).length,
        install: camActivityData.filter(a => a.type === "app_install").length,
        uninstall: camActivityData.filter(a => a.type === "app_uninstall").length,
    };

    const [selectedType, setSelectedType] = useState(null);
    const [cameraFilter, setCameraFilter] = useState(null);
    const [modalUser, setModalUser] = useState(null);

    // ============================================================
    // 🔍 SEARCH STATE + HANDLER (ADDED)
    // ============================================================
    const [searchTerm, setSearchTerm] = useState("");

    const handleSearchChange = (e) => {
        setSearchTerm(e.target.value);
    };

    // ============================================================
    // FILTER + SEARCH
    // ============================================================
    const filteredUsers = (() => {
        let list = [];

        if (selectedType === "camera_activity") {
            list = cameraFilter
                ? camActivityData.filter(a => a.type === cameraFilter)
                : camActivityData.filter(a =>
                    ["screenshot", "take_picture", "video"].includes(a.type)
                );
        } else if (selectedType) {
            list = camActivityData.filter(a => a.type === selectedType);
        }

        // Search filter (ADDED)
        if (searchTerm.trim() !== "") {
            list = list.filter(item =>
                item.user.toLowerCase().includes(searchTerm.toLowerCase()) ||
                item.deviceId.toLowerCase().includes(searchTerm.toLowerCase()) ||
                item.employeeId.toLowerCase().includes(searchTerm.toLowerCase())
            );
        }

        return list;
    })();

    // ============================================================
    // MODAL OPEN
    // ============================================================
    const openModal = (record) => {
        const all = camActivityData.filter(a => a.user === record.user);
        setModalUser({ user: record.user, activities: all });
    };

    const closeModal = () => setModalUser(null);

    // ============================================================
    // CARD CONFIG
    // ============================================================
    const cardConfig = [
        { title: "Cam Activity", type: "camera_activity", count: counts.cameraTotal },
        { title: "App Installed", type: "app_install", count: counts.install },
        { title: "App Uninstalled", type: "app_uninstall", count: counts.uninstall },
    ];

    // ============================================================
    // RENDER UI
    // ============================================================
    return (
        <div className="layout-section-dashboard p-4">

            <div className="bg-white p-4 py-8 rounded-lg text-gray-700 font-semibold text-xl flex gap-4 activity-list-heading">
                <svg width="20" fill="navy-blue" xmlns="http://www.w3.org/2000/svg" viewBox="0 0 448 512"><path d="M128 136c0-22.1-17.9-40-40-40L40 96C17.9 96 0 113.9 0 136l0 48c0 22.1 17.9 40 40 40l48 0c22.1 0 40-17.9 40-40l0-48zm0 192c0-22.1-17.9-40-40-40l-48 0c-22.1 0-40 17.9-40 40l0 48c0 22.1 17.9 40 40 40l48 0c22.1 0 40-17.9 40-40l0-48zm32-192l0 48c0 22.1 17.9 40 40 40l48 0c22.1 0 40-17.9 40-40l0-48c0-22.1-17.9-40-40-40l-48 0c-22.1 0-40 17.9-40 40zM288 328c0-22.1-17.9-40-40-40l-48 0c-22.1 0-40 17.9-40 40l0 48c0 22.1 17.9 40 40 40l48 0c22.1 0 40-17.9 40-40l0-48zm32-192l0 48c0 22.1 17.9 40 40 40l48 0c22.1 0 40-17.9 40-40l0-48c0-22.1-17.9-40-40-40l-48 0c-22.1 0-40 17.9-40 40zM448 328c0-22.1-17.9-40-40-40l-48 0c-22.1 0-40 17.9-40 40l0 48c0 22.1 17.9 40 40 40l48 0c22.1 0 40-17.9 40-40l0-48z"></path>
                </svg>
                User Activity
            </div>

            {/* ================= CARDS ================= */}
            <div className="grid lg:grid-cols-4 xl:grid-cols-4 sm:grid-cols-1 md:grid-cols-2 gap-3 mt-6 activity-page-cards">
                {cardConfig.map((item, i) => {
                    const isActive = selectedType === item.type;

                    return (
                        <div
                            key={i}
                            onClick={() => {
                                setSelectedType(item.type);
                                setCameraFilter(null);
                            }}
                            className={`cursor-pointer p-4 rounded-xl transition-all duration-300 border-l-4 hover:shadow-xl hover:-translate-y-2 
                                ${isActive ? "bg-[#018DD4]/15 border-[#018DD4]" : "bg-white border-[#018DD4]"}
                            `}
                        >
                            <p className={`font-semibold text-lg ${isActive ? "text-black" : "text-gray-700"}`}>
                                {item.title}
                            </p>

                            <h2 className={`text-3xl font-bold mt-2 ${isActive ? "text-[#018DD4]" : "text-black"}`}>
                                {item.count}
                            </h2>

                            <p className="text-gray-500 text-sm">
                                {item.count} user activities detected
                            </p>
                        </div>
                    );
                })}
            </div>

            {/* ================= CAMERA FILTER ================= */}
            {selectedType === "camera_activity" && (
                <div className="mt-6 flex gap-3 items-center">
                    <div className="input-search-bar-activity-page flex ">
                        <input
                            type="text"
                            id="search"
                            name="search"
                            value={searchTerm}
                            onChange={handleSearchChange}
                            placeholder="Search"
                            className="border rounded p-2 "
                        />
                        <div
                            className="searching-log-activity-page flex items-center">
                            <svg
                                fill="#blue"
                                width="16"
                                height="16"
                                xmlns="http://www.w3.org/2000/svg" viewBox="0 0 512 512"><path d="M416 208c0 45.9-14.9 88.3-40 122.7L502.6 457.4c12.5 12.5 12.5 32.8 0 45.3s-32.8 12.5-45.3 0L330.7 376c-34.4 25.2-76.8 40-122.7 40C93.1 416 0 322.9 0 208S93.1 0 208 0S416 93.1 416 208zM208 352a144 144 0 1 0 0-288 144 144 0 1 0 0 288z"></path></svg>
                        </div>
                    </div>

                    <select
                        className="p-2 border rounded-lg bg-white activity-page-select-option"
                        value={cameraFilter || ""}
                        onChange={(e) => setCameraFilter(e.target.value)}
                    >
                        <option value="">All Camera Activity</option>
                        <option value="screenshot">Screenshot</option>
                        <option value="video">Record Video</option>
                    </select>
                </div>
            )}

            {/* ================= TABLE ================= */}
            {selectedType && (
                <div className="mt-10 bg-white p-5 rounded-xl shadow">
                    <h2 className="text-xl font-bold mb-4">
                        User Activity — {
                            selectedType === "camera_activity"
                                ? (cameraFilter ? cameraFilter.replace("_", " ").toUpperCase() : "ALL CAMERA ACTIVITY")
                                : selectedType.replace("_", " ").toUpperCase()
                        }
                    </h2>

                    <table className="w-full border-collapse">
                        <thead>
                            <tr className="bg-gray-100 text-left text-gray-700">
                                <th style={{ width: columnWidths.srNo }} className="p-3">Sr.No</th>
                                <th style={{ width: columnWidths.user }} className="p-3">User</th>
                                <th style={{ width: columnWidths.activity }} className="p-3">Activity</th>
                                <th style={{ width: columnWidths.device }} className="p-3">Device ID</th>
                                <th style={{ width: columnWidths.emp }} className="p-3">Employee ID</th>
                                <th style={{ width: columnWidths.time }} className="p-3">Time</th>
                                <th style={{ width: columnWidths.action }} className="p-3">Action</th>
                            </tr>
                        </thead>

                        <tbody>
                            {filteredUsers.map((item, index) => (
                                <tr key={item.id} className="hover:bg-gray-50">
                                    <td className="p-3">{index + 1}</td>
                                    <td className="p-3">{item.user}</td>
                                    <td className="p-3">{item.type.replace("_", " ")}</td>
                                    <td className="p-3">{item.deviceId}</td>
                                    <td className="p-3">{item.employeeId}</td>
                                    <td className="p-3">{item.timestamp}</td>

                                    <td className="p-3 flex items-center gap-2">
                                        <button
                                            onClick={() => openModal(item)}
                                            className="px-3 py-1 bg-blue-600 text-white rounded hover:bg-blue-800 flex items-center gap-1"
                                        >
                                            View
                                        </button>

                                        <svg
                                            onClick={() => openModal(item)}
                                            className="cursor-pointer"
                                            width={24}
                                            height={24}
                                            xmlns="http://www.w3.org/2000/svg"
                                            viewBox="0 0 640 640"
                                        >
                                            <path fill="black" d="M320 96C239.2 96 174.5 132.8 127.4 176.6C80.6 220.1 49.3 272 34.4 307.7C31.1 315.6 31.1 324.4 34.4 332.3C49.3 368 80.6 420 127.4 463.4C174.5 507.1 239.2 544 320 544C400.8 544 465.5 507.2 512.6 463.4C559.4 419.9 590.7 368 605.6 332.3C608.9 324.4 608.9 315.6 605.6 307.7C590.7 272 559.4 220 512.6 176.6C465.5 132.9 400.8 96 320 96zM176 320C176 240.5 240.5 176 320 176C399.5 176 464 240.5 464 320C464 399.5 399.5 464 320 464C240.5 464 176 399.5 176 320zM320 256C320 291.3 291.3 320 256 320C244.5 320 233.7 317 224.3 311.6C223.3 322.5 224.2 333.7 227.2 344.8C240.9 396 293.6 426.4 344.8 412.7C396 399 426.4 346.3 412.7 295.1C400.5 249.4 357.2 220.3 311.6 224.3C316.9 233.6 320 244.4 320 256z" />
                                        </svg>
                                    </td>
                                </tr>
                            ))}
                        </tbody>
                    </table>
                </div>
            )}

            {/* ================= MODAL ================= */}
            {modalUser && (
                <div className="fixed inset-0 bg-black/70 backdrop-blur-sm flex justify-center items-center z-50">
                    <div className="bg-white w-[720px] rounded-xl shadow-xl relative p-6">

                        <button
                            onClick={closeModal}
                            className="absolute top-3 right-3 text-gray-600 hover:text-black text-xl"
                        >
                            ✕
                        </button>

                        <div className="mb-4">
                            <h2 className="text-xl font-bold">{modalUser.user}</h2>
                            <p className="text-gray-700 text-sm font-semibold">
                                Employee ID: {modalUser.activities[0]?.employeeId}
                            </p>
                            <p className="text-gray-700 text-sm font-semibold">
                                Device ID: {modalUser.activities[0]?.deviceId}
                            </p>
                        </div>

                        {/* APP LOGS */}
                        {modalUser.activities.some(a =>
                            ["app_install", "app_uninstall"].includes(a.type)
                        ) ? (
                            <>
                                <h3 className="text-lg font-semibold mb-3">App Activity</h3>

                                {modalUser.activities
                                    .filter(a =>
                                        ["app_install", "app_uninstall"].includes(a.type)
                                    )
                                    .map((act) => (
                                        <div key={act.id} className="border rounded-lg p-4 mb-3 bg-gray-50">
                                            <p className="text-sm font-semibold">
                                                {act.appName} — {act.type === "app_install" ? "Installed" : "Uninstalled"}
                                            </p>
                                            <p className="text-xs text-gray-600 mt-1">{act.timestamp}</p>
                                        </div>
                                    ))}
                            </>
                        ) : (
                            <>
                                <h3 className="text-lg font-semibold mb-3">Camera Activity</h3>

                                <div className="grid grid-cols-4 sm:grid-cols-3 md:grid-cols-4 gap-1 screenshot-cards">
                                    {modalUser.activities
                                        .filter(a =>
                                            ["screenshot", "take_picture", "video"].includes(a.type)
                                        )
                                        .map((act) => (
                                            <div key={act.id} className="flex flex-col items-center">
                                                <img
                                                    src={act.media}
                                                    className="w-30 h-28 object-cover rounded border"
                                                    alt="activity"
                                                />
                                                <p className="text-xs mt-1 font-semibold text-gray-700">
                                                    {act.type.replace("_", " ").toUpperCase()}
                                                </p>
                                                <p className="text-xs text-gray-500 font-medium">{act.timestamp}</p>
                                            </div>
                                        ))}
                                </div>
                            </>
                        )}

                    </div>
                </div>
            )}

        </div>
    );
};

export default ActivityPage;
