import React from "react";
import { Routes, Route, Navigate } from "react-router-dom";
import { useUser } from "./Helpers/Context/UserContext.js";
import ProtectedRoute from "./Layouts/ProtectedRoute.js";
import DashboardLayout from "./Dashboardlayout/Dashboardlayout.js";

// Public pages
import Homepage from "./Website/Home.js";
import Loginpage from "./Website/login.js";
import EducationLoginpage from "./Dashboard/Education/login.js";
import Registerpage from "./Website/registerform.js";
import Forgotpassword from "./Website/forgotpassword.js";
import Getotp from "./Website/getotp.js";
import NotFound from "./Website/NotFound.js";
import Unauthorized from "./Website/Unauthorized.js";

const AppRoutes = () => {
  const { user } = useUser();
  if (user === undefined) return <div>Loading...</div>;

  const userRole = user?.role?.toLowerCase().replace("_", "") || "";
  console.log("Detected role:", user?.role, "→ normalized:", userRole);

  const allowedRoles = ["superadmin", "admin", "hr", "employee"];

  return (
    <Routes>
      {/* Protected Dashboard Route */}
      <Route
        path="/dashboard/*"
        element={
          user && allowedRoles.includes(userRole) ? (
            <ProtectedRoute allowedRoles={[userRole]}>
              <DashboardLayout userRole={userRole} />
            </ProtectedRoute>
          ) : (
            <Navigate to="/login" replace />
          )
        }
      />

      {/* Public Routes */}
      <Route path="/" element={<Homepage />} />
      <Route path="/login" element={<EducationLoginpage />} />
      <Route path="/platform" element={<Loginpage />} />
      <Route path="/register" element={<Registerpage />} />
      <Route path="/forgotpassword" element={<Forgotpassword />} />
      <Route path="/getotp" element={<Getotp />} />
      <Route path="/unauthorized" element={<Unauthorized />} />
      <Route path="*" element={<NotFound />} />
    </Routes>
  );
};

export default AppRoutes;
