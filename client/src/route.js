import React from "react";
import {
  BrowserRouter as Router,
  Routes,
  Route,
  Navigate,
} from "react-router-dom";
import "./App.css";
import { getUserRole } from "./helpers/utils.js";

// Layouts
import AdminLayout from "./layouts/AdminLayout.js";
import Teacherlayout from "./layouts/Teacherlayout.js";
import WebsiteLayout from "./layouts/WebsiteLayout.js";
import Studentlayout from "./layouts/Studentlayout.js";
import ParentLayout from "./layouts/ParentLayout.js";
import SuperAdminLayout from "./Layouts/SuperadminLayout.js";
import PermissionDenied from "./Website/PermissionDenied.js";

// Public Pages
import Registerpage from "./Website/registerform.js";
import Getotp from "./Website/getotp.js";
import Homepage from "./Website/Home.js";
import NotFound from "./Website/NotFound.js";
import Loginpage from "./Website/login.js";
import Forgotpassword from "./Website/forgotpassword.js";

// Dashboards
import SuperadminDashboard from "./SuperAdmin/Dasboard.js";
import AdminDashboard from "./Admin/admindashboard.js";
import TeacherDashboard from "./Teacher/teacherdashboard.js";
import ParentDashboard from "./SuperAdmin/Dasboard.js";
import ContractorDashboard from "./Dashboard/Education/Contractor/Dasboard.js";
import SupervisorDashboard from "./Dashboard/Education/Supervisor/Dasboard.js";
import HRDashboard from "./Dashboard/Education/HR/Dasboard.js";

const App = () => {
  // Get the role from utils or hardcode temporarily
  const userRole = getUserRole() || "super_admin";
  console.log("Current userRole:", userRole);

  // Role → Layout mapping
  const roleLayoutMap = {
    super_admin: SuperAdminLayout,
    admin: AdminLayout,
    teacher: Teacherlayout,
    student: Studentlayout,
    parent: ParentLayout,
  };

  const LayoutComponent = roleLayoutMap[userRole];

  return (
    <Router>
      <Routes>
        {/* ✅ Role-based Dashboard Route */}
        <Route
          path="/dashboard/*"
          element={LayoutComponent ? <LayoutComponent /> : <PermissionDenied />}
        />

        {/* ✅ Public Website Routes */}
        <Route path="/" element={<Homepage />} />
        <Route path="/login" element={<Loginpage />} />
        <Route path="/register" element={<Registerpage />} />
        <Route path="/forgotpassword" element={<Forgotpassword />} />
        <Route path="/getotp" element={<Getotp />} />
        <Route path="/permission-denied" element={<PermissionDenied />} />

        {/* ✅ Fallbacks */}
        <Route path="*" element={<NotFound />} />

        {/* ✅ Optional: Direct dashboard routes */}
        <Route path="/dashboard/superadmin" element={<SuperadminDashboard />} />
        <Route path="/dashboard/admin" element={<AdminDashboard />} />
        <Route path="/dashboard/teacher" element={<TeacherDashboard />} />
        <Route path="/dashboard/parent" element={<ParentDashboard />} />
        <Route path="/dashboard/contractor" element={<ContractorDashboard />} />
        <Route path="/dashboard/supervisor" element={<SupervisorDashboard />} />
        <Route path="/dashboard/hr" element={<HRDashboard />} />
      </Routes>
    </Router>
  );
};

export default App;
