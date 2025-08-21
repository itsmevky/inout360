import React, { useEffect, useState } from "react";
import axios from "axios";
import CustomDataTable from "../Common/Customsdatatable";
import { useNavigate } from "react-router-dom";

// const domainpath = process.env.REACT_APP_API_DOMAIN_ENDPOINT;
const domainpath = "http://localhost:5000";

const Teacher = () => {
  const [data, setData] = useState([]);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState(null);
  const [currentPage, setCurrentPage] = useState(0);
  const [rowsPerPage, setRowsPerPage] = useState(10);
  const [totalRows, setTotalRows] = useState(0);
  const navigate = useNavigate();

  // Fetch teacher data
  const fetchTeachers = async () => {
    setLoading(true);
    setError(null); // Reset error state before making the request
    const token = localStorage.getItem("accesstoken");

    const myHeaders = new Headers();
    myHeaders.append("Authorization", `${token}`);
    myHeaders.append("Cookie", "refresh_token=your_refresh_token_here");

    const requestOptions = {
      method: "GET",
      headers: myHeaders,
      redirect: "follow",
    };

    try {
      const url = `${domainpath}/api/teacher/?page=${currentPage}&limit=${rowsPerPage}`;
      console.log("Request URL:", url);
      const response = await fetch(url, requestOptions);

      if (!response.ok) {
        throw new Error(`HTTP error! status: ${response.status}`);
      }

      const result = await response.json();
      console.log("API Response:", result); // Log the full response

      if (result && result.data) {
        setData(result.data); // Set fetched teacher data
        setTotalRows(result.pagination.totalRecords); // Set total records for pagination
      } else {
        console.error("Invalid response structure:", result);
        setError("No data found");
      }
    } catch (error) {
      console.error("Error fetching teacher data:", error);
      setError(error.message); // Set error state
    } finally {
      setLoading(false); // Stop loading after the request
    }
  };

  useEffect(() => {
    fetchTeachers();
  }, [currentPage, rowsPerPage]);

  // Table columns configuration
  const columns = [
    { name: "Full name", selector: (row) => row.fullname, width: "15%" },

    { name: "Email", selector: (row) => row.email, width: "15%" },
    ,
    { name: "Gender", selector: (row) => row.gender, width: "10%" },
    {
      name: "Subjects Tought",
      selector: (row) => row.subjectsTaught,
      width: "10%",
    },

    { name: "Status", selector: (row) => row.status, width: "10%" },

    {
      name: "Actions",
      width: "15%",
      selector: (row) => (
        <div className="flex space-x-2 justify-around ">
          <div className="flex space-x-2  ">
            <button className="text-blue-500" onClick={() => handleEdit(row)}>
              <svg
                fill="#22374e"
                width={25}
                height={25}
                xmlns="http://www.w3.org/2000/svg"
                viewBox="0 0 640 512"
              >
                <path d="M224 256A128 128 0 1 0 224 0a128 128 0 1 0 0 256zm-45.7 48C79.8 304 0 383.8 0 482.3C0 498.7 13.3 512 29.7 512l293.1 0c-3.1-8.8-3.7-18.4-1.4-27.8l15-60.1c2.8-11.3 8.6-21.5 16.8-29.7l40.3-40.3c-32.1-31-75.7-50.1-123.9-50.1l-91.4 0zm435.5-68.3c-15.6-15.6-40.9-15.6-56.6 0l-29.4 29.4 71 71 29.4-29.4c15.6-15.6 15.6-40.9 0-56.6l-14.4-14.4zM375.9 417c-4.1 4.1-7 9.2-8.4 14.9l-15 60.1c-1.4 5.5 .2 11.2 4.2 15.2s9.7 5.6 15.2 4.2l60.1-15c5.6-1.4 10.8-4.3 14.9-8.4L576.1 358.7l-71-71L375.9 417z" />
              </svg>
            </button>
          </div>
          <div className="flex space-x-2 ">
            <button className="text-red-500" onClick={() => handleDelete(row)}>
              <svg
                fill="#22374e"
                width={20}
                height={20}
                xmlns="http://www.w3.org/2000/svg"
                viewBox="0 0 448 512"
              >
                <path d="M135.2 17.7L128 32 32 32C14.3 32 0 46.3 0 64S14.3 96 32 96l384 0c17.7 0 32-14.3 32-32s-14.3-32-32-32l-96 0-7.2-14.3C307.4 6.8 296.3 0 284.2 0L163.8 0c-12.1 0-23.2 6.8-28.6 17.7zM416 128L32 128 53.2 467c1.6 25.3 22.6 45 47.9 45l245.8 0c25.3 0 46.3-19.7 47.9-45L416 128z" />
              </svg>
            </button>
          </div>
        </div>
      ),
    },
  ];

  const handlePageChange = (page) => {
    setCurrentPage(page);
  };

  const handleRowsPerPageChange = (newRowsPerPage) => {
    setRowsPerPage(newRowsPerPage);
    setCurrentPage(1); // Reset to first page when rows per page changes
  };

  const handleEdit = (teacher) => {
    navigate(`../editteacher/${teacher._id}`);
  };

  const handleDelete = async (teacher) => {
    if (
      window.confirm(
        `Are you sure you want to delete ${teacher.first_name} ${teacher.last_name}?`
      )
    ) {
      const token = localStorage.getItem("accesstoken");

      const requestOptions = {
        method: "DELETE",
        headers: {
          Authorization: `${token}`,
          "Content-Type": "application/json",
        },
        redirect: "follow",
      };

      try {
        const url = `${domainpath}/api/teachers/${teacher._id}`;
        const response = await fetch(url, requestOptions);

        if (!response.ok) {
          throw new Error(`HTTP error! status: ${response.status}`);
        }

        // If the delete request is successful, remove the teacher from the state
        setData((prevData) =>
          prevData.filter((item) => item._id !== teacher._id)
        );
        setTotalRows((prevTotalRows) => prevTotalRows - 1); // Update total rows count
        console.log(
          `Teacher ${teacher.first_name} ${teacher.last_name} deleted successfully`
        );
      } catch (error) {
        console.error("Error deleting teacher:", error);
        setError(error.message); // Handle the error and show a message
      }
    }
  };

  return (
    <div className="shadow-grey-500/100 shadow-lg m-5  rounded-sm">
      <div className="list-user-title mb-4">
        <h2 className="text-xl font-bold  sub-title">List of Teachers</h2>
      </div>
      <div className="button-crm">
        <div className="input-search-bar">
          <input
            type="text"
            id="search"
            name="search"
            placeholder="Search"
            className="border rounded p-2 mb-4"
          />
        </div>
        <div className="crm-buttonsection">
          <div className="">
            <button onClick={(e) => navigate("../addteacher")}>
              <svg
                fill="white"
                width={25}
                height={25}
                xmlns="http://www.w3.org/2000/svg"
                viewBox="0 0 640 512"
              >
                <path d="M96 128a128 128 0 1 1 256 0A128 128 0 1 1 96 128zM0 482.3C0 383.8 79.8 304 178.3 304l91.4 0C368.2 304 448 383.8 448 482.3c0 16.4-13.3 29.7-29.7 29.7L29.7 512C13.3 512 0 498.7 0 482.3zM504 312l0-64-64 0c-13.3 0-24-10.7-24-24s10.7-24 24-24l64 0 0-64c0-13.3 10.7-24 24-24s24 10.7 24 24l0 64 64 0c13.3 0 24 10.7 24 24s-10.7 24-24 24l-64 0 0 64c0 13.3-10.7 24-24 24s-24-10.7-24-24z" />
              </svg>
              Add Teacher
            </button>
          </div>
        </div>
      </div>

      <CustomDataTable
        data={data}
        columns={columns}
        loading={loading}
        error={error}
        currentPage={currentPage}
        rowsPerPage={rowsPerPage}
        totalRows={totalRows}
        onPageChange={handlePageChange} // Rename this to match
        onRowsPerPageChange={handleRowsPerPageChange} // Rename this to match
      />
    </div>
  );
};

export default Teacher;
