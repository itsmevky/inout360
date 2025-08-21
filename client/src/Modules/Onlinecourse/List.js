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

const Onlinecourse = () => {
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
  const [classList, setClassList] = useState([]);
  const [sectionList, setSectionList] = useState([]);
  const [selectedClassId, setSelectedClassId] = useState("");
  const [selectedSectionId, setSelectedSectionId] = useState('');
  const [sections, setSections] = useState([]);
  
  

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

  // useEffect(() => {
  //   const delaySearch = setTimeout(() => {
  //     fetchresult();
  //   }, 500); // Adjust delay as needed

  //   return () => clearTimeout(delaySearch);
  // }, [searchTerm]);

  console.log("searchTerm", searchTerm);

  const handleSelectAllChange = () => {
    if (selectedUsers.length === data.length) {
      setSelectedUsers([]);
    } else {
      setSelectedUsers(data.map((user) => user.id));
    }
  };

  const fetchresult = async () => {
    setLoading(true);
    setError(null);
    try {
      let reqPage = parseInt(currentPage) || 0;
      reqPage = reqPage < 0 ? 0 : reqPage;

      const responseData = await API.getClassRoutine(
        reqPage,
        rowsPerPage,
        searchTerm
      );

      if (responseData && responseData.data && responseData.data.length > 0) {
        const updatedRoutine = responseData.data.map((item) => ({
          ...item,
          className:
            item.className.charAt(0).toUpperCase() + item.className.slice(1),
        }));

        setData(updatedRoutine);
        setTotalRows(responseData.pagination.totalRecords || 0);

        if (Array.isArray(responseData.classes)) {
          setClassList(responseData.classes);
        }

        if (Array.isArray(responseData.Section)) {
          setSectionList(responseData.Section);
        }
      } else {
        setData([]);
        setTotalRows(0);
        setError("No data found");
      }
    } catch (error) {
      setError(error.message || "Something went wrong");
    } finally {
      setLoading(false);
    }
  };

  // useEffect(() => {
  //   fetchresult();
  // }, [currentPage, rowsPerPage, searchTerm]);

  const columns = [
    // ====================ClasName========================//
    {
      name: "ClassName",
      selector: (row) => <span>{row.className}</span>,
      width: "20%",
    },

    // ====================day========================//
    {
      name: "day",
      selector: (row) => <span>{row.day}</span>,
      width: "20%",
    },

    // ====================subject========================//
    {
      name: "subject",
      selector: (row) => <span>{row.subject}</span>,
      width: "20%",
    },

    // ====================startTime========================//
    {
      name: "startTime",
      selector: (row) => <span>{row.startTime}</span>,
      width: "20%",
    },
    // ====================endTime========================//

    {
      name: "endTime",
      selector: (row) => <span>{row.endTime}</span>,
      width: "20%",
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

  const handleEdit = (userid) => {
    console.log(userid, "userid");
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
      console.log("response", response);

      if (response.status) {
        fetchresult(); // Refresh list of classes
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
        <h2 className="text-xl font-bold sub-title">Online Course</h2>
      </div>
      <div className="button-crm">
        <div className="status-dropdown-section flex gap-4">
          <div className="dropdown-attendance">
            <div className="inner-class">
              <select
                name="classId"
                value={selectedClassId}
                onChange={(e) => setSelectedClassId(e.target.value)}
              >
                <option value="">All</option>
                {console.log("Classes data from state:", classList)}{" "}
                {/* Log classList state */}
                {classList &&
                  Array.isArray(classList) &&
                  classList.map((cls) => (
                    <option key={cls.id} value={cls.id}>
                      {cls.className}
                    </option>
                  ))}
              </select>
            </div>
            <div className="inner-section">
              <select
                name="sectionId"
                value={selectedSectionId}
                onChange={(e) => setSelectedSectionId(e.target.value)}
              >
                <option value="">Select S</option>
                {console.log(
                  "Classes data from ==yyyyyyyyyyyyyyyyyyyyyyyyyyyyyyyyyyyyyyyyyyyyy:",
                  sections
                )}{" "}
                {/* Log classList state */}
                {sectionList &&
                  Array.isArray(sectionList) &&
                  sectionList.map((item) => (
                    <option key={item.id} value={item.id}>
                      {item.name}
                    </option>
                  ))}
              </select>
            </div>
          </div>

          <PopupModal
            isOpen={isModalOpen}
            onClose={() => setIsModalOpen(false)}
          >
            <h2 className="text-xl font-bold mb-4">Fill the Form</h2>
            <ConfirmDelete />
          </PopupModal>
        
        </div>

        <div className="inner-button">
        <button  onClick={fetchresult}>        
          Filter</button>
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

export default Onlinecourse;
