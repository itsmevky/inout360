import React, { useState, useEffect, useRef } from "react";
import axios from "axios";
import CustomDataTable from "../../../Common/Customsdatatable.js";
import { useNavigate, useParams } from "react-router-dom";
import AddUserForm from "./Add.js";
import EditRoomForm from "./Edit.js";
import { API, getData, deleteData, putData } from "../../../Helpers/api.js";
import { ToastContainer, toast } from "react-toastify";
import "react-toastify/dist/ReactToastify.css";
import PopupModal from "../../../popup/Popup.js";
import ConfirmDelete from "../../../popup/conformationdelet.js";


const Syllabus = () => {
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
  const [selectedClassId, setSelectedClassId] = useState("");
  const [classList, setClassList] = useState([]);
  const [sectionList, setSectionList] = useState([]);
  const [selectedSectionId, setSelectedSectionId] = useState("");
  
  
  
  

  const [showPopup, setShowPopup] = useState(false);
  // const { openPopup } = usePopup();
  const [SelectedStatus, setSelectedStatus] = useState("");
  const toggleDropdown = () => {
    setDropdownVisible(!isDropdownVisible);
  };
  const statusValues = ["Active", "Disabled", "Blocked"];

  const [searchTerm, setSearchTerm] = useState("");
  // Handle checkbox selection
  const handleCheckboxChange = (syllabusId) => {
    setSelectedUsers((prevSelected) =>
      prevSelected.includes(syllabusId)
        ? prevSelected.filter((id) => id !== syllabusId)
        : [...prevSelected, syllabusId]
    );
  };
  // useEffect(() => {
  //   const delaySearch = setTimeout(() => {
  //     fetchresult();
  //   }, 500); // Adjust delay as needed

  //   return () => clearTimeout(delaySearch);
  // }, [searchTerm]);

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
      setSelectedUsers(data.map((syllabus) => syllabus.id));
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
      let responseData = await API.GetSyllabus(reqPage, rowsPerPage);

      console.log("responseDataaaaa====>", responseData)
      if (searchTerm) {
        url += `&search=${searchTerm}`;
       
      }

      console.log("responseDatasssaaeww", responseData);


      if (responseData.status===true) {
        setClassList(responseData.classes || []);
        setSectionList(responseData.section || []);

        const updatedsyllabus = responseData.data.map((syllabus) => {
          const capitalizedFullName =
            syllabus.subject.charAt(0).toUpperCase() + syllabus.subject.slice(1);
          return { ...syllabus, subject: capitalizedFullName };
        });
        console.log("classes ",responseData.classes  )


        console.log("Filtered rooms (excluding super_admin):", updatedsyllabus);

        setData(updatedsyllabus);
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

  // useEffect(() => {
  //   fetchresult();
  // }, [currentPage, rowsPerPage, searchTerm]);

  const columns = [
 
    {
      name: "Title",
      selector: (row) => (
        <span>{row.topics.map((topic) => topic.title).join(", ")}</span>
      ),
      width: "20%", // adjust width to fit content
    },

    {
      name: "Syllabus",
      selector: (row) => (
        <div>
          {Array.isArray(row.topics) &&
            row.topics.map((topic, index) => (
              <div key={topic._id || index}>
                <strong>{topic.title}</strong>: {topic.description} (Week {topic.week})
              </div>
            ))}
        </div>
      ),
      width: "20%",
    },
    
    {
      name: "Subject",
      selector: (row) => <span> {row.subject}</span>,
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

  const handleEdit = (syllabusid) => {
    console.log(syllabusid, "syllabusid");
    setSelectedUser(syllabusid); // Store the selected user for editing
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
      alert("Invalid syllabus IDs provided.");
      return;
    }
    setIsModalOpen(true);

    try {
      const url = "/syllabus/delete"; // Use the correct delete API endpoint
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
      <svg xmlns="http://www.w3.org/2000/svg" width={26} height={26} viewBox="0 0 512 512"> 
      <path d="M96 0C60.7 0 32 28.7 32 64l0 384c0 35.3 28.7 64 64 64l288 0c35.3 0 64-28.7 64-64l0-384c0-35.3-28.7-64-64-64L96 0zM208 288l64 0c44.2 0 80 35.8 80 80c0 8.8-7.2 16-16 16l-192 0c-8.8 0-16-7.2-16-16c0-44.2 35.8-80 80-80zm-32-96a64 64 0 1 1 128 0 64 64 0 1 1 -128 0zM512 80c0-8.8-7.2-16-16-16s-16 7.2-16 16l0 64c0 8.8 7.2 16 16 16s16-7.2 16-16l0-64zM496 192c-8.8 0-16 7.2-16 16l0 64c0 8.8 7.2 16 16 16s16-7.2 16-16l0-64c0-8.8-7.2-16-16-16zm16 144c0-8.8-7.2-16-16-16s-16 7.2-16 16l0 64c0 8.8 7.2 16 16 16s16-7.2 16-16l0-64z"/></svg>
        <h2 className="text-xl font-bold sub-title">Syllabus</h2>
      </div>
      <div className="button-crm">
      <div className="dropdown-attendance">

      <div className="inner-class">
              <select
                name="classId"
                value={selectedClassId}
                onChange={(e) => setSelectedClassId(e.target.value)}
              >
                <option value="">Select Class</option>
                {classList.map((cls) => (
                  <option key={cls._id || cls.id} value={cls._id || cls.id}>
                    {cls.className}
                  </option>
                ))}
              </select>
            </div>
            <div className="inner-section">
              {console.log("Rendering sectionList:", sectionList)}{" "}
              {/* Logs the subjectList */}
              <select
                name="sectionId"
                value={selectedSectionId}
                onChange={(e) => setSelectedSectionId(e.target.value)}
              >
                <option value="">Select Section</option>

                {sectionList &&
                  Array.isArray(sectionList) &&
                  sectionList.map((item) => (
                    <option
                      key={item._id || item.id}
                      value={item._id || item.id}
                    >
                      {item.name}
                    </option>
                  ))}
              </select>
            </div>

            </div>

            <div className="inner-button">
          <button onClick={fetchresult} >Filter</button>
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

export default Syllabus;
