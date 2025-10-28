import React from "react";
import { Routes, Route, Navigate } from "react-router-dom";
import { useUser } from "./Helpers/Context/UserContext.js";

// ✅ Layouts
import SuperAdminLayout from "./Layouts/SuperadminLayout.js";
import AdminLayout from "./Layouts/AdminLayout.js";

// ✅ Public Pages
import Homepage from "./Website/Home.js";
import Loginpage from "./Website/login.js";
import EducationLoginpage from "./Dashboard/Education/login.js";
import Registerpage from "./Website/registerform.js";
import Forgotpassword from "./Website/forgotpassword.js";
import Getotp from "./Website/getotp.js";
import NotFound from "./Website/NotFound.js";

const AppRoutes = () => {
  const { user } = useUser();
  const userRole = user?.role;
  console.log("userRole:", userRole);

  // ✅ Role-based layout mapping
  const roleLayoutMap = {
    superadmin: SuperAdminLayout,
    admin: AdminLayout,
  };

  const LayoutComponent = roleLayoutMap[userRole];

  return (
    <Routes>
      {/* ✅ Protected Dashboard Route */}
      <Route
        path="/dashboard/*"
        element={
          LayoutComponent ? (
            <LayoutComponent />
          ) : (
            <Navigate to="/login" replace />
          )
        }
      />

      {/* ✅ Public Routes */}
      <Route path="/" element={<Homepage />} />
      <Route path="/login" element={<EducationLoginpage />} />
      <Route path="/platform" element={<Loginpage />} />
      <Route path="/register" element={<Registerpage />} />
      <Route path="/forgotpassword" element={<Forgotpassword />} />
      <Route path="/getotp" element={<Getotp />} />
      <Route path="*" element={<NotFound />} />
    </Routes>
  );
};

export default AppRoutes;
