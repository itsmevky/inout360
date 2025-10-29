import React, { useState, useEffect } from "react";
import { useLocation, useNavigate } from "react-router-dom";
import Cookies from "js-cookie";
import logo from "../Images/pidilite-logo-13.png";

const Sidebar = ({ isCollapsed, setIsCollapsed, userRole = "superadmin" }) => {
  const navigate = useNavigate();
  const location = useLocation();
  const [openDropdown, setOpenDropdown] = useState(null);
  const [activeLink, setActiveLink] = useState("");

  // ✅ Handle logout
  const handleLogout = () => {
    localStorage.removeItem("accesstoken");
    Cookies.remove("accesstoken");
    Cookies.remove("userdetail");
    navigate("/login");
  };

  // ✅ Collapse automatically on small screens
  useEffect(() => {
    if (window.innerWidth <= 1024) setIsCollapsed(true);
  }, [setIsCollapsed]);

  // ✅ Track current path
  useEffect(() => {
    const normalizedPath = location.pathname.endsWith("/")
      ? location.pathname.slice(0, -1)
      : location.pathname;
    setActiveLink(normalizedPath);
  }, [location.pathname]);

  // ✅ Dynamic base path by role
  const basePath =
    userRole === "superadmin" || userRole === "admin"
      ? "/dashboard/users"
      : "/dashboard/employee";

  // ✅ Full list of all possible menu items
  const allNavItems = [
    { label: "Dashboard", icon: "dashboard", path: "/dashboard" },
    { label: "Employees", icon: "group", path: `${basePath}/employees` },
    { label: "Attendance", icon: "event", path: `${basePath}/attendance` },
    { label: "Contractors", icon: "badge", path: `${basePath}/contractor` },
    { label: "Rfid", icon: "qr_code", path: `${basePath}/rfid` },
    { label: "Zones", icon: "map", path: `${basePath}/zones` },
    {
      label: "Settings",
      icon: "settings",
      sublinks: [
        {
          label: "System Settings",
          path: "/dashboard/settings/systemsettings",
        },
        {
          label: "Website Settings",
          path: "/dashboard/settings/websitesettings",
        },
        {
          label: "Language Settings",
          path: "/dashboard/settings/languagesettings",
        },
        { label: "SMTP Settings", path: "/dashboard/settings/smtpsettings" },
        { label: "About", path: "/dashboard/settings/about" },
      ],
    },
    { label: "Device", icon: "devices", path: `${basePath}/device` },
  ];

  // ✅ Role-based visibility rules
  const roleAccess = {
    superadmin: [
      "Dashboard",
      "Employees",
      "Attendance",
      "Contractors",
      "Rfid",
      "Zones",
      "Device",
      "Settings",
    ],
    admin: [
      "Dashboard",
      "Employees",
      "Attendance",
      "Contractors",
      "Rfid",
      "Device",
    ],
    hr: ["Dashboard", "Employees", "Attendance"],
    employee: ["Dashboard", "Attendance"],
  };

  // ✅ Filter menu items for current role
  const visibleNavItems = allNavItems.filter((item) =>
    roleAccess[userRole?.toLowerCase()]?.includes(item.label)
  );

  // ✅ Dropdown toggle
  const toggleDropdown = (label) => {
    setOpenDropdown((prev) => (prev === label ? null : label));
  };

  return (
    <aside className={`sidebar ${isCollapsed ? "collapsed" : ""}`}>
      {/* Header */}
      <header className="sidebar-header">
        <img src={logo} alt="Pidilite" style={{ height: 40 }} />
        <button
          className="sidebar-toggler"
          onClick={() => setIsCollapsed(!isCollapsed)}
        >
          <span className="material-symbols-rounded">chevron_left</span>
        </button>
      </header>

      {/* Navigation */}
      <nav className="sidebar-nav">
        <ul className="nav-list primary-nav">
          {visibleNavItems.map((item) => {
            const isActive =
              location.pathname.toLowerCase() ===
              (item.path || "").toLowerCase();

            return (
              <li
                key={item.label}
                className={`nav-item ${isActive ? "active" : ""}`}
              >
                <div
                  className="nav-link"
                  onClick={() =>
                    item.sublinks
                      ? toggleDropdown(item.label)
                      : navigate(item.path)
                  }
                  role="button"
                  tabIndex={0}
                >
                  {item.icon && (
                    <span className="material-symbols-rounded">
                      {item.icon}
                    </span>
                  )}
                  <span className="nav-label">{item.label}</span>
                  {item.sublinks && (
                    <span className="dropdown-icon material-symbols-rounded">
                      {openDropdown === item.label
                        ? "keyboard_arrow_up"
                        : "keyboard_arrow_down"}
                    </span>
                  )}
                </div>

                {/* Dropdown menu */}
                {item.sublinks && (
                  <ul
                    className="dropdown-menu"
                    style={{
                      height:
                        openDropdown === item.label
                          ? `${item.sublinks.length * 40}px`
                          : "0",
                    }}
                  >
                    {item.sublinks.map((link) => (
                      <li
                        key={link.path}
                        className={`nav-subitem ${
                          location.pathname === link.path ? "active" : ""
                        }`}
                        onClick={() => navigate(link.path)}
                      >
                        {link.label}
                      </li>
                    ))}
                  </ul>
                )}
              </li>
            );
          })}
        </ul>

        {/* Footer */}
        <ul className="nav-list secondary-nav">
          <li className="nav-item">
            <div onClick={handleLogout} className="nav-link cursor-pointer">
              <span className="material-symbols-rounded">logout</span>
              <span className="nav-label">Sign Out</span>
            </div>
          </li>
        </ul>
      </nav>
    </aside>
  );
};

export default Sidebar;
