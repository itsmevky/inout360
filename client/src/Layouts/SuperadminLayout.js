import React, { useState, useEffect } from "react";
import { Routes, Route, useLocation } from "react-router-dom";
import Dashboard from "../SuperAdmin/Dasboard";
import StudentUser from "../Modules/Users/Students/User.js";
import Employee from "../Modules/Users/Add.js";
// import AddUserForm from "../Modules/Users/Add.js";
import AddTeacher from "../Modules/Users/Teachers/addteacher.js";
import AddStudent from "../Modules/Users/Students/Add.js";
import Rooms from "../Modules/Academics/Rooms/List.js";
import Departments from "../Modules/Academics/Department/List.js";
import Subjects from "../Modules/Academics/Subjects/List.js";
import Schedules from "../Modules/Academics/Schedules/List.js";
import Courses from "../Modules/Academics/Courses/List.js";
import EditUserForm from "../Modules/Users/Edit";
import Sidebar from "../SuperAdmin/sidebar";
import Header from "../SuperAdmin/header.js";
import Footer from "../SuperAdmin/footer.js";
import Modules from "../Modules/Business Module/Business/List.js";
// import Attendance from "../Modules/Attendance/List.js"
// import Globalfields from "../Modules/Module/GlobalFields/Globalfieldlist.js";
import Businesstypes from "../Modules/Business Module/Business Type/List.js";
import AddGlobalBusinesstypes from "../Modules/Business Module/Business Type/Add.js";
import AddBusinesstypes from "../Modules/Business Module/Business/Addbusiness.js";
// import AddGlobalfields from "../Modules/Module/GlobalFields/Add.js";
// import EditGlobalfields from "../Modules/Module/GlobalFields/Edit.js";
import PermissionsTable from "../Modules/Users/Permissions/permission.js";
import GetUsers from "../Modules/Users/List.js";
import Fields from "../Modules/Settings/Fields/Fieldlist.js";
import Teachers from "../Modules/Users/Teachers/List.js";
import Students from "../Modules/Users/Students/List.js";
import Employees from "../Modules/Users/Employees/List.js";
import Roles from "../Modules/Users/Roles/List.js";
import Vendors from "../Modules/Users/vendors/List.js";
import Freelancers from "../Modules/Users/Freelancors/List.js";
import Parents from "../Modules/Users/Parents/List.js";
import Classes from "../Modules/Academics/Classes/List.js";
import Editemployee from "../Modules/Users/Edit.js";
import Section from "../Modules/Users/Section/List.js";
import AddSection from "../Modules/Users/Section/Add.js";
import  Attendancelist from "../Modules/Users/Attendance/List.js"; 
import EditAttendance from "../Modules/Users/Attendance/Edit.js";
import Addattendance from "../Modules/Users/Attendance/Add.js";
import Contractorlist from "../Modules/Users/Contractors/List.js"
import Addcontractor from "../Modules/Users/Contractors/Add.js";
import Editcontractor from "../Modules/Users/Contractors/Edit.js";
import Rfidlist from "../Modules/Users/Rfid/List.js"
import Rfidadd from "../Modules/Users/Rfid/Add.js";
import Editrfid from "../Modules/Users/Rfid/Edit.js";



// import ModuleGlobalfields from "../Modules/Module/GlobalFields/Globalfieldlist.js";
// import Groups from "../Modules/Module/GlobalFields/Groups/list.js";
// import GlobalfieldsEdit from "../Modules/Module/GlobalFields/Edit.js";
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
              <Route path="" element={<Dashboard />} />
              <Route path="/student" element={<StudentUser />} />
              <Route path="/users/teacher/add" element={<AddTeacher />} />
              <Route path="Settings/fields" element={<Fields />} />
              <Route path="/users/student/add" element={<AddStudent />} />
              <Route path="/users/teachers" element={<Teachers />} />
              <Route path="/users/students" element={<Students />} />
              <Route path="/users/parents" element={<Parents />} />
              <Route path="/users/freelancers" element={<Freelancers />} />
              <Route path="/users/roles" element={<Roles />} />
              <Route path="/users/employees" element={<Employees />} />
              <Route path="/users/employe" element={<Employee />} />
              <Route path="/users/editemployee" element={<Editemployee />} />
              <Route path="/users/vendors" element={<Vendors />} />
              <Route path="/users/permissions" element={<PermissionsTable />} />
              <Route path="/users/Section" element={<Section />} />
              <Route path="/users/AddSection" element={<AddSection />} />
              <Route path="/users" element={<GetUsers />} />
              <Route path="/edit-user/:id" element={<EditUserForm />} />
              <Route path="/academic/rooms" element={<Rooms />} />
              <Route path="/academic/departments" element={<Departments />} />
              <Route path="/academic/courses" element={<Courses />} />
              <Route path="/academic/subjects" element={<Subjects />} />
              <Route path="/academic/schedules" element={<Schedules />} />
              <Route path="/academic/classes" element={<Classes />} />
             <Route path="/users/Attendance" element={<Attendancelist />} />
              <Route path="/users/Addattendance" element={<Addattendance />} />
              <Route path="/users/EditAttendance" element={<EditAttendance />} />
              <Route path="/users/Contractor" element={<Contractorlist />} />
              <Route path="/users/AddContractor" element={<Addcontractor />} />
              <Route path="/users/Editcontractor" element={<Editcontractor />} />
              <Route path="/users/Rfid" element={<Rfidlist />} />
              <Route path="/users/AddRfid" element={<Rfidadd />} />
              <Route path="/users/Editrfid" element={<Editrfid />} />
              

              {/* bussiness module routes*/}
              <Route path="/business" element={<Modules />} />
              <Route
                path="/business/businesstypes"
                element={<Businesstypes />}
              />
              <Route
                path="/business/Add"
                element={<AddGlobalBusinesstypes />}
              />
              <Route
                path="/business/businesstypes/Add"
                element={<AddBusinesstypes />}
              />
             
            </Routes>
          </div>
        </main>

        {/* Footer */}
        <Footer />
      </div>
    </div>
  );
}

export default SuperAdminLayout;
