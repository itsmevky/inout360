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
    alumni: false,
    academic: false,
    liveClasses: false,
    examination: false,
    accounting: false,
    backOffice: false,
    settings: false,
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
      label: "Trips",
      icon: (
        <svg
          width="20"
          fill="white"
          xmlns="http://www.w3.org/2000/svg"
          viewBox="0 0 640 512"
        >
          <path d="M381 114.9L186.1 41.8c-16.7-6.2-35.2-5.3-51.1 2.7L89.1 67.4C78 73 77.2 88.5 87.6 95.2l146.9 94.5L136 240 77.8 214.1c-8.7-3.9-18.8-3.7-27.3 .6L18.3 230.8c-9.3 4.7-11.8 16.8-5 24.7l73.1 85.3c6.1 7.1 15 11.2 24.3 11.2l137.7 0c5 0 9.9-1.2 14.3-3.4L535.6 212.2c46.5-23.3 82.5-63.3 100.8-112C645.9 75 627.2 48 600.2 48l-57.4 0c-20.2 0-40.2 4.8-58.2 14L381 114.9zM0 480c0 17.7 14.3 32 32 32l576 0c17.7 0 32-14.3 32-32s-14.3-32-32-32L32 448c-17.7 0-32 14.3-32 32z" />
        </svg>
      ),
      links: [
        { label: "Trips", path: "/dashboard/Trips" },
        // { label: "Trip", path: "/dashboard/Trips/trip" },
      ],
    },
    {
      label: "User",
      icon: (
        <svg
          width="20"
          fill="white"
          xmlns="http://www.w3.org/2000/svg"
          viewBox="0 0 448 512"
        >
          <path d="M224 256A128 128 0 1 0 224 0a128 128 0 1 0 0 256zm-45.7 48C79.8 304 0 383.8 0 482.3C0 498.7 13.3 512 29.7 512l388.6 0c16.4 0 29.7-13.3 29.7-29.7C448 383.8 368.2 304 269.7 304l-91.4 0z" />
        </svg>
      ),
      links: [{ label: "User", path: "/dashboard/User/User" }],
      links: [{ label: "Teacher", path: "/dashboard/Teacher/Teacher" }],
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
          label: "Class Routine",
          path: "/dashboard/Academic/classroutine",
        },
        { label: "Syllabus", path: "/dashboard/academic/syllabus" },
        { label: "Event Calender", path: "/dashboard/academic/eventcalender" },
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

        { label: "Grades", path: "/dashboard/Examination/grades" },
      ],
    },
    {
      label: "Student fee manager",
      icon: (
        <svg
          width="20"
          fill="white"
          xmlns="http://www.w3.org/2000/svg"
          viewBox="0 0 512 512"
        >
          <path d="M184 48l144 0c4.4 0 8 3.6 8 8l0 40L176 96l0-40c0-4.4 3.6-8 8-8zm-56 8l0 40L64 96C28.7 96 0 124.7 0 160l0 96 192 0 128 0 192 0 0-96c0-35.3-28.7-64-64-64l-64 0 0-40c0-30.9-25.1-56-56-56L184 0c-30.9 0-56 25.1-56 56zM512 288l-192 0 0 32c0 17.7-14.3 32-32 32l-64 0c-17.7 0-32-14.3-32-32l0-32L0 288 0 416c0 35.3 28.7 64 64 64l384 0c35.3 0 64-28.7 64-64l0-128z" />
        </svg>
      ),
      links: [
        {
          label: "Student Fee Manager",
          path: "/dashboard/StudentFeeManager",
        },
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

        {
          label: "Book list manager",
          path: "/dashboard/BackOffice/book list manager",
        },
      ],
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
