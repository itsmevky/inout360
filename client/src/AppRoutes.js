import React from "react";
import { Routes, Route, Navigate } from "react-router-dom";
import { useUser } from "./Helpers/Context/UserContext.js";
import ProtectedRoute from "./Layouts/ProtectedRoute.js";

// ✅ Layouts
import SuperAdminLayout from "./Layouts/SuperadminLayout.js";
import AdminLayout from "./Layouts/AdminLayout.js";
import HRLayout from "./Layouts/HRLayout.js";
import EmployeeLayout from "./Layouts/EmployeeLayout.js";

// ✅ Public Pages
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

  if (user === undefined) {
    return <div>Loading...</div>;
  }

  const userRole = user?.role?.toLowerCase().replace("_", "") || "";
  console.log("Detected role:", user?.role, "→ normalized:", userRole);

  const roleLayoutMap = {
    superadmin: SuperAdminLayout,
    admin: AdminLayout,
    hr: HRLayout,
    employee: EmployeeLayout,
  };

  const LayoutComponent = roleLayoutMap[userRole];

  return (
    <Routes>
      <Route
        path="/dashboard/*"
        element={
          user ? (
            LayoutComponent ? (
              <ProtectedRoute allowedRoles={[userRole]}>
                <LayoutComponent />
              </ProtectedRoute>
            ) : (
              <Navigate to="/unauthorized" replace />
            )
          ) : (
            <Navigate to="/login" replace />
          )
        }
      />

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
