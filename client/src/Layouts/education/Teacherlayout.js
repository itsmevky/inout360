import React, { useState, useEffect } from "react";
import { Routes, Route, useLocation } from "react-router-dom";
import Dashboard from "../..//Dashboard/Education/Teacher/Dasboard";

import Sidebar from "../../Dashboard/Education/Teacher/sidebar";
import Header from "../../Dashboard/Education/header.js";
import Footer from "../../Dashboard/Education/footer.js";

// import GetTeacher from "../../Modules/Users/Teachers/Add.js";
// import GetStudent from "../../Modules/"
import PermissionDenied from "../../Website/PermissionDenied.js";

function TeacherLayout() {
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
              {/* all your defined routes */}
              <Route path="" element={<Dashboard />} />
              {/* <Route path="/users/students" element={<GetStudent />} /> */}

              {/* <Route path="/users/teachers" element={<GetTeacher />} /> */}

              {/* 🚫 Fallback route for undefined paths */}
              <Route path="*" element={<PermissionDenied />} />
            </Routes>
          </div>
        </main>

        <Footer />
      </div>
    </div>
  );
}

export default TeacherLayout;
