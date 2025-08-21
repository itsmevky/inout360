import React, { useState, useEffect, useRef } from "react";
import axios from "axios";
import CustomDataTable from "../../../Common/Customsdatatable.js";
import { useNavigate, useParams } from "react-router-dom";
import AddUserForm from "./Add.js";
import EditUserForm from "./Edit.js";
import { API, getData, deleteData, putData } from "../../../Helpers/api.js";
import { ToastContainer, toast } from "react-toastify";
import "react-toastify/dist/ReactToastify.css";
import PopupModal from "../../../popup/Popup.js";
import ConfirmDelete from "../../../popup/conformationdelet.js";
const Subjects = () => {
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
  const [selectedClassId, setSelectedClassId] = useState("");
  
  

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
  // useEffect(() => {
  //   const delaySearch = setTimeout(() => {
  //     fetchsubject();
  //   }, 500); // Adjust delay as needed

  //   return () => clearTimeout(delaySearch);
  // }, [searchTerm]);

  // signle user status change
  const handleStatusChange = async (userIds, newStatus) => {
    try {
      const usersArray = Array.isArray(userIds) ? userIds : [userIds];

      let result = await putData("/subjects/status", {
        users: usersArray,
        status: newStatus,
      });
      if (result.status === true) {
        setUsers((prevUsers) =>
          prevUsers.map((user) =>
            usersArray.includes(user.id) ? { ...user, status: newStatus } : user
          )
        );
        fetchsubject();

        toast.success(result.message || "Status Updated Successfully");

        // window.location.reload();
      } else {
        toast.error(result.message || "Failed to create user.");
      }
    } catch (error) {
      console.error("Error updating status:", error);
    }
  };
  const handleSelectAllChange = () => {
    if (selectedUsers.length === data.length) {
      setSelectedUsers([]);
    } else {
      setSelectedUsers(data.map((user) => user.id));
    }
  };

  const fetchsubject = async () => {
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
      let responseData = await API.getsubject(reqPage, rowsPerPage);
      if (searchTerm) {
        url += `&search=${searchTerm}`;
      }

      console.log(responseData);

      if (responseData.status===true) {
        const updatedsubject = responseData.data.map((subject) => {
          // Find the corresponding class object using classId
          const classInfo = responseData.classes.find(
            (cls) => cls.id === subject.classId
          );
          const teacherInfo = responseData.teachers.find(
            (teacher) => teacher.id === subject.teacherId
          );
  
          // Optionally, capitalize the subject name if needed
          const capitalizedSubjectName =
            subject.subjectname.charAt(0).toUpperCase() +
            subject.subjectname.slice(1);
          return {
            ...subject,
            subjectname: capitalizedSubjectName,
            className: classInfo ? classInfo.className : "No class name", // assign className from classes or fallback text
            teacherName: teacherInfo ? teacherInfo.first_name : "No teacher", // Use teacher first name

          };
        });
        console.log("Filtered Users (excluding super_admin):", updatedsubject);
        console.log("responseData====>", responseData);
        console.log("responseData for classes====>", responseData.classes);

        setData(updatedsubject);
        setTotalRows(responseData.pagination.totalRecords);

          // Set class list for dropdown
          if (Array.isArray(responseData.classes)) {
            setClassList(responseData.classes);
          }
  
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
  //   fetchsubject();
  // }, [currentPage, rowsPerPage, searchTerm]);

  const columns = [
 
    {
      name: "Subjectname",
      selector: (row) => <span>{row.subjectname}</span>,
      width: "20%",
    },
    {
      name: "Subjectcode",
      selector: (row) => <span>{row.subjectcode}</span>,
      width: "20%",
    },

    {
      name: "Description",
      selector: (row) => <span>{row.description}</span>,
      width: "20%",
    },
    {
      name: "Class",
      selector: (row) => <span>{row.className ? row.className : "No class name"}</span>, // Show className or a fallback if not present
      width: "20%",
    },

    {
      name: "Teacher",
      selector: (row) => <span>{row.teacherName}</span>,
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
        fetchsubject(); // Refresh user list
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
    fetchsubject(); // Trigger fetch with the updated search term
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
      toast.error("Invalid user IDs provided.");
      return;
    }

    try {
      console.log("Deleting valid users:", validUsers);

      await Promise.all(
        validUsers.map(async (id) => {
          try {
            await API.singleuserDelete(id);
          } catch (err) {
            console.error(`Failed to delete user with ID ${id}:`, err);
          }
        })
      );

      toast.success("subject deleted successfully!");
      fetchsubject();
    } catch (error) {
      console.error("Error deleting users:", error);
      toast.error("Failed to delete some users. Try again.");
    }
  };

  // single user delete
  const handleDelete = async (id) => {
    const confirm = window.confirm("Are you sure you want to delete?");
    if (!confirm) return;

    try {
      const res = await API.Deletesubject(id);
      console.log("res===>", res)
      if (res.success) {
        toast.success("Deleted successfully");
        fetchsubject(); // Refresh the user list
      } else {
        toast.error(res.message || "Deletion failed");
      }
    } catch (err) {
      toast.error("Failed to delete");
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
      <svg xmlns="http://www.w3.org/2000/svg" width={26} height={26} viewBox="0 0 576 512"><path d="M249.6 471.5c10.8 3.8 22.4-4.1 22.4-15.5l0-377.4c0-4.2-1.6-8.4-5-11C247.4 52 202.4 32 144 32C93.5 32 46.3 45.3 18.1 56.1C6.8 60.5 0 71.7 0 83.8L0 454.1c0 11.9 12.8 20.2 24.1 16.5C55.6 460.1 105.5 448 144 448c33.9 0 79 14 105.6 23.5zm76.8 0C353 462 398.1 448 432 448c38.5 0 88.4 12.1 119.9 22.6c11.3 3.8 24.1-4.6 24.1-16.5l0-370.3c0-12.1-6.8-23.3-18.1-27.6C529.7 45.3 482.5 32 432 32c-58.4 0-103.4 20-123 35.6c-3.3 2.6-5 6.8-5 11L304 456c0 11.4 11.7 19.3 22.4 15.5z"/></svg>        <h2 className="text-xl font-bold sub-title">Subject</h2>
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
            </div>
            <div className="inner-button">
          <button onClick={fetchsubject}>Filter</button>
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

export default Subjects;
