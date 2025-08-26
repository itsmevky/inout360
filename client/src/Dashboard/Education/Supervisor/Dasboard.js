import React, { useEffect, useState, useRef } from "react";
const domainpath = process.env.REACT_APP_API_DOMAIN_ENDPOINT;
const SupervisorDashboard = () => {
  console.log("SupervisorDashboard");
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
  {/* <!-- Left Section --> */}
  <div className="col-span-2 space-y-4">
    {/* <!-- Row 1: Workforce Overview & Pending Approvals --> */}
    <div className="grid grid-cols-2 gap-4">
      {/* Workforce Overview Card */}
      <div className="bg-white dashboard-crm-box-shadow p-6 rounded-lg">
        <p className="text-gray-500 flex items-center space-x-2">
          <svg
            fill="grey"
            width={30}
            height={30}
            xmlns="http://www.w3.org/2000/svg"
            viewBox="0 0 640 512"
          >
            <path d="M96 128a64 64 0 1 0 0-128 64 64 0 1 0 0 128zm448-64a64 64 0 1 0-128 0 64 64 0 1 0 128 0zM96 192C42.98 192 0 234.1 0 288v72c0 13.3 10.75 24 24 24h144c13.25 0 24-10.7 24-24V288c0-53-42.1-96-96-96zm448 0c-53 0-96 43-96 96v72c0 13.3 10.75 24 24 24h144c13.25 0 24-10.7 24-24V288c0-53-42.1-96-96-96z"/>
          </svg>
          <span className="font-semibold">Workforce Overview</span>
        </p>
        <h2 className="text-2xl font-bold mt-2">152</h2>
        <p className="text-gray-400 text-sm">Active today across all sections</p>
      </div>

      {/* Pending Approvals Card */}
      <div className="bg-white dashboard-crm-box-shadow p-6 rounded-lg">
        <p className="text-gray-500 flex items-center space-x-2">
          <svg
            fill="grey"
            width={30}
            height={30}
            xmlns="http://www.w3.org/2000/svg"
            viewBox="0 0 448 512"
          >
            <path d="M438.6 105.4l-96-96C339.1 3.1 333.1 0 327.1 0H48C21.49 0 0 21.49 0 48v416c0 26.5 21.49 48 48 48h352c26.5 0 48-21.5 48-48V120c0-6-3.1-12-9.4-14.6zM320 32l96 96H336c-8.84 0-16-7.16-16-16V32z"/>
          </svg>
          <span className="font-semibold">Pending Approvals</span>
        </p>
        <h2 className="text-2xl font-bold mt-2">8</h2>
        <p className="text-gray-400 text-sm">Attendance requests awaiting review</p>
      </div>
    </div>

    {/* <!-- Row 2: Active Sections & Notifications --> */}
    <div className="grid grid-cols-2 gap-4">
      {/* Active Sections Card */}
      <div className="bg-white dashboard-crm-box-shadow p-6 rounded-lg">
        <p className="text-gray-500 flex items-center space-x-2">
          <svg
            fill="grey"
            width={30}
            height={30}
            xmlns="http://www.w3.org/2000/svg"
            viewBox="0 0 512 512"
          >
            <path d="M64 64C28.7 64 0 92.7 0 128v256c0 35.3 28.7 64 64 64h384c35.3 0 64-28.7 64-64V128c0-35.3-28.7-64-64-64H64zm96 96h192c17.7 0 32 14.3 32 32v128c0 17.7-14.3 32-32 32H160c-17.7 0-32-14.3-32-32V192c0-17.7 14.3-32 32-32z"/>
          </svg>
          <span className="font-semibold">Active Sections</span>
        </p>
        <h2 className="text-2xl font-bold mt-2">5 / 8</h2>
        <p className="text-gray-400 text-sm">Assembly, Welding, Packing, Quality, Maintenance</p>
      </div>

      {/* Notifications Card */}
      <div className="bg-white dashboard-crm-box-shadow p-6 rounded-lg">
        <p className="text-gray-500 flex items-center space-x-2">
          <svg
            fill="grey"
            width={30}
            height={30}
            xmlns="http://www.w3.org/2000/svg"
            viewBox="0 0 448 512"
          >
            <path d="M224 512c35.3 0 63.9-28.7 63.9-64H160.1c0 35.3 28.7 64 63.9 64zM439.4 362.3L384 320V192c0-77.7-54.5-142.3-127.1-156.8V16c0-8.8-7.2-16-16-16s-16 7.2-16 16v19.2C118.5 49.7 64 114.3 64 192v128l-55.4 42.3C2.3 367.1 0 372.5 0 378.2c0 11.3 9.2 21.8 20.4 21.8h407.2c11.2 0 20.4-10.5 20.4-21.8 0-5.7-2.3-11.1-8.6-15.9z"/>
          </svg>
          <span className="font-semibold">Notifications</span>
        </p>
        <h2 className="text-2xl font-bold mt-2">3</h2>
        <p className="text-gray-400 text-sm">2 new absence alerts, 1 overtime request</p>
      </div>
    </div>
  </div>

  {/* <!-- Right Section (Recent Logs) --> */}
  <div>
    <div className="bg-white dashboard-crm-box-shadow p-6 rounded-lg">
      <p className="text-gray-500 flex items-center space-x-2">
        <svg
          fill="grey"
          width={30}
          height={30}
          xmlns="http://www.w3.org/2000/svg"
          viewBox="0 0 512 512"
        >
          <path d="M256 8C119 8 8 119 8 256s111 248 248 248 248-111 248-248S393 8 256 8zm0 64c101.7 0 184 82.3 184 184s-82.3 184-184 184S72 357.7 72 256 154.3 72 256 72zm-8 88v96l80 48 16-24-72-44v-76h-24z"/>
        </svg>
        <span className="font-semibold">Recent Attendance Logs</span>
      </p>
      <ul className="mt-3 text-sm text-gray-600 space-y-2">
        <li>25 Aug → 140 present | 12 absent</li>
        <li>24 Aug → 148 present | 4 absent</li>
        <li>23 Aug → 145 present | 7 absent</li>
        <li>22 Aug → 150 present | 2 absent</li>
      </ul>
    </div>
  </div>
       </div>


        </div>
      </div>
    </>
  );
};

export default SupervisorDashboard;
