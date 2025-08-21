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
const Attendance = () => {
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
  const [selectedMonth, setSelectedMonth] = useState('');
  const [selectedYear, setSelectedYear] = useState('');
  const [selectedClassId, setSelectedClassId] = useState("");
  const [classes, setClasses] = useState([]);
  const [responseData, setResponseData] = useState({}); // Optional if you need the full response
  const [sections, setSections] = useState([]);
  const [selectedSectionId, setSelectedSectionId] = useState('');


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

  // API function for fetching attendance data
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

      // Fetch attendance data
      let url = ""; // Define the API URL here
      let responseData = await API.Getattendance(reqPage, rowsPerPage);

      console.log("API responseData:", responseData); // Log the full responseData

      // Add search filter if search term exists
      if (searchTerm) {
        url += `&search=${searchTerm}`;
      }

      if (responseData.status === true) {
        const updatedAttendance = responseData.data.map((attendance) => {
          const capitalizedFullName = attendance.subject.charAt(0).toUpperCase() + attendance.subject.slice(1);
          return { ...attendance, subject: capitalizedFullName };
        });

        setData(updatedAttendance);
        setTotalRows(responseData.pagination.totalRecords);

        // Set class list for dropdown
        if (Array.isArray(responseData.classes)) {
          setClassList(responseData.classes);
        }

        // Set section list for dropdown
        if (Array.isArray(responseData.section)) {
          setSectionList(responseData.section);
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
 


  // Fetch data when the component mounts or dependencies change
  // useEffect(() => {
  //   fetchresult();
  // }, [currentPage, rowsPerPage]); // Adding searchTerm, currentPage, and rowsPerPage as dependencies


  const monthYearOptions = [
    { month: 'January', year: 2021 },
    { month: 'February', year: 2022 },
    { month: 'March', year: 2023 },
    { month: 'April', year: 2023 },
    { month: 'May', year: 2023 },
    { month: 'June', year: 2023 },
    { month: 'July', year: 2023 },
    { month: 'August', year: 2023 },
    { month: 'September', year: 2023 },
    { month: 'October', year: 2023 },
    { month: 'November', year: 2023 },
    { month: 'December', year: 2023 },
    { month: 'January', year: 2024 },
    { month: 'February', year: 2024 },
    { month: 'March', year: 2024 },
    // ... add more if needed
  ];
  const uniqueMonths = [...new Set(monthYearOptions.map(item => item.month))];
  const uniqueYears = [...new Set(monthYearOptions.map(item => item.year))];
    
  const columns = [
    // {
    //   name: (
    //     <input
    //       type="checkbox"
    //       onChange={handleSelectAllChange}
    //       checked={selectedUsers.length === data.length && data.length > 0}
    //     />
    //   ), // Select all checkbox
    //   selector: (row) => (
    //     <input
    //       type="checkbox"
    //       onChange={() => handleCheckboxChange(row.id)}
    //       checked={selectedUsers.includes(row.id)}
    //     />
    //   ),
    //   width: "1%",
    // },
    
    {
      name: "date",
      selector: (row) => <span>{row.date}</span>,
      width: "20%",
    },
    {
      name: "subject",
      selector: (row) => <span>{row.subject}</span>,
      width: "20%",
    },
    {
      name: "status",
      selector: (row) => <span>{row.status}</span>,
      width: "20%",
    },
    {
      name: "term",
      selector: (row) => <span>{row.term}</span>,
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
      const url = "/user/delete"; // Use the correct delete API endpoint
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
      <svg xmlns="http://www.w3.org/2000/svg" height={25} width={38} viewBox="0 0 384 512"><path d="M192 0c-41.8 0-77.4 26.7-90.5 64L64 64C28.7 64 0 92.7 0 128L0 448c0 35.3 28.7 64 64 64l256 0c35.3 0 64-28.7 64-64l0-320c0-35.3-28.7-64-64-64l-37.5 0C269.4 26.7 233.8 0 192 0zm0 64a32 32 0 1 1 0 64 32 32 0 1 1 0-64zM128 256a64 64 0 1 1 128 0 64 64 0 1 1 -128 0zM80 432c0-44.2 35.8-80 80-80l64 0c44.2 0 80 35.8 80 80c0 8.8-7.2 16-16 16L96 448c-8.8 0-16-7.2-16-16z"/></svg>        <h2 className="text-xl font-bold sub-title"> Daily Attendance</h2>
      </div>
      <div className="button-crm">
        <div className="status-dropdown-section flex gap-4">
        

<div className="dropdown-container">
<div className="dropdown-attendance">
  <div className="inner-months">
  <select
    name="month"  
    value={selectedMonth}
    onChange={(e) => setSelectedMonth(e.target.value)}
  >
    <option value="">Select Month</option>
    {uniqueMonths.map((month) => (
      <option key={month} value={month}>
        {month}
      </option>
    ))}
  </select>
</div>
<div className="inner-year">
  <select
    name="year"
    value={selectedYear}
    onChange={(e) => setSelectedYear(e.target.value)}
  >
    <option value="">Select Year</option>
    
    {uniqueYears.map((year) => (
      <option key={year} value={year}>
        {year}
      </option>
    ))}
  </select>
  </div>
  <div className="inner-class">
        <select
          name="classId"
          value={selectedClassId}
          onChange={(e) => setSelectedClassId(e.target.value)}
        >
          <option value="">Select Class</option>
          {console.log("Classes data from state:", classList)} {/* Log classList state */}
          {classList && Array.isArray(classList) && 
            classList.map((cls) => (
              <option key={cls.id} value={cls.id}>
                {cls.className}
              </option>
            ))
          }
        </select>
      </div>



<div className="inner-section">
<select
      name="sectionId"
      value={selectedSectionId}
      onChange={(e) => setSelectedSectionId(e.target.value)}
    >
      <option value="">Select Section</option>
      {console.log("Classes data from ==yyyyyyyyyyyyyyyyyyyyyyyyyyyyyyyyyyyyyyyyyyyyy:", sections)} {/* Log classList state */}
      {sectionList && Array.isArray(sectionList) && 
            sectionList.map((item) => (
              <option key={item.id} value={item.id}>
                {item.name}
              </option>
            ))
          }
        
    </select>
</div>

</div>



          {/* <div className="outer-aply-section">
            <button
              type="submit"
              className="apply-section"
              onClick={handleApplyClick}
            >
              <svg
                fill="#fff"
                width={20}
                height={20}
                xmlns="http://www.w3.org/2000/svg"
                viewBox="0 0 448 512"
              >
                <path d="M438.6 105.4c12.5 12.5 12.5 32.8 0 45.3l-256 256c-12.5 12.5-32.8 12.5-45.3 0l-128-128c-12.5-12.5-12.5-32.8 0-45.3s32.8-12.5 45.3 0L160 338.7 393.4 105.4c12.5-12.5 32.8-12.5 45.3 0z" />
              </svg>
              <div>Apply</div>
            </button>
          </div> */}
          <PopupModal
            isOpen={isModalOpen}
            onClose={() => setIsModalOpen(false)}
          >
            <h2 className="text-xl font-bold mb-4">Fill the Form</h2>
            <ConfirmDelete />
          </PopupModal>
          {/* <div className="outer-delete-section">
            <button
              className="apply-section"
              // onClick={() => handleDeleteClick(user)}
            >
              <svg
                fill="#fff"
                width={20}
                height={20}
                xmlns="http://www.w3.org/2000/svg"
                viewBox="0 0 640 512"
              >
                <path d="M96 128a128 128 0 1 1 256 0A128 128 0 1 1 96 128zM0 482.3C0 383.8 79.8 304 178.3 304l91.4 0C368.2 304 448 383.8 448 482.3c0 16.4-13.3 29.7-29.7 29.7L29.7 512C13.3 512 0 498.7 0 482.3zM472 200l144 0c13.3 0 24 10.7 24 24s-10.7 24-24 24l-144 0c-13.3 0-24-10.7-24-24s10.7-24 24-24z" />
              </svg>
              <div onClick={handleDeleteUser}>Delete</div>
            </button>
          </div> */}
        </div>

       {/* <div className="inner-button">
        <button  onClick={fetchresult}>        
          Filter</button>
       </div> */}
      </div>

        <div className="inner-button">
        <button  onClick={fetchresult}>        
          Filter</button>
       </div> 

      {/* Toast Notifications */}
      <ToastContainer />
      {/* Error message */}
      {error && <div className="text-red-500">{error}</div>}

    
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

    
    </div>
  );
};

export default Attendance;
