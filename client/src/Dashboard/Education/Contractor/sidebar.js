import React, { useState, useEffect } from "react";
import { Link, useLocation, useHistory } from "react-router-dom";
import logo from "../../../Images/pidilite-logo-11.png"; 
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

    //*****************************Employees****************************************/
    {
      label: "Employees",
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
        { label: "Employees", path: "/dashboard/users/Employees" },
        // { label: "Roles", path: "/dashboard/users/roles" },
          // { label: "Permissions", path: "/dashboard/users/permissions" },
      ],
    },
    //********************************Attendance***********************************/

      {
      label: "Attendance",
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
        { label: "Employees", path: "/dashboard/users/Attendance" },
        // { label: "Roles", path: "/dashboard/users/roles" },
          // { label: "Permissions", path: "/dashboard/users/permissions" },
      ],
    },

    //********************************Contractors***********************************/
      {
      label: "Contractors",
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
        { label: "Employees", path: "/dashboard/users/Contractor" },
        // { label: "Roles", path: "/dashboard/users/roles" },
          // { label: "Permissions", path: "/dashboard/users/permissions" },
      ],
    },

    //********************************Section***********************************/
   
       {
      label: "Section",
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
        { label: "Employees", path: "/dashboard/users/Section" },
        // { label: "Roles", path: "/dashboard/users/roles" },
          // { label: "Permissions", path: "/dashboard/users/permissions" },
      ],
    },

        //********************************Rfid***********************************/

       {
      label: "Rfid",
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
        { label: "Employees", path: "/dashboard/users/Rfid" },
        // { label: "Roles", path: "/dashboard/users/roles" },
          // { label: "Permissions", path: "/dashboard/users/permissions" },
      ],
    },

    // {
    
    //   links: [
       
      
    //     {
    //       label: "Rfid",
    //       path: "/dashboard/modules/Rfid",
    //     },
    //   ],
    // },

    // {
    //   label: "Businesses",
    //   icon: (
    //     <svg
    //       width="20"
    //       fill="white"
    //       xmlns="http://www.w3.org/2000/svg"
    //       viewBox="0 0 640 512"
    //     >
    //       <path d="M480 48c0-26.5-21.5-48-48-48L336 0c-26.5 0-48 21.5-48 48l0 48-64 0 0-72c0-13.3-10.7-24-24-24s-24 10.7-24 24l0 72-64 0 0-72c0-13.3-10.7-24-24-24S64 10.7 64 24l0 72L48 96C21.5 96 0 117.5 0 144l0 96L0 464c0 26.5 21.5 48 48 48l256 0 32 0 96 0 160 0c26.5 0 48-21.5 48-48l0-224c0-26.5-21.5-48-48-48l-112 0 0-144zm96 320l0 32c0 8.8-7.2 16-16 16l-32 0c-8.8 0-16-7.2-16-16l0-32c0-8.8 7.2-16 16-16l32 0c8.8 0 16 7.2 16 16zM240 416l-32 0c-8.8 0-16-7.2-16-16l0-32c0-8.8 7.2-16 16-16l32 0c8.8 0 16 7.2 16 16l0 32c0 8.8-7.2 16-16 16zM128 400c0 8.8-7.2 16-16 16l-32 0c-8.8 0-16-7.2-16-16l0-32c0-8.8 7.2-16 16-16l32 0c8.8 0 16 7.2 16 16l0 32zM560 256c8.8 0 16 7.2 16 16l0 32c0 8.8-7.2 16-16 16l-32 0c-8.8 0-16-7.2-16-16l0-32c0-8.8 7.2-16 16-16l32 0zM256 176l0 32c0 8.8-7.2 16-16 16l-32 0c-8.8 0-16-7.2-16-16l0-32c0-8.8 7.2-16 16-16l32 0c8.8 0 16 7.2 16 16zM112 160c8.8 0 16 7.2 16 16l0 32c0 8.8-7.2 16-16 16l-32 0c-8.8 0-16-7.2-16-16l0-32c0-8.8 7.2-16 16-16l32 0zM256 304c0 8.8-7.2 16-16 16l-32 0c-8.8 0-16-7.2-16-16l0-32c0-8.8 7.2-16 16-16l32 0c8.8 0 16 7.2 16 16l0 32zM112 320l-32 0c-8.8 0-16-7.2-16-16l0-32c0-8.8 7.2-16 16-16l32 0c8.8 0 16 7.2 16 16l0 32c0 8.8-7.2 16-16 16zm304-48l0 32c0 8.8-7.2 16-16 16l-32 0c-8.8 0-16-7.2-16-16l0-32c0-8.8 7.2-16 16-16l32 0c8.8 0 16 7.2 16 16zM400 64c8.8 0 16 7.2 16 16l0 32c0 8.8-7.2 16-16 16l-32 0c-8.8 0-16-7.2-16-16l0-32c0-8.8 7.2-16 16-16l32 0zm16 112l0 32c0 8.8-7.2 16-16 16l-32 0c-8.8 0-16-7.2-16-16l0-32c0-8.8 7.2-16 16-16l32 0c8.8 0 16 7.2 16 16z" />
    //     </svg>
    //   ),
    //   links: [
    //     { label: "Business", path: "/dashboard/business" },
    //     { label: "Business Types", path: "/dashboard/business/businesstypes" },
    //   ],
    // },

    {
      label: "Settings",
      icon: (
        <svg
          fill="white"
          width="20"
          xmlns="http://www.w3.org/2000/svg"
          viewBox="0 0 512 512"
        >
          <path d="M495.9 166.6c3.2 8.7 .5 18.4-6.4 24.6l-43.3 39.4c1.1 8.3 1.7 16.8 1.7 25.4s-.6 17.1-1.7 25.4l43.3 39.4c6.9 6.2 9.6 15.9 6.4 24.6c-4.4 11.9-9.7 23.3-15.8 34.3l-4.7 8.1c-6.6 11-14 21.4-22.1 31.2c-5.9 7.2-15.7 9.6-24.5 6.8l-55.7-17.7c-13.4 10.3-28.2 18.9-44 25.4l-12.5 57.1c-2 9.1-9 16.3-18.2 17.8c-13.8 2.3-28 3.5-42.5 3.5s-28.7-1.2-42.5-3.5c-9.2-1.5-16.2-8.7-18.2-17.8l-12.5-57.1c-15.8-6.5-30.6-15.1-44-25.4L83.1 425.9c-8.8 2.8-18.6 .3-24.5-6.8c-8.1-9.8-15.5-20.2-22.1-31.2l-4.7-8.1c-6.1-11-11.4-22.4-15.8-34.3c-3.2-8.7-.5-18.4 6.4-24.6l43.3-39.4C64.6 273.1 64 264.6 64 256s.6-17.1 1.7-25.4L22.4 191.2c-6.9-6.2-9.6-15.9-6.4-24.6c4.4-11.9 9.7-23.3 15.8-34.3l4.7-8.1c6.6-11 14-21.4 22.1-31.2c5.9-7.2 15.7-9.6 24.5-6.8l55.7 17.7c13.4-10.3 28.2-18.9 44-25.4l12.5-57.1c2-9.1 9-16.3 18.2-17.8C227.3 1.2 241.5 0 256 0s28.7 1.2 42.5 3.5c9.2 1.5 16.2 8.7 18.2 17.8l12.5 57.1c15.8 6.5 30.6 15.1 44 25.4l55.7-17.7c8.8-2.8 18.6-.3 24.5 6.8c8.1 9.8 15.5 20.2 22.1 31.2l4.7 8.1c6.1 11 11.4 22.4 15.8 34.3zM256 336a80 80 0 1 0 0-160 80 80 0 1 0 0 160z" />
        </svg>
      ),
      links: [
        {
          label: "System Settings",
          path: "/dashboard/Settings/Systemsettings",
        },

        {
          label: "Website Settings",
          path: "/dashboard/Settings/WebsiteSettings",
        },

        {
          label: "Language Settings",
          path: "/dashboard/Settings/Languagesettings",
        },

        { label: "Smtp Settings", path: "/dashboard/Settings/Smtpsettings" },
        { label: "About", path: "/dashboard/Settings/About" },
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
