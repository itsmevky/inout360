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

const Studentfeemanager = () => {
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
      let reqPage = currentPage;

      // Handle currentPage type and ensure it's a valid number
      if (typeof currentPage === "string") {
        reqPage = parseInt(currentPage) - 1;
      } else if (typeof currentPage === "number") {
        reqPage = currentPage - 1;
      } else {
        reqPage = 0;
      }

      reqPage = reqPage < 0 ? 0 : reqPage;

      // Fetch data from the API directly with parameters
      let responseData = await API.Getstudentfeereport(
        reqPage,
        rowsPerPage,
        searchTerm
      );

      // Debugging the response data
      console.log(responseData);
      console.log("responseData of classes", responseData.classes);
      console.log("responseData of invoice", responseData.invoice);
      console.log("responseData of student", responseData.student);

      // Check the API response status
      if (responseData.status === true) {
        // Set the class list
        setClassList(responseData.classes || []);

        // Get the fees data and transform it
        const updatedFees = responseData.data;
        const invoices = responseData.invoice; // Get the invoices array
        const students = responseData.student;

        console.log("Classes data:", responseData.classes);
        console.log("Filtered Fees:", updatedFees);
        console.log("invoicesdddddd:", invoices);

        const transformedFees = updatedFees.map((fee, index) => {
          // Use the index to grab data from both arrays independently
          const invoice = invoices[index] || {}; // Safely access corresponding invoice
          const student = students[index] || {};

          return {
            ...fee,
            feeName: fee.feeName,
            amount: fee.amount,
            description: fee.description,
            applicableClasses: Array.isArray(fee.applicableClasses)
              ? fee.applicableClasses.join(", ")
              : "", // Ensure applicableClasses is an array
            totalAmount: invoice.totalAmount || 0, // Safely map totalAmount from invoice
            paidAmount: invoice.paidAmount || 0,
            issueDate: invoice.issueDate || 0,
            first_name: student.first_name|| 0,
            status: invoice.status || "Unpaid",
          };
        });

        // Create a string of class names
        const classNames = responseData.classes
          .map((cls) => cls.className)
          .join(", ");

        // Transform the data with all class names
        const transformedData = transformedFees.map((item) => ({
          ...item,
          allClassNames: classNames, // Apply the class names to each fee
        }));

        // Debugging transformed data
        console.log("classNames", classNames);
        console.log("Transformed Fees:", transformedData);

        // Set the transformed data and total rows
        setData(transformedData);
        setTotalRows(responseData.pagination.totalRecords);
      } else {
        setError("No data found"); // Handle no data scenario
      }
    } catch (error) {
      setError(error.message); // Handle any API call errors
    } finally {
      setLoading(false); // Reset loading state after the operation is complete
    }
  };

  useEffect(() => {
    console.log("Classes data from state:", classList);
  }, [classList]);

  const columns = [
    {
      name: "Student",
      selector: (row) => <span>{row.first_name}</span>,
      width: "8%",
    },
    {
      name: "Class",
      selector: (row) => <span>{row.allClassNames}</span>,
      width: "8%",
    },
    {
      name: "Invoice title",
      selector: (row) => <span>{row.feeName}</span>,
      width: "8%",
    },

    {
      name: "Total amount",
      selector: (row) => <span>{row.totalAmount}</span>,
      width: "8%",
    },
    {
      name: "Paid amount",
      selector: (row) => <span>{row.paidAmount}</span>,
      width: "8%",
    },
    {
      name: "Status",
      selector: (row) => (
        <span
          style={{
            backgroundColor: row.status === "Paid" ? "#d4edda" : "#f8d7da",
            color: row.status === "Paid" ? "#28a745" : "#dc3545",
            padding: "5px 10px",
            borderRadius: "12px",
            fontWeight: "600",
            fontSize: "14px",
            display: "inline-block",
            minWidth: "60px",
            textAlign: "center",
          }}
        >
          {row.status}
        </span>
      ),
      width: "10%",
    },
    {
      name: "Creation Date",
      selector: (row) => <span>{row.issueDate}</span>,
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
        <h2 className="text-xl font-bold sub-title">Student fee manager</h2>
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
      <h2 className="text-xl font-bold sub-title">STUDENT FEE REPORT</h2>

      {/* Toast Notifications */}
      <ToastContainer />
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

export default Studentfeemanager;
