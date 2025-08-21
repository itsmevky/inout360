import React, { useState, useEffect } from "react";
// import FeatherIcon from "feather-icons-react";
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
  handleEdit,
  handleDelete,
  handleView,
  handleShare,
}) => {
  const [rowsPerPage, setRowsPerPage] = useState(defaultRowsPerPage);
  const totalPages = Math.ceil(totalRows / rowsPerPage);
  const [openDropdownId, setOpenDropdownId] = useState(null);

  const toggleDropdown = (id) => {
    setOpenDropdownId(openDropdownId === id ? null : id);
  };

  useEffect(() => {
    if (currentPage) {
      onPageChange(currentPage);
    } else {
      onPageChange(1); // Ensure the first page is set on mount
    }
  }, [currentPage, onPageChange]);

  const handlePageClick = (page) => {
    onPageChange(page);
  };

  const handleRowsPerPageChange = (event) => {
    const newRowsPerPage = parseInt(event.target.value, 10);
    setRowsPerPage(newRowsPerPage);
    onRowsPerPageChange(newRowsPerPage);
    onPageChange(1);
  };

  const startItem = Math.max((currentPage - 1) * rowsPerPage + 1, 1);

  const endItem = Math.min(currentPage * rowsPerPage, totalRows);

  const renderPaginationButtons = () => {
    const paginationButtons = [];
    const startPage = Math.max(currentPage - 2, 1);
    const endPage = Math.min(currentPage + 2, totalPages);

    if (startPage > 1) {
      paginationButtons.push(
        <button
          key={1}
          onClick={() => handlePageClick(1)}
          className={`mx-1 px-3 py-1 rounded-full shadow ${
            1 === currentPage
              ? "bg-yellow-400 text-white font-semibold"
              : "bg-gray-200 text-gray-700"
          }`}
        >
          1
        </button>
      );

      if (startPage > 2) {
        paginationButtons.push(
          <span key="start-dots" className="mx-1 px-3 py-1 text-gray-700">
            ...
          </span>
        );
      }
    }

    for (let i = startPage; i <= endPage; i++) {
      paginationButtons.push(
        <button
          key={i}
          onClick={() => handlePageClick(i)}
          className={`mx-1 px-3 py-1 rounded-full shadow ${
            i === currentPage ? "text-white font-semibold" : "text-gray-700"
          }`}
        >
          {i}
        </button>
      );
    }

    if (endPage < totalPages - 1) {
      paginationButtons.push(
        <span key="end-dots" className="mx-1 px-3 py-1 text-gray-700">
          ...
        </span>
      );

      paginationButtons.push(
        <button
          key={totalPages}
          onClick={() => handlePageClick(totalPages)}
          className={`mx-1 px-3 py-1 rounded-full shadow ${
            totalPages === currentPage
              ? "bg-yellow-400 text-white font-semibold"
              : "bg-gray-200 text-gray-700"
          }`}
        >
          {totalPages}
        </button>
      );
    }

    return paginationButtons;
  };

  return (
    <div className="table-container">
      <table
        className="min-w-full bg-white border rounded shadow"
        id="tableContent"
      >
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
            <tr
              key={rowIndex}
              className="hover:bg-gray-100 border-b transition duration-150"
            >
              {columns.map((col, colIndex) => (
                <td
                  key={colIndex}
                  className=" update-single-status text-gray-700"
                >
                  {col.selector ? col.selector(row) : row[col.selectorKey]}
                </td>
              ))}
            </tr>
          ))}
        </tbody>
      </table>

      <div className="pagination-container flex items-center justify-between mt-4">
        <div className="rows-per-page flex items-center ">
          <div>
            <span className="text-gray-600">Rows per page:</span>
          </div>
          <div>
            <select
              value={rowsPerPage}
              onChange={handleRowsPerPageChange}
              className="AJ-page-limit ml-2 border rounded p-1"
            >
              {rowsPerPageOptions.map((option) => (
                <option key={option} value={option}>
                  {option}
                </option>
              ))}
            </select>
          </div>
          <div>
            <span className="ml-2 text-gray-600">
              {startItem}-{endItem} of {totalRows}
            </span>
          </div>
        </div>

        <div className="pagination-controls flex items-center space-x-2">
          <button
            onClick={() => handlePageClick(Math.max(currentPage - 1, 1))}
            disabled={currentPage === 1}
            className={`pagination-button mx-1 px-3 py-1 rounded-full shadow ${
              currentPage === 1 ? "bg-gray-300" : "bg-white text-gray-700"
            }`}
          >
            Previous
          </button>

          <div className="pagination-buttons flex space-x-2">
            {renderPaginationButtons()}
          </div>

          <button
            onClick={() =>
              handlePageClick(Math.min(currentPage + 1, totalPages))
            }
            disabled={currentPage === totalPages}
            className={`pagination-button mx-1 px-3 py-1 rounded-full shadow ${
              currentPage === totalPages
                ? "bg-gray-300"
                : "bg-white text-gray-700"
            }`}
          >
            Next
          </button>
        </div>
      </div>
    </div>
  );
};

export default CustomDataTable;
