import React, { useState, useEffect } from "react";
import { Routes, Route, useLocation } from "react-router-dom";
import Sidebar from "../Dashboardsidebaarmenu/Dashboardmenu";
import Header from "../SuperAdmin/header.js";
import Footer from "../SuperAdmin/footer.js";

// 🧩 All your shared modules
import Dashboard from "../SuperAdmin/Dashboard.js";
import GetUsers from "../Modules/Users/List";
import AddUser from "../Modules/Users/Add";
import EditUser from "../Modules/Users/Edit";
import Employees from "../Modules/Users/Employees/List";
import Roles from "../Modules/Users/Roles/List";
import PermissionsTable from "../Modules/Users/Permissions/permission";
import Attendance from "../Modules/Users/Attendance/List";
import Contractors from "../Modules/Users/Contractors/List";
import Rfid from "../Modules/Users/Rfid/List";
import Device from "../Modules/Users/Device/List";
import Zones from "../Modules/Users/Zones/List";
import Fields from "../Modules/Settings/Fields/Fieldlist";

function DashboardLayout({ userRole }) {
  const location = useLocation();
  const [isCollapsed, setIsCollapsed] = useState(false);

  useEffect(() => {
    console.log("📍 Current path:", location.pathname);
  }, [location.pathname]);

  // ✅ Universal layout styling
  return (
    <div className="AJ-dashboard min-h-screen flex">
      {/* Sidebar */}
      <Sidebar
        isCollapsed={isCollapsed}
        setIsCollapsed={setIsCollapsed}
        userRole={userRole}
      />

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
              {/* ✅ Dashboard */}
              <Route index element={<Dashboard />} />

              {/* ✅ Users */}
              <Route path="users" element={<GetUsers />} />
              <Route path="users/add" element={<AddUser />} />
              <Route path="users/edit/:id" element={<EditUser />} />

              {/* ✅ Employees, Roles, Permissions */}
              <Route path="users/employees" element={<Employees />} />
              <Route path="users/roles" element={<Roles />} />
              <Route path="users/permissions" element={<PermissionsTable />} />

              {/* ✅ Attendance */}
              <Route path="users/attendance" element={<Attendance />} />

              {/* ✅ Contractors, RFID, Device, Zones */}
              <Route path="users/contractor" element={<Contractors />} />
              <Route path="users/rfid" element={<Rfid />} />
              <Route path="users/device" element={<Device />} />
              <Route path="users/zones" element={<Zones />} />

              {/* ✅ Settings */}
              <Route path="settings/fields" element={<Fields />} />

              {/* ✅ Default fallback */}
              <Route path="*" element={<Dashboard />} />
            </Routes>
          </div>
        </main>

        <Footer />
      </div>
    </div>
  );
}

export default DashboardLayout;
