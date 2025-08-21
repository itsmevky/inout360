import React, { useState, useEffect, useRef } from "react";
import axios from "axios";
import CustomDataTable from "../../Common/Customsdatatable.js";
import { useNavigate, useParams } from "react-router-dom";
import AddUserForm from "./Add.js";
import EditUserForm from "./Edit.js";
import { API, getData, deleteData, putData } from "../../Helpers/api.js";
import { ToastContainer, toast } from "react-toastify";
import "react-toastify/dist/ReactToastify.css";
import PopupModal from "../../popup/Popup.js";
import ConfirmDelete from "../../popup/conformationdelet.js";

const Liveclass = () => {
  const [data, setData] = useState([]);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState(null);
  const [currentPage, setCurrentPage] = useState(0);
  const [rowsPerPage, setRowsPerPage] = useState(10);
  const [totalRows, setTotalRows] = useState(0);
  const [isAddUserFormVisible, setIsAddUserFormVisible] = useState(false);
  const [isEditUserFormVisible, setIsEditUserFormVisible] = useState(false);
  const [selectedUser, setSelectedUser] = useState(null);
  const [selectedUsers, setSelectedUsers] = useState([]);
  const [isDropdownVisible, setDropdownVisible] = useState(false);
  const dropdownRef = useRef(null);
  const buttonRef = useRef(null);
  const navigate = useNavigate();
  const [users, setUsers] = useState([]);
  const [selectedUserIds, setSelectedUserIds] = useState([]);

  const [showPopup, setShowPopup] = useState(false);
  // const { openPopup } = usePopup();
  const [SelectedStatus, setSelectedStatus] = useState("");
  const toggleDropdown = () => {
    setDropdownVisible(!isDropdownVisible);
  };

  const statusValues = ["Active", "Disabled", "Blocked"];

  const [searchTerm, setSearchTerm] = useState("");
  // Handle checkbox selection
  const handleCheckboxChange = (className) => {
    setSelectedUsers((prevSelected) =>
      prevSelected.includes(className)
        ? prevSelected.filter((name) => name !== className)
        : [...prevSelected, className]
    );
  };

  useEffect(() => {
    const delaySearch = setTimeout(() => {
      fetchclasses();
    }, 500); // Adjust delay as needed

    return () => clearTimeout(delaySearch);
  }, [searchTerm]);

  const handleSelectAllChange = () => {
    if (selectedUsers.length === data.length) {
      setSelectedUsers([]);
    } else {
      setSelectedUsers(data.map((user) => user.id));
    }
  };

  const fetchclasses = async () => {
    setLoading(true);
    setError(null);

    try {
      let reqPage = currentPage;
      if (typeof currentPage === "string") {
        reqPage = parseInt(currentPage) - 1;
      } else if (typeof currentPage === "number") {
        reqPage = currentPage - 1;
      } else {
        reqPage = 0;
      }
      reqPage = reqPage < 0 ? 0 : reqPage;
      let url;
      let responseData = await API.Getclass(reqPage, rowsPerPage);

      if (searchTerm) {
        url += `&search=${searchTerm}`;
      }

      if (responseData.status === true) {
        const updatedClasses = responseData.data.map((classItem) => {
          const capitalizedClassName =
            classItem.className.charAt(0).toUpperCase() +
            classItem.className.slice(1);

          const subjectMap = new Map();
          responseData.subject?.forEach((subj) => {
            subjectMap.set(subj.id, subj.subjectname);
          });
          const subjectname = subjectMap.values().next().value || "N/A";

          const schedule = "08-Jul-2020 at 11:00 AM";
          return {
            ...classItem,
            className: capitalizedClassName,
            schedule,
            subjectname,
          };
        });

        setData(updatedClasses);
        setTotalRows(responseData.pagination.totalRecords);
      } else {
        setError("No data found");
      }
    } catch (error) {
      setError(error.message);
    } finally {
      setLoading(false);
    }
  };

  useEffect(() => {
    fetchclasses();
  }, [currentPage, rowsPerPage, searchTerm]);

  const columns = [
    {
      name: "Schedule",
      selector: (row) => row.schedule,
      width: "20%",
    },
    {
      name: "Class",
      selector: (row) => row.className,
      width: "20%",
    },
    {
      name: "Subject",
      selector: (row) => row.subjectname,
      width: "20%",
    },
    {
      name: "Meeting info",
      selector: () => (
        <span>
          Attachment:{" "}
          <a
            href="https://example.com/static-meeting-info.pdf"
            target="_blank"
            rel="noopener noreferrer"
            style={{ color: "#536de6", fontSize: "15px", fontWeight: "500" }}
          >
            Download
          </a>
        </span>
      ),
      width: "20%",
    },
    {
      name: "Options",
      selector: () => (
        <button
          style={{
            background: "#536de6",
            padding: "9px",
            width: "50%",
            borderRadius: "4px",
            display:"flex",
            gap:"8px"
          }}
          onClick={() => window.open("https://zoom.us/j/firstclass", "_blank")}
          className="btn btn-primary btn-sm"
        >
          <svg
            xmlns="http://www.w3.org/2000/svg"
            width="13"
            viewBox="0 0 512 512"
            fill="#fff"
          >
            <path d="M0 256a256 256 0 1 1 512 0A256 256 0 1 1 0 256zM188.3 147.1c-7.6 4.2-12.3 12.3-12.3 20.9l0 176c0 8.7 4.7 16.7 12.3 20.9s16.8 4.1 24.3-.5l144-88c7.1-4.4 11.5-12.1 11.5-20.5s-4.4-16.1-11.5-20.5l-144-88c-7.4-4.5-16.7-4.7-24.3-.5z" />
          </svg>
          <span>Join</span>
        </button>
      ),
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
  // selected user status update
  const handleApplyClick = async () => {
    if (selectedUsers.length === 0) {
      toast.error("Select Row");
      return;
    }

    const validUsers = selectedUsers.filter((id) =>
      /^[0-9a-fA-F]{24}$/.test(id)
    );

    if (validUsers.length === 0) {
      alert("Invalid user IDs provided.");
      return;
    }

    try {
      const response = await updateUserStatus(validUsers, SelectedStatus);
      if (response.status === true) {
        setSelectedStatus("");
        setSelectedUsers("");
        fetchclasses(); // Refresh user list
        toast.success("Updated Successfully!");
      } else {
        toast.error(response.message || "Failed to create user.");
      }
    } catch (error) {
      toast.error("Failed to update user status:", error);
    }
  };

  const updateUserStatus = async (users, status) => {
    try {
      return await API.updateStatus({ users, status });
    } catch (error) {
      return error;
    }
  };

  const handleSearchChange = (e) => {
    setSearchTerm(e.target.value); // Update the search term
    fetchclasses(); // Trigger fetch with the updated search term
  };

  const handleEdit = (userid) => {
    setSelectedUser(userid); // Store the selected user for editing
    setIsEditUserFormVisible(true); // Show the edit form
  };

  // selected class delete
  const handleDeleteclass = async () => {
    if (selectedUsers.length === 0) {
      toast.error("Select Row");
      return;
    }

    const validUsers = selectedUsers.filter((id) =>
      /^[0-9a-fA-F]{24}$/.test(id)
    );

    if (validUsers.length === 0) {
      alert("Invalid class IDs provided.");
      return;
    }

    setIsModalOpen(true); // Optional: use this only if you're showing a confirmation dialog

    try {
      const url = API.class.delete; // Update this to the new endpoint "/class/delete"
      const payload = { recordId: validUsers }; // Send the class IDs as recordId in the payload

      const response = await deleteData(url, payload); // Send the correct payload

      if (response.status) {
        fetchclasses(); // Refresh list of classes
        toast.success(`${response.message}`); // Display success message from the backend
      } else {
        toast.error(response.message || "Try again");
      }
    } catch (error) {
      toast.error(error.message || "Try again");
    }
  };

  const toggleAddUserForm = () => {
    setIsAddUserFormVisible((prev) => !prev); // Toggle form visibility
  };

  const toggleEditUserForm = () => {
    setIsEditUserFormVisible((prev) => !prev); // Toggle form visibility
  };
  const handleListStatusChange = (event) => {
    setSelectedStatus(event.target.value);
  };

  const [isModalOpen, setIsModalOpen] = useState(false);
  const [show, setShow] = useState(false);

  const StatusApply = ({ onConfirm, onCancel }) => {
    return (
      <PopupModal>
        <div className="p-6 bg-white rounded-lg shadow-md text-center">
          <h2 className="text-lg font-semibold">Confirm Deletion</h2>
          <p className="mt-2">
            Are you sure you want to delete the selected classs(s)?
          </p>
          <div className="flex justify-center gap-4 mt-4">
            <button
              onClick={onCancel}
              className="px-4 py-2 bg-gray-400 text-white rounded-md"
            >
              Cancel
            </button>
            <button
              onClick={onConfirm}
              className="px-4 py-2 bg-red-500 text-white rounded-md"
            >
              Yes, Delete
            </button>
          </div>
        </div>
      </PopupModal>
    );
  };

  {
    show && <StatusApply />;
  }
  return (
    <div className="relative p-4">
      <div className="list-user-title ">
        <svg
          xmlns="http://www.w3.org/2000/svg"
          width={29}
          height={26}
          viewBox="0 0 576 512"
        >
          <path d="M0 128C0 92.7 28.7 64 64 64l256 0c35.3 0 64 28.7 64 64l0 256c0 35.3-28.7 64-64 64L64 448c-35.3 0-64-28.7-64-64L0 128zM559.1 99.8c10.4 5.6 16.9 16.4 16.9 28.2l0 256c0 11.8-6.5 22.6-16.9 28.2s-23 5-32.9-1.6l-96-64L416 337.1l0-17.1 0-128 0-17.1 14.2-9.5 96-64c9.8-6.5 22.4-7.2 32.9-1.6z" />
        </svg>
        <h2 className="text-xl font-bold sub-title"> Your live classes</h2>
      </div>
      <div className="button-crm">
        <div className="status-dropdown-section flex gap-4">
          <PopupModal
            isOpen={isModalOpen}
            onClose={() => setIsModalOpen(false)}
          >
            <h2 className="text-xl font-bold mb-4">Fill the Form</h2>
            <ConfirmDelete />
          </PopupModal>
        </div>

        <div className="combine-export-section"></div>
      </div>
      <div className="inputttts">
        <div className="input-search-bar flex input">
          <label>Search:</label>
          <input
            type="text"
            id="search"
            name="search"
            value={searchTerm}
            onChange={handleSearchChange}
            className="border rounded p-2 "
          />
        </div>
      </div>
      {/* Toast Notifications */}
      <ToastContainer />
      {/* Error message */}
      {error && <div className="text-red-500">{error}</div>}

      {/* Loading state */}
      {loading ? (
        <div>Loading...</div>
      ) : (
        <CustomDataTable
          columns={columns}
          data={data}
          totalRows={totalRows}
          rowsPerPageOptions={[10, 20, 50, 100, 500, 1000]}
          defaultRowsPerPage={rowsPerPage}
          onPageChange={handlePageChange}
          onRowsPerPageChange={handleRowsPerPageChange}
          currentPage={currentPage}
        />
      )}

      {/* Add User Form Sliding Panel */}
      {isAddUserFormVisible && (
        <div className="sideform fixed top-0 right-0 w-1/3 h-full shadow-lg z-50 ">
          <div className="sidebar-inner bg-white  transition-transform transform translate-x-0">
            <button
              className="upclick-cut text-red-500 float-left rounded-sm"
              onClick={toggleAddUserForm}
            >
              X
            </button>
            <AddUserForm />
          </div>
        </div>
      )}

      {/* Edit User Form Sliding Panel */}
      {isEditUserFormVisible && selectedUser && (
        <div className=" sideform fixed top-0 right-0 w-1/3 h-full  shadow-lg p-4 z-50 ">
          <div className="sidebar-inner bg-white p-4 transition-transform transform translate-x-0">
            <button
              className="upclick-cut text-red-500 float-left rounded-sm "
              onClick={toggleEditUserForm}
            >
              X
            </button>
            {console.log(selectedUser)}
            <EditUserForm user={selectedUser} />{" "}
          </div>
        </div>
      )}

      {/* Background overlay when Add or Edit User form is visible */}
      {(isAddUserFormVisible || isEditUserFormVisible) && (
        <div className="fixed inset-0 bg-black opacity-50 z-40"></div>
      )}
    </div>
  );
};

export default Liveclass;
