import React, { useEffect, useState, useRef } from "react";
const domainpath = process.env.REACT_APP_API_DOMAIN_ENDPOINT;
const ContractorDashboard = () => {
  console.log("ContractorDashboard");
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
    {/* <!-- Row 1: Total Employees & Active Shifts --> */}
    <div className="grid grid-cols-2 gap-4">
      {/* <!-- Total Employees Card --> */}
      <div className="bg-white dashboard-crm-box-shadow p-6 rounded-lg">
        <p className="text-gray-500 flex items-center space-x-2">
          <svg
            fill="grey"
            width={30}
            height={30}
            xmlns="http://www.w3.org/2000/svg"
            viewBox="0 0 448 512"
          >
            <path d="M224 256A128 128 0 1 0 224 0a128 128 0 1 0 0 256zm-45.7 48C79.8 304 0 383.8 0 482.3C0 498.7 13.3 512 29.7 512H418.3c16.4 0 29.7-13.3 29.7-29.7C448 383.8 368.2 304 269.7 304H178.3z"/>
          </svg>
          <span className="font-semibold">Total Employees</span>
        </p>
        <h2 className="text-2xl font-bold mt-2">245</h2>
        <p className="text-gray-400 text-sm">Active: 220 | Inactive: 25</p>
      </div>

      {/* <!-- Active Shifts Card --> */}
      <div className="bg-white dashboard-crm-box-shadow p-6 rounded-lg">
        <p className="text-gray-500 flex items-center space-x-2">
          <svg
            fill="grey"
            width={30}
            height={30}
            xmlns="http://www.w3.org/2000/svg"
            viewBox="0 0 512 512"
          >
            <path d="M256 0C167.6 0 96 71.6 96 160s71.6 160 160 160 160-71.6 160-160S344.4 0 256 0zM0 512c0-123.7 100.3-224 224-224h64c123.7 0 224 100.3 224 224H0z"/>
          </svg>
          <span className="font-semibold">Active Shifts</span>
        </p>
        <h2 className="text-2xl font-bold mt-2">12</h2>
        <p className="text-gray-400 text-sm">Morning, Evening, Night</p>
      </div>
    </div>

    {/* <!-- Row 2: Attendance Requests & Contractors --> */}
    <div className="grid grid-cols-2 gap-4">
      {/* <!-- Attendance Requests Card --> */}
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
          <span className="font-semibold">Attendance Requests</span>
        </p>
        <h2 className="text-2xl font-bold mt-2">5 Pending</h2>
        <p className="text-gray-400 text-sm">Last updated: 25 Aug</p>
      </div>

      {/* <!-- Contractors Card --> */}
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
          <span className="font-semibold">Contractors</span>
        </p>
        <h2 className="text-2xl font-bold mt-2">8</h2>
        <p className="text-gray-400 text-sm">Managing 120 workers</p>
      </div>
    </div>
  </div>

  {/* <!-- Right Section (Recent Activities) --> */}
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
        <span className="font-semibold">Recent Activities</span>
      </p>
      <ul className="mt-3 text-sm text-gray-600 space-y-2">
        <li>25 Aug → 3 Attendance Requests Approved</li>
        <li>24 Aug → New Contractor Added (ABC Ltd.)</li>
        <li>23 Aug → 15 Employees Joined Night Shift</li>
        <li>22 Aug → Payroll Processed</li>
      </ul>
    </div>
  </div>
</div>


        </div>
      </div>
    </>
  );
};

export default ContractorDashboard;
