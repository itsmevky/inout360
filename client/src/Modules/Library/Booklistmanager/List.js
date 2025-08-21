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

const Bookissuereport = () => {
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
  const [selectedSectionId, setSelectedSectionId] = useState("");
  const [sections, setSections] = useState([]);
  const [sectionList, setSectionList] = useState([]);
  const [subjectList, setSubjectList] = useState([]);
  const [selectedSubjectId, setSelectedSubjectId] = useState("");
  const [examList, setExamList] = useState([]);
  const [selectedExamId, setSelectedExamId] = useState("");

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
      fetchresult();
    }, 500); // Adjust delay as needed

    return () => clearTimeout(delaySearch);
  }, [searchTerm]);

  // signle user status change
  const handleStatusChange = async (userIds, newStatus) => {
    try {
      const usersArray = Array.isArray(userIds) ? userIds : [userIds];

      let result = await putData("/user/status", {
        users: usersArray,
        status: newStatus,
      });
      if (result.status === true) {
        setUsers((prevUsers) =>
          prevUsers.map((user) =>
            usersArray.includes(user.id) ? { ...user, status: newStatus } : user
          )
        );
        fetchresult();

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

  const fetchresult = async () => {
    setLoading(true);
    setError(null);
  
    try {
      let reqPage =
        typeof currentPage === "number"
          ? currentPage - 1
          : parseInt(currentPage) - 1;
      reqPage = isNaN(reqPage) || reqPage < 0 ? 0 : reqPage;
  
      const responseData = await API.GetBooklistmanager(reqPage, rowsPerPage);
  
      console.log("responseData", responseData);
      console.log("responseData of student", responseData.student);
      console.log("responseData of class", responseData.classes);
  
      const books = responseData.data || [];
      const pagination = responseData.pagination;
  
      // ✅ Get class names
      const classNames = Array.isArray(responseData.classes)
        ? responseData.classes.map((cls) => cls.className).join(", ")
        : "";
  
      // ✅ Get student first names
      const studentNames = Array.isArray(responseData.student)
        ? responseData.student.map((stu) => stu.first_name).join(", ")
        : "";
  
      console.log("Built classNames:", classNames);
      console.log("Built studentNames:", studentNames);
  
      // ✅ Attach both to each book row
      const transformedData = books.map((book) => ({
        bookName: book.bookName,
        author: book.author,
        copies: book.copies,
        availableCopies: book.availableCopies,
        genre: book.metadata?.genre || "N/A",
        language: book.metadata?.language || "N/A",
        pages: book.metadata?.pages || 0,
        status: book.status, 
        shelfLocation: book.shelfLocation,
        issueDate: new Date(book.issueDate).toLocaleDateString(),
        dateOfExpiry: new Date(book.dateOfExpiry).toLocaleDateString(),
        allClassNames: classNames,
        allStudentNames: studentNames, 
      }));
  
      console.log("Transformed data:", transformedData);
  
      setData(transformedData);
      setTotalRows(pagination?.totalrecords || 0);
    } catch (error) {
      console.error("fetchresult error", error);
      setError(error.message || "Something went wrong");
    } finally {
      setLoading(false);
    }
  };
  
  
  // useEffect(() => {
  //   console.log("Classes data from state:", classList);
  // }, [classList]);

  const columns = [
    {
      name: "Book Name",
      selector: (row) => <span>{row.bookName}</span>,
      width: "10%",
    },

    {
      name: "Issue date",
      selector: (row) => <span>{row.issueDate}</span>,
      width: "10%",
    },

    {
      name: "Student",
      selector: (row) => <span>{row.allStudentNames}</span>,
      width: "10%",
    },

    {
      name: "Class",
      selector: (row) => row.allClassNames, // optional, if using "cell"
      cell: (row) => <span>{row.allClassNames}</span>,
      width: "10%",
      wrap: true,
    },
    {
      name: "Status",
      selector: (row) => (
        <span className={`status-dot ${row.status.toLowerCase()}`}>
          {row.status}
        </span>
      ),
      width: "10%",
    }
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
      alert("Invalid user IDs provided.");
      return;
    }
    setIsModalOpen(true);

    try {
      const url = "/departments/delete"; // Use the correct delete API endpoint
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
        <svg
          xmlns="http://www.w3.org/2000/svg"
          width={28}
          height={28}
          viewBox="0 0 448 512"
        >
          <path d="M128 0c13.3 0 24 10.7 24 24l0 40 144 0 0-40c0-13.3 10.7-24 24-24s24 10.7 24 24l0 40 40 0c35.3 0 64 28.7 64 64l0 16 0 48 0 256c0 35.3-28.7 64-64 64L64 512c-35.3 0-64-28.7-64-64L0 192l0-48 0-16C0 92.7 28.7 64 64 64l40 0 0-40c0-13.3 10.7-24 24-24zM400 192L48 192l0 256c0 8.8 7.2 16 16 16l320 0c8.8 0 16-7.2 16-16l0-256zm-95 89l-47 47 47 47c9.4 9.4 9.4 24.6 0 33.9s-24.6 9.4-33.9 0l-47-47-47 47c-9.4 9.4-24.6 9.4-33.9 0s-9.4-24.6 0-33.9l47-47-47-47c-9.4-9.4-9.4-24.6 0-33.9s24.6-9.4 33.9 0l47 47 47-47c9.4-9.4 24.6-9.4 33.9 0s9.4 24.6 0 33.9z" />
        </svg>
        <h2 className="text-xl font-bold sub-title">Book</h2>
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
      </div>
      <h2 className="text-xl font-bold sub-title">ISSUES BOOK LIST</h2>

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

export default Bookissuereport;