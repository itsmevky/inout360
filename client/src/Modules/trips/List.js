import React, { useState, useEffect, useRef } from "react";
import axios from "axios";
import CustomDataTable from "../../Common/Customsdatatable.js";
import { useNavigate, useParams } from "react-router-dom";
import AddUserForm from "./Add.js";
import EditRoomForm from "./Edit.js";
import { API, getData, deleteData, putData } from "../../Helpers/api.js";
import { ToastContainer, toast } from "react-toastify";
import "react-toastify/dist/ReactToastify.css";
import PopupModal from "../../popup/Popup.js";
import ConfirmDelete from "../../popup/conformationdelet.js";
const Trips = () => {
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
  const handleCheckboxChange = (TripsId) => {
    setSelectedUsers((prevSelected) =>
      prevSelected.includes(TripsId)
        ? prevSelected.filter((id) => id !== TripsId)
        : [...prevSelected, TripsId]
    );
  };
  useEffect(() => {
    const delaySearch = setTimeout(() => {
      fetchresult();
    }, 500); // Adjust delay as needed

    return () => clearTimeout(delaySearch);
  }, [searchTerm]);

  // signle user status change
  // const handleStatusChange = async (userIds, newStatus) => {
  //   try {
  //     const usersArray = Array.isArray(userIds) ? userIds : [userIds];

  //     let result = await putData("/user/status", {
  //       users: usersArray,
  //       status: newStatus,
  //     });
  //     if (result.status === true) {
  //       setUsers((prevUsers) =>
  //         prevUsers.map((user) =>
  //           usersArray.includes(user.id) ? { ...user, status: newStatus } : user
  //         )
  //       );
  //       fetchresult();

  //       toast.success(result.message || "Status Updated Successfully");

  //       // window.location.reload();
  //     } else {
  //       toast.error(result.message || "Failed to create user.");
  //     }
  //   } catch (error) {
  //     console.error("Error updating status:", error);
  //   }
  // };
  const handleSelectAllChange = () => {
    if (selectedUsers.length === data.length) {
      setSelectedUsers([]);
    } else {
      setSelectedUsers(data.map((Trips) => Trips.id));
    }
  };

  const fetchresult = async () => {
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
      console.log("url", url);
      let responseData = await API.GetTrips(reqPage, rowsPerPage);

      console.log("responseData====>", responseData);
      if (searchTerm) {
        url += `&search=${searchTerm}`;
      }

      // console.log("responseData", responseData);

      if (responseData.status === true) {
        const updatedTrips = responseData.data.map((trip) => {
          const capitalizedTripName =
            trip.tripName.charAt(0).toUpperCase() + trip.tripName.slice(1);

          return { ...trip, tripName: capitalizedTripName };
        });
        console.log("Filtered rooms (excluding super_admin):", updatedTrips);

        setData(updatedTrips);
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
    fetchresult();
  }, [currentPage, rowsPerPage, searchTerm]);

  const columns = [
    {
      name: "tripName",
      selector: (row) => <span>{row.tripName}</span>,
      width: "8%",
    },
    {
      name: "description",
      selector: (row) => <span> {row.description}</span>,
      width: "20%",
    },
    {
      name: "destination",
      selector: (row) => <span> {row.destination}</span>,
      width: "8%",
    },
    {
      name: "tripDate",
      selector: (row) => <span> {row.tripDate}</span>,
      width: "8%",
    },
    {
      name: "returnDate",
      selector: (row) => <span> {row.returnDate}</span>,
      width: "8%",
    },

    {
      name: "Status",
      selector: (row) => <span> {row.status}</span>,
      width: "8%",
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
        fetchresult(); // Refresh user list
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
    fetchresult(); // Trigger fetch with the updated search term
  };

  const handleEdit = (Tripsid) => {
    console.log(Tripsid, "Tripsid");
    setSelectedUser(Tripsid); // Store the selected user for editing
    setIsEditUserFormVisible(true); // Show the edit form
  };

  // selected userlist delete
  const handleDeleteUser = async () => {
    if (selectedUsers.length === 0) {
      toast.error("Select Row");
      return;
    }
    const validUsers = selectedUsers.filter((id) =>
      /^[0-9a-fA-F]{24}$/.test(id)
    );

    if (validUsers.length === 0) {
      alert("Invalid Trips IDs provided.");
      return;
    }
    setIsModalOpen(true);

    try {
      const url = "/Trips/delete"; // Use the correct delete API endpoint
      const payload = {
        users: Array.isArray(validUsers) ? validUsers : [validUsers],
      };

      const response = await deleteData(url, payload); // Pass payload for deletion

      if (response.success) {
        fetchresult();
        toast.success("Deleted  Successfully!");
      } else {
        toast.error(response.message || "Try again");
      }
    } catch (error) {
      toast.error(error || "Try again");
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
    console.log("Selected Status:", event.target.value);
  };

  const [isModalOpen, setIsModalOpen] = useState(false);
  const [show, setShow] = useState(false);

  const StatusApply = ({ onConfirm, onCancel }) => {
    return (
      <PopupModal>
        <div className="p-6 bg-white rounded-lg shadow-md text-center">
          <h2 className="text-lg font-semibold">Confirm Deletion</h2>
          <p className="mt-2">
            Are you sure you want to delete the selected room(s)?
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
          width="25"
          viewBox="0 0 640 512"
        >
          <path d="M381 114.9L186.1 41.8c-16.7-6.2-35.2-5.3-51.1 2.7L89.1 67.4C78 73 77.2 88.5 87.6 95.2l146.9 94.5L136 240 77.8 214.1c-8.7-3.9-18.8-3.7-27.3 .6L18.3 230.8c-9.3 4.7-11.8 16.8-5 24.7l73.1 85.3c6.1 7.1 15 11.2 24.3 11.2l137.7 0c5 0 9.9-1.2 14.3-3.4L535.6 212.2c46.5-23.3 82.5-63.3 100.8-112C645.9 75 627.2 48 600.2 48l-57.4 0c-20.2 0-40.2 4.8-58.2 14L381 114.9zM0 480c0 17.7 14.3 32 32 32l576 0c17.7 0 32-14.3 32-32s-14.3-32-32-32L32 448c-17.7 0-32 14.3-32 32z" />
        </svg>
        <h2 className="text-xl font-bold sub-title">Trips</h2>
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

        <div className="combine-export-section">
          <div className="input-search-bar flex ">
            <label>Select a child</label>
            <input
              type="text"
              id="search"
              name="search"
              value={searchTerm}
              onChange={handleSearchChange}
              placeholder=""
              className="border rounded p-2 "
            />
            <div className="searching-log flex items-center">
              <svg
                fill="#blue"
                width={16}
                height={16}
                xmlns="http://www.w3.org/2000/svg"
                viewBox="0 0 512 512"
              >
                <path d="M416 208c0 45.9-14.9 88.3-40 122.7L502.6 457.4c12.5 12.5 12.5 32.8 0 45.3s-32.8 12.5-45.3 0L330.7 376c-34.4 25.2-76.8 40-122.7 40C93.1 416 0 322.9 0 208S93.1 0 208 0S416 93.1 416 208zM208 352a144 144 0 1 0 0-288 144 144 0 1 0 0 288z" />
              </svg>
            </div>
          </div>
          <div>
            <button className="btnffffer">Filter</button>
          </div>
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
            <EditRoomForm user={selectedUser} />{" "}
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

export default Trips;
