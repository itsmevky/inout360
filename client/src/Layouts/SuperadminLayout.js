import React, { useState, useEffect } from "react";
import { Routes, Route, useLocation } from "react-router-dom";

// Core Layout Components
import Sidebar from "../SuperAdmin/sidebar";
import Header from "../SuperAdmin/header";
import Footer from "../SuperAdmin/footer";

// Dashboard
import Dashboard from "../SuperAdmin/Dasboard";

// Users Module
import GetUsers from "../Modules/Users/List.js";
import Employee from "../Modules/Users/Add.js";
import EditUserForm from "../Modules/Users/Edit.js";
import Editemployee from "../Modules/Users/Edit.js";

// Employees, Roles, Permissions
import Employees from "../Modules/Users/Employees/List.js";
import Roles from "../Modules/Users/Roles/List.js";
import PermissionsTable from "../Modules/Users/Permissions/permission.js";

// Contractors / RFID
import Contractor from "../Modules/SuperAdminDashboard/Contractors/List.js";
import Addcontractor from "../Modules/Users/Contractors/Add.js";
import Editcontractor from "../Modules/Users/Contractors/Edit.js";
import Rfidlist from "../Modules/Users/Rfid/List.js";
import Rfidadd from "../Modules/Users/Rfid/Add.js";
import Editrfid from "../Modules/Users/Rfid/Edit.js";

// Attendance
import Attendancelist from "../Modules/Users/Attendance/List.js";
import Addattendance from "../Modules/Users/Attendance/Add.js";
import EditAttendance from "../Modules/Users/Attendance/Edit.js";
import Device from "../Modules/SuperAdminDashboard/Device/List.js";
import Zones from "../Modules/SuperAdminDashboard/Zones/List.js";
// Settings
import Fields from "../Modules/Settings/Fields/Fieldlist.js";

function SuperAdminLayout() {
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

  return (
    <div className="AJ-dasboard min-h-screen flex">
      {/* Sidebar */}
      <Sidebar isCollapsed={isCollapsed} setIsCollapsed={setIsCollapsed} />

      {/* Right Section */}
      <div
        className="flex flex-col transition-all duration-300"
        style={{
          width: isCollapsed ? "94%" : "80%",
          marginLeft: isCollapsed ? "6%" : "18%",
        }}
      >
        <Header />

        <main className="flex-1 mt-2">
          <div className="p-4 shadow min-h-[calc(100vh-2%)]">
            <Routes>
              <Route path="/" element={<Dashboard />} />

              {/* Users */}
              <Route path="/users" element={<GetUsers />} />
              <Route path="/users/add" element={<Employee />} />
              <Route path="/users/edit/:id" element={<EditUserForm />} />
              <Route path="/users/employees" element={<Employees />} />
              <Route path="/users/editemployee" element={<Editemployee />} />

              {/* Roles & Permissions */}
              <Route path="/roles" element={<Roles />} />
              <Route path="/permissions" element={<PermissionsTable />} />

              {/* Attendance */}
              <Route path="users/Attendance" element={<Attendancelist />} />
              <Route path="/attendance/add" element={<Addattendance />} />
              <Route path="/attendance/edit/:id" element={<EditAttendance />} />

              {/* Contractors */}
              <Route path="users/Contractor" element={<Contractor />} />
              <Route path="users/contractors/add" element={<Addcontractor />} />
              <Route
                path="/contractors/edit/:id"
                element={<Editcontractor />}
              />

              {/* RFID */}
              <Route path="users/Rfid" element={<Rfidlist />} />
              <Route path="/rfid/add" element={<Rfidadd />} />
              <Route path="/rfid/edit/:id" element={<Editrfid />} />

              {/* Settings */}
              <Route path="/settings/fields" element={<Fields />} />
              <Route path="users/device" element={<Device />} />
              <Route path="users/zones" element={<Zones />} />

              {/* Fallback */}
              <Route path="*" element={<Dashboard />} />
            </Routes>
          </div>
        </main>

        <Footer />
      </div>
    </div>
  );
}

export default SuperAdminLayout;
