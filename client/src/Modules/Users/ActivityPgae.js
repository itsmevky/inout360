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
        app_access: 0,
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

    const isToday = (dateValue) => {
        if (!dateValue) return false;
        const d = new Date(dateValue);
        if (Number.isNaN(d.getTime())) return false;

        const now = new Date();
        return (
            d.getDate() === now.getDate() &&
            d.getMonth() === now.getMonth() &&
            d.getFullYear() === now.getFullYear()
        );
    };
    // ============================================================
    // COUNTS
    // ============================================================
    const counts = {
        cameraTotal: summary.camera || 0,
        access: summary.app_access || 0,
        install: summary.app_install || 0,
        uninstall: summary.app_uninstall || 0,
    };


    const todayCounts = useMemo(() => {
        const cameraTypes = ["screenshot", "take_picture", "video"];

        let cameraToday = 0;
        let accessToday = 0;
        let installToday = 0;
        let uninstallToday = 0;

        for (const group of activityGroups) {
            const acts = group.activities || [];
            for (const a of acts) {
                if (!isToday(a.timestamp)) continue;

                const t = a.type || a.category || "";

                if (cameraTypes.includes(t) || a.category === "camera") cameraToday++;
                if (a.category === "app_access") accessToday++;
                if (a.category === "app_install") installToday++;
                if (a.category === "app_uninstall") uninstallToday++;
            }
        }

        return {
            cameraToday,
            accessToday,
            installToday,
            uninstallToday,
        };
    }, [activityGroups]);

    const [selectedType, setSelectedType] = useState(null);
    const [cameraFilter, setCameraFilter] = useState(null);
    const [modalUser, setModalUser] = useState(null);
    const [selectedActivity, setSelectedActivity] = useState(null);
    const [mediaModalActivity, setMediaModalActivity] = useState(null);
    const [modalFromDate, setModalFromDate] = useState("");
    const [modalToDate, setModalToDate] = useState("");
    const [modalTypeFilter, setModalTypeFilter] = useState("");
    const [modalContextType, setModalContextType] = useState(null);


    // ============================================================
    // PAGINATION STATE (ADDED)
    // ============================================================
    const ITEMS_PER_PAGE = 15;
    const [currentPage, setCurrentPage] = useState(1);
    const MODAL_ITEMS_PER_PAGE = 8;
    const [modalPage, setModalPage] = useState(1);

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
    const modalActivities = useMemo(() => {
        if (!modalUser) return [];
        let list = [...(modalUser.activities || [])];
        if (modalFromDate || modalToDate) {
            const from = modalFromDate ? new Date(`${modalFromDate}T00:00:00`) : null;
            const to = modalToDate ? new Date(`${modalToDate}T23:59:59`) : null;
            list = list.filter((a) => {
                const t = a.timestamp ? new Date(a.timestamp) : null;
                if (!t || Number.isNaN(t.getTime())) return false;
                if (from && t < from) return false;
                if (to && t > to) return false;
                return true;
            });
        }
        if (modalContextType === "camera_activity") {
            const cameraTypes = ["screenshot", "take_picture", "video"];
            list = list.filter((a) => {
                const type = String(a.type || a.category || "").toLowerCase();
                if (modalTypeFilter) return type === modalTypeFilter;
                return cameraTypes.includes(type) || a.category === "camera";
            });
        } else if (modalContextType === "app_access") {
            list = list.filter((a) => a.category === "app_access");
        } else if (modalContextType === "app_install_uninstall") {
            list = list.filter(
                (a) => a.category === "app_install" || a.category === "app_uninstall"
            );
        } else if (modalTypeFilter) {
            list = list.filter((a) => {
                const type = String(a.type || a.category || "").toLowerCase();
                return type === modalTypeFilter;
            });
        }
        return list.sort((a, b) => {
            const ta = new Date(a.timestamp || 0).getTime();
            const tb = new Date(b.timestamp || 0).getTime();
            return tb - ta;
        });
    }, [modalUser, modalFromDate, modalToDate, modalTypeFilter, modalContextType]);
    useEffect(() => {
        setModalPage(1);
    }, [modalActivities]);
    const modalPolicyCounts = useMemo(() => {
        const acts = modalActivities || [];
        const today = acts.reduce((count, activity) => {
            if (isToday(activity.timestamp)) return count + 1;
            return count;
        }, 0);
        return { total: acts.length, today };
    }, [modalActivities]);
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
            if (selectedType === "app_access") {
                return activities.some((a) => a.category === "app_access");
            }
            if (selectedType === "app_install_uninstall") {
                return activities.some(
                    (a) => a.category === "app_install" || a.category === "app_uninstall"
                );
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
            } else if (selectedType === "app_access") {
                relevant = activities.filter((a) => a.category === "app_access");
            } else if (selectedType === "app_install_uninstall") {
                relevant = activities.filter(
                    (a) => a.category === "app_install" || a.category === "app_uninstall"
                );
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
    const modalTotalPages =
        Math.ceil(modalActivities.length / MODAL_ITEMS_PER_PAGE) || 1;

    const paginatedUsers = useMemo(() => {
        const startIndex = (currentPage - 1) * ITEMS_PER_PAGE;
        const endIndex = startIndex + ITEMS_PER_PAGE;
        return filteredUsers.slice(startIndex, endIndex);
    }, [filteredUsers, currentPage]);
    const paginatedModalActivities = useMemo(() => {
        const startIndex = (modalPage - 1) * MODAL_ITEMS_PER_PAGE;
        const endIndex = startIndex + MODAL_ITEMS_PER_PAGE;
        return modalActivities.slice(startIndex, endIndex);
    }, [modalActivities, modalPage]);

    const uniqueUsersCount = useMemo(() => filteredUsers.length, [filteredUsers]);
    // ============================================================
    // MODAL OPEN
    // ============================================================
    const openModal = (record) => {
        setSelectedActivity(null);
        setMediaModalActivity(null);
        setModalFromDate("");
        setModalToDate("");
        setModalTypeFilter("");
        setModalContextType(selectedType || null);
        setModalPage(1);
        setModalUser({
            user: record.user,
            activities: record.activities || [],
        });
    };



    const closeModal = () => {
        setModalUser(null);
        setSelectedActivity(null);
        setMediaModalActivity(null);
        setModalFromDate("");
        setModalToDate("");
        setModalTypeFilter("");
        setModalContextType(null);
        setModalPage(1);
    };

    // ============================================================
    // CARD CONFIG
    // ============================================================
    const cardConfig = [
        {
            title: "Cam Activity",
            type: "camera_activity",
            count: counts.cameraTotal,
            today: todayCounts.cameraToday,
        },
        {
            title: "App Accessed",
            type: "app_access",
            count: counts.access,
            today: todayCounts.accessToday,
        },
        {
            title: "App Install / Uninstall / Accessibility Permission",
            type: "app_install_uninstall",
            count: counts.install + counts.uninstall,
            today: todayCounts.installToday + todayCounts.uninstallToday,
        },
    ];

    const formatTimestamp = (value) => {
        if (!value) return "-";
        const date = new Date(value);
        if (Number.isNaN(date.getTime())) return value;
        return date.toLocaleString();
    };

    const resolveMediaType = (activity) => {
        const type = String(activity?.type || activity?.category || "").toLowerCase();
        const url = String(activity?.media || "").toLowerCase();
        if (type === "video") return "video";
        if (/\.(mp4|webm|ogg|mov)$/i.test(url)) return "video";
        if (type === "screenshot" || type === "take_picture") return "image";
        if (/\.(png|jpe?g|gif|webp|bmp)$/i.test(url)) return "image";
        return activity?.media ? "image" : "none";
    };

    const isAccessibilityEvent = (activity) => {
        const value = String(activity?.type || activity?.category || "").toLowerCase();
        return value.includes("accessibility");
    };

    const formatActivityLabel = (activity) => {
        const raw = String(activity?.type || activity?.category || "-").replace("_", " ");
        if (String(activity?.category || "").toLowerCase() === "app_access") {
            return `${raw} accessed`;
        }
        return raw;
    };

    const renderPaginationButtons = (current, total, onChange) => {
        const btns = [];
        const start = Math.max(current - 2, 1);
        const end = Math.min(current + 2, total);
        const baseBtn =
            "w-10 h-10 text-sm font-semibold text-gray-700 rounded-full border border-gray-200 bg-white hover:bg-gray-50";
        const activeBtn =
            "bg-blue-600 text-white border-blue-600 shadow ring-2 ring-blue-200 hover:bg-blue-600";

        if (start > 1) {
            btns.push(
                <button key={1} onClick={() => onChange(1)} className={baseBtn}>
                    1
                </button>
            );
            if (start > 2) btns.push(<span key="dots1">…</span>);
        }

        for (let i = start; i <= end; i += 1) {
            btns.push(
                <button
                    key={i}
                    onClick={() => onChange(i)}
                    className={`${baseBtn} ${i === current ? activeBtn : ""}`}
                    style={
                        i === current
                            ? {
                                backgroundColor: "#2563eb",
                                color: "#ffffff",
                                borderColor: "#2563eb",
                                boxShadow: "0 0 0 3px rgba(59, 130, 246, 0.3)",
                            }
                            : { backgroundColor: "#ffffff", color: "#374151" }
                    }
                >
                    {i}
                </button>
            );
        }

        if (end < total - 1) btns.push(<span key="dots2">…</span>);

        if (end < total) {
            btns.push(
                <button
                    key={total}
                    onClick={() => onChange(total)}
                    className={baseBtn}
                >
                    {total}
                </button>
            );
        }

        return btns;
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
                            item.imagePath ||
                            item.mediaUrl ||
                            item.media?.[0]?.url ||
                            item.metadata?.mediaUrl ||
                            item.metadata?.media ||
                            item.metadata?.imagePath ||
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

                            <h2
                                className={`text-2xl font-bold mt-2 ${isActive ? "text-[#018DD4]" : "text-black"
                                    }`}
                            >
                                {item.count}
                                <span className="text-base font-semibold text-gray-500">
                                    {" "} / {item.today} Today
                                </span>
                            </h2>

                            <p className="text-gray-500 text-sm">
                                {item.count} activities detected
                            </p>
                        </div>
                    );
                })}
            </div>

            {/* ================= CAMERA FILTER ================= */}
            {selectedType === "camera_activity" && (
                <div className="mt-6 flex flex-col lg:flex-row gap-4 items-start lg:items-center justify-between activity-page-searchbar-dropdown">

                    {/* LEFT SIDE: SEARCH + CAMERA FILTER */}
                    <div className="flex flex-col sm:flex-row gap-3 !pt-0 items-stretch sm:items-center w-full lg:w-2/4">

                        <div className="input-search-bar-activity-page flex w-full sm:w-2/4 md:w-2/4 !m-0">
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
                                : selectedType === "app_access"
                                    ? "APP ACCESSED"
                                    : selectedType === "app_install_uninstall"
                                        ? "APP INSTALL / UNINSTALL / ACCESSIBILITY PERMISSION"
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
                                        <td className="p-3">{formatActivityLabel(item.latestActivity)}</td>
                                        <td className="p-3">{item.latestActivity?.deviceId || item.deviceId}</td>
                                        <td className="p-3">{item.latestActivity?.employeeId || item.employeeId}</td>
                                        <td className="p-3">{formatTimestamp(item.latestActivity?.timestamp)}</td>

                                        <td className="p-3">
                                            <div className="flex items-center gap-3 !p-0 !m-0">

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
                    {/* ================= PAGINATION CONTROLS ================= */}
                    <div className="flex flex-col sm:flex-row sm:justify-between sm:items-center gap-4 mt-4">

                        {/* LEFT TEXT */}
                        <p className="text-sm text-gray-600 text-center sm:text-left">
                            Showing {(currentPage - 1) * ITEMS_PER_PAGE + 1} –{" "}
                            {Math.min(currentPage * ITEMS_PER_PAGE, filteredUsers.length)} of{" "}
                            {filteredUsers.length}
                        </p>

                        {/* RIGHT CONTROLS */}
                        <div className="flex items-center gap-2 justify-center w-full overflow-x-auto sm:overflow-visible">
                            <button
                                disabled={currentPage === 1}
                                onClick={() => setCurrentPage((p) => Math.max(p - 1, 1))}
                                className="w-12 h-12 text-2xl rounded-full border border-gray-200 bg-white hover:bg-gray-50 disabled:opacity-50"
                                aria-label="Previous page"
                            >
                                ‹
                            </button>

                            <div className="flex flex-nowrap gap-2">
                                {renderPaginationButtons(currentPage, totalPages, setCurrentPage)}
                            </div>

                            <button
                                disabled={currentPage === totalPages}
                                onClick={() => setCurrentPage((p) => Math.min(p + 1, totalPages))}
                                className="w-12 h-12 text-2xl rounded-full border border-gray-200 bg-white hover:bg-gray-50 disabled:opacity-50"
                                aria-label="Next page"
                            >
                                ›
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

                        <div className="modal-header modal-header--compact">
                            <h2 className="modal-user-name">Name: {modalUser.user}</h2>
                            <p className="modal-meta">
                                Employee ID: {modalUser.activities[0]?.employeeId}
                            </p>
                            <p className="modal-meta">
                                Device ID: {modalUser.activities[0]?.deviceId}
                            </p>
                        </div>

                        <div className="mt-4">
                            <div className="activity-card p-4 rounded-xl border-l-4 bg-[#018DD4]/15 border-[#018DD4] max-w-sm">
                                <p className="activity-card-title font-semibold text-lg text-black">
                                    Policy Voilation Count
                                </p>
                                <h2 className="text-2xl font-bold mt-2 text-[#018DD4]">
                                    {modalPolicyCounts.total}
                                    <span className="text-base font-semibold text-gray-500">
                                        {" "} / {modalPolicyCounts.today} Today
                                    </span>
                                </h2>
                                <p className="text-gray-500 text-sm">
                                    {modalPolicyCounts.total} activities detected
                                </p>
                            </div>
                        </div>

                        <div className="modal-activity-filters modal-activity-filters--compact">
                            <h3 className="modal-section-title !m-0">User Activities</h3>
                            <div className="modal-activity-controls">
                                {modalContextType === "camera_activity" && modalUser?.activities?.some((a) => {
                                    const type = String(a.type || a.category || "").toLowerCase();
                                    return ["screenshot", "take_picture", "video"].includes(type);
                                }) ? (
                                    <select
                                        className="p-2 bg-white activity-page-select-option modal-filter-input"
                                        value={modalTypeFilter}
                                        onChange={(e) => setModalTypeFilter(e.target.value)}
                                    >
                                        <option value="">All Camera Activity</option>
                                        <option value="screenshot">Screenshot</option>
                                        <option value="take_picture">Take Picture</option>
                                        <option value="video">Video</option>
                                    </select>
                                ) : null}
                                <input
                                    type="date"
                                    className="border rounded p-2 activity-page-date-from modal-filter-input"
                                    value={modalFromDate}
                                    onChange={(e) => setModalFromDate(e.target.value)}
                                />
                                <input
                                    type="date"
                                    className="border rounded p-2 activity-page-date-to modal-filter-input"
                                    value={modalToDate}
                                    onChange={(e) => setModalToDate(e.target.value)}
                                />
                                {(modalFromDate || modalToDate) && (
                                    <button
                                        type="button"
                                        onClick={() => {
                                            setModalFromDate("");
                                            setModalToDate("");
                                        }}
                                        className="modal-filter-clear"
                                    >
                                        Clear
                                    </button>
                                )}
                            </div>
                        </div>

                        {modalActivities.length === 0 ? (
                            <p className="text-gray-500 text-sm">No activity found for this user.</p>
                        ) : (
                            <div className="activity-table-scroll">
                                <table className="w-full border-collapse activity-table">
                                    <thead>
                                        <tr className="bg-gray-100 text-left text-gray-700">
                                            <th className="p-3">Activity</th>
                                            <th className="p-3">Device ID</th>
                                            <th className="p-3">Time</th>
                                            <th className="p-3">Action</th>
                                        </tr>
                                    </thead>
                                    <tbody>
                                        {paginatedModalActivities.map((act, index) => (
                                            <tr key={act.id || `${act.type}-${index}`} className="hover:bg-gray-50">
                                                <td className="p-3">
                                                    {isAccessibilityEvent(act)
                                                        ? `${modalUser?.user || "User"} has turned off the accessibility settings of app`
                                                        : formatActivityLabel(act)}
                                                </td>
                                                <td className="p-3">{act.deviceId || "-"}</td>
                                                <td className="p-3">{formatTimestamp(act.timestamp)}</td>
                                                <td className="p-3">
                                                    <button
                                                        onClick={() => {
                                                            setSelectedActivity(act);
                                                            const type = String(act.type || act.category || "").toLowerCase();
                                                            if (["app_access", "app_uninstall"].includes(type)) {
                                                                setMediaModalActivity({
                                                                    ...act,
                                                                    media: "",
                                                                    mediaTypeOverride: "none",
                                                                });
                                                            } else {
                                                                setMediaModalActivity(act);
                                                            }
                                                        }}
                                                        className="w-9 h-9 flex items-center justify-center rounded-lg bg-gray-100 hover:bg-gray-200"
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
                                                </td>
                                            </tr>
                                        ))}
                                    </tbody>
                                </table>
                            </div>
                        )}
                        {modalActivities.length > 0 ? (
                            <div className="flex flex-col sm:flex-row sm:justify-between sm:items-center gap-3 mt-4">
                                <p className="text-sm text-gray-600">
                                    Showing {(modalPage - 1) * MODAL_ITEMS_PER_PAGE + 1} –{" "}
                                    {Math.min(
                                        modalPage * MODAL_ITEMS_PER_PAGE,
                                        modalActivities.length
                                    )}{" "}
                                    of {modalActivities.length}
                                </p>
                                <div className="flex items-center gap-2 justify-center w-full overflow-x-auto sm:overflow-visible">
                                    <button
                                        disabled={modalPage === 1}
                                        onClick={() => setModalPage((p) => Math.max(p - 1, 1))}
                                        className="w-12 h-12 text-2xl rounded-full border border-gray-200 bg-white hover:bg-gray-50 disabled:opacity-50"
                                        aria-label="Previous page"
                                    >
                                        ‹
                                    </button>
                                    <div className="flex flex-nowrap gap-2">
                                        {renderPaginationButtons(
                                            modalPage,
                                            modalTotalPages,
                                            setModalPage
                                        )}
                                    </div>
                                    <button
                                        disabled={modalPage === modalTotalPages}
                                        onClick={() =>
                                            setModalPage((p) =>
                                                Math.min(p + 1, modalTotalPages)
                                            )
                                        }
                                        className="w-12 h-12 text-2xl rounded-full border border-gray-200 bg-white hover:bg-gray-50 disabled:opacity-50"
                                        aria-label="Next page"
                                    >
                                        ›
                                    </button>
                                </div>
                            </div>
                        ) : null}
                    </div>
                </div>
            )
            }

            {mediaModalActivity && (
                <div className="modal-overlay">
                    <div className="modal-container modal-container--media">
                        <button
                            onClick={() => setMediaModalActivity(null)}
                            className="modal-close-btn"
                        >
                            ✕
                        </button>
                        <div className="modal-header">
                            <h2 className="modal-user-name">
                                {(mediaModalActivity.type || mediaModalActivity.category || "-")
                                    .replace("_", " ")
                                    .toUpperCase()}
                            </h2>
                            <p className="modal-meta">
                                {formatTimestamp(mediaModalActivity.timestamp)}
                            </p>
                        </div>
                        <div className="mt-2">
                            {String(mediaModalActivity.category || mediaModalActivity.type || "").toLowerCase() === "app_access" ? (
                                <div className="text-sm text-gray-700">
                                    {`${(mediaModalActivity.appName || mediaModalActivity.type || "App").replace("_", " ")} accessed by ${mediaModalActivity.name || "user"}`}
                                </div>
                            ) : String(mediaModalActivity.type || mediaModalActivity.category || "").toLowerCase() === "app_uninstall" ? (
                                <div className="text-sm text-gray-700 space-y-2">
                                    <div><strong>Event:</strong> {(mediaModalActivity.type || mediaModalActivity.category || "-").replace("_", " ")}</div>
                                    <div><strong>App:</strong> {mediaModalActivity.appName || "-"}</div>
                                    <div><strong>Device ID:</strong> {mediaModalActivity.deviceId || "-"}</div>
                                    <div><strong>Employee ID:</strong> {mediaModalActivity.employeeId || "-"}</div>
                                </div>
                            ) : resolveMediaType(mediaModalActivity) === "video" ? (
                                <video
                                    src={mediaModalActivity.media}
                                    controls
                                    className="w-full rounded-lg"
                                />
                            ) : resolveMediaType(mediaModalActivity) === "image" ? (
                                <img
                                    src={mediaModalActivity.media}
                                    alt="activity media"
                                    className="w-full rounded-lg"
                                />
                            ) : (
                                <div className="text-sm text-gray-500">No media available.</div>
                            )}
                        </div>
                    </div>
                </div>
            )}

        </div >
    );
};

export default ActivityPage;
