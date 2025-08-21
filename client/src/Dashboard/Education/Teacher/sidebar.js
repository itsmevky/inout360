import React, { useState, useEffect } from "react";
import { Link, useLocation, useHistory } from "react-router-dom";
import logo from "../../../Images/logo.png";
import { useNavigate } from "react-router-dom";
import { FiChevronDown, FiChevronUp } from "react-icons/fi";

import Cookies from "js-cookie";

const domainpath = process.env.REACT_APP_API_DOMAIN_ENDPOINT;

const Sidebar = ({ isCollapsed, setIsCollapsed }) => {
  const handleLogout = () => {
    localStorage.removeItem("accesstoken");
    Cookies.remove("accesstoken");
    Cookies.remove("userdetail");
    navigate("/login");
  };
  const [openDropdown, setOpenDropdown] = useState(null);
  // const [isCollapsed, setIsCollapsed] = useState(false);
  const toggleSidebar = () => {
    setIsCollapsed((prev) => !prev);
    setOpenDropdown(null); // Close dropdowns when collapsing
  };

  const toggleDropdown = (label) => {
    setOpenDropdown((prev) => (prev === label ? null : label));
  };
  useEffect(() => {
    if (window.innerWidth <= 1024) {
      setIsCollapsed(true);
    }
  }, []);

  //   // State for tracking the active section
  const [activeSection, setActiveSection] = useState("superadmin");
  const [activeLink, setActiveLink] = useState("");
  const location = useLocation();
  const [dropdownOpen, setDropdownOpen] = useState({
    users: false,
    academic: false,
    liveClasses: false,
    examination: false,
    backOffice: false,
    assignment: false,
    onlinecourses: false,
    
  });
  const navItems = [
    {
      label: "Dashboard",
      icon: "dashboard",
      links: [{ label: "Dashboard", path: "/dashboard" }],
    },
    // {
    //   label: "Notifications",
    //   icon: "notifications",
    //   links: [{ label: "Notifications", path: "/notifications" }],
    // },
    {
      label: "Users",
      icon: (
        <svg
          width="20"
          fill="white"
          xmlns="http://www.w3.org/2000/svg"
          viewBox="0 0 640 512"
        >
          <path d="M144 0a80 80 0 1 1 0 160A80 80 0 1 1 144 0zM512 0a80 80 0 1 1 0 160A80 80 0 1 1 512 0zM0 298.7C0 239.8 47.8 192 106.7 192l42.7 0c15.9 0 31 3.5 44.6 9.7c-1.3 7.2-1.9 14.7-1.9 22.3c0 38.2 16.8 72.5 43.3 96c-.2 0-.4 0-.7 0L21.3 320C9.6 320 0 310.4 0 298.7zM405.3 320c-.2 0-.4 0-.7 0c26.6-23.5 43.3-57.8 43.3-96c0-7.6-.7-15-1.9-22.3c13.6-6.3 28.7-9.7 44.6-9.7l42.7 0C592.2 192 640 239.8 640 298.7c0 11.8-9.6 21.3-21.3 21.3l-213.3 0zM224 224a96 96 0 1 1 192 0 96 96 0 1 1 -192 0zM128 485.3C128 411.7 187.7 352 261.3 352l117.3 0C452.3 352 512 411.7 512 485.3c0 14.7-11.9 26.7-26.7 26.7l-330.7 0c-14.7 0-26.7-11.9-26.7-26.7z" />
        </svg>
      ),
      links: [
       
        { label: "Student", path: "/dashboard/users/students" },
        { label: "Teacher", path: "/dashboard/users/teachers" },
       
      ],
    },
  
  
    {
      label: "Academic",
      icon: (
        <svg
          width="20"
          fill="white"
          xmlns="http://www.w3.org/2000/svg"
          viewBox="0 0 448 512"
        >
          <path d="M96 0C43 0 0 43 0 96L0 416c0 53 43 96 96 96l288 0 32 0c17.7 0 32-14.3 32-32s-14.3-32-32-32l0-64c17.7 0 32-14.3 32-32l0-320c0-17.7-14.3-32-32-32L384 0 96 0zm0 384l256 0 0 64L96 448c-17.7 0-32-14.3-32-32s14.3-32 32-32zm32-240c0-8.8 7.2-16 16-16l192 0c8.8 0 16 7.2 16 16s-7.2 16-16 16l-192 0c-8.8 0-16-7.2-16-16zm16 48l192 0c8.8 0 16 7.2 16 16s-7.2 16-16 16l-192 0c-8.8 0-16-7.2-16-16s7.2-16 16-16z" />
        </svg>
      ),
      links: [
        {
          label: "Daily Attendance",
          path: "/dashboard/Academic/dailyattendance",
        },
        {
          label: "Biometric Attendance",
          path: "/dashboard/Academic/biometricattendance",
        },
        {
          label: "Class Routine",
          path: "/dashboard/Academic/classroutine",
        },

        { label: "Subject", path: "/dashboard/academic/subjects" },
        { label: "Syllabus", path: "/dashboard/academic/syllabus" },

     

        { label: "Event Calender", path: "/dashboard/academic/eventcalender" },
      ],
    },
    {
      label: "Live Class",
      icon: (
        <svg
          fill="white"
          width="20"
          xmlns="http://www.w3.org/2000/svg"
          viewBox="0 0 576 512"
        >
          <path d="M0 128C0 92.7 28.7 64 64 64l256 0c35.3 0 64 28.7 64 64l0 256c0 35.3-28.7 64-64 64L64 448c-35.3 0-64-28.7-64-64L0 128zM559.1 99.8c10.4 5.6 16.9 16.4 16.9 28.2l0 256c0 11.8-6.5 22.6-16.9 28.2s-23 5-32.9-1.6l-96-64L416 337.1l0-17.1 0-128 0-17.1 14.2-9.5 96-64c9.8-6.5 22.4-7.2 32.9-1.6z" />
        </svg>
      ),
      links: [
        {
          label: "Your Live Class",
          path: "/dashboard/LiveClass/yourliveclass",
        },
         {
          label: "Add New",
          path: "/dashboard/LiveClass/addnew",
        },
      ],
    },
    {
      label: "Examination",
      icon: (
        <svg
          fill="white"
          width="20"
          xmlns="http://www.w3.org/2000/svg"
          viewBox="0 0 384 512"
        >
          <path d="M192 0c-41.8 0-77.4 26.7-90.5 64L64 64C28.7 64 0 92.7 0 128L0 448c0 35.3 28.7 64 64 64l256 0c35.3 0 64-28.7 64-64l0-320c0-35.3-28.7-64-64-64l-37.5 0C269.4 26.7 233.8 0 192 0zm0 64a32 32 0 1 1 0 64 32 32 0 1 1 0-64zM112 192l160 0c8.8 0 16 7.2 16 16s-7.2 16-16 16l-160 0c-8.8 0-16-7.2-16-16s7.2-16 16-16z" />
        </svg>
      ),
      links: [
        { label: "Marks", path: "/dashboard/Examination/freelancors" },
        { label: "Examinations", path: "/dashboard/Examination/examinations" },
       
      ],
    },
   
   
    {
      label: "Back Office",
      icon: (
        <svg
          fill="white"
          width="20"
          xmlns="http://www.w3.org/2000/svg"
          viewBox="0 0 384 512"
        >
          <path d="M48 0C21.5 0 0 21.5 0 48L0 464c0 26.5 21.5 48 48 48l96 0 0-80c0-26.5 21.5-48 48-48s48 21.5 48 48l0 80 96 0c26.5 0 48-21.5 48-48l0-416c0-26.5-21.5-48-48-48L48 0zM64 240c0-8.8 7.2-16 16-16l32 0c8.8 0 16 7.2 16 16l0 32c0 8.8-7.2 16-16 16l-32 0c-8.8 0-16-7.2-16-16l0-32zm112-16l32 0c8.8 0 16 7.2 16 16l0 32c0 8.8-7.2 16-16 16l-32 0c-8.8 0-16-7.2-16-16l0-32c0-8.8 7.2-16 16-16zm80 16c0-8.8 7.2-16 16-16l32 0c8.8 0 16 7.2 16 16l0 32c0 8.8-7.2 16-16 16l-32 0c-8.8 0-16-7.2-16-16l0-32zM80 96l32 0c8.8 0 16 7.2 16 16l0 32c0 8.8-7.2 16-16 16l-32 0c-8.8 0-16-7.2-16-16l0-32c0-8.8 7.2-16 16-16zm80 16c0-8.8 7.2-16 16-16l32 0c8.8 0 16 7.2 16 16l0 32c0 8.8-7.2 16-16 16l-32 0c-8.8 0-16-7.2-16-16l0-32zM272 96l32 0c8.8 0 16 7.2 16 16l0 32c0 8.8-7.2 16-16 16l-32 0c-8.8 0-16-7.2-16-16l0-32c0-8.8 7.2-16 16-16z" />
        </svg>
      ),
      links: [
        
        { label: "Library", path: "/dashboard/BackOffice/library" },
        { label: "Book list manager", path: "/dashboard/BackOffice/Booklistmanager" },  
      
      ],
    },
     {
      label: "Assignment",
      icon: (
        <svg
          xmlns="http://www.w3.org/2000/svg"
          viewBox="0 0 24 24"
          width="20"
          fill="white">
    <path d="M19 3h-4.18C14.4 1.84 13.3 1 12 1c-1.3 0-2.4.84-2.82 2H5c-1.1 0-2 .9-2 2v16c0 1.1.9 2 2 2h14c1.1 0 2-.9 2-2V5c0-1.1-.9-2-2-2zm-7 0c.55 0 1 .45 1 1s-.45 1-1 1-1-.45-1-1 .45-1 1-1zm2 14H7v-2h7v2zm3-4H7v-2h10v2zm0-4H7V7h10v2z"/>
</svg>
      ),
      links: [{ label: "Assignment", path: "/dashboard/assignment" }],
    },
    {
      label: "Online Courses",
      icon: (
        <svg
          width="20"
          fill="white"
          xmlns="http://www.w3.org/2000/svg"
          viewBox="0 0 512 512"
        >
          <path d="M0 128C0 92.7 28.7 64 64 64l384 0c35.3 0 64 28.7 64 64l0 256c0 35.3-28.7 64-64 64L64 448c-35.3 0-64-28.7-64-64L0 128zm64 32l0 64c0 17.7 14.3 32 32 32l320 0c17.7 0 32-14.3 32-32l0-64c0-17.7-14.3-32-32-32L96 128c-17.7 0-32 14.3-32 32zM80 320c-13.3 0-24 10.7-24 24s10.7 24 24 24l56 0c13.3 0 24-10.7 24-24s-10.7-24-24-24l-56 0zm136 0c-13.3 0-24 10.7-24 24s10.7 24 24 24l48 0c13.3 0 24-10.7 24-24s-10.7-24-24-24l-48 0z" />
        </svg>
      ),
      links: [{ label: "Online Courses", path: "/dashboard/Online Courses" }],
    },
   
  ];

  const navigate = useNavigate();
  const userType = "superadmin"; // This value should come from an API or context
  useEffect(() => {
    const pathname = location.pathname;
    const normalizedPathname = pathname.endsWith("/")
      ? pathname.slice(0, -1)
      : pathname;
    setActiveLink(normalizedPathname);
  }, [location.pathname]);

  return (
    <div className="sidebar-sections">
      <div className="left-navbars">
        <div className="vertical-sections">
          <aside className={`sidebar ${isCollapsed ? "collapsed" : ""}`}>
            {/* Sidebar Header */}
            <header className="sidebar-header">
              <a href="#" className="header-logo">
                <img src={logo} alt="CodingNepal" />
              </a>
              <button className="sidebar-toggler" onClick={toggleSidebar}>
                <span className="material-symbols-rounded">chevron_left</span>
              </button>
            </header>

            <nav className="sidebar-nav">
              <ul className="nav-list primary-nav">
                <>
                  {navItems.map((item) => {
                    const isActive = item.links.some(
                      (link) => link.path === location.pathname
                    );

                    return (
                      <li
                        key={item.label}
                        className={`nav-item dropdown-container ${
                          openDropdown === item.label ? "open" : ""
                        } ${isActive ? "open active" : ""}`} // active for main item
                      >
                        <div
                          className="nav-link dropdown-toggle"
                          onClick={() => {
                            if (item.links.length === 1) {
                              navigate(item.links[0].path);
                            } else {
                              toggleDropdown(item.label);
                            }
                          }}
                          role="button"
                          tabIndex={0}
                        >
                          <span className="material-symbols-rounded">
                            {item.icon}
                          </span>
                          <span className="nav-label">{item.label}</span>
                          {item.links.length > 1 && (
                            <span className="dropdown-icon material-symbols-rounded">
                              keyboard_arrow_down
                            </span>
                          )}
                        </div>

                        {item.links.length > 1 ? (
                          <ul
                            className="dropdown-menu"
                            style={{
                              height:
                                openDropdown === item.label
                                  ? `${item.links.length * 40 + 40}px`
                                  : "0",
                            }}
                          >
                            <li className="nav-item">
                              <div className="nav-link dropdown-title">
                                {item.label}
                              </div>
                            </li>

                            {item.links.map((link, i) => {
                              const isSubActive =
                                location.pathname === link.path;

                              return (
                                <li
                                  key={i}
                                  className={`nav-item ${
                                    isSubActive ? "open active" : ""
                                  }`}
                                >
                                  <div
                                    className={`nav-link dropdown-link ${
                                      isSubActive ? "open active" : ""
                                    }`}
                                    onClick={() => navigate(link.path)}
                                    role="button"
                                    tabIndex={0}
                                  >
                                    {link.label}
                                  </div>
                                </li>
                              );
                            })}
                          </ul>
                        ) : (
                          <ul className="dropdown-menu single-hover">
                            <li
                              className={`nav-item ${
                                location.pathname === item.links[0].path
                                  ? "open active"
                                  : ""
                              }`}
                              onClick={() => navigate(item.links[0].path)}
                            >
                              <div className="nav-link dropdown-title">
                                {item.label}
                              </div>
                            </li>
                          </ul>
                        )}
                      </li>
                    );
                  })}
                </>
              </ul>

              <ul className="nav-list secondary-nav">
                <li className="nav-item">
                  <a href="#" onClick={handleLogout} className="nav-link">
                    <span className="material-symbols-rounded">logout</span>
                    <span className="nav-label">Sign Out</span>
                  </a>
                </li>
              </ul>
            </nav>
          </aside>
        </div>
      </div>

      {/* Render the appropriate layout */}
      {/* {renderActiveSection()} */}
    </div>
  );
};

export default Sidebar;
