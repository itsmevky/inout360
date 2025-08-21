import React, { useState } from "react";
import SuperAdminLayout from "../layouts/SuperadminLayout";
import AdminLayout from "../layouts/AdminLayout";
import TeacherLayout from "../layouts/Teacherlayout";
import ParentLayout from "../layouts/ParentLayout";
import StudentLayout from "../layouts/Studentlayout";

const Sidebar = () => {
  // State to control which section is visible
  const [activeSection, setActiveSection] = useState("personal", "superadmin");
  const [showAccountantOptions, setShowAccountantOptions] = useState(false);
  const [selectedAccountantOption, setSelectedAccountantOption] = useState("");

  // Function to handle Accountant button click
  const handleAccountantClick = () => {
    setShowAccountantOptions(!showAccountantOptions); // Toggle the visibility of options
  };

  // Function to handle selection from Accountant options
  const handleAccountantOptionChange = (event) => {
    setSelectedAccountantOption(event.target.value); // Capture the selected option
    setActiveSection("accounting"); // Update section to accounting when an option is selected
  };

  // Function to handle section button clicks
  const showSection = (section) => {
    setActiveSection(section); // Update the state with the selected section
  };

  const renderActiveSection = () => {
    switch (activeSection) {
      case "superadmin":
        return <SuperAdminLayout />;
      case "admin":
        return <AdminLayout />;
      case "teacher":
        return <TeacherLayout />;
      case "student":
        return <StudentLayout />;
      case "parent":
        return <ParentLayout />;
      case "accounting":
        return (
          <div>
            <h3>Accounting Section</h3>
            <p>You selected: {selectedAccountantOption}</p>
          </div>
        );
      default:
        return <h2>Select a section</h2>;
    }
  };

  return (
    <div className="home-section-dashboard-outer">
      <div className="home-section">
        <div className="left-navbar">
          <div className="vertical-section">
            <ul>
              <li>
                <button
                  className={activeSection === "dashboard" ? "active" : ""}
                  onClick={() => showSection("dashboard")}
                >
                  <div className="dashboard-log">
                    <svg
                      fill="#272B41"
                      width={15}
                      height={15}
                      xmlns="http://www.w3.org/2000/svg"
                      viewBox="0 0 512 512"
                    >
                      <path d="M0 256a256 256 0 1 1 512 0A256 256 0 1 1 0 256zm320 96c0-15.9-5.8-30.4-15.3-41.6l76.6-147.4c6.1-11.8 1.5-26.3-10.2-32.4s-26.2-1.5-32.4 10.2L262.1 288.3c-2-.2-4-.3-6.1-.3c-35.3 0-64 28.7-64 64s28.7 64 64 64s64-28.7 64-64z" />
                    </svg>
                    <div>Dashboard</div>
                  </div>
                </button>
              </li>

              <li onClick={handleAccountantClick}>
                <button
                  className={activeSection === "accounting" ? "active" : ""}
                  onClick={handleAccountantClick}
                >
                  Accounting
                </button>
                {showAccountantOptions && (
                  <div className="accountant-options">
                    <li value="" disabled></li>
                    <li value="reporting">Reporting</li>
                    <li value="invoice">Invoice Management</li>
                    <li value="payments">Payments</li>
                  </div>
                )}
              </li>
            </ul>
          </div>
        </div>

        {/* Academic Information Section */}
        <div className="section-content-inner">
          <div className="section-content">{renderActiveSection()}</div>
        </div>
      </div>
    </div>
  );
};

export default Sidebar;
