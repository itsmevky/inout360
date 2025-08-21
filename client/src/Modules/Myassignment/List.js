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

const Myassignment = () => {
  const [activeTab, setActiveTab] = useState("published");
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
  const [selectedSectionId, setSelectedSectionId] = useState("");
  const [sections, setSections] = useState([]);
  const [publishedAssignments, setPublishedAssignments] = useState([]);
  const [expiredAssignments, setExpiredAssignments] = useState([]);
  const [selectedSubjectId, setSelectedSubjectId] = useState("");
  const [subjectList, setSubjectList] = useState([]);
  const [teacherList, setTeacherList] = useState([]);
  const [selectedTeacherId, setSelectedTeacherId] = useState("");

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
      let reqPage = Math.max(parseInt(currentPage) || 0, 0);

      const responseData = await API.GetAssignment(
        reqPage,
        rowsPerPage,
        searchTerm
      );

      console.log("responseData", responseData);
      console.log("responseData.Teacher", responseData.Teacher);

      if (Array.isArray(responseData.subjects)) {
        setSubjectList(responseData.subjects);
      }

      if (Array.isArray(responseData.Teacher)) {
        setTeacherList(responseData.Teacher);
      }
      // Build subject lookup map
      const subjectLookup = (responseData.subjects || []).reduce(
        (acc, s) => ({ ...acc, [s.id]: s.subjectname }),
        {}
      );

      if (responseData?.data?.length) {
        const updatedRoutine = responseData.data.map((item) => ({
          ...item,
          className: item.className
            ? item.className.charAt(0).toUpperCase() + item.className.slice(1)
            : "",

          subjectName: subjectLookup[item.subject] || item.subject,
        }));

        setData(updatedRoutine);
        setTotalRows(responseData.pagination?.totalrecords || 0);

        if (Array.isArray(responseData.classes)) {
          setClassList(responseData.classes);
        }

        if (Array.isArray(responseData.sections)) {
          setSectionList(responseData.sections);
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
      name: "Title",
      selector: (row) => <span>{row.title}</span>,
      width: "20%",
    },

    // ====================day========================//
    {
      name: "Description",
      selector: (row) => <span>{row.description}</span>,
      width: "20%",
    },

    //========================subject========================//
    {
      name: "subject",
      selector: (row) => <span>{row.subject}</span>,
      width: "20%",
    },

    // ====================startTime========================//
    {
      name: "Deadline",
      selector: (row) => <span>{row.deadline}</span>,
      width: "20%",
    },
    // ====================endTime========================//

    {
      name: "PublishDate",
      selector: (row) => <span>{row.publishDate}</span>,
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
          width="18"
          viewBox="0 0 448 512"
        >
          <path
            d="M96 0C43 0 0
       43 0 96L0 416c0 53 43 96 96 96l288 0 32 0c17.7 0 32-14.3 32-32s-14.3-32-32-32l0-64c17.7
        0 32-14.3 32-32l0-320c0-17.7-14.3-32-32-32L384 0 96 0zm0 384l256 0 0 64L96 448c-17.7 0-32
        -14.3-32-32s14.3-32 32-32zm32-240c0-8.8 7.2-16 16-16l192 0c8.8 0 16 7.2 16 16s-7.2 16-16 16l
        -192 0c-8.8 0-16-7.2-16-16zm16 48l192 0c8.8 0 16 7.2 16 16s-7.2 16-16 16l-192 0c-8.8 0-16-7.2
        -16-16s7.2-16 16-16z"
          />
        </svg>
        <h2 className="text-xl font-bold sub-title">My assignment</h2>
      </div>
      <div className="button-crm">
        <div className="status-dropdown-section flex gap-4">

          <div className="dropdown-attendance">
            <div className="inner-class">
              <select
                name="subjectId"
                value={selectedSubjectId}
                onChange={(e) => setSelectedSubjectId(e.target.value)}
              >
                <option value="">All Subjects</option>
                {console.log("Subjects data from state:", subjectList)}{" "}
                {/* Log subjectList state */}
                {Array.isArray(subjectList) &&
                  subjectList.map((subj) => (
                    <option key={subj.id} value={subj.id}>
                      {subj.subjectname}
                    </option>
                  ))}
              </select>
            </div>
            <div className="inner-section">
              <select
                name="teacherId"
                value={selectedTeacherId}
                onChange={(e) => setSelectedTeacherId(e.target.value)}
              >
                <option value="">All Teachers</option>
                {Array.isArray(teacherList) &&
                  teacherList.map((teacher) => (
                    <option key={teacher.id} value={teacher.id}>
                      {teacher.fullname ||
                        `${teacher.first_name} ${teacher.last_name}`}
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
          <button onClick={fetchresult}>Filter</button>
        </div>
      </div>
      <h2 className="text-xl font-bold sub-title">Published assignment</h2>
      {/* Published Assignments Section */}
      <div className="assignmenttttts">
        <div className="section">
          <h3>📘 Published Assignments</h3>
          <div className="assignment-grid">
            {publishedAssignments.map((item) => (
              <div key={item.id} className="card">
                <h4>{item.title}</h4>
                <p>Total {item.totalQuestions} Questions</p>
                <p>Total marks: {item.totalMarks}</p>
                <p>Total obtained marks: {item.obtainedMarks}</p>
                <p>
                  Deadline:{" "}
                  <span className="text-warning">{item.deadline}</span>
                </p>
                <div className="teacher-info">
                  <img
                    src={item.teacherImage}
                    alt={item.teacherName}
                    width="30"
                  />
                  <p>{item.teacherName}</p>
                  <span className="subject-badge">{item.subject}</span>
                </div>
              </div>
            ))}
          </div>
        </div>

        <div className="section">
          <h3>📁 Expired Assignments</h3>
          <div className="assignment-grid">
            {expiredAssignments.map((item) => (
              <div key={item.id} className="card">
                <h4>{item.title}</h4>
                <p>Total {item.totalQuestions} Questions</p>
                <p>Total marks: {item.totalMarks}</p>
                <p>Total obtained marks: {item.obtainedMarks}</p>
                <p>
                  Deadline:{" "}
                  <span className="text-warning">{item.deadline}</span>
                </p>
                <div className="teacher-info">
                  <img
                    src={item.teacherImage}
                    alt={item.teacherName}
                    width="30"
                  />
                  <p>{item.teacherName}</p>
                  <span className="subject-badge">{item.subject}</span>
                </div>
              </div>
            ))}
          </div>
        </div>
      </div>

    

      <div className="card-assignment">

        <div>
          <section className="cardddssssss">
            <div>
              {" "}
              <h1>Chapter 3: Structure of atoms -3 </h1>
            </div>
            <div>
              <span>Total 5 Questions</span>
            </div>
            <div>
              <span>Total marks :<a className="totalmarks">17</a></span>
            </div>
            <div>
              <span>Total obtained marks : <a className="obtainedmarks">0</a></span>
            </div>
            <div>
              <span>Deadline :<a className="datedeadline">24 Jan 2026 </a></span>
            </div>
            <div>
              <img
                class="mr-2 rounded-circle"
                src="https://demo.creativeitem.com/ekattor/uploads/users/274.jpg"
                width="30"
                alt="Generic placeholder image"
              />
              <span>Alison Frami</span>
            </div>
            <div>
              <span className="subjectname">Physics</span>
            </div>

            <div class="progress-container">
              <div class="progress-track">
                <div class="progress-bar"></div>
              </div>
              <span class="progress-text">20%</span>
            </div>
              
              <div className="openasssgmentbtn">
            <button class="open-assignment-btn">Open assignment</button>
            </div>

          </section>
        </div>

        <div>
          <section className="cardddssssss">
            <div>
              {" "}
              <h1>Chapter 3: Structure of atoms -4 </h1>
            </div>
            <div>
              <span>Total 8 Questions</span>
            </div>
            <div>
              <span>Total marks :<a className="totalmarks"> 20</a></span>
            </div>
            <div>
              <span>Total obtained marks : <a className="obtainedmarks">0</a></span>
            </div>
            <div>
              <span>Deadline :<a className="datedeadline">24 Jan 2026</a></span>
            </div>
            <div>
              <img
                class="mr-2 rounded-circle"
                src="https://demo.creativeitem.com/ekattor/uploads/users/274.jpg"
                width="30"
                alt="Generic placeholder image"
              />
              <span>Alison Frami</span>
            </div>
            <div>
              <span className="subjectname">Physics</span>
            </div>

            <div class="progress-container">
              <div class="progress-track">
                <div class="progress-bar"></div>
              </div>
              <span class="progress-text">20%</span>
            </div>

              <div className="openasssgmentbtn">
            <button class="open-assignment-btn">Open assignment</button>
            </div>
          </section>
        </div>

        <div>
          <section className="cardddssssss">
            <div>
              {" "}
              <h1>Chapter 3: Structure of atoms -6 </h1>
            </div>
            <div>
              <span>Total 4 Questions</span>
            </div>
            <div>
              <span>Total marks :<a className="totalmarks"> 10</a></span>
            </div>
            <div>
              <span>Total obtained marks :<a className="obtainedmarks">0</a></span>
            </div>
            <div>
              <span>Deadline :<a className="datedeadline"> 24 Jan 2027</a></span>
            </div>
            <div>
              <img
                class="mr-2 rounded-circle"
                src="https://demo.creativeitem.com/ekattor/uploads/users/274.jpg"
                width="30"
                alt="Generic placeholder image"
              />
              <span>Alison Frami</span>
            </div>
            <div>
              <span className="subjectname">Physics</span>
            </div>

            <div class="progress-container">
              <div class="progress-track">
                <div class="progress-bar"></div>
              </div>
              <span class="progress-text">20%</span>
            </div>

            <div className="openasssgmentbtn">
            <button class="open-assignment-btn">Open assignment</button>
            </div>
          </section>
        </div>

        <div>
          <section className="cardddssssss">
            <div>
              {" "}
              <h1>Refraction of Light and Our Eyes </h1>
            </div>
            <div>
              <span>Total 6 Questions</span>
            </div>
            <div>
              <span>Total marks : <a className="totalmarks">10</a></span>
            </div>
            <div>
              <span>Total obtained marks :<a className="obtainedmarks"> 0</a></span>
            </div>
            <div>
              <span>Deadline :<a className="datedeadline">24 Jan 2027 </a></span>
            </div>
            <div>
              <img
                class="mr-2 rounded-circle"
                src="https://demo.creativeitem.com/ekattor/uploads/users/274.jpg"
                width="30"
                alt="Generic placeholder image"
              />
              <span>Alison Frami</span>
            </div>
            <div>
              <span className="subjectname">Physics</span>
            </div>

            <div class="progress-container">
              <div class="progress-track">
                <div class="progress-bar"></div>
              </div>
              <span class="progress-text">20%</span>
            </div>

              <div className="openasssgmentbtn">
            <button class="open-assignment-btn">Open assignment</button>
            </div>
          </section>
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
      {/* Background overlay when Add or Edit User form is visible */}
      {(isAddUserFormVisible || isEditUserFormVisible) && (
        <div className="fixed inset-0 bg-black opacity-50 z-40"></div>
      )}
    </div>
  );
};

export default Myassignment;
