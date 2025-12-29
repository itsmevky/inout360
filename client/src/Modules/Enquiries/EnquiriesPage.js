import React, { useEffect, useMemo, useState } from "react";
import { getData } from "../../Helpers/api";

const ITEMS_PER_PAGE = 20;

const EnquiriesPage = () => {
    const [enquiries, setEnquiries] = useState([]);
    const [loading, setLoading] = useState(true);

    const [search, setSearch] = useState("");
    const [fromDate, setFromDate] = useState("");
    const [toDate, setToDate] = useState("");

    const [selectedEnquiry, setSelectedEnquiry] = useState(null);
    const [currentPage, setCurrentPage] = useState(1);

    useEffect(() => {
        fetchEnquiries();
    }, []);

    const fetchEnquiries = async () => {
        try {
            const res = await getData("/enquiry");
            const list = Array.isArray(res?.data) ? res.data : [];
            const normalized = list.map((item) => {
                const message = item.message || "";
                const employeeId =
                    item.employeeId || "";
                const deviceId = item.deviceId || "";
                return {
                    _id: item._id,
                    name: item.name || "-",
                    email: item.email || "-",
                    phone: item.phone || "-",
                    employeeId,
                    deviceId,
                    message,
                    createdAt: item.createdAt,
                };
            });
            setEnquiries(normalized);
        } catch {
            setEnquiries([]);
        } finally {
            setLoading(false);
        }
    };

    /* =======================
    🔍 FILTERS
    ======================= */
    const filteredEnquiries = useMemo(() => {
        let list = [...enquiries];

        // Search filter
        if (search.trim()) {
            list = list.filter((e) =>
                `${e.name} ${e.email} ${e.phone}`
                    .toLowerCase()
                    .includes(search.toLowerCase())
            );
        }

        // Date filter
        if (fromDate || toDate) {
            const from = fromDate ? new Date(fromDate + "T00:00:00") : null;
            const to = toDate ? new Date(toDate + "T23:59:59") : null;

            list = list.filter((e) => {
                const created = new Date(e.createdAt);
                if (from && created < from) return false;
                if (to && created > to) return false;
                return true;
            });
        }

        return list;
    }, [enquiries, search, fromDate, toDate]);

    /* =======================
    PAGINATION
    ======================= */
    const totalPages = Math.ceil(filteredEnquiries.length / ITEMS_PER_PAGE) || 1;

    const paginatedEnquiries = useMemo(() => {
        const start = (currentPage - 1) * ITEMS_PER_PAGE;
        return filteredEnquiries.slice(start, start + ITEMS_PER_PAGE);
    }, [filteredEnquiries, currentPage]);

    useEffect(() => {
        setCurrentPage(1);
    }, [search, fromDate, toDate]);

    return (
        <div className="layout-section-dashboard p-4">

            {/* ===== HEADER ===== */}
            <div className="bg-white p-4 rounded-lg font-semibold text-xl flex items-center gap-2 enquiries-page-title-box">
                📩 Enquiries
                <span className="text-gray-500 text-base">
                    ({filteredEnquiries.length})
                </span>
            </div>

            {/* ===== SEARCH + DATE FILTER (RESPONSIVE & FIXED WIDTH) ===== */}
            <div className="!py-2 !px-5 mt-5 rounded-lg flex flex-col lg:flex-row gap-1 lg:items-center lg:justify-between enquiries-page-search-date-box items-center">

                {/* 🔍 SEARCH (WIDTH FIXED) */}
                <div className="w-full lg:max-w-[600px] input-search-bar">
                    <input
                        type="text"
                        placeholder="Search name / email / phone"
                        value={search}
                        onChange={(e) => setSearch(e.target.value)}
                        className="border rounded !py-2.5 px-2 w-full"
                    />
                </div>

                {/* 📅 DATE FILTER */}
                <div className=" !px-0 flex flex-col sm:flex-row gap-3 items-start sm:items-center w-full lg:w-auto">

                    <input
                        type="date"
                        value={fromDate}
                        onChange={(e) => setFromDate(e.target.value)}
                        className="border rounded p-2 w-full sm:w-auto bg-white enquiries-page-date-to"
                    />

                    <span className="text-gray-500 hidden sm:inline">to</span>

                    <input
                        type="date"
                        value={toDate}
                        onChange={(e) => setToDate(e.target.value)}
                        className="border rounded p-2 w-full sm:w-auto bg-white enquiries-page-date-from"
                    />

                    {(fromDate || toDate) && (
                        <button
                            onClick={() => {
                                setFromDate("");
                                setToDate("");
                            }}
                            className="px-5 py-2 border rounded bg-gray-100 hover:bg-gray-200 w-full sm:w-auto enquiries-page-date-clear-button"
                        >
                            Clear
                        </button>
                    )}
                </div>
            </div>


            {/* ===== TABLE ===== */}
            <div className=" !px-4 !py-0 mt-5 rounded-lg Enquiries-page-cards-mobile-view">

                {loading ? (
                    <p>Loading enquiries...</p>
                ) : paginatedEnquiries.length === 0 ? (
                    <p className="text-gray-500">No enquiries found</p>
                ) : (
                    <>
                        {/* ================= DESKTOP TABLE ================= */}
                        <div className="hidden md:block overflow-x-auto !p-0">
                            <table className="w-full border-collapse">
                                <thead>
                                    <tr className="bg-gray-100 text-left">
                                        <th className="p-3">#</th>
                                        <th className="p-3">Name</th>
                                        <th className="p-3">Email</th>
                                        <th className="p-3">Phone</th>
                                        <th className="p-3">Employee Id</th>
                                        <th className="p-3">Created</th>
                                        <th className="p-3">Action</th>
                                    </tr>
                                </thead>

                                <tbody>
                                    {paginatedEnquiries.map((e, i) => (
                                        <tr key={e._id} className="border-t hover:bg-gray-50 bg-white">
                                            <td className="p-3">
                                                {(currentPage - 1) * ITEMS_PER_PAGE + i + 1}
                                            </td>
                                            <td className="p-3">{e.name}</td>
                                            <td className="p-3">{e.email}</td>
                                            <td className="p-3">{e.phone}</td>
                                            <td className="p-3">{e.employeeId}</td>
                                            <td className="p-3">
                                                {new Date(e.createdAt).toLocaleString()}
                                            </td>
                                            <td className="p-3">
                                                <button
                                                    onClick={() => setSelectedEnquiry(e)}
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

                        {/* ================= MOBILE / TABLET CARDS ================= */}
                        <div className="md:hidden space-y-4 !p-0 ">
                            {paginatedEnquiries.map((e, i) => (
                                <div
                                    key={e._id}
                                    className="border rounded-lg p-4 shadow-sm bg-white !m-0 !my-4 Enquiries-page-card"
                                >
                                    <div className="flex justify-between items-center mb-2 !p-0 !my-1">
                                        <span className="text-sm text-gray-500">
                                            #{(currentPage - 1) * ITEMS_PER_PAGE + i + 1}
                                        </span>
                                        <span className="text-sm text-gray-500">
                                            {new Date(e.createdAt).toLocaleDateString()}
                                        </span>
                                    </div>

                                    <div className="!p-0 text-sm">
                                        <p className="flex justify-between items-center !my-1 !px-0">
                                            <span className="font-semibold">Name:</span> {e.name}
                                        </p>
                                        <p className="flex justify-between items-center !my-1 !px-0">
                                            <span className="font-semibold">Employee Id:</span> {e.employeeId}
                                        </p>
                                        <p className="flex justify-between items-center !my-1 !px-0">
                                            <span className="font-semibold">Phone:</span> {e.phone}
                                        </p>
                                        <p className="flex justify-between items-center !my-1 !px-0 enquiry-email-feild">
                                            <span className="font-semibold">Email:</span> {e.email}
                                        </p>


                                    </div>

                                    <button
                                        onClick={() => setSelectedEnquiry(e)}
                                        className="mt-3 w-full bg-blue-600 text-white py-2 !text-sm !font-medium rounded hover:bg-blue-800"
                                    >
                                        View Details
                                    </button>
                                </div>
                            ))}
                        </div>
                    </>
                )}

                {/* ================= PAGINATION ================= */}
                <div className="flex flex-col sm:flex-row justify-between items-center gap-3 mt-6">
                    <p className="text-sm text-gray-600">
                        Showing {(currentPage - 1) * ITEMS_PER_PAGE + 1} –{" "}
                        {Math.min(currentPage * ITEMS_PER_PAGE, filteredEnquiries.length)} of{" "}
                        {filteredEnquiries.length}
                    </p>

                    <div className="flex flex-col sm:flex-row sm:items-center gap-3 !p-0">
                        {/* Previous */}
                        <button
                            disabled={currentPage === 1}
                            onClick={() => setCurrentPage((p) => Math.max(1, p - 1))}
                            className={`w-full sm:w-auto px-4 py-2 border rounded text-sm font-medium
                            ${currentPage === 1
                                    ? "bg-gray-200 text-gray-500 cursor-not-allowed"
                                    : "bg-white hover:bg-gray-100"
                                }`}
                        >
                            ← Previous
                        </button>
                        {/* Page Info */}
                        <span className="text-center text-sm font-semibold text-gray-700">
                            Page {currentPage} of {totalPages}
                        </span>
                        {/* Next */}
                        <button
                            disabled={currentPage === totalPages}
                            onClick={() => setCurrentPage((p) => Math.min(totalPages, p + 1))}
                            className={`w-full sm:w-auto px-4 py-2 border rounded text-sm font-medium !m-0
                              ${currentPage === totalPages
                                    ? "bg-gray-200 text-gray-500 cursor-not-allowed"
                                    : "bg-white hover:bg-gray-100"
                                }`}>
                            Next →
                        </button>
                    </div>
                </div>
            </div>


            {/* ===== MODAL ===== */}
            {selectedEnquiry && (
                <div className="modal-overlay">
                    <div className="modal-container max-w-xl p-6 rounded-xl shadow-lg bg-white relative">
                        <button
                            onClick={() => setSelectedEnquiry(null)}
                            className="absolute top-4 right-4 w-9 h-9 !mr-0 rounded-full bg-red-600 text-white flex items-center justify-center hover:bg-red-700 transition"
                        >
                            ✕
                        </button>

                        {/* <h2 className="text-2xl font-bold mb-4 text-blue-700">
                            {selectedEnquiry.subject}
                        </h2> */}

                        <p><strong>Name:</strong> {selectedEnquiry.name}</p>
                        <p><strong>Phone:</strong> {selectedEnquiry.phone}</p>
                        <p><strong>Employee Id:</strong> {selectedEnquiry.employeeId}</p>
                        <p><strong>Device Id:</strong> {selectedEnquiry.deviceId}</p>

                        <p><strong>Email:</strong> {selectedEnquiry.email}</p>

                        <div className="mt-4 py-3 px-2 bg-gray-50 rounded-lg">
                            <p className="font-semibold mb-1 ">Message</p>
                            <p className="text-gray-700">{selectedEnquiry.message}</p>
                        </div>
                    </div>
                </div>
            )}
        </div>
    );
};

export default EnquiriesPage;
