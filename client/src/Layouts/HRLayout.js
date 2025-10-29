import React, { useState, useEffect } from "react";
import { Routes, Route, useLocation } from "react-router-dom";
import Dashboard from "../SuperAdmin/Dasboard";
import AddUserForm from "../Modules/Users/Add.js";
import EditUser from "../Modules/Users/Edit";
import Sidebar from "../HRdashboard/sidebar.js";
import Header from "../SuperAdmin/header.js";
import Footer from "../SuperAdmin/footer.js";
import PermissionsTable from "../Modules/Users/Permissions/permission.js";
import GetUsers from "../Modules/Users/List.js";
import Attendance from "../Modules/Users/Attendance/List.js";
import Contractors from "../Modules/Users/Contractors/List.js";
import Rfid from "../Modules/Users/Rfid/List.js";
import Fields from "../Modules/Settings/Fields/Fieldlist.js";
import Employees from "../Modules/Users/Employees/List.js";
import Roles from "../Modules/Users/Roles/List.js";
import Freelancers from "../Modules/Users/Freelancors/List.js";
import Device from "../Modules/Users/Device/List.js";
import Zones from "../Modules/Users/Zones/List.js";

function HRLayout() {
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
              <Route path="users/freelancers" element={<Freelancers />} />
              <Route path="users/roles" element={<Roles />} />
              <Route path="users/employees" element={<Employees />} />
              <Route path="users/permissions" element={<PermissionsTable />} />
              <Route path="users" element={<GetUsers />} />
              <Route path="edit-user/:id" element={<EditUser />} />
              <Route path="settings/fields" element={<Fields />} />
              <Route path="users/attendance" element={<Attendance />} />
              <Route path="users/contractor" element={<Contractors />} />
              <Route path="users/rfid" element={<Rfid />} />
              <Route path="users/device" element={<Device />} />
              <Route path="users/zones" element={<Zones />} />
            </Routes>
          </div>
        </main>

        <Footer />
      </div>
    </div>
  );
}

export default HRLayout;
