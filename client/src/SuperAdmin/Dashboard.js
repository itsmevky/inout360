import React, { useEffect, useState, useRef } from "react";
import Sidebar from "../Dashboardsidebaarmenu/Dashboardmenu.js";
import Header from "./header.js";
import Footer from "./footer.js";
// import "../../src/App.css ";
const domainpath = process.env.REACT_APP_API_DOMAIN_ENDPOINT;
const SuperAdminDashboard = () => {
  // console.log("SuperAdminDashboard");
  return (
    <>
      <div className="layout-section-dashboard">
        <div className="w-full mx-auto p-2">
          {/* <!-- Dashboard Header --> */}
          <div className="bg-white p-4 py-8  rounded-lg text-gray-700 font-semibold text-xl dashboard-crm-box-shadow">
            <span className="mr-2 flex items-center gap-4 space-x-2 ">
              <svg
                width="20"
                fill="navy-blue"
                xmlns="http://www.w3.org/2000/svg"
                viewBox="0 0 448 512"
              >
                <path d="M128 136c0-22.1-17.9-40-40-40L40 96C17.9 96 0 113.9 0 136l0 48c0 22.1 17.9 40 40 40l48 0c22.1 0 40-17.9 40-40l0-48zm0 192c0-22.1-17.9-40-40-40l-48 0c-22.1 0-40 17.9-40 40l0 48c0 22.1 17.9 40 40 40l48 0c22.1 0 40-17.9 40-40l0-48zm32-192l0 48c0 22.1 17.9 40 40 40l48 0c22.1 0 40-17.9 40-40l0-48c0-22.1-17.9-40-40-40l-48 0c-22.1 0-40 17.9-40 40zM288 328c0-22.1-17.9-40-40-40l-48 0c-22.1 0-40 17.9-40 40l0 48c0 22.1 17.9 40 40 40l48 0c22.1 0 40-17.9 40-40l0-48zm32-192l0 48c0 22.1 17.9 40 40 40l48 0c22.1 0 40-17.9 40-40l0-48c0-22.1-17.9-40-40-40l-48 0c-22.1 0-40 17.9-40 40zM448 328c0-22.1-17.9-40-40-40l-48 0c-22.1 0-40 17.9-40 40l0 48c0 22.1 17.9 40 40 40l48 0c22.1 0 40-17.9 40-40l0-48z" />
              </svg>{" "}
              Dashboard
            </span>
          </div>

          {/* <!-- Main Content Grid --> */}

          <div className="grid grid-cols-3 gap-4 mt-10">
            {/* <!-- Left Section (Students & Teachers, Parents & Staff) --> */}
            <div className="col-span-2 space-y-4">
              {/* <!-- Row 1: Students & Teachers --> */}
              <div className="grid grid-cols-2 gap-4">
                {/* <!-- Students Card --> */}
                <div className="bg-white dashboard-crm-box-shadow p-6   rounded-lg">
                  <p className="text-gray-500 flex items-center space-x-2">
                    <svg
                      fill="grey"
                      width={30}
                      height={30}
                      xmlns="http://www.w3.org/2000/svg"
                      viewBox="0 0 640 512"
                    >
                      <path d="M144 0a80 80 0 1 1 0 160A80 80 0 1 1 144 0zM512 0a80 80 0 1 1 0 160A80 80 0 1 1 512 0zM0 298.7C0 239.8 47.8 192 106.7 192l42.7 0c15.9 0 31 3.5 44.6 9.7c-1.3 7.2-1.9 14.7-1.9 22.3c0 38.2 16.8 72.5 43.3 96c-.2 0-.4 0-.7 0L21.3 320C9.6 320 0 310.4 0 298.7zM405.3 320c-.2 0-.4 0-.7 0c26.6-23.5 43.3-57.8 43.3-96c0-7.6-.7-15-1.9-22.3c13.6-6.3 28.7-9.7 44.6-9.7l42.7 0C592.2 192 640 239.8 640 298.7c0 11.8-9.6 21.3-21.3 21.3l-213.3 0zM224 224a96 96 0 1 1 192 0 96 96 0 1 1 -192 0zM128 485.3C128 411.7 187.7 352 261.3 352l117.3 0C452.3 352 512 411.7 512 485.3c0 14.7-11.9 26.7-26.7 26.7l-330.7 0c-14.7 0-26.7-11.9-26.7-26.7z" />
                    </svg>
                    <span className="font-semibold">Contractors</span>
                  </p>
                  <h2 className="text-2xl font-bold mt-2">12</h2>
                  <p className="text-gray-400 text-sm">
                    Total number of contractors.
                  </p>
                </div>
                {/* <!-- Teachers Card --> */}
                <div className="bg-white dashboard-crm-box-shadow p-6  rounded-lg">
                  <p className="text-gray-500 flex items-center space-x-2">
                    <svg
                      fill="grey"
                      width={30}
                      height={30}
                      xmlns="http://www.w3.org/2000/svg"
                      viewBox="0 0 640 512"
                    >
                      <path d="M144 0a80 80 0 1 1 0 160A80 80 0 1 1 144 0zM512 0a80 80 0 1 1 0 160A80 80 0 1 1 512 0zM0 298.7C0 239.8 47.8 192 106.7 192l42.7 0c15.9 0 31 3.5 44.6 9.7c-1.3 7.2-1.9 14.7-1.9 22.3c0 38.2 16.8 72.5 43.3 96c-.2 0-.4 0-.7 0L21.3 320C9.6 320 0 310.4 0 298.7zM405.3 320c-.2 0-.4 0-.7 0c26.6-23.5 43.3-57.8 43.3-96c0-7.6-.7-15-1.9-22.3c13.6-6.3 28.7-9.7 44.6-9.7l42.7 0C592.2 192 640 239.8 640 298.7c0 11.8-9.6 21.3-21.3 21.3l-213.3 0zM224 224a96 96 0 1 1 192 0 96 96 0 1 1 -192 0zM128 485.3C128 411.7 187.7 352 261.3 352l117.3 0C452.3 352 512 411.7 512 485.3c0 14.7-11.9 26.7-26.7 26.7l-330.7 0c-14.7 0-26.7-11.9-26.7-26.7z" />
                    </svg>{" "}
                    <span className="font-semibold">Employee</span>
                  </p>
                  <h2 className="text-2xl font-bold mt-2">5</h2>
                  <p className="text-gray-400 text-sm">
                    Total number of Employee
                  </p>
                </div>
              </div>
              {/* <!-- Row 2: Parents & Staff --> */}
              <div className="grid grid-cols-2 gap-4">
                {/* <!-- Parents Card --> */}
                <div className="bg-white dashboard-crm-box-shadow p-6  rounded-lg">
                  <p className="text-gray-500 flex items-center space-x-2">
                    <svg
                      fill="grey"
                      width={30}
                      height={30}
                      xmlns="http://www.w3.org/2000/svg"
                      viewBox="0 0 640 512"
                    >
                      <path d="M144 0a80 80 0 1 1 0 160A80 80 0 1 1 144 0zM512 0a80 80 0 1 1 0 160A80 80 0 1 1 512 0zM0 298.7C0 239.8 47.8 192 106.7 192l42.7 0c15.9 0 31 3.5 44.6 9.7c-1.3 7.2-1.9 14.7-1.9 22.3c0 38.2 16.8 72.5 43.3 96c-.2 0-.4 0-.7 0L21.3 320C9.6 320 0 310.4 0 298.7zM405.3 320c-.2 0-.4 0-.7 0c26.6-23.5 43.3-57.8 43.3-96c0-7.6-.7-15-1.9-22.3c13.6-6.3 28.7-9.7 44.6-9.7l42.7 0C592.2 192 640 239.8 640 298.7c0 11.8-9.6 21.3-21.3 21.3l-213.3 0zM224 224a96 96 0 1 1 192 0 96 96 0 1 1 -192 0zM128 485.3C128 411.7 187.7 352 261.3 352l117.3 0C452.3 352 512 411.7 512 485.3c0 14.7-11.9 26.7-26.7 26.7l-330.7 0c-14.7 0-26.7-11.9-26.7-26.7z" />
                    </svg>{" "}
                    <span className="font-semibold">Supervisor</span>
                  </p>
                  <h2 className="text-2xl font-bold mt-2">7</h2>
                  <p className="text-gray-400 text-sm">
                    Total number of parents
                  </p>
                </div>
                {/* <!-- Staff Card --> */}
                <div className="bg-white dashboard-crm-box-shadow p-6  rounded-lg">
                  <p className="text-gray-500 flex items-center space-x-2">
                    <svg
                      fill="grey"
                      width={30}
                      height={30}
                      xmlns="http://www.w3.org/2000/svg"
                      viewBox="0 0 640 512"
                    >
                      <path d="M144 0a80 80 0 1 1 0 160A80 80 0 1 1 144 0zM512 0a80 80 0 1 1 0 160A80 80 0 1 1 512 0zM0 298.7C0 239.8 47.8 192 106.7 192l42.7 0c15.9 0 31 3.5 44.6 9.7c-1.3 7.2-1.9 14.7-1.9 22.3c0 38.2 16.8 72.5 43.3 96c-.2 0-.4 0-.7 0L21.3 320C9.6 320 0 310.4 0 298.7zM405.3 320c-.2 0-.4 0-.7 0c26.6-23.5 43.3-57.8 43.3-96c0-7.6-.7-15-1.9-22.3c13.6-6.3 28.7-9.7 44.6-9.7l42.7 0C592.2 192 640 239.8 640 298.7c0 11.8-9.6 21.3-21.3 21.3l-213.3 0zM224 224a96 96 0 1 1 192 0 96 96 0 1 1 -192 0zM128 485.3C128 411.7 187.7 352 261.3 352l117.3 0C452.3 352 512 411.7 512 485.3c0 14.7-11.9 26.7-26.7 26.7l-330.7 0c-14.7 0-26.7-11.9-26.7-26.7z" />
                    </svg>{" "}
                    <span className="font-semibold">Manager</span>
                  </p>
                  <h2 className="text-2xl font-bold mt-2">6</h2>
                  <p className="text-gray-400 text-sm">
                    Total number of Manager
                  </p>
                </div>
              </div>
            </div>

            {/* <!-- Right Section (Today’s Attendance & Recent Events) --> */}
            <div className="space-y-4">
              {/* <!-- Today's Attendance Card --> */}
              {/* <div
                style={{ background: "#22374e" }}
                className="bg-blue-600 text-white dashboard-crm-box-shadow p-6 text-center rounded-lg"
              >
                <p className=" text-base font-semibold ">TODAY'S ATTENDANCE</p>
                <h2 className="text-base  mt-2">0</h2>
                <p className="text-base mt-1">0 STUDENTS ARE ATTENDING TODAY</p>
                <a
                  style={{ color: "#22374e" }}
                  href="#"
                  className="mt-4 inline-block bg-white  px-4 py-2 rounded-lg font-semibold shadow-md"
                >
                  Go to attendance →
                </a>
              </div> */}
              {/* <!-- Recent Events Card --> */}
              {/* <div className="bg-white p-6  rounded-lg dashboard-crm-box-shadow">
                <p className="text-gray-500 font-semibold">RECENT EVENTS</p>
              </div> */}
            </div>
          </div>
        </div>
      </div>
    </>
  );
};

export default SuperAdminDashboard;
