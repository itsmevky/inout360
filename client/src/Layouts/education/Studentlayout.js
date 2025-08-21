import React, { useState, useEffect } from "react";
import { Routes, Route, useLocation } from "react-router-dom";
import Dashboard from "../..//Dashboard/Education/Student/Dasboard";
import StudentUser from "../../Modules/Users/Students/User.js";
import AddUserForm from "../../Modules/Users/Add.js";
import AddTeacher from "../../Modules/Users/Teachers/addteacher.js";
import AddStudent from "../../Modules/Users/Students/Add.js";
import Rooms from "../../Modules/Academics/Rooms/List.js";
import Departments from "../../Modules/Academics/Department/List.js";
import Subjects from "../../Modules/Academics/Subjects/List.js";
import Schedules from "../../Modules/Academics/Schedules/List.js";
import Courses from "../../Modules/Academics/Courses/List.js";
import Attendance from "../../Modules/Academics/dailyattendance/List.js";
import EditUser from "../../Modules/Users/Edit";
import Sidebar from "../../Dashboard/Education/Student/sidebar";
import Header from "../../Dashboard/Education/header.js";
import Footer from "../../Dashboard/Education/footer.js";
import PermissionsTable from "../../Modules/Users/Permissions/permission.js";
import GetUsers from "../../Modules/Users/List.js";
import Fields from "../../Modules/Settings/Fields/Fieldlist.js";
import Teachers from "../../Modules/Users/Teachers/List.js";
import Students from "../../Modules/Users/Students/List.js";
import Employees from "../../Modules/Users/Employees/List.js";
import Roles from "../../Modules/Users/Roles/List.js";
import Vendors from "../../Modules/Users/vendors/List.js";
import Freelancers from "../../Modules/Users/Freelancors/List.js";
import Parents from "../../Modules/Users/Parents/List.js";
import Liveclass from "../../Modules/Live class/List.js";
import PermissionDenied from "../../Website/PermissionDenied.js";
import Class_routine from "../../Modules/Academics/Class_routine/List.js"
import Examination from "../../Modules/Examination/List.js";
import Syllabus from "../../Modules/Academics/syllabus/List.js"
import Grades from "../../Modules/Grades/List.js"
import Studentfeemanager from "../../Modules/Accounting/Studentfeemanager/List.js"
import Booklistmanager from "../../Modules/Library/Booklistmanager/List.js"
import Bookissuereport from "../../Modules/Library/Booklistmanager/Bookissuereport/List.js";
import Onlinecourse from "../../Modules/Onlinecourse/List.js";
import Myassignment from "../../Modules/Myassignment/List.js";





function StudentLayout() {
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
              <Route path="/student" element={<StudentUser />} />
              <Route path="/add-user" element={<AddUserForm />} />
              <Route path="/users/teacher/add" element={<AddTeacher />} />
              <Route path="/users/student/add" element={<AddStudent />} />
              <Route path="/users/teachers" element={<Teachers />} />
              <Route path="/users/students" element={<Students />} />
              <Route path="/users/parents" element={<Parents />} />
              <Route path="/users/freelancers" element={<Freelancers />} />
              <Route path="/users/roles" element={<Roles />} />
              <Route path="/users/employees" element={<Employees />} />
              <Route path="/users/vendors" element={<Vendors />} />
              <Route path="/users/permissions" element={<PermissionsTable />} />
              <Route path="/users" element={<GetUsers />} />
              <Route path="/edit-user/:id" element={<EditUser />} />
              <Route path="/academic/rooms" element={<Rooms />} />
              <Route path="/academic/departments" element={<Departments />} /> 
              <Route path="/academic/courses" element={<Courses />} />
              <Route path="/academic/dailyattendance" element={<Attendance/>} />
              <Route path="/academic/subjects" element={<Subjects />} />
              <Route path="/academic/schedules" element={<Schedules />} />
              <Route path="/LiveClass/liveclasssettings" element={<Liveclass/>} />
              <Route path="/Settings/fields" element={<Fields />} />
              <Route path="/academic/classroutine" element={<Class_routine />} />
              <Route path="/Examination/Marks" element={<Examination />} />
              <Route path="/academic/syllabus" element={<Syllabus />} />
              <Route path="/Examination/grades" element={<Grades />}/>
              <Route path="Accounting/StudentFeeManager" element={<Studentfeemanager />} />
              <Route path="BackOffice/library/Booklistmanager" element={<Booklistmanager />} />
              <Route path="BackOffice/library/Bookissuereport" element={<Bookissuereport />} />
              <Route path="OnlineCourses" element={<Onlinecourse />} />
              <Route path="Myassignment" element={<Myassignment />} />




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

export default StudentLayout;
