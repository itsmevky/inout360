import React, { useState, useEffect } from "react";
import { toast } from "react-toastify";
import "react-toastify/dist/ReactToastify.css";

const CustomDataTable = ({
  columns,
  data,
  totalRows,
  rowsPerPageOptions = [10, 20, 50, 100, 500, 1000],
  defaultRowsPerPage = 10,
  onPageChange,
  onRowsPerPageChange,
  currentPage,
}) => {
  const [rowsPerPage, setRowsPerPage] = useState(defaultRowsPerPage);
  const totalPages = Math.ceil(totalRows / rowsPerPage);

  useEffect(() => {
    onPageChange(currentPage || 1);
  }, [currentPage, onPageChange]);

  const handlePageClick = (page) => onPageChange(page);

  const handleRowsPerPageChange = (e) => {
    const newRows = parseInt(e.target.value, 10);
    setRowsPerPage(newRows);
    onRowsPerPageChange(newRows);
    onPageChange(1);
  };

  const startItem = Math.max((currentPage - 1) * rowsPerPage + 1, 1);
  const endItem = Math.min(currentPage * rowsPerPage, totalRows);

  const renderPaginationButtons = () => {
    const btns = [];
    const start = Math.max(currentPage - 2, 1);
    const end = Math.min(currentPage + 2, totalPages);

    if (start > 1) {
      btns.push(
        <button key={1} onClick={() => handlePageClick(1)} className="mx-1 px-3 py-1 rounded-full shadow bg-gray-200">
          1
        </button>
      );
      if (start > 2) btns.push(<span key="startDots">...</span>);
    }

    for (let i = start; i <= end; i++) {
      btns.push(
        <button
          key={i}
          onClick={() => handlePageClick(i)}
          className={`mx-1 px-3 py-1 rounded-full shadow ${i === currentPage ? "bg-yellow-400 text-white" : "bg-gray-100"
            }`}
        >
          {i}
        </button>
      );
    }

    if (end < totalPages - 1) btns.push(<span key="endDots">...</span>);

    if (end < totalPages) {
      btns.push(
        <button
          key={totalPages}
          onClick={() => handlePageClick(totalPages)}
          className="mx-1 px-3 py-1 rounded-full shadow bg-gray-200"
        >
          {totalPages}
        </button>
      );
    }

    return btns;
  };

  return (
    <div className="table-container w-full">
      {/* ===========================
          DESKTOP TABLE (md and above)
      ============================ */}
      <div className="hidden md:block">
        <table className="min-w-full bg-white border rounded shadow" id="tableContent">
          <thead>
            <tr>
              {columns.map((col, index) => (
                <th
                  key={index}
                  className="py-2 px-2 border-b text-left bg-gray-200 font-semibold text-gray-600"
                  style={{ width: col.width || "auto" }}
                >
                  {col.name}
                </th>
              ))}
            </tr>
          </thead>

          <tbody>
            {data.map((row, rowIndex) => (
              <tr key={rowIndex} className="hover:bg-gray-100 border-b transition duration-150">
                {columns.map((col, colIndex) => (
                  <td key={colIndex} className="text-gray-700 p-2">
                    {col.selector ? col.selector(row) : row[col.selectorKey]}
                  </td>
                ))}
              </tr>
            ))}
          </tbody>
        </table>
      </div>

      {/* ===========================
          MOBILE / TABLET CARD VIEW
      ============================ */}
      <div className="md:hidden grid grid-cols-1 gap-4 mt-4">
        {data.map((row, rowIndex) => (
          <div
            key={rowIndex}
            className="p-4 bg-white border rounded shadow flex flex-col gap-2"
          >
            {columns.map((col, colIndex) => (
              <div key={colIndex} className="flex justify-between">
                <strong className="text-gray-600">{col.name}:</strong>
                <span className="text-gray-800">
                  {col.selector ? col.selector(row) : row[col.selectorKey]}
                </span>
              </div>
            ))}
          </div>
        ))}
      </div>

      {/* ===========================
          PAGINATION
      ============================ */}
      <div className="pagination-container flex flex-col md:flex-row md:items-center justify-between mt-4 gap-3">
        {/* Rows Per Page */}
        <div className="rows-per-page flex items-center gap-2">
          <span className="text-gray-600">Rows per page:</span>

          <select
            value={rowsPerPage}
            onChange={handleRowsPerPageChange}
            className="border rounded p-1"
          >
            {rowsPerPageOptions.map((opt) => (
              <option key={opt} value={opt}>{opt}</option>
            ))}
          </select>

          <span className="text-gray-600">
            {startItem}-{endItem} of {totalRows}
          </span>
        </div>

        {/* Pagination Controls */}
        <div className="pagination-controls flex items-center gap-2">
          <button
            onClick={() => handlePageClick(Math.max(currentPage - 1, 1))}
            disabled={currentPage === 1}
            className="px-3 py-1 rounded shadow bg-gray-100 disabled:bg-gray-300"
          >
            Previous
          </button>

          <div className="flex gap-1">{renderPaginationButtons()}</div>

          <button
            onClick={() => handlePageClick(Math.min(currentPage + 1, totalPages))}
            disabled={currentPage === totalPages}
            className="px-3 py-1 rounded shadow bg-gray-100 disabled:bg-gray-300"
          >
            Next
          </button>
        </div>
      </div>
    </div>
  );
};

export default CustomDataTable;
