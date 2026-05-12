import React, { useState, useEffect } from "react";
import CustomDataTable from "../../../Common/Customsdatatable.js";
import { API } from "../../../Helpers/api.js";
import { toast } from "react-toastify";
import "react-toastify/dist/ReactToastify.css";

const EventsList = () => {
  const [data, setData] = useState([]);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState(null);
  const [currentPage, setCurrentPage] = useState(1);
  const [rowsPerPage, setRowsPerPage] = useState(10);
  const [totalRows, setTotalRows] = useState(0);
  const [searchTerm, setSearchTerm] = useState("");
  const [eventType, setEventType] = useState("camera");

  const fetchEvents = async () => {
    setLoading(true);
    try {
      const response = await API.device.getCameraEvents({
        search: searchTerm,
        page: currentPage,
        limit: rowsPerPage,
        eventType: eventType,
      });

      if (response.status) {
        setData(response.data);
        setTotalRows(response.total);
      } else {
        setData([]);
        setTotalRows(0);
        setError("No event data found");
      }
    } catch (err) {

      console.error("Error fetching events:", err);
      setError("Something went wrong while fetching events.");
      toast.error("Failed to load events");
    } finally {
      setLoading(false);
    }
  };

  useEffect(() => {
    fetchEvents();
  }, [currentPage, rowsPerPage, searchTerm, eventType]);

  const handleEventTypeChange = (e) => {
    setEventType(e.target.value);
    setCurrentPage(1);
  };

  const handleSearchChange = (e) => {
    setSearchTerm(e.target.value);
    setCurrentPage(1);
  };

  const columns = [
    {
      name: "Name",
      selector: (row) => row.name || "-",
      sortable: true,
      width: "15%",
    },
    {
      name: "Employee ID",
      selector: (row) => row.employeeId || "-",
      sortable: true,
      width: "10%",
    },
    {
      name: "Event",
      selector: (row) => {
        const fullEvent = row.metadata?.appName || row.metadata?.event || row.event || "-";
        return <span title={fullEvent}>{fullEvent}</span>;
      },
      sortable: true,
      width: "15%",
    },
    ...(eventType === "clear_all" ? [{
      name: "Count",
      selector: (row) => row.clearAllCount || 0,
      sortable: true,
      width: "10%",
    }] : []),
    {
      name: "Package",
      selector: (row) => row.packageName || "-",
      sortable: true,
      width: "15%",
    },
    {
      name: "Narrative",
      selector: (row) => row.narrative || "-",
      width: "15%",
    },
    {
      name: "Timestamp",
      selector: (row) => new Date(row.timestamp).toLocaleString(),
      sortable: true,
      width: "15%",
    },
  ];


  const handlePageChange = (page) => {
    setCurrentPage(page);
  };

  const handleRowsPerPageChange = (newRowsPerPage) => {
    setRowsPerPage(newRowsPerPage);
    setCurrentPage(1);
  };

  return (
    <div className="relative p-4 ">
      <div className="list-user-title mb-4">
        <h2 className="text-xl font-bold sub-title">
          {eventType === "camera" ? "Camera Events" : "Clear All Events"}
        </h2>
      </div>

      <div className="button-crm flex justify-between items-center mb-4">
        <div className="flex gap-4 w-full">
          <div className="input-search-bar flex w-1/3">
            <input
              type="text"
              id="search"
              name="search"
              value={searchTerm}
              onChange={handleSearchChange}
              placeholder="Search by Name or ID"
              className="border rounded p-2 w-full"
            />
          </div>
          <div className="flex items-center">
            <select
              value={eventType}
              onChange={handleEventTypeChange}
              className="border rounded p-2 bg-white"
            >
              <option value="camera">Camera Events</option>
              <option value="clear_all">Clear All Events</option>
            </select>
          </div>
        </div>
      </div>

      {error && <div className="text-red-500 mb-4">{error}</div>}

      {loading ? (
        <div className="flex justify-center p-10 text-lg">Loading...</div>
      ) : (
        <CustomDataTable
          columns={columns}
          data={data}
          totalRows={totalRows}
          rowsPerPageOptions={[10, 20, 50, 100]}
          defaultRowsPerPage={rowsPerPage}
          onPageChange={handlePageChange}
          onRowsPerPageChange={handleRowsPerPageChange}
          currentPage={currentPage}
        />
      )}
    </div>
  );
};

export default EventsList;
