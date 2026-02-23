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
                const d = new Date(v.occurredAt);
                groups[dateKey] = {
                    date: d,
                    dateString: dateKey,
                    day: d.toLocaleDateString('en-US', { weekday: 'short' }),
                    month: d.toLocaleDateString('en-US', { month: 'short' }),
                    dayNum: d.getDate(),
                    year: d.getFullYear(),
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

    const dateGroups = groupedViolations;

    // Determine what to paginate based on view
    const itemsToPaginate = useMemo(() => {
        if (!selectedDate) return dateGroups;
        return dateGroups.find(g => g.dateString === selectedDate)?.items || [];
    }, [selectedDate, dateGroups]);

    const totalPages = Math.ceil(itemsToPaginate.length / ITEMS_PER_PAGE) || 1;

    const paginatedItems = useMemo(() => {
        const start = (currentPage - 1) * ITEMS_PER_PAGE;
        return itemsToPaginate.slice(start, start + ITEMS_PER_PAGE);
    }, [itemsToPaginate, currentPage]);

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

    const handleBack = () => {
        setSelectedDate(null);
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
                        {selectedDate ? `Warnings - ${selectedDate}` : "Warnings Summary"}
                    </span>
                    <span className="text-gray-500 text-base">
                        ({selectedDate ? itemsToPaginate.length : dateGroups.length})
                    </span>
                </div>
            </div>

            {/* ===== SEARCH + DATE FILTER ===== */}
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


            {/* ===== CONTENT AREA ===== */}
            <div className="mt-5">
                {loading ? (
                    <div className="p-8 text-center text-gray-500 bg-white rounded-lg shadow-sm">Loading violations...</div>
                ) : (
                    <div className="bg-white rounded-lg shadow-sm border border-gray-200 overflow-hidden">

                        {/* ================= DESKTOP TABLE ================= */}
                        <div className="hidden md:block overflow-x-auto">
                            <table className="w-full border-collapse">
                                <thead className="bg-[#1e293b] text-white">
                                    {!selectedDate ? (
                                        <tr className="text-left text-xs font-semibold uppercase tracking-wider divide-x divide-slate-700">
                                            <th className="p-4 border-r border-slate-700">Sr.No</th>
                                            <th className="p-4 border-r border-slate-700">Date Entry</th>
                                            <th className="p-4 border-r border-slate-700">Total No. of Records</th>
                                            <th className="p-4">ACTION</th>
                                        </tr>
                                    ) : (
                                        <tr className="text-left text-xs font-semibold uppercase tracking-wider divide-x divide-slate-700">
                                            <th className="p-4 border-r border-slate-700">Sr.No</th>
                                            <th className="p-4 border-r border-slate-700">User</th>
                                            <th className="p-4 border-r border-slate-700">Activity</th>
                                            <th className="p-4 border-r border-slate-700">Device ID</th>
                                            <th className="p-4 border-r border-slate-700">Employee ID</th>
                                            <th className="p-4">Time</th>
                                        </tr>
                                    )}
                                </thead>

                                <tbody className="divide-y divide-gray-100 italic-none">
                                    {paginatedItems.length === 0 ? (
                                        <tr>
                                            <td colSpan={!selectedDate ? 4 : 6} className="p-8 text-center text-gray-500">No warnings found.</td>
                                        </tr>
                                    ) : !selectedDate ? (
                                        /* Level 1: Summary Table */
                                        paginatedItems.map((group, i) => (
                                            <tr key={group.dateString} className="hover:bg-slate-50 transition-colors group divide-x divide-gray-100">
                                                <td className="px-4 py-3 text-sm font-bold text-slate-700 border-r border-gray-100">
                                                    {(currentPage - 1) * ITEMS_PER_PAGE + i + 1}
                                                </td>
                                                <td className="px-4 py-3 border-r border-gray-100 font-bold text-slate-900">
                                                    {group.dateString}
                                                </td>
                                                <td className="px-4 py-3 border-r border-gray-100 text-sm font-semibold text-slate-700 text-center">
                                                    <span className="bg-red-50 text-red-600 px-3 py-1 rounded-full border border-red-100">{group.count} Records</span>
                                                </td>
                                                <td className="px-4 py-3 text-center">
                                                    <button
                                                        onClick={() => setSelectedDate(group.dateString)}
                                                        className="p-2 bg-[#f8f9fa] hover:bg-gray-200 rounded-md text-slate-800 border border-gray-200 shadow-sm transition-all"
                                                        title="View Details"
                                                    >
                                                        <svg width={22} height={22} xmlns="http://www.w3.org/2000/svg" viewBox="0 0 576 512" fill="currentColor">
                                                            <path d="M288 32c-80.8 0-145.5 36.8-192.6 80.6-46.8 43.5-78.1 95.4-93 131.1-3.3 7.9-3.3 16.7 0 24.6 14.9 35.7 46.2 87.7 93 131.1 47.1 43.7 111.8 80.6 192.6 80.6s145.5-36.8 192.6-80.6c46.8-43.5 78.1-95.4 93-131.1 3.3-7.9 3.3-16.7 0-24.6-14.9-35.7-46.2-87.7-93-131.1-47.1-43.7-111.8-80.6-192.6-80.6zM144 256a144 144 0 1 1 288 0 144 144 0 1 1 -288 0zm144-64c0 35.3-28.7 64-64 64-11.5 0-22.3-3-31.7-8.4-1 10.9-.1 22.1 2.9 33.2 13.7 51.2 66.4 81.6 117.6 67.9s81.6-66.4 67.9-117.6c-12.2-45.7-55.5-74.8-101.1-70.8 5.3 9.3 8.4 20.1 8.4 31.7z" />
                                                        </svg>
                                                    </button>
                                                </td>
                                            </tr>
                                        ))
                                    ) : (
                                        /* Level 2: Detail Table */
                                        paginatedItems.map((v, i) => (
                                            <tr key={v._id || i} className="hover:bg-slate-50 transition-colors group divide-x divide-gray-100">
                                                <td className="px-4 py-3 text-sm font-bold text-slate-700 border-r border-gray-100">
                                                    {(currentPage - 1) * ITEMS_PER_PAGE + i + 1}
                                                </td>
                                                <td className="px-4 py-3 border-r border-gray-100">
                                                    <div className="font-bold text-slate-900 text-sm whitespace-nowrap">{v.name || "Unknown"}</div>
                                                </td>
                                                <td className="px-4 py-3 border-r border-gray-100">
                                                    <div className="text-sm font-semibold text-slate-700 min-w-[150px]">
                                                        {v.description || v.narrative || "-"}
                                                    </div>
                                                </td>
                                                <td className="px-4 py-3 border-r border-gray-100">
                                                    <div className="text-[11px] font-mono text-slate-500 break-all max-w-[200px]">
                                                        {v.deviceId || "No Device Linked"}
                                                    </div>
                                                </td>
                                                <td className="px-4 py-3 border-r border-gray-100">
                                                    <div className="text-sm font-semibold text-slate-700">{v.employeeId || "-"}</div>
                                                </td>
                                                <td className="px-4 py-3 border-r border-gray-100">
                                                    <div className="text-sm font-bold text-slate-700 whitespace-nowrap">
                                                        {v.occurredAt ? new Date(v.occurredAt).toLocaleString() : "-"}
                                                    </div>
                                                </td>
                                            </tr>
                                        ))
                                    )}
                                </tbody>
                            </table>
                        </div>

                        {/* ================= MOBILE / TABLET CARDS ================= */}
                        <div className="md:hidden p-4 space-y-4 bg-gray-50">
                            {paginatedItems.map((v, i) => (
                                <div key={v._id || v.dateString || i} className="bg-white border rounded-lg p-4 shadow-sm">
                                    <div className="flex justify-between items-center mb-3 border-b pb-2">
                                        <span className="text-xs font-bold text-gray-400">#{(currentPage - 1) * ITEMS_PER_PAGE + i + 1}</span>
                                        {!selectedDate ? (
                                            <button onClick={() => setSelectedDate(v.dateString)} className="text-xs text-red-600 font-bold uppercase">View Details</button>
                                        ) : (
                                            <span className="text-xs text-gray-500">{v.occurredAt ? new Date(v.occurredAt).toLocaleTimeString() : "-"}</span>
                                        )}
                                    </div>
                                    <div className="space-y-2 text-sm">
                                        {!selectedDate ? (
                                            <div className="flex justify-between font-bold">
                                                <span>{v.dateString}</span>
                                                <span className="text-red-600">{v.count} Records</span>
                                            </div>
                                        ) : (
                                            <>
                                                <div className="flex justify-between">
                                                    <span className="text-gray-500">User:</span>
                                                    <span className="font-medium">{v.name || "Unknown"}</span>
                                                </div>
                                                <div className="mt-2 pt-2 border-t text-gray-700">{v.description || v.narrative}</div>
                                            </>
                                        )}
                                    </div>
                                </div>
                            ))}
                        </div>

                        {/* ================= PAGINATION ================= */}
                        {itemsToPaginate.length > 0 && (
                            <div className="flex flex-col sm:flex-row justify-between items-center gap-4 p-4 border-t border-gray-100">
                                <p className="text-sm text-gray-500">
                                    Showing {(currentPage - 1) * ITEMS_PER_PAGE + 1} –{" "}
                                    {Math.min(currentPage * ITEMS_PER_PAGE, itemsToPaginate.length)} of{" "}
                                    {itemsToPaginate.length}
                                </p>

                                <div className="flex items-center gap-2">
                                    <button
                                        onClick={() => setCurrentPage((p) => Math.max(1, p - 1))}
                                        disabled={currentPage === 1}
                                        className="w-9 h-9 flex items-center justify-center rounded-full border bg-white hover:bg-gray-50 disabled:opacity-50"
                                    >
                                        ‹
                                    </button>
                                    <div className="flex gap-1">{renderPaginationButtons()}</div>
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
