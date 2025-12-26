import React, { useEffect, useMemo, useState } from "react";
import { toast } from "react-toastify";
import { domainpath, getData } from "../../Helpers/api.js";

const ActivityPage = () => {

    // ============================================================
    // STATIC CAMERA & APP ACTIVITY DATA
    // ============================================================
    const [activityGroups, setActivityGroups] = useState([]);

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


    const resolveMediaUrl = (value) => {
        if (!value) return "";
        if (/^https?:\/\//i.test(value)) return value;
        if (value.startsWith("/uploads/")) {
            const base = domainpath.replace(/\/api\/?$/, "");
            return `${base}${value}`;
        }
        return value;
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
    // MODAL CAMERA FILTER (ADDED)
    // ============================================================
    const [modalCameraType, setModalCameraType] = useState("all");
    // values: "all" | "take_picture" | "screenshot" | "video"


    // ============================================================
    // PAGINATION STATE (ADDED)
    // ============================================================
    const ITEMS_PER_PAGE = 15;
    const [currentPage, setCurrentPage] = useState(1);

    // ============================================================
    // 🔍 SEARCH STATE + HANDLER (ADDED)
    // ============================================================
    const [searchTerm, setSearchTerm] = useState("");
    // ============================================================

    // ============================================================
    // DATE RANGE FILTER STATE (ADDED)
    // ============================================================
    const [fromDate, setFromDate] = useState(""); // "YYYY-MM-DD"
    const [toDate, setToDate] = useState("");     // "YYYY-MM-DD"


    // RESET PAGE WHEN FILTERS CHANGE (ADDED)
    // ============================================================
    useEffect(() => {
        setCurrentPage(1);
    }, [selectedType, cameraFilter, searchTerm, fromDate, toDate]);
    const handleSearchChange = (e) => {
        setSearchTerm(e.target.value);
    };
    const modalCameraActs = useMemo(() => {
        if (!modalUser) return [];

        return modalUser.activities.filter((a) => {
            const type = a.type || a.category || "";
            const isCamera = ["screenshot", "take_picture", "video"].includes(type);
            if (!isCamera) return false;

            if (modalCameraType === "all") return true;
            return type === modalCameraType;
        });
    }, [modalUser, modalCameraType]);
    // ============================================================
    // FILTER + SEARCH
    // ============================================================
    const filteredUsers = useMemo(() => {
        const cameraTypes = ["screenshot", "take_picture", "video"];
        let list = activityGroups.filter((group) => {
            const activities = group.activities || [];
            if (selectedType === "camera_activity") {
                if (cameraFilter) {
                    return activities.some((a) => a.type === cameraFilter);
                }
                return activities.some((a) =>
                    cameraTypes.includes(a.type) ||
                    a.category === "camera" ||
                    ["screenshot", "video"].includes(a.category)
                );
            }
            if (selectedType === "app_install" || selectedType === "app_uninstall") {
                return activities.some((a) => a.category === selectedType);
            }
            if (selectedType) {
                return activities.some((a) => a.type === selectedType);
            }
            return true;
        });

        if (searchTerm.trim() !== "") {
            list = list.filter((item) =>
                String(item.user || "").toLowerCase().includes(searchTerm.toLowerCase()) ||
                String(item.deviceId || "").toLowerCase().includes(searchTerm.toLowerCase()) ||
                String(item.employeeId || "").toLowerCase().includes(searchTerm.toLowerCase())
            );
        }

        if (fromDate || toDate) {
            const from = fromDate ? new Date(fromDate + "T00:00:00") : null;
            const to = toDate ? new Date(toDate + "T23:59:59") : null;

            list = list.filter((item) => {
                const activities = item.activities || [];
                return activities.some((a) => {
                    const t = a.timestamp ? new Date(a.timestamp) : null;
                    if (!t || Number.isNaN(t.getTime())) return false;
                    if (from && t < from) return false;
                    if (to && t > to) return false;
                    return true;
                });
            });
        }

        return list.map((item) => {
            const activities = item.activities || [];
            let relevant = activities;
            if (selectedType === "camera_activity") {
                if (cameraFilter) {
                    relevant = activities.filter((a) => a.type === cameraFilter);
                } else {
                    relevant = activities.filter((a) =>
                        cameraTypes.includes(a.type) ||
                        a.category === "camera" ||
                        ["screenshot", "video"].includes(a.category)
                    );
                }
            } else if (selectedType === "app_install" || selectedType === "app_uninstall") {
                relevant = activities.filter((a) => a.category === selectedType);
            } else if (selectedType) {
                relevant = activities.filter((a) => a.type === selectedType);
            }

            const latest = [...relevant].sort((a, b) => {
                const ta = new Date(a.timestamp || 0).getTime();
                const tb = new Date(b.timestamp || 0).getTime();
                return tb - ta;
            })[0];

            return { ...item, latestActivity: latest };
        });
    }, [activityGroups, cameraFilter, searchTerm, selectedType, fromDate, toDate]);

    // PAGINATION LOGIC (ADDED)
    // ============================================================
    const totalPages = Math.ceil(filteredUsers.length / ITEMS_PER_PAGE) || 1;

    const paginatedUsers = useMemo(() => {
        const startIndex = (currentPage - 1) * ITEMS_PER_PAGE;
        const endIndex = startIndex + ITEMS_PER_PAGE;
        return filteredUsers.slice(startIndex, endIndex);
    }, [filteredUsers, currentPage]);

    const uniqueUsersCount = useMemo(() => filteredUsers.length, [filteredUsers]);
    // ============================================================
    // MODAL OPEN
    // ============================================================
    const openModal = (record) => {
        setModalCameraType("all");
        setModalUser({
            user: record.user,
            activities: record.activities || [],
        });
    };



    const closeModal = () => { setModalUser(null); setModalCameraType("all"); };

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
                const normalized = list.map((group) => {
                    const activities = (group.activities || []).map((item) => {
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
                        return {
                            id: item.id || item._id,
                            type: activityType,
                            category: item.category,
                            deviceId: item.deviceId,
                            employeeId: item.employeeId,
                            timestamp: item.occurredAt,
                            appName,
                            media: resolveMediaUrl(mediaUrl),
                        };
                    });

                    return {
                        user: group.user || "-",
                        userKey: group.userKey || group.user || "-",
                        deviceId: group.deviceId || "",
                        employeeId: group.employeeId || "",
                        activities,
                    };
                });

                setActivityGroups(normalized);
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
                <div className="mt-6 flex flex-col lg:flex-row gap-4 items-start lg:items-center justify-between activity-page-searchbar-dropdown">

                    {/* LEFT SIDE: SEARCH + CAMERA FILTER */}
                    <div className="flex flex-col sm:flex-row gap-3 items-stretch sm:items-center w-full lg:w-2/4">

                        <div className="input-search-bar-activity-page flex w-full sm:w-2/4 md:w-2/4">
                            <input
                                type="text"
                                id="search"
                                name="search"
                                value={searchTerm}
                                onChange={handleSearchChange}
                                placeholder="Search"
                                className="border rounded p-2 w-full min-w-[180px]"
                            />
                            <div className="searching-log-activity-page flex items-center px-2">
                                <svg
                                    fill="#blue"
                                    width="16"
                                    height="16"
                                    xmlns="http://www.w3.org/2000/svg"
                                    viewBox="0 0 512 512">
                                    <path d="M416 208c0 45.9-14.9 88.3-40 122.7L502.6 457.4c12.5 12.5 12.5 32.8 0 45.3s-32.8 12.5-45.3 0L330.7 376c-34.4 25.2-76.8 40-122.7 40C93.1 416 0 322.9 0 208S93.1 0 208 0S416 93.1 416 208zM208 352a144 144 0 1 0 0-288 144 144 0 1 0 0 288z"></path>
                                </svg>
                            </div>
                        </div>

                        <select
                            className="p-2  bg-white activity-page-select-option w-full sm:w-auto"
                            value={cameraFilter || ""}
                            onChange={(e) => setCameraFilter(e.target.value)}
                        >
                            <option value="">All Camera Activity</option>
                            <option value="screenshot">Screenshot</option>
                            <option value="take_picture">Take Picture</option>
                            <option value="video">Record Video</option>
                        </select>
                    </div>

                    {/* RIGHT SIDE: DATE RANGE */}
                    <div className="flex flex-wrap gap-2 items-center w-full lg:w-2/4 justify-start lg:justify-end !pt-0">

                        <input
                            type="date"
                            value={fromDate}
                            onChange={(e) => setFromDate(e.target.value)}
                            className="border rounded p-2 activity-page-date-from w-full sm:w-auto"
                            title="From Date"
                        />

                        <span className="text-gray-500 hidden sm:inline">to</span>

                        <input
                            type="date"
                            value={toDate}
                            onChange={(e) => setToDate(e.target.value)}
                            className="border rounded p-2 activity-page-date-to w-full sm:w-auto"
                            title="To Date"
                        />

                        {(fromDate || toDate) && (
                            <button
                                type="button"
                                onClick={() => { setFromDate(""); setToDate(""); }}
                                className="px-3 py-2 border rounded bg-white hover:bg-gray-100 w-full sm:w-auto"
                            >
                                Clear
                            </button>
                        )}
                    </div>

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
                                {paginatedUsers.map((item, index) => (
                                    <tr key={item.userKey || index} className="hover:bg-gray-50">
                                        <td className="p-3">
                                            {(currentPage - 1) * ITEMS_PER_PAGE + index + 1}
                                        </td>
                                        <td className="p-3">{item.user}</td>
                                        <td className="p-3">{(item.latestActivity?.type || "-").replace("_", " ")}</td>
                                        <td className="p-3">{item.latestActivity?.deviceId || item.deviceId}</td>
                                        <td className="p-3">{item.latestActivity?.employeeId || item.employeeId}</td>
                                        <td className="p-3">{formatTimestamp(item.latestActivity?.timestamp)}</td>

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
                    {/* ================= PAGINATION CONTROLS (ADDED) ================= */}
                    <div className="flex flex-col sm:flex-row sm:justify-between sm:items-center gap-3 mt-4">

                        {/* LEFT TEXT */}
                        <p className="text-sm text-gray-600 text-center sm:text-left">
                            Showing {(currentPage - 1) * ITEMS_PER_PAGE + 1} –{" "}
                            {Math.min(currentPage * ITEMS_PER_PAGE, filteredUsers.length)} of{" "}
                            {filteredUsers.length}
                        </p>

                        {/* RIGHT CONTROLS */}
                        <div className="flex gap-2 items-center justify-center sm:justify-end">
                            <button
                                disabled={currentPage === 1}
                                onClick={() => setCurrentPage((p) => Math.max(p - 1, 1))}
                                className={`px-3 py-1 rounded border text-sm
        ${currentPage === 1
                                        ? "bg-gray-200 cursor-not-allowed"
                                        : "bg-white hover:bg-gray-100"
                                    }`}
                            >
                                Previous
                            </button>

                            <span className="px-3 py-1 font-semibold text-sm">
                                {currentPage} / {totalPages}
                            </span>

                            <button
                                disabled={currentPage === totalPages}
                                onClick={() => setCurrentPage((p) => Math.min(p + 1, totalPages))}
                                className={`px-3 py-1 rounded border text-sm
        ${currentPage === totalPages
                                        ? "bg-gray-200 cursor-not-allowed"
                                        : "bg-white hover:bg-gray-100"
                                    }`}
                            >
                                Next
                            </button>
                        </div>

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

                                <div
                                    className="flex flex-col lg:flex-row gap-3 lg:gap-5 py-1"
                                    style={{ alignItems: "center" }}
                                >
                                    {/* TITLE */}
                                    <h3 className="modal-section-title !m-0 text-center lg:text-left">
                                        Camera Activity
                                    </h3>

                                    {/* CAMERA TYPE DROPDOWN */}
                                    <div
                                        className="flex items-center gap-2"
                                        style={{
                                            padding: "8px 8px",
                                            border: "1px solid gray",
                                            borderRadius: "10px",
                                        }}
                                    >
                                        <label className="text-sm font-semibold text-gray-700 !m-0">
                                            Filter:
                                        </label>

                                        <select
                                            className="bg-white outline-none"
                                            value={modalCameraType}
                                            onChange={(e) => setModalCameraType(e.target.value)}
                                        >
                                            <option value="all">All</option>
                                            <option value="take_picture">Take Picture</option>
                                            <option value="screenshot">Screenshot</option>
                                            <option value="video">Video</option>
                                        </select>
                                    </div>
                                </div>


                                {modalCameraActs.length === 0 ? (
                                    <p className="text-gray-500 text-sm">
                                        No camera activity found for this filter.
                                    </p>
                                ) : (
                                    <div className="camera-grid">
                                        {modalCameraActs.map((act) => (
                                            <div key={act.id} className="camera-card">
                                                {act.media ? (
                                                    <img
                                                        src={act.media}
                                                        className="camera-img"
                                                        alt="camera activity"
                                                    />
                                                ) : (
                                                    <div className="camera-img camera-img--empty"></div>
                                                )}

                                                <p className="camera-type">
                                                    {(act.type || act.category || "-")
                                                        .replace("_", " ")
                                                        .toUpperCase()}
                                                </p>
                                                <p className="camera-time">
                                                    {formatTimestamp(act.timestamp)}
                                                </p>
                                            </div>
                                        ))}
                                    </div>
                                )}

                            </>
                        )}
                    </div>
                </div>
            )
            }

        </div >
    );
};

export default ActivityPage;
