import React, { useState, useEffect } from "react";
import { Routes, Route, useLocation } from "react-router-dom";
import Dashboard from "../SuperAdmin/Dasboard";
import AddUserForm from "../Modules/Employee/Add.js";
import EditUser from "../Modules/Employee/Edit";
import Sidebar from "../Employeedashboard/sidebar.js";
import Header from "../SuperAdmin/header.js";
import Footer from "../SuperAdmin/footer.js";
import PermissionsTable from "../Modules/Employee/Permissions/permission.js";
import GetUsers from "../Modules/Employee/List.js";
import Attendance from "../Modules/Employee/Attendance/List.js";
import Contractors from "../Modules/Employee/Contractors/List.js";
import Rfid from "../Modules/Employee/Rfid/List.js";
import Fields from "../Modules/Settings/Fields/Fieldlist.js";
import Employees from "../Modules/Employee/Employees/List.js";
import Roles from "../Modules/Employee/Roles/List.js";
import Freelancers from "../Modules/Employee/Freelancors/List.js";
import Device from "../Modules/Employee/Device/List.js";
import Zones from "../Modules/Employee/Zones/List.js";

function EmployeeLayout() {
  const getCookie = (name) => {
    const cookies = document.cookie.split("; ");
    for (let cookie of cookies) {
      const [cookieName, cookieValue] = cookie.split("=");
      if (cookieName === name) {
        return decodeURIComponent(cookieValue);
      }
    }
    return null;
  };

  const useLocalStorage = (key) => {
    const [storedValue, setStoredValue] = useState(() => {
      return localStorage.getItem(key) || getCookie(key) || null;
    });

    useEffect(() => {
      const cookieValue = getCookie(key);
      if (cookieValue && !localStorage.getItem(key)) {
        localStorage.setItem(key, cookieValue);
        setStoredValue(cookieValue);
      }
    }, [key]);

    return storedValue;
  };

  const user = useLocalStorage("accessToken");
  const location = useLocation();
  const [isCollapsed, setIsCollapsed] = useState(false);
  console.log("Current path:", location.pathname);

  return (
    <div className="AJ-dasboard min-h-screen flex">
      {/* Sidebar on the left */}
      <Sidebar isCollapsed={isCollapsed} setIsCollapsed={setIsCollapsed} />

      {/* Right section: Header + Main + Footer */}
      <div
        className="flex flex-col transition-all duration-300"
        style={{
          width: isCollapsed ? "94%" : "80%",
          marginLeft: isCollapsed ? "6%" : "18%",
        }}
      >
        {/* Header */}
        <Header />

        {/* Main content */}
        <main className="flex-1 mt-2">
          <div className="p-4 shadow min-h-[calc(100vh-2%)]">
            <Routes>
              <Route index element={<Dashboard />} />
              <Route path="add-user" element={<AddUserForm />} />
              <Route path="employee/freelancers" element={<Freelancers />} />
              <Route path="employee/roles" element={<Roles />} />
              <Route path="employee" element={<Employees />} />
              <Route
                path="employee/permissions"
                element={<PermissionsTable />}
              />
              <Route path="users" element={<GetUsers />} />
              <Route path="edit-user/:id" element={<EditUser />} />
              <Route path="settings/fields" element={<Fields />} />
              <Route path="employee/attendance" element={<Attendance />} />
              <Route path="employee/contractor" element={<Contractors />} />
              <Route path="employee/rfid" element={<Rfid />} />
              <Route path="employee/device" element={<Device />} />
              <Route path="employee/zones" element={<Zones />} />
            </Routes>
          </div>
        </main>

        <Footer />
      </div>
    </div>
  );
}

export default EmployeeLayout;
