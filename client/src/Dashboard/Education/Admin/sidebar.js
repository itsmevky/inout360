import React, { useState, useEffect } from "react";
import { Link, useLocation, useHistory } from "react-router-dom";
import logo from "../../../Images/logo.png"; // Adjust path as needed
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
        { label: "Users", path: "/dashboard/users" },
        { label: "Student", path: "/dashboard/users/students" },
        { label: "Admission", path: "/dashboard/users/admission" },
        { label: "Admin", path: "/dashboard/users/admin" },
        { label: "Teacher", path: "/dashboard/users/teachers" },
        { label: "Parent", path: "/dashboard/users/parents" },
        { label: "Vendors", path: "/dashboard/users/vendors" },
        { label: "Employees", path: "/dashboard/users/employees" },
        { label: "Freelancers", path: "/dashboard/users/freelancers" },
        { label: "Roles", path: "/dashboard/users/roles" },
        { label: "Permissions", path: "/dashboard/users/permissions" },
      ],
    },
    {
      label: "Alumni",
      icon: (
        <svg
          width="20"
          fill="white"
          xmlns="http://www.w3.org/2000/svg"
          viewBox="0 0 448 512"
        >
          <path d="M219.3 .5c3.1-.6 6.3-.6 9.4 0l200 40C439.9 42.7 448 52.6 448 64s-8.1 21.3-19.3 23.5L352 102.9l0 57.1c0 70.7-57.3 128-128 128s-128-57.3-128-128l0-57.1L48 93.3l0 65.1 15.7 78.4c.9 4.7-.3 9.6-3.3 13.3s-7.6 5.9-12.4 5.9l-32 0c-4.8 0-9.3-2.1-12.4-5.9s-4.3-8.6-3.3-13.3L16 158.4l0-71.8C6.5 83.3 0 74.3 0 64C0 52.6 8.1 42.7 19.3 40.5l200-40zM111.9 327.7c10.5-3.4 21.8 .4 29.4 8.5l71 75.5c6.3 6.7 17 6.7 23.3 0l71-75.5c7.6-8.1 18.9-11.9 29.4-8.5C401 348.6 448 409.4 448 481.3c0 17-13.8 30.7-30.7 30.7L30.7 512C13.8 512 0 498.2 0 481.3c0-71.9 47-132.7 111.9-153.6z" />
        </svg>
      ),
      links: [
        { label: "Manage Alumni", path: "/dashboard/Alumni/Manage-Alumni" },
        { label: "Events", path: "/dashboard/Events/events" },
        { label: "Gallery", path: "/dashboard/Gallery/gallery" },
      ],
    },

    {
      label: "Form Module",
      icon: (
        <svg
          width="20"
          fill="white"
          xmlns="http://www.w3.org/2000/svg"
          viewBox="0 0 576 512"
        >
          <path d="M413.5 237.5c-28.2 4.8-58.2-3.6-80-25.4l-38.1-38.1C280.4 159 272 138.8 272 117.6l0-12.1L192.3 62c-5.3-2.9-8.6-8.6-8.3-14.7s3.9-11.5 9.5-14l47.2-21C259.1 4.2 279 0 299.2 0l18.1 0c36.7 0 72 14 98.7 39.1l44.6 42c24.2 22.8 33.2 55.7 26.6 86L503 183l8-8c9.4-9.4 24.6-9.4 33.9 0l24 24c9.4 9.4 9.4 24.6 0 33.9l-88 88c-9.4 9.4-24.6 9.4-33.9 0l-24-24c-9.4-9.4-9.4-24.6 0-33.9l8-8-17.5-17.5zM27.4 377.1L260.9 182.6c3.5 4.9 7.5 9.6 11.8 14l38.1 38.1c6 6 12.4 11.2 19.2 15.7L134.9 484.6c-14.5 17.4-36 27.4-58.6 27.4C34.1 512 0 477.8 0 435.7c0-22.6 10.1-44.1 27.4-58.6z" />
        </svg>
      ),
      links: [
        { label: "Forms", path: "/dashboard/forms/list" },
        { label: "Vender Fields", path: "/dashboard/Customfields/list" },
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

        { label: "Class", path: "/dashboard/academic/classes" },

        { label: "Rooms", path: "/dashboard/academic/rooms" },
        { label: "Department", path: "/dashboard/academic/departments" },

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
          label: "Live Class Settings",
          path: "/dashboard/LiveClass/liveclasssettings",
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
        { label: "Grades", path: "/dashboard/Examination/grades" },

        { label: "Promotions", path: "/dashboard/Examination/promotions" },

        {
          label: "Send Exam Marks",
          path: "/dashboard/Examination/SendExamMarks",
        },
      ],
    },
    {
      label: "Accounting",
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
        { label: "Fee", path: "/dashboard/Accounting/Fee" },
        {
          label: "Student Fee Manager",
          path: "/dashboard/StudentFeeManager",
        },
        {
          label: "Expense Category",
          path: "/dashboard/Accounting/ExpenseCategory",
        },

        {
          label: "Expense Manager",
          path: "/dashboard/Accounting/ExpenseManager",
        },
      ],
    },
    {
      label: "School",
      icon: (
        <svg
          fill="white"
          width="20"
          xmlns="http://www.w3.org/2000/svg"
          viewBox="0 0 640 512"
        >
          <path d="M337.8 5.4C327-1.8 313-1.8 302.2 5.4L166.3 96 48 96C21.5 96 0 117.5 0 144L0 464c0 26.5 21.5 48 48 48l208 0 0-96c0-35.3 28.7-64 64-64s64 28.7 64 64l0 96 208 0c26.5 0 48-21.5 48-48l0-320c0-26.5-21.5-48-48-48L473.7 96 337.8 5.4zM96 192l32 0c8.8 0 16 7.2 16 16l0 64c0 8.8-7.2 16-16 16l-32 0c-8.8 0-16-7.2-16-16l0-64c0-8.8 7.2-16 16-16zm400 16c0-8.8 7.2-16 16-16l32 0c8.8 0 16 7.2 16 16l0 64c0 8.8-7.2 16-16 16l-32 0c-8.8 0-16-7.2-16-16l0-64zM96 320l32 0c8.8 0 16 7.2 16 16l0 64c0 8.8-7.2 16-16 16l-32 0c-8.8 0-16-7.2-16-16l0-64c0-8.8 7.2-16 16-16zm400 16c0-8.8 7.2-16 16-16l32 0c8.8 0 16 7.2 16 16l0 64c0 8.8-7.2 16-16 16l-32 0c-8.8 0-16-7.2-16-16l0-64zM232 176a88 88 0 1 1 176 0 88 88 0 1 1 -176 0zm88-48c-8.8 0-16 7.2-16 16l0 32c0 8.8 7.2 16 16 16l32 0c8.8 0 16-7.2 16-16s-7.2-16-16-16l-16 0 0-16c0-8.8-7.2-16-16-16z" />
        </svg>
      ),
      links: [{ label: "Department", path: "/dashboard/school/department" }],
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
          label: "Session",
          path: "/dashboard/BackOffice/session",
        },
        {
          label: "Notice Board",
          path: "/dashboard/BackOffice/Noticeboard",
        },

        {
          label: "School Manager",
          path: "/dashboard/BackOffice/SchoolManager",
        },
      ],
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
          label: "Fields",
          path: "/dashboard/Settings/fields",
        },
        {
          label: "Groups",
          path: "/dashboard/Settings/groups",
        },
        {
          label: "Website Settings",
          path: "/dashboard/Settings/WebsiteSettings",
        },

        {
          label: "School Settings",
          path: "/dashboard/Settings/Schoolsettings",
        },

        {
          label: "Payment Settings",
          path: "/dashboard/Settings/Paymentsettings",
        },

        {
          label: "Language Settings",
          path: "/dashboard/Settings/Languagesettings",
        },

        { label: "Smtp Settings", path: "/dashboard/Settings/Smtpsettings" },
        { label: "About", path: "/dashboard/Settings/About" },
      ],
    },
    // {
    //   label: "Services",
    //   icon: "calendar_today",
    //   links: [
    //     { label: "IT Consulting", path: "/services/it-consulting" },
    //     { label: "Cloud Solutions", path: "/services/cloud" },
    //     { label: "Mobile Apps", path: "/services/mobile-apps" },
    //   ],
    // },
    // {
    //   label: "Notifications",
    //   icon: "notifications",
    //   links: [{ label: "Notifications", path: "/notifications" }],
    // },
    // {
    //   label: "Resources",
    //   icon: "local_library",
    //   links: [{ label: "Resources", path: "/resources" }],
    // },
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
