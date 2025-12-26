import React, { useEffect, useMemo, useState } from "react";
import { toast } from "react-toastify";
import { getData } from "../../Helpers/api.js";

const ActivityPage = () => {

    // ============================================================
    // STATIC CAMERA & APP ACTIVITY DATA
    // ============================================================
    const [activityData, setActivityData] = useState([]);
    const [summary, setSummary] = useState({
        camera: 0,
        app_install: 0,
        app_uninstall: 0,
    });
    const [loading, setLoading] = useState(true);

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


    const getRandomCameraImage = () => {
        const imgs = [
            "https://picsum.photos/300/200?random=11",
            "https://picsum.photos/300/200?random=12",
            "https://picsum.photos/300/200?random=13",
            "https://picsum.photos/300/200?random=14",
            "https://picsum.photos/300/200?random=15",
        ];
        return imgs[Math.floor(Math.random() * imgs.length)];
    };
    // ============================================================
    // COUNTS
    // ============================================================
    const counts = {
        cameraTotal: summary.camera || 0,
        install: summary.app_install || 0,
        uninstall: summary.app_uninstall || 0,
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
    const filteredUsers = useMemo(() => {
        let list = [];
        const cameraTypes = ["screenshot", "take_picture", "video"];

        if (selectedType === "camera_activity") {
            list = cameraFilter
                ? activityData.filter(a => a.type === cameraFilter)
                : activityData.filter(a =>
                    cameraTypes.includes(a.type) ||
                    a.category === "camera" ||
                    ["screenshot", "video"].includes(a.category)
                );
        } else if (selectedType === "app_install" || selectedType === "app_uninstall") {
            list = activityData.filter(a => a.category === selectedType);
        } else if (selectedType) {
            list = activityData.filter(a => a.type === selectedType);
        }

        // Search filter (ADDED)
        if (searchTerm.trim() !== "") {
            list = list.filter(item =>
                String(item.user || "").toLowerCase().includes(searchTerm.toLowerCase()) ||
                String(item.deviceId || "").toLowerCase().includes(searchTerm.toLowerCase()) ||
                String(item.employeeId || "").toLowerCase().includes(searchTerm.toLowerCase())
            );
        }

        console.log("Filtered Users:vggggggggggggggggggggggg", list);

        return list;

    }, [activityData, cameraFilter, searchTerm, selectedType]);

    // ============================================================
    // MODAL OPEN
    // ============================================================
    const openModal = (record) => {
        let filtered = [];

        // 👉 Camera Activity popup
        if (selectedType === "camera_activity") {
            filtered = activityData.filter(a =>
                a.userKey === record.userKey &&
                ["screenshot", "take_picture", "video"].includes(a.type)
            );
        }

        // 👉 App Installed popup
        else if (selectedType === "app_install") {
            filtered = activityData.filter(a =>
                a.userKey === record.userKey &&
                a.category === "app_install"
            );
        }

        // 👉 App Uninstalled popup
        else if (selectedType === "app_uninstall") {
            filtered = activityData.filter(a =>
                a.userKey === record.userKey &&
                a.category === "app_uninstall"
            );
        }

        setModalUser({
            user: record.user,
            activities: filtered,
        });
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

    const formatTimestamp = (value) => {
        if (!value) return "-";
        const date = new Date(value);
        if (Number.isNaN(date.getTime())) return value;
        return date.toLocaleString();
    };

    useEffect(() => {
        const fetchActivity = async () => {
            setLoading(true);
            try {
                const [summaryResponse, listResponse] = await Promise.all([
                    getData("/activity/summary"),
                    getData("/activity"),
                ]);
                if (summaryResponse?.data) {
                    setSummary(summaryResponse.data);
                }
                const list = Array.isArray(listResponse) ? listResponse : [];
                const normalized = list.map((item) => {
                    const userName =
                        item.userName ||
                        item.metadata?.userName ||
                        item.metadata?.name ||
                        item.metadata?.user ||
                        item.userId ||
                        "-";
                    const activityType =
                        item.activityType || item.title || item.category || "-";
                    const appName =
                        item.metadata?.appName ||
                        item.metadata?.app ||
                        item.title ||
                        "";
                    const mediaUrl =
                        item.media?.[0]?.url ||
                        item.metadata?.mediaUrl ||
                        item.metadata?.media ||
                        "";
                    const userKey = item.userId || userName;

                    return {
                        id: item.id || item._id,
                        user: userName,
                        userKey,
                        type: activityType,
                        category: item.category,
                        deviceId: item.deviceId,
                        employeeId: item.employeeId,
                        timestamp: item.occurredAt,
                        appName,
                        media: mediaUrl,
                    };
                });
                setActivityData(normalized);
            } catch (error) {
                toast.error("Failed to load activity.");
            } finally {
                setLoading(false);
            }
        };
        fetchActivity();
    }, []);

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
                <div className="mt-6 flex gap-3 items-center activity-page-searchbar-dropdown">
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
                        <option value="take_picture">Take Picture</option>
                        <option value="video">Record Video</option>
                    </select>
                </div>
            )}

            {/* ================= TABLE ================= */}
            {selectedType && (
                <div className="mt-10 bg-white p-5 rounded-xl shadow activity-table-wrapper">
                    <h2 className="text-xl font-bold mb-4">
                        User Activity — {
                            selectedType === "camera_activity"
                                ? (cameraFilter
                                    ? cameraFilter.replace("_", " ").toUpperCase()
                                    : "ALL CAMERA ACTIVITY")
                                : selectedType.replace("_", " ").toUpperCase()
                        }
                    </h2>

                    <div className="activity-table-scroll">
                        <table className="w-full border-collapse activity-table">
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
                                        <td className="p-3">{(item.type || "-").replace("_", " ")}</td>
                                        <td className="p-3">{item.deviceId}</td>
                                        <td className="p-3">{item.employeeId}</td>
                                        <td className="p-3">{formatTimestamp(item.timestamp)}</td>

                                        <td className="p-3">
                                            <div className="flex items-center gap-3 !p-0 !m-0">

                                                {/* VIEW BUTTON (existing) */}
                                                <button
                                                    onClick={() => openModal(item)}
                                                    className="px-3 py-1 bg-blue-600 text-white rounded hover:bg-blue-800 !m-0"
                                                >
                                                    View
                                                </button>

                                                {/* EYE ICON BUTTON (NEW) */}
                                                <button
                                                    onClick={() => openModal(item)}
                                                    className="w-9 h-9 flex items-center justify-center rounded-lg bg-gray-100 hover:bg-gray-200 !m-0"
                                                    title="View Details"
                                                >
                                                    <svg
                                                        width={22}
                                                        height={22}
                                                        xmlns="http://www.w3.org/2000/svg"
                                                        viewBox="0 0 576 512">
                                                        <path d="M288 32c-80.8 0-145.5 36.8-192.6 80.6-46.8 43.5-78.1 95.4-93 131.1-3.3 7.9-3.3 16.7 0 24.6 14.9 35.7 46.2 87.7 93 131.1 47.1 43.7 111.8 80.6 192.6 80.6s145.5-36.8 192.6-80.6c46.8-43.5 78.1-95.4 93-131.1 3.3-7.9 3.3-16.7 0-24.6-14.9-35.7-46.2-87.7-93-131.1-47.1-43.7-111.8-80.6-192.6-80.6zM144 256a144 144 0 1 1 288 0 144 144 0 1 1 -288 0zm144-64c0 35.3-28.7 64-64 64-11.5 0-22.3-3-31.7-8.4-1 10.9-.1 22.1 2.9 33.2 13.7 51.2 66.4 81.6 117.6 67.9s81.6-66.4 67.9-117.6c-12.2-45.7-55.5-74.8-101.1-70.8 5.3 9.3 8.4 20.1 8.4 31.7z" />
                                                    </svg>
                                                </button>

                                            </div>
                                        </td>

                                    </tr>
                                ))}
                            </tbody>
                        </table>
                    </div>
                </div>
            )}



            {/* ================= MODAL ================= */}
            {modalUser && (
                <div className="modal-overlay">
                    <div className="modal-container">

                        <button
                            onClick={closeModal}
                            className="modal-close-btn"
                        >
                            ✕
                        </button>

                        <div className="modal-header">
                            <h2 className="modal-user-name">{modalUser.user}</h2>
                            <p className="modal-meta">
                                Employee ID: {modalUser.activities[0]?.employeeId}
                            </p>
                            <p className="modal-meta">
                                Device ID: {modalUser.activities[0]?.deviceId}
                            </p>
                        </div>

                        {modalUser.activities.some(a =>
                            ["app_install", "app_uninstall"].includes(a.category || a.type)
                        ) ? (
                            <>
                                <h3 className="modal-section-title">App Activity</h3>

                                {modalUser.activities
                                    .filter(a =>
                                        ["app_install", "app_uninstall"].includes(a.category || a.type)
                                    )
                                    .map((act) => (
                                        <div key={act.id} className="app-log-card">
                                            <p className="app-log-title">
                                                {act.appName || "-"} — {(act.category || act.type) === "app_install" ? "Installed" : "Uninstalled"}
                                            </p>
                                            <p className="app-log-time">{formatTimestamp(act.timestamp)}</p>
                                        </div>
                                    ))}
                            </>
                        ) : (
                            <>
                                <h3 className="modal-section-title">Camera Activity</h3>

                                <div className="camera-grid">
                                    {modalUser.activities
                                        .filter(a =>
                                            ["screenshot", "take_picture", "video"].includes(a.type) ||
                                            a.category === "camera" ||
                                            ["screenshot", "video"].includes(a.category)
                                        )
                                        .map((act) => (
                                            <div key={act.id} className="camera-card">
                                                {act.media ? (
                                                    <img
                                                        src={act.media || getRandomCameraImage()}
                                                        className="camera-img"
                                                        alt="camera activity"
                                                    />
                                                ) : (
                                                    <div className="camera-img camera-img--empty"></div>
                                                )}
                                                <p className="camera-type">
                                                    {(act.type || act.category || "-").replace("_", " ").toUpperCase()}
                                                </p>
                                                <p className="camera-time">{formatTimestamp(act.timestamp)}</p>
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
