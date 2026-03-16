import React, { useEffect, useState, useRef } from "react";
import Sidebar from "../Dashboardsidebaarmenu/Dashboardmenu.js";
import Header from "./header.js";
import Footer from "./footer.js";
import { getData } from "../Helpers/api.js";
import {
  XAxis, YAxis, CartesianGrid, Tooltip as BarTooltip, ResponsiveContainer,
  PieChart, Pie, Cell, Tooltip as PieTooltip, Legend as PieLegend,
  LineChart, Line, AreaChart, Area,
  Radar, RadarChart, PolarGrid, PolarAngleAxis, PolarRadiusAxis
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
    { name: 'Total    ', value: summary.totalActivities },
    { name: "Today's ", value: summary.todayActivities },
  ];
  const pieChartData = pieChartDataRaw.some(d => d.value > 0) ? pieChartDataRaw : [{ name: 'No Data', value: 1 }];

  const attendanceDataRaw = [
    { name: 'Logged In', value: summary.loggedIn },
    { name: 'Logged Out', value: summary.loggedOut },
  ];
  const attendanceData = attendanceDataRaw.some(d => d.value > 0) ? attendanceDataRaw : [{ name: 'No Data', value: 1 }];

  const maxDeviceTrendsValue = (summary.last7DaysAttendance || []).reduce((max, row) => {
    const loggedIn = Number(row?.loggedIn || 0);
    const loggedOut = Number(row?.loggedOut || 0);
    return Math.max(max, loggedIn, loggedOut);
  }, 0);

  const deviceTrendsAxisMax = (() => {
    const target = Math.max(1, maxDeviceTrendsValue * 2);
    if (target <= 10) return 10;
    if (target <= 16) return 16;
    if (target <= 20) return 20;
    return Math.ceil(target / 10) * 10;
  })();

  return (
    <>
      <div className="layout-section-dashboard pb-10 min-h-screen bg-[#F8FAFC]">
        <div className="dashboar-option-inner-page w-full mx-auto px-4 md:px-6 lg:px-8 pt-4">

          {/* Dashboard Header */}
          <div className="bg-white p-4 sm:p-6 md:p-8 rounded-2xl text-gray-700 font-bold text-xl md:text-2xl dashboard-crm-box-shadow mb-6 sm:mb-8 flex flex-col sm:flex-row items-start sm:items-center gap-4">
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
          <div className="grid grid-cols-1 lg:grid-cols-14 gap-6 mb-8">

            {/* User Statistics Card */}
            <div className="lg:col-span-4 bg-white p-4 sm:p-5 rounded-3xl shadow-sm border border-gray-100 flex flex-col min-h-[260px] overflow-hidden">
              <h3 className="text-lg font-bold text-gray-800 mb-2">User Distribution</h3>
              <div className="flex-1 flex flex-col gap-3 py-1 justify-center">
                <div className="flex flex-row items-center justify-between px-1 gap-3 mb-1">
                  <div className="flex flex-col min-w-0">
                    <span className="text-[10px] text-gray-400 font-black uppercase tracking-wider mb-0.5">
                      Total Users
                    </span>
                    <h4 className="text-3xl sm:text-4xl font-black text-gray-900 leading-none">
                      {(summary.employees || 0) + (summary.visitors || 0)}
                    </h4>
                  </div>
                  <div className="flex items-center shrink-0">
                    <div className="flex items-center gap-1.5 sm:gap-2 bg-blue-50 px-2 sm:px-3 py-1 sm:py-1.5 rounded-xl border border-blue-100">
                      <span className="w-1.5 sm:w-2 h-1.5 sm:h-2 rounded-full bg-blue-500"></span>
                      <span className="text-[9px] sm:text-[10px] text-blue-700 font-black uppercase tracking-wide">
                        Active
                      </span>
                    </div>
                  </div>
                </div>

                <div className="flex flex-col gap-2 w-full">
                  <div className="bg-slate-50 px-3 py-2.5 rounded-2xl border border-slate-200 grid grid-cols-[1fr_auto] items-center gap-3">
                    <div className="flex items-center gap-2 min-w-0">
                      <span className="w-2 h-2 rounded-full bg-blue-500 shrink-0"></span>
                      <span className="text-sm text-gray-800 font-bold truncate">
                        Employees
                      </span>
                    </div>
                    <span className="text-2xl font-black text-gray-900 leading-none tabular-nums">
                      {summary.employees || 0}
                    </span>
                  </div>

                  <div className="bg-slate-50 px-3 py-2.5 rounded-2xl border border-slate-200 grid grid-cols-[1fr_auto] items-center gap-3">
                    <div className="flex items-center gap-2 min-w-0">
                      <span className="w-2 h-2 rounded-full bg-[#00A88A] shrink-0"></span>
                      <span className="text-sm text-gray-800 font-bold truncate">
                        Visitors
                      </span>
                    </div>
                    <span className="text-2xl font-black text-gray-900 leading-none tabular-nums">
                      {summary.visitors || 0}
                    </span>
                  </div>
                </div>
              </div>
            </div>

            {/* Violations Overview Card */}
            <div className="lg:col-span-4 bg-white p-4 sm:p-5 rounded-3xl shadow-sm border border-gray-100 flex flex-col items-center min-h-[260px] overflow-hidden">
              <h3 className="text-lg font-bold text-gray-800 mb-1 w-full text-left">Violations</h3>
              <div className="flex-1 w-full flex justify-center items-center py-2 sm:py-4">
                <ResponsiveContainer width="100%" height={110}>
                  <PieChart>
                    <Pie
                      data={pieChartData}
                      cx="50%"
                      cy="50%"
                      innerRadius={40}
                      outerRadius={55}
                      paddingAngle={8}
                      dataKey="value"
                    >
                      {pieChartData.map((entry, index) => (
                        <Cell key={`cell-${index}`} fill={entry.name === 'No Data' ? '#f3f4f6' : COLORS[index % COLORS.length]} cornerRadius={8} />
                      ))}
                    </Pie>
                    <PieTooltip
                      contentStyle={{ borderRadius: '12px', border: 'none', boxShadow: '0 10px 15px -3px rgba(0,0,0,0.1)' }}
                    />
                  </PieChart>
                </ResponsiveContainer>
              </div>
              <div className="flex flex-row flex-wrap gap-2 mt-auto w-full border-t border-gray-50 pt-4 px-1 justify-center">
                {pieChartDataRaw.map((d, i) => (
                  <div key={i} className="flex items-center gap-2 bg-gray-50 px-3 py-1.5 rounded-xl border border-gray-100 hover:bg-white hover:shadow-sm transition-all group/legend cursor-default">
                    <div className="w-1.5 h-1.5 rounded-full" style={{ backgroundColor: COLORS[i % COLORS.length] }}></div>
                    <span className="text-[10px] text-gray-400 font-black uppercase tracking-wider">{d.name.split("'")[0]}:</span>
                    <span className="text-xs font-black text-gray-900">{d.value}</span>
                  </div>
                ))}
              </div>
            </div>

            {/* Line Chart Section - Trends */}
            <div className="lg:col-span-6 bg-white p-4 sm:p-5 rounded-3xl shadow-sm border border-gray-100 flex flex-col min-h-[260px] overflow-hidden">
              <div className="w-full mb-3">
                <h3 className="text-lg font-bold text-gray-800 text-left">Device Trends</h3>
                <p className="text-[10px] text-gray-400 font-black uppercase tracking-widest mt-0.5 text-left">Overview of the last 7 days</p>
                <div className="mt-2 flex items-center gap-4 text-xs font-bold text-gray-600">
                  <span className="inline-flex items-center gap-2">
                    <span className="w-2.5 h-2.5 rounded-full bg-[#018DD4]"></span>
                    Logged In
                  </span>
                  <span className="inline-flex items-center gap-2">
                    <span className="w-2.5 h-2.5 rounded-full bg-[#00C49F]"></span>
                    Logged Out
                  </span>
                </div>
              </div>
              <div className="flex-1 w-full min-h-[150px] pr-1 mt-1">
                <ResponsiveContainer width="100%" height="100%">
                  <AreaChart
                    data={summary.last7DaysAttendance}
                    margin={{ top: 10, right: 12, left: 0, bottom: 0 }}
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
                      interval="preserveStartEnd"
                      padding={{ left: 10, right: 10 }}
                    />
                    <YAxis
                      axisLine={false}
                      tickLine={false}
                      tick={{ fill: '#9ca3af', fontSize: 12 }}
                      domain={[0, deviceTrendsAxisMax]}
                      allowDecimals={false}
                      width={30}
                      tickMargin={8}
                    />
                    <BarTooltip
                      contentStyle={{ borderRadius: '16px', border: 'none', boxShadow: '0 10px 15px -3px rgba(0,0,0,0.1)' }}
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
      </div>
    </>
  );
};

export default SuperAdminDashboard;
