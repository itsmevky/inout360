import React, { useEffect, useMemo, useState } from "react";
import { getData } from "../../Helpers/api";

const ITEMS_PER_PAGE = 20;

const WarningsPage = () => {
    const [violations, setViolations] = useState([]);
    const [loading, setLoading] = useState(true);

    const [search, setSearch] = useState("");
    const [fromDate, setFromDate] = useState("");
    const [toDate, setToDate] = useState("");

    const [currentPage, setCurrentPage] = useState(1);

    useEffect(() => {
        fetchViolations();
    }, []);

    const fetchViolations = async () => {
        try {
            const res = await getData("/activity/notifications?search=Working Hours Violation&limit=1000"); // Fetching more to filter locally for now or better pagination can be implemented
            if (res?.status && Array.isArray(res.data)) {
                // Filter strictly just in case search acts fuzzy
                const filtered = res.data.filter(v => v.activityType === "Working Hours Violation");
                setViolations(filtered);
            } else {
                setViolations([]);
            }
        } catch (error) {
            console.error("Failed to fetch violations", error);
            setViolations([]);
        } finally {
            setLoading(false);
        }
    };

    /* =======================
    🔍 FILTERS
    ======================= */
    const filteredViolations = useMemo(() => {
        let list = [...violations];

        // Search filter
        if (search.trim()) {
            list = list.filter((v) =>
                `${v.name} ${v.employeeId} ${v.deviceId} ${v.description}`
                    .toLowerCase()
                    .includes(search.toLowerCase())
            );
        }

        // Date filter
        if (fromDate || toDate) {
            const from = fromDate ? new Date(fromDate + "T00:00:00") : null;
            const to = toDate ? new Date(toDate + "T23:59:59") : null;

            list = list.filter((v) => {
                const created = new Date(v.occurredAt);
                if (from && created < from) return false;
                if (to && created > to) return false;
                return true;
            });
        }

        return list;
    }, [violations, search, fromDate, toDate]);

    /* =======================
    PAGINATION
    ======================= */
    const [selectedDate, setSelectedDate] = useState(null);

    /* =======================
    DATA GROUPING
    ======================= */
    // Group violations by date (YYYY-MM-DD for key, Date Object for sorting)
    const groupedViolations = useMemo(() => {
        const groups = {};
        filteredViolations.forEach((v) => {
            if (!v.occurredAt) return;
            // Use local date string for grouping
            const dateKey = new Date(v.occurredAt).toDateString();
            if (!groups[dateKey]) {
                groups[dateKey] = {
                    date: new Date(v.occurredAt),
                    dateString: dateKey,
                    count: 0,
                    items: []
                };
            }
            groups[dateKey].count += 1;
            groups[dateKey].items.push(v);
        });

        // Sort by date descending
        return Object.values(groups).sort((a, b) => b.date - a.date);
    }, [filteredViolations]);

    /* =======================
    PAGINATION (Only for detail view)
    ======================= */
    // If selectedDate is set, show pagination for that date's items
    // Otherwise show list of cards (no pagination on groups for now? or paginate groups?)
    // User asked for "show date on card and on view show list". 
    // Let's paginate the detail view.

    const detailViolations = useMemo(() => {
        if (!selectedDate) return [];
        return groupedViolations.find(g => g.dateString === selectedDate)?.items || [];
    }, [selectedDate, groupedViolations]);

    const totalPages = Math.ceil(detailViolations.length / ITEMS_PER_PAGE) || 1;

    const paginatedDetailViolations = useMemo(() => {
        const start = (currentPage - 1) * ITEMS_PER_PAGE;
        return detailViolations.slice(start, start + ITEMS_PER_PAGE);
    }, [detailViolations, currentPage]);

    const renderPaginationButtons = () => {
        const btns = [];
        const start = Math.max(currentPage - 2, 1);
        const end = Math.min(currentPage + 2, totalPages);
        const baseBtn =
            "w-10 h-10 text-sm font-semibold text-gray-700 rounded-full border border-gray-200 bg-white hover:bg-gray-50";
        const activeBtn =
            "bg-red-600 text-white border-red-600 shadow ring-2 ring-red-200 hover:bg-red-600";

        if (start > 1) {
            btns.push(
                <button
                    key={1}
                    onClick={() => setCurrentPage(1)}
                    className={baseBtn}
                >
                    1
                </button>
            );
            if (start > 2) btns.push(<span key="dots1">…</span>);
        }

        for (let i = start; i <= end; i += 1) {
            btns.push(
                <button
                    key={i}
                    onClick={() => setCurrentPage(i)}
                    className={`${baseBtn} ${i === currentPage ? activeBtn : ""}`}
                    style={
                        i === currentPage
                            ? {
                                backgroundColor: "#dc2626", // Red-600
                                color: "#ffffff",
                                borderColor: "#dc2626",
                                boxShadow: "0 0 0 3px rgba(220, 38, 38, 0.3)",
                            }
                            : { backgroundColor: "#ffffff", color: "#374151" }
                    }
                >
                    {i}
                </button>
            );
        }

        if (end < totalPages - 1) btns.push(<span key="dots2">…</span>);

        if (end < totalPages) {
            btns.push(
                <button
                    key={totalPages}
                    onClick={() => setCurrentPage(totalPages)}
                    className={baseBtn}
                >
                    {totalPages}
                </button>
            );
        }

        return btns;
    };


    useEffect(() => {
        setCurrentPage(1);
    }, [selectedDate, search, fromDate, toDate]);

    // Handle "Back" action
    const handleBack = () => {
        setSelectedDate(null);
        setSearch(""); // Reset search on back? Optional. Let's keep filters.
    };

    return (
        <div className="layout-section-dashboard p-4">

            {/* ===== HEADER ===== */}
            <div className="bg-white p-4 rounded-lg font-semibold text-xl flex items-center justify-between gap-2 shadow-sm border border-gray-100">
                <div className="flex items-center gap-2">
                    {selectedDate && (
                        <button
                            onClick={handleBack}
                            className="mr-2 text-gray-500 hover:text-gray-700 transition-colors"
                        >
                            <svg xmlns="http://www.w3.org/2000/svg" fill="none" viewBox="0 0 24 24" strokeWidth={2} stroke="currentColor" className="w-5 h-5">
                                <path strokeLinecap="round" strokeLinejoin="round" d="M10.5 19.5 3 12m0 0 7.5-7.5M3 12h18" />
                            </svg>
                        </button>
                    )}
                    <span className="text-red-500 flex items-center gap-2">
                        <svg xmlns="http://www.w3.org/2000/svg" fill="none" viewBox="0 0 24 24" strokeWidth={1.5} stroke="currentColor" className="w-6 h-6">
                            <path strokeLinecap="round" strokeLinejoin="round" d="M12 9v3.75m-9.303 3.376c-.866 1.5.217 3.374 1.948 3.374h14.71c1.73 0 2.813-1.874 1.948-3.374L13.949 3.378c-.866-1.5-3.032-1.5-3.898 0L2.697 16.126ZM12 15.75h.007v.008H12v-.008Z" />
                        </svg>
                        {selectedDate ? `Warnings - ${selectedDate}` : "Warnings"}
                    </span>
                    <span className="text-gray-500 text-base">
                        ({selectedDate ? detailViolations.length : filteredViolations.length})
                    </span>
                </div>
            </div>

            {/* ===== SEARCH + DATE FILTER (Keep visible or hide in detailed view? Keep visible) ===== */}
            {!selectedDate && (
                <div className="bg-white p-4 mt-5 rounded-lg flex flex-col lg:flex-row gap-4 lg:items-center lg:justify-between shadow-sm border border-gray-100">
                    {/* 🔍 SEARCH */}
                    <div className="w-full lg:max-w-[400px]">
                        <input
                            type="text"
                            placeholder="Search name / ID / device / date..."
                            value={search}
                            onChange={(e) => setSearch(e.target.value)}
                            className="border rounded py-2 px-3 w-full focus:outline-none focus:ring-2 focus:ring-red-100 focus:border-red-400"
                        />
                    </div>

                    {/* 📅 DATE FILTER */}
                    <div className="flex flex-col sm:flex-row gap-3 items-start sm:items-center w-full lg:w-auto">
                        <input
                            type="date"
                            value={fromDate}
                            onChange={(e) => setFromDate(e.target.value)}
                            className="border rounded p-2 w-full sm:w-auto"
                        />
                        <span className="text-gray-500 hidden sm:inline">to</span>
                        <input
                            type="date"
                            value={toDate}
                            onChange={(e) => setToDate(e.target.value)}
                            className="border rounded p-2 w-full sm:w-auto"
                        />
                        {(fromDate || toDate) && (
                            <button
                                onClick={() => {
                                    setFromDate("");
                                    setToDate("");
                                }}
                                className="px-4 py-2 border rounded bg-gray-100 hover:bg-gray-200 w-full sm:w-auto text-sm"
                            >
                                Clear
                            </button>
                        )}
                    </div>
                </div>
            )}


            {/* ===== CONTENT AREA ===== */}
            <div className="mt-5">
                {loading ? (
                    <div className="p-8 text-center text-gray-500 bg-white rounded-lg shadow-sm">Loading violations...</div>
                ) : !selectedDate ? (
                    /* ================= GRID VIEW OF DATES ================= */
                    <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-3 xl:grid-cols-4 gap-4">
                        {groupedViolations.length === 0 ? (
                            <div className="col-span-full p-8 text-center text-gray-500 bg-white rounded-lg shadow-sm border border-gray-200">
                                No working hours violations found.
                            </div>
                        ) : (
                            groupedViolations.map((group) => (
                                <div key={group.dateString} className="bg-white rounded-lg shadow-sm border border-gray-200 p-5 hover:shadow-md transition-shadow relative overflow-hidden group">
                                    {/* Red accent bar on left */}
                                    <div className="absolute left-0 top-0 bottom-0 w-1 bg-red-500"></div>

                                    <div className="flex justify-between items-start">
                                        <div>
                                            <p className="text-gray-500 text-xs uppercase font-bold tracking-wider mb-1">Date</p>
                                            <h3 className="text-lg font-semibold text-gray-800">{group.dateString}</h3>
                                        </div>
                                        <div className="bg-red-50 text-red-600 px-2 py-1 rounded text-xs font-semibold border border-red-100">
                                            {group.count} Violations
                                        </div>
                                    </div>

                                    <div className="mt-4 pt-4 border-t border-gray-100 flex justify-between items-center">
                                        <div className="flex -space-x-2 overflow-hidden">
                                            {/* Avatar preview logic could go here if images were available */}
                                            {group.items.slice(0, 3).map((item, idx) => (
                                                <div key={idx} className="inline-block h-6 w-6 rounded-full ring-2 ring-white bg-gray-200 flex items-center justify-center text-[10px] text-gray-600 font-bold" title={item.name}>
                                                    {item.name ? item.name.charAt(0).toUpperCase() : "?"}
                                                </div>
                                            ))}
                                            {group.count > 3 && (
                                                <div className="inline-block h-6 w-6 rounded-full ring-2 ring-white bg-gray-100 flex items-center justify-center text-[10px] text-gray-500">
                                                    +{group.count - 3}
                                                </div>
                                            )}
                                        </div>

                                        <button
                                            onClick={() => setSelectedDate(group.dateString)}
                                            className="text-blue-600 hover:text-blue-800 text-sm font-medium flex items-center gap-1 group-hover:underline"
                                        >
                                            View
                                            <svg xmlns="http://www.w3.org/2000/svg" viewBox="0 0 20 20" fill="currentColor" className="w-4 h-4">
                                                <path fillRule="evenodd" d="M7.21 14.77a.75.75 0 01.02-1.06L11.168 10 7.23 6.29a.75.75 0 111.04-1.08l4.5 4.25a.75.75 0 010 1.08l-4.5 4.25a.75.75 0 01-1.06-.02z" clipRule="evenodd" />
                                            </svg>
                                        </button>
                                    </div>
                                </div>
                            ))
                        )}
                    </div>
                ) : (
                    /* ================= DETAIL TABLE VIEW ================= */
                    <div className="bg-white rounded-lg shadow-sm border border-gray-200 overflow-hidden">

                        {/* ================= DESKTOP TABLE ================= */}
                        <div className="hidden md:block overflow-x-auto">
                            <table className="w-full border-collapse">
                                <thead className="bg-gray-50 border-b border-gray-200">
                                    <tr className="text-left text-xs font-semibold text-gray-500 uppercase tracking-wider">
                                        <th className="p-4">#</th>
                                        <th className="p-4">Time</th>
                                        <th className="p-4">User / Employee</th>
                                        <th className="p-4">Device ID</th>
                                        <th className="p-4">Description</th>
                                    </tr>
                                </thead>

                                <tbody className="divide-y divide-gray-200">
                                    {paginatedDetailViolations.map((v, i) => (
                                        <tr key={v._id || i} className="hover:bg-gray-50">
                                            <td className="p-4 text-sm text-gray-500">
                                                {(currentPage - 1) * ITEMS_PER_PAGE + i + 1}
                                            </td>
                                            <td className="p-4 text-sm text-gray-900 font-medium">
                                                {v.occurredAt ? new Date(v.occurredAt).toLocaleTimeString([], { hour: '2-digit', minute: '2-digit' }) : "-"}
                                            </td>
                                            <td className="p-4 text-sm text-gray-700">
                                                <div className="font-medium text-gray-900">{v.name || "Unknown"}</div>
                                                <div className="text-xs text-gray-500">{v.employeeId || ""}</div>
                                            </td>
                                            <td className="p-4 text-sm text-gray-500 font-mono text-xs">
                                                {v.deviceId || "-"}
                                            </td>
                                            <td className="p-4 text-sm text-gray-600">
                                                {v.description || v.narrative || "-"}
                                            </td>
                                        </tr>
                                    ))}
                                </tbody>
                            </table>
                        </div>

                        {/* ================= MOBILE / TABLET CARDS ================= */}
                        <div className="md:hidden p-4 space-y-4 bg-gray-50">
                            {paginatedDetailViolations.map((v, i) => (
                                <div
                                    key={v._id || i}
                                    className="bg-white border rounded-lg p-4 shadow-sm"
                                >
                                    <div className="flex justify-between items-center mb-3 border-b pb-2">
                                        <span className="text-xs font-bold text-gray-400">
                                            #{(currentPage - 1) * ITEMS_PER_PAGE + i + 1}
                                        </span>
                                        <span className="text-xs text-gray-500">
                                            {v.occurredAt ? new Date(v.occurredAt).toLocaleTimeString() : "-"}
                                        </span>
                                    </div>

                                    <div className="space-y-2 text-sm">
                                        <div className="flex justify-between">
                                            <span className="text-gray-500">User:</span>
                                            <span className="font-medium">{v.name || "Unknown"}</span>
                                        </div>
                                        {v.employeeId && (
                                            <div className="flex justify-between">
                                                <span className="text-gray-500">ID:</span>
                                                <span>{v.employeeId}</span>
                                            </div>
                                        )}
                                        <div className="flex justify-between">
                                            <span className="text-gray-500">Device:</span>
                                            <span className="font-mono text-xs">{v.deviceId || "-"}</span>
                                        </div>
                                        <div className="mt-2 pt-2 border-t text-gray-700">
                                            {v.description || v.narrative}
                                        </div>
                                    </div>
                                </div>
                            ))}
                        </div>

                        {/* ================= PAGINATION ================= */}
                        {detailViolations.length > 0 && (
                            <div className="flex flex-col sm:flex-row justify-between items-center gap-4 p-4 border-t border-gray-100">
                                <p className="text-sm text-gray-500">
                                    Showing {(currentPage - 1) * ITEMS_PER_PAGE + 1} –{" "}
                                    {Math.min(currentPage * ITEMS_PER_PAGE, detailViolations.length)} of{" "}
                                    {detailViolations.length}
                                </p>

                                <div className="flex items-center gap-2">
                                    <button
                                        onClick={() => setCurrentPage((p) => Math.max(1, p - 1))}
                                        disabled={currentPage === 1}
                                        className="w-9 h-9 flex items-center justify-center rounded-full border bg-white hover:bg-gray-50 disabled:opacity-50"
                                    >
                                        ‹
                                    </button>

                                    <div className="flex gap-1">
                                        {renderPaginationButtons()}
                                    </div>

                                    <button
                                        onClick={() => setCurrentPage((p) => Math.min(totalPages, p + 1))}
                                        disabled={currentPage === totalPages}
                                        className="w-9 h-9 flex items-center justify-center rounded-full border bg-white hover:bg-gray-50 disabled:opacity-50"
                                    >
                                        ›
                                    </button>
                                </div>
                            </div>
                        )}
                    </div>
                )}
            </div>
        </div>
    );
};

export default WarningsPage;
