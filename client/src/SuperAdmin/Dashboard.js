import React, { useEffect, useState, useRef } from "react";
import Sidebar from "../Dashboardsidebaarmenu/Dashboardmenu.js";
import Header from "./header.js";
import Footer from "./footer.js";
import { getData } from "../Helpers/api.js";
import {
  BarChart, Bar, XAxis, YAxis, CartesianGrid, Tooltip as BarTooltip, Legend as BarLegend, ResponsiveContainer,
  PieChart, Pie, Cell, Tooltip as PieTooltip, Legend as PieLegend,
  LineChart, Line, AreaChart, Area
} from 'recharts';
// import "../../src/App.css ";
const domainpath = process.env.REACT_APP_API_DOMAIN_ENDPOINT;
const SuperAdminDashboard = () => {
  // console.log("SuperAdminDashboard");
  const [summary, setSummary] = useState({
    employees: 0,
    visitors: 0,
    monthlyReports: 0,
    totalActivities: 0,
    todayActivities: 0,
    loggedIn: 0,
    loggedOut: 0,
    last7DaysAttendance: []
  });

  useEffect(() => {
    const fetchSummary = async () => {
      try {
        const res = await getData("/dashboard/summary");
        if (res?.status && res?.data) {
          setSummary(res.data);
        }
      } catch (error) {
        // Keep defaults; error toast is handled by API helper.
      }
    };
    fetchSummary();
  }, []);

  const COLORS = ['#0088FE', '#00C49F', '#FFBB28', '#FF8042', '#8884d8'];

  const chartData = [
    { name: 'Employees', value: summary.employees },
    { name: 'Visitors', value: summary.visitors },
  ];

  const pieChartDataRaw = [
    { name: 'Total Violations', value: summary.totalActivities },
    { name: "Today's Violations", value: summary.todayActivities },
  ];
  const pieChartData = pieChartDataRaw.some(d => d.value > 0) ? pieChartDataRaw : [{ name: 'No Data', value: 1 }];

  const attendanceDataRaw = [
    { name: 'Logged In', value: summary.loggedIn },
    { name: 'Logged Out', value: summary.loggedOut },
  ];
  const attendanceData = attendanceDataRaw.some(d => d.value > 0) ? attendanceDataRaw : [{ name: 'No Data', value: 1 }];

  return (
    <>
      <div className="layout-section-dashboard pb-10 min-h-screen bg-[#F8FAFC]">
        <div className="dashboar-option-inner-page w-full mx-auto px-4 md:px-6 lg:px-8 pt-4">

          {/* Dashboard Header */}
          <div className="bg-white p-6 md:p-8 rounded-2xl text-gray-700 font-bold text-xl md:text-2xl dashboard-crm-box-shadow mb-8 flex flex-col sm:flex-row items-start sm:items-center gap-4">
            <span className="flex items-center gap-3">
              <div className="p-2 bg-blue-50 rounded-lg">
                <svg
                  width="24"
                  height="24"
                  fill="#018DD4"
                  xmlns="http://www.w3.org/2000/svg"
                  viewBox="0 0 448 512"
                >
                  <path d="M128 136c0-22.1-17.9-40-40-40L40 96C17.9 96 0 113.9 0 136l0 48c0 22.1 17.9 40 40 40l48 0c22.1 0 40-17.9 40-40l0-48zm0 192c0-22.1-17.9-40-40-40l-48 0c-22.1 0-40 17.9-40 40l0 48c0 22.1 17.9 40 40 40l48 0c22.1 0 40-17.9 40-40l0-48zm32-192l0 48c0 22.1 17.9 40 40 40l48 0c22.1 0 40-17.9 40-40l0-48c0-22.1-17.9-40-40-40l-48 0c-22.1 0-40 17.9-40 40zM288 328c0-22.1-17.9-40-40-40l-48 0c-22.1 0-40 17.9-40 40l0 48c0 22.1 17.9 40 40 40l48 0c22.1 0 40-17.9 40-40l0-48zm32-192l0 48c0 22.1 17.9 40 40 40l48 0c22.1 0 40-17.9 40-40l0-48c0-22.1-17.9-40-40-40l-48 0c-22.1 0-40 17.9-40 40zM448 328c0-22.1-17.9-40-40-40l-48 0c-22.1 0-40 17.9-40 40l0 48c0 22.1 17.9 40 40 40l48 0c22.1 0 40-17.9 40-40l0-48z" />
                </svg>
              </div>
              Dashboard Overview
            </span>
          </div>

          {/* Charts Grid Section */}
          <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-6 mb-8">

            {/* User Statistics Card */}
            <div className="bg-white p-6 md:p-8 rounded-3xl shadow-sm border border-gray-100 flex flex-col min-h-[400px]">
              <h3 className="text-xl font-bold text-gray-800 mb-8">User Distribution</h3>
              <div className="w-full h-[280px]">
                <ResponsiveContainer width="100%" height="100%">
                  <BarChart
                    data={chartData}
                    layout="vertical"
                    margin={{ left: 20, right: 60, top: 10, bottom: 10 }}
                  >
                    <XAxis type="number" hide />
                    <YAxis
                      dataKey="name"
                      type="category"
                      axisLine={false}
                      tickLine={false}
                      width={100}
                      tick={{
                        fill: '#4b5563',
                        fontSize: 14,
                        fontWeight: 700,
                      }}
                    />
                    <Bar
                      dataKey="value"
                      fill="#018DD4"
                      radius={[0, 8, 8, 0]}
                      barSize={32}
                      label={{ position: 'right', fill: '#1f2937', fontSize: 14, fontWeight: 800, offset: 15 }}
                    />
                  </BarChart>
                </ResponsiveContainer>
              </div>
            </div>

            {/* Violations Overview Card */}
            <div className="bg-white p-6 md:p-8 rounded-3xl shadow-sm border border-gray-100 flex flex-col items-center min-h-[400px]">
              <h3 className="text-xl font-bold text-gray-800 mb-2 w-full text-left">Violations</h3>
              <div className="w-full h-[250px] flex justify-center mt-4">
                <ResponsiveContainer width="100%" height="100%">
                  <PieChart>
                    <Pie
                      data={pieChartData}
                      cx="50%"
                      cy="55%"
                      innerRadius={60}
                      outerRadius={80}
                      paddingAngle={8}
                      dataKey="value"
                    >
                      {pieChartData.map((entry, index) => (
                        <Cell key={`cell-${index}`} fill={entry.name === 'No Data' ? '#f3f4f6' : COLORS[index % COLORS.length]} cornerRadius={6} />
                      ))}
                    </Pie>
                    <PieTooltip
                      contentStyle={{ borderRadius: '12px', border: 'none', boxShadow: '0 10px 15px -3px rgba(0,0,0,0.1)' }}
                    />
                  </PieChart>
                </ResponsiveContainer>
              </div>
              <div className="flex flex-wrap justify-center gap-4 mt-auto pt-6">
                {pieChartDataRaw.map((d, i) => (
                  <div key={i} className="flex items-center gap-2 px-3 py-1.5 bg-gray-50 rounded-full border border-gray-100">
                    <div className="w-2.5 h-2.5 rounded-full" style={{ backgroundColor: COLORS[i % COLORS.length] }}></div>
                    <span className="text-xs text-gray-600 font-bold">{d.name}: {d.value}</span>
                  </div>
                ))}
              </div>
            </div>

            {/* Attendance Overview Card */}
            <div className="bg-white p-6 md:p-8 rounded-3xl shadow-sm border border-gray-100 flex flex-col items-center min-h-[400px]">
              <h3 className="text-xl font-bold text-gray-800 mb-2 w-full text-left">Today's Attendance</h3>
              <div className="w-full h-[250px] flex justify-center mt-4">
                <ResponsiveContainer width="100%" height="100%">
                  <PieChart>
                    <Pie
                      data={attendanceData}
                      cx="50%"
                      cy="55%"
                      innerRadius={60}
                      outerRadius={80}
                      paddingAngle={8}
                      dataKey="value"
                    >
                      {attendanceData.map((entry, index) => (
                        <Cell key={`cell-${index}`} fill={entry.name === 'No Data' ? '#f3f4f6' : COLORS[index % COLORS.length]} cornerRadius={6} />
                      ))}
                    </Pie>
                    <PieTooltip
                      contentStyle={{ borderRadius: '12px', border: 'none', boxShadow: '0 10px 15px -3px rgba(0,0,0,0.1)' }}
                    />
                  </PieChart>
                </ResponsiveContainer>
              </div>
              <div className="flex flex-wrap justify-center gap-4 mt-auto pt-6">
                {attendanceDataRaw.map((d, i) => (
                  <div key={i} className="flex items-center gap-2 px-3 py-1.5 bg-gray-50 rounded-full border border-gray-100">
                    <div className="w-2.5 h-2.5 rounded-full" style={{ backgroundColor: COLORS[i % COLORS.length] }}></div>
                    <span className="text-xs text-gray-600 font-bold">{d.name}: {d.value}</span>
                  </div>
                ))}
              </div>
            </div>

          </div>

          {/* Line Chart Section - Trends */}
          <div className="bg-white p-5 md:p-8 rounded-3xl shadow-sm border border-gray-100 overflow-hidden">
            <div className="flex flex-col sm:flex-row justify-between sm:items-center mb-8 gap-4">
              <div>
                <h3 className="text-xl md:text-2xl font-bold text-gray-800">Attendance Trends</h3>
                <p className="text-sm text-gray-500">Overview of the last 7 days</p>
              </div>
            </div>
            <div className="h-[350px] md:h-[400px] w-full">
              <ResponsiveContainer width="100%" height="100%">
                <AreaChart
                  data={summary.last7DaysAttendance}
                  margin={{ top: 10, right: 10, left: -20, bottom: 0 }}
                >
                  <defs>
                    <linearGradient id="colorLoggedIn" x1="0" y1="0" x2="0" y2="1">
                      <stop offset="5%" stopColor="#018DD4" stopOpacity={0.15} />
                      <stop offset="95%" stopColor="#018DD4" stopOpacity={0} />
                    </linearGradient>
                    <linearGradient id="colorLoggedOut" x1="0" y1="0" x2="0" y2="1">
                      <stop offset="5%" stopColor="#00C49F" stopOpacity={0.15} />
                      <stop offset="95%" stopColor="#00C49F" stopOpacity={0} />
                    </linearGradient>
                  </defs>
                  <CartesianGrid strokeDasharray="3 3" vertical={false} stroke="#f0f0f0" />
                  <XAxis
                    dataKey="name"
                    axisLine={false}
                    tickLine={false}
                    tick={{ fill: '#9ca3af', fontSize: 12 }}
                    dy={10}
                  />
                  <YAxis
                    axisLine={false}
                    tickLine={false}
                    tick={{ fill: '#9ca3af', fontSize: 12 }}
                    domain={[0, 'auto']}
                    width={60}
                    dx={10}
                  />
                  <BarTooltip
                    contentStyle={{ borderRadius: '16px', border: 'none', boxShadow: '0 10px 15px -3px rgba(0,0,0,0.1)' }}
                  />
                  <BarLegend
                    verticalAlign="top"
                    align="right"
                    iconType="circle"
                    wrapperStyle={{ paddingTop: '0px', paddingBottom: '30px' }}
                  />
                  <Area
                    type="monotone"
                    dataKey="loggedIn"
                    name="Logged In"
                    stroke="#018DD4"
                    strokeWidth={4}
                    fillOpacity={1}
                    fill="url(#colorLoggedIn)"
                  />
                  <Area
                    type="monotone"
                    dataKey="loggedOut"
                    name="Logged Out"
                    stroke="#00C49F"
                    strokeWidth={4}
                    fillOpacity={1}
                    fill="url(#colorLoggedOut)"
                  />
                </AreaChart>
              </ResponsiveContainer>
            </div>
          </div>

        </div>
      </div>
    </>
  );
};

export default SuperAdminDashboard;
