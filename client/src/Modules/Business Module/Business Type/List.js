import React, { useState, useEffect, useRef } from "react";
import axios from "axios";
import CustomDataTable from "../../../Common/Customsdatatable.js";
import { useNavigate, useParams } from "react-router-dom";
import AddGlobalBusinesstypes from "./Add.js";
import EditUserForm from "./Edit.js";
import Modulepermissions from "../Business Type/Modulepermissions.js";
import { usePopup } from "../../../Helpers/PopupContext.js";
import { API, getData, deleteData, putData } from "../../../Helpers/api.js";
import { ToastContainer, toast } from "react-toastify";
import debounce from "lodash.debounce";

import "react-toastify/dist/ReactToastify.css";
import PopupModal from "../../../popup/Popup.js";
import ConfirmDelete from "../../../popup/conformationdelet.js";
const GetUsers = () => {
  const [data, setData] = useState([]);
  const [dataList, setDataList] = useState([]);

  const [loading, setLoading] = useState(true);
  const [error, setError] = useState(null);
  const [currentPage, setCurrentPage] = useState(0);
  const { openPopup } = usePopup();
  const module = "business_types";

  const [rowsPerPage, setRowsPerPage] = useState(10);
  const [totalRows, setTotalRows] = useState(0);
  const [isAddGlobalBusinesstypesVisible, setIsAddGlobalBusinesstypesVisible] =
    useState(false);
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
  const handleCheckboxChange = (userId) => {
    setSelectedUsers((prevSelected) =>
      prevSelected.includes(userId)
        ? prevSelected.filter((id) => id !== userId)
        : [...prevSelected, userId]
    );
  };
  useEffect(() => {
    const delaySearch = setTimeout(() => {
      fetchBusinesstypes();
    }, 500); // Adjust delay as needed

    return () => clearTimeout(delaySearch);
  }, [searchTerm]);

  // signle user status change
  const handleStatusChange = async (
    userId,
    newStatus,
    module = "business_types"
  ) => {
    try {
      if (!userId || typeof userId !== "string") {
        toast.error("Invalid user ID");
        return;
      }

      const payload = {
        ids: [userId],
        status: newStatus,
      };

      console.log("🟡 Sending status update:", payload, "Module:", module);

      const res = await API.postData(`/${module}/update-status`, payload);

      if (res.status) {
        setUsers((prevUsers) =>
          prevUsers.map((user) =>
            user.id === userId ? { ...user, status: newStatus } : user
          )
        );
        toast.success(res.message || "Status updated successfully!");
        fetchBusinesstypes(); // Refresh user list
      } else {
        toast.error(res.message || "Failed to update status.");
      }
    } catch (error) {
      console.error("❌ Error updating status:", error);
      toast.error("Server error while updating status.");
    }
  };

  useEffect(() => {
    if (!module) {
      console.warn("Module param missing from route.");
    } else {
      console.log("Current module from route:", module);
    }
  }, [module]);
  const handleSelectAllChange = () => {
    if (selectedUsers.length === data.length) {
      setSelectedUsers([]);
    } else {
      setSelectedUsers(data.map((user) => user.id));
    }
  };

  const fetchBusinesstypes = async () => {
    setLoading(true);
    setError(null);

    try {
      let reqPage =
        typeof currentPage === "string"
          ? parseInt(currentPage) - 1
          : typeof currentPage === "number"
          ? currentPage - 1
          : 0;

      reqPage = reqPage < 0 ? 0 : reqPage;

      // ✅ Prepare dynamic params
      const params = {
        page: reqPage,
        limit: rowsPerPage,
      };

      if (searchTerm) {
        params.search = searchTerm;
      }

      // ✅ Use dynamic API call
      const responseData = await API.getAll("business_types", params);

      console.log("✅ Business Types Fetched:", responseData);

      if (!responseData || responseData.success === false) {
        throw new Error(
          `HTTP error! status: ${responseData?.status || "Unknown"}`
        );
      }

      if (responseData?.data?.length) {
        const updatedUsers = responseData.data.map((user) => {
          const capitalizedType = user.type
            ? user.type.charAt(0).toUpperCase() + user.type.slice(1)
            : "Unknown";
          return { ...user, type: capitalizedType };
        });

        console.log("🎯 Filtered Business Types:", updatedUsers);
        setData(updatedUsers);
        setTotalRows(responseData.pagination.totalRecords);
      } else {
        setError("No business types found.");
      }
    } catch (error) {
      console.error("❌ Error fetching business types:", error);
      setError(error.message);
    } finally {
      setLoading(false);
    }
  };

  useEffect(() => {
    fetchBusinesstypes();
  }, [currentPage, rowsPerPage, searchTerm]);

  const columns = [
    {
      name: (
        <input
          type="checkbox"
          onChange={handleSelectAllChange}
          checked={selectedUsers.length === data.length && data.length > 0}
        />
      ), // Select all checkbox
      selector: (row) => (
        <input
          type="checkbox"
          onChange={() => handleCheckboxChange(row.id)}
          checked={selectedUsers.includes(row.id)}
        />
      ), // Checkbox for each user
      width: "1%",
    },
    {
      name: "Type",
      selector: (row) => <span>{row.type}</span>,
      width: "10%",
    },
    // {
    //   name: "Business Counts",
    //   selector: (row) => <span>{row.business_count}</span>,
    //   width: "10%",
    // },
    {
      name: "Status",
      selector: (row) => (
        <select
          value={row.status}
          onChange={(e) => handleStatusChange(row.id, e.target.value)}
        >
          {statusValues.map((status) => (
            <option key={status} value={status}>
              {status.charAt(0).toUpperCase() + status.slice(1)}
            </option>
          ))}
        </select>
      ),
      width: "5%",
    },

    {
      name: "Actions",
      width: "2%",
      selector: (row) => (
        <div className="flex space-x-2 justify-center ">
          <div className="flex space-x-2 ">
            <button
              onClick={() =>
                openPopup(<Modulepermissions businesstypeId={row.id} />, {
                  width: "full",
                  transparent: true,
                  padding: "p-8",
                  position: "center",
                  height: "full",
                })
              }
            >
              {" "}
              <svg
                fill="#22374e"
                width={20}
                height={20}
                xmlns="http://www.w3.org/2000/svg"
                viewBox="0 0 640 512"
              >
                <path d="M224 256A128 128 0 1 0 224 0a128 128 0 1 0 0 256zm-45.7 48C79.8 304 0 383.8 0 482.3C0 498.7 13.3 512 29.7 512l293.1 0c-3.1-8.8-3.7-18.4-1.4-27.8l15-60.1c2.8-11.3 8.6-21.5 16.8-29.7l40.3-40.3c-32.1-31-75.7-50.1-123.9-50.1l-91.4 0zm435.5-68.3c-15.6-15.6-40.9-15.6-56.6 0l-29.4 29.4 71 71 29.4-29.4c15.6-15.6 15.6-40.9 0-56.6l-14.4-14.4zM375.9 417c-4.1 4.1-7 9.2-8.4 14.9l-15 60.1c-1.4 5.5 .2 11.2 4.2 15.2s9.7 5.6 15.2 4.2l60.1-15c5.6-1.4 10.8-4.3 14.9-8.4L576.1 358.7l-71-71L375.9 417z" />
              </svg>
            </button>
            <button
              className="text-red-500"
              onClick={() => handleDelete(row.id)}
            >
              <svg
                fill="red"
                width={16}
                height={16}
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
        fetchBusinesstypes(); // Refresh user list
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

  const fetchSearchResults = async (term) => {
    if (!module) {
      console.warn("Module is undefined. Cannot perform search.");
      return;
    }

    console.log("Performing search for term:", term);
    console.log(" Using module:", module);
    console.log(" Rows per page:", rowsPerPage);

    setLoading(true);

    try {
      const response = await API.search(module, term, 0, rowsPerPage);

      console.log(" Search response:", response);

      if (response?.data?.length > 0) {
        console.log(" Found records:", response.data.length);
        setDataList(response.data);
        setTotalRows(response.total || 0);
      } else {
        console.warn(" No records found for search term:", term);
        setDataList([]);
        setTotalRows(0);
      }
    } catch (error) {
      console.error(" Search fetch failed:", error);
      setDataList([]);
    } finally {
      setLoading(false);
      console.log(" Search loading complete");
    }
  };

  const debouncedSearch = debounce(fetchSearchResults, 300);

  const handleSearchChange = (e) => {
    const term = e.target.value;
    setSearchTerm(term);
    debouncedSearch(term.trim());
  };

  const handleEdit = (userid) => {
    console.log(userid, "userid");
    setSelectedUser(userid); // Store the selected user for editing
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
      toast.error("Invalid businessType IDs provided.");
      return;
    }

    try {
      console.log("Deleting valid businessType:", validUsers);

      await Promise.all(
        validUsers.map(async (id) => {
          try {
            await API.DeletebusinessType(id);
          } catch (err) {
            console.error(`Failed to delete businessType with ID ${id}:`, err);
          }
        })
      );

      toast.success("businessType deleted successfully!");
      fetchBusinesstypes();
    } catch (error) {
      console.error("Error deleting users:", error);
      toast.error("Failed to delete some businessType. Try again.");
    }
  };

  // single user delete
  const handleDelete = async (userId) => {
    if (!userId) {
      toast.error("User ID is missing.");
      return;
    }

    toast.info(
      ({ closeToast }) => (
        <div>
          <p className="text-black">
            Are you sure you want to delete this user?
          </p>
          <div className="flex justify-end gap-2 mt-3">
            <button
              className="bg-red-600 text-white px-3 py-1 rounded text-sm"
              onClick={async () => {
                closeToast();

                try {
                  console.log("🗑️ Sending DELETE for user ID:", userId);
                  const response = await API.remove("business_types", userId); // ✅ uses api.js

                  console.log("✅ Delete response:", response);

                  if (response?.status) {
                    toast.success("User deleted successfully.");
                    // optionally refresh the list here
                  } else {
                    toast.error(response?.message || "Failed to delete user.");
                  }
                } catch (error) {
                  console.error("❌ Error deleting user:", error);
                  toast.error("Something went wrong.");
                }
              }}
            >
              Yes, Delete
            </button>
            <button
              className="bg-gray-300 text-black px-3 py-1 rounded text-sm"
              onClick={closeToast}
            >
              Cancel
            </button>
          </div>
        </div>
      ),
      { autoClose: false }
    );
  };

  const toggleAddGlobalBusinesstypes = () => {
    setIsAddGlobalBusinesstypesVisible((prev) => !prev); // Toggle form visibility
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
            Are you sure you want to delete the selected user(s)?
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
        <h2 className="text-xl font-bold sub-title">
          List of Businesses Types
        </h2>
      </div>
      <div className="button-crm">
        <div className="status-dropdown-section flex gap-4">
          <div className="status-select-option-dropdown first-left form-item">
            <select
              name="status"
              placeholder="Select Status"
              value={SelectedStatus}
              onChange={handleListStatusChange}
            >
              <option>Select Status</option>

              <option value="Active">Active</option>
              <option value="Disabled">Disable</option>
              <option value="Blocked">Block</option>
              <option value="Trash">Trash</option>
            </select>
          </div>

          <PopupModal
            isOpen={isModalOpen}
            onClose={() => setIsModalOpen(false)}
          >
            <ConfirmDelete />
          </PopupModal>
        </div>

        <div className="combine-export-section">
          <div className="input-search-bar flex ">
            <input
              type="text"
              id="search"
              name="search"
              value={searchTerm}
              onChange={handleSearchChange}
              placeholder="Search"
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

          <div className="crm-buttonsection ">
            {/* <button onClick={toggleAddGlobalBusinesstypes}>
         
              Add
            </button> */}
            <button
              onClick={() =>
                openPopup(
                  <AddGlobalBusinesstypes
                    selectedModule="User"
                    selectedBusinessType="Admin"
                  />,
                  {
                    width: "sm",
                    transparent: true,
                    padding: "p-8",
                    position: "right",
                    height: "full",
                  }
                )
              }
            >
              {" "}
              <svg
                fill="white"
                width={20}
                height={20}
                xmlns="http://www.w3.org/2000/svg"
                viewBox="0 0 640 512"
              >
                <path d="M96 128a128 128 0 1 1 256 0A128 128 0 1 1 96 128zM0 482.3C0 383.8 79.8 304 178.3 304l91.4 0C368.2 304 448 383.8 448 482.3c0 16.4-13.3 29.7-29.7 29.7L29.7 512C13.3 512 0 498.7 0 482.3zM504 312l0-64-64 0c-13.3 0-24-10.7-24-24s10.7-24 24-24l64 0 0-64c0-13.3 10.7-24 24-24s24 10.7 24 24l0 64 64 0c13.3 0 24 10.7 24 24s-10.7 24-24 24l-64 0 0 64c0 13.3-10.7 24-24 24s-24-10.7-24-24z" />
              </svg>
              Add
            </button>
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
      ) : (searchTerm ? dataList.length : data.length) > 0 ? (
        <CustomDataTable
          columns={columns}
          data={searchTerm ? dataList : data}
          totalRows={totalRows}
          rowsPerPageOptions={[10, 20, 50, 100, 500, 1000]}
          defaultRowsPerPage={rowsPerPage}
          onPageChange={handlePageChange}
          onRowsPerPageChange={handleRowsPerPageChange}
          currentPage={currentPage}
        />
      ) : (
        <div className="text-center text-gray-500 mt-4">
          {searchTerm
            ? `No user found with the name "${searchTerm}"`
            : "No data available."}
        </div>
      )}

      {/* Add User Form Sliding Panel */}
      {isAddGlobalBusinesstypesVisible && (
        <div className="sideform fixed top-0 right-0 w-1/3 h-full shadow-lg z-50 ">
          <div className="sidebar-inner bg-white  transition-transform transform translate-x-0">
            <button
              className="upclick-cut text-red-500 float-left rounded-sm"
              onClick={toggleAddGlobalBusinesstypes}
            >
              X
            </button>
            <AddGlobalBusinesstypes />
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
      {(isAddGlobalBusinesstypesVisible || isEditUserFormVisible) && (
        <div className=" bg-black opacity-50 z-40"></div>
      )}
    </div>
  );
};

export default GetUsers;
