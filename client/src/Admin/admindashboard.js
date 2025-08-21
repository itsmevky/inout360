import React, { useEffect, useState, useRef } from "react";

const domainpath = process.env.REACT_APP_API_DOMAIN_ENDPOINT;
const Dashboard = () => {
  return (
    <div class="max-w-6xl mx-auto">
      {/* <!-- Dashboard Header --> */}
      <div class="bg-white p-4 shadow-md rounded-lg flex items-center space-x-2 text-gray-700 font-semibold text-xl">
        <span>:bar_chart:</span>
        <span>Dashboard</span>
      </div>
      {/* <!-- Main Content Grid --> */}
      <div class="grid grid-cols-3 gap-4 mt-6">
        {/* <!-- Left Section (Students & Teachers, Parents & Staff) --> */}
        <div class="col-span-2 space-y-4">
          {/* <!-- Row 1: Students & Teachers --> */}
          <div class="grid grid-cols-2 gap-4">
            {/* <!-- Students Card --> */}
            <div class="bg-white p-6 shadow-md rounded-lg">
              <p class="text-gray-500 flex items-center space-x-2">
                :male-student: <span class="font-semibold">Students</span>
              </p>
              <h2 class="text-2xl font-bold mt-2">12</h2>
              <p class="text-gray-400 text-sm">Total number of students</p>
            </div>
            {/* <!-- Teachers Card --> */}
            <div class="bg-white p-6 shadow-md rounded-lg">
              <p class="text-gray-500 flex items-center space-x-2">
                :male-teacher: <span class="font-semibold">Teachers</span>
              </p>
              <h2 class="text-2xl font-bold mt-2">5</h2>
              <p class="text-gray-400 text-sm">Total number of teachers</p>
            </div>
          </div>
          {/* <!-- Row 2: Parents & Staff --> */}
          <div class="grid grid-cols-2 gap-4">
            {/* <!-- Parents Card --> */}
            <div class="bg-white p-6 shadow-md rounded-lg">
              <p class="text-gray-500 flex items-center space-x-2">
                :family: <span class="font-semibold">Parents</span>
              </p>
              <h2 class="text-2xl font-bold mt-2">7</h2>
              <p class="text-gray-400 text-sm">Total number of parents</p>
            </div>
            {/* <!-- Staff Card --> */}
            <div class="bg-white p-6 shadow-md rounded-lg">
              <p class="text-gray-500 flex items-center space-x-2">
                :office: <span class="font-semibold">Staff</span>
              </p>
              <h2 class="text-2xl font-bold mt-2">6</h2>
              <p class="text-gray-400 text-sm">Total number of staff</p>
            </div>
          </div>
        </div>
        {/* <!-- Right Section (Today’s Attendance & Recent Events) --> */}
        <div class="space-y-4">
          {/* <!-- Today's Attendance Card --> */}
          <div class="bg-blue-600 text-white p-6 shadow-md rounded-lg">
            <p class="font-semibold text-lg">TODAY'S ATTENDANCE</p>
            <h2 class="text-4xl font-bold mt-2">0</h2>
            <p class="text-sm mt-1">0 STUDENTS ARE ATTENDING TODAY</p>
            <a href="#" class="mt-4 inline-block bg-white text-blue-600 px-4 py-2 rounded-lg font-semibold shadow-md">
              Go to attendance →
            </a>
          </div>
          {/* <!-- Recent Events Card --> */}
          <div class="bg-white p-6 shadow-md rounded-lg">
            <p class="text-gray-500 font-semibold">RECENT EVENTS :arrow_right:</p>
          </div>
        </div>
      </div>
    </div>
  )
};

export default Dashboard;
