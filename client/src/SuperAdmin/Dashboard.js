import React, { useEffect, useState, useRef } from "react";
import Sidebar from "../Dashboardsidebaarmenu/Dashboardmenu.js";
import Header from "./header.js";
import Footer from "./footer.js";
import { getData } from "../Helpers/api.js";
import {
  XAxis, YAxis, CartesianGrid, Tooltip, ResponsiveContainer,
  PieChart, Pie, Cell, Legend,
  LineChart, Line, AreaChart, Area,
  Radar, RadarChart, PolarGrid, PolarAngleAxis, PolarRadiusAxis
} from 'recharts';
// import "../../src/App.css ";
const domainpath = process.env.REACT_APP_API_DOMAIN_ENDPOINT;
const SuperAdminDashboard = () => {
  // console.log("SuperAdminDashboard");
  const [loading, setLoading] = useState(true);
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
        setLoading(true);
        const res = await getData("/dashboard/summary");
        if (res?.status && res?.data) {
          setSummary(res.data);
        }
      } catch (error) {
        console.error("Dashboard error:", error);
      } finally {
        setTimeout(() => setLoading(false), 800);
      }
    };
    fetchSummary();
  }, []);

  const VIOLATION_COLORS = ['#EF4444', '#F59E0B', '#FBBF24']; // Red, Orange, Yellow

  const violationsData = [
    { name: 'Historical', value: Math.max(0, summary.totalActivities - summary.todayActivities) },
    { name: 'Today', value: Math.max(0, summary.todayActivities) },
  ];

  const totalUsers = (summary.employees || 0) + (summary.visitors || 0);
  const employeePerc = totalUsers > 0 ? Math.round((summary.employees / totalUsers) * 100) : 0;
  const visitorPerc = totalUsers > 0 ? Math.round((summary.visitors / totalUsers) * 100) : 0;

  const SkeletonCard = () => (
    <div className="bg-white p-6 rounded-[14px] shadow-sm animate-pulse h-[440px]">
      <div className="h-3 w-20 bg-slate-100 rounded mb-4"></div>
      <div className="h-5 w-32 bg-slate-100 rounded mb-6"></div>
      <div className="h-12 w-24 bg-slate-100 rounded mb-10"></div>
      <div className="space-y-4">
        <div className="h-4 bg-slate-50 rounded w-full"></div>
        <div className="h-4 bg-slate-50 rounded w-full"></div>
      </div>
    </div>
  );

  return (
    <>
      <style>{`
        @import url('https://fonts.googleapis.com/css2?family=Inter:wght@400;500;600;700&display=swap');
        .dashboard-ui { 
          font-family: 'Inter', sans-serif; 
          -webkit-font-smoothing: antialiased;
          background-image: url("data:image/svg+xml,%3Csvg viewBox='0 0 200 200' xmlns='http://www.w3.org/2000/svg'%3E%3Cfilter id='noiseFilter'%3E%3CfeTurbulence type='fractalNoise' baseFrequency='0.65' numOctaves='3' stitchTiles='stitch'/%3E%3C/filter%3E%3Crect width='100%25' height='100%25' filter='url(%23noiseFilter)' opacity='0.02'/%3E%3C/svg%3E");
        }
        .card-premium { 
          background: #ffffff; 
          border: 1px solid rgba(241, 245, 249, 1); 
          transition: all 0.3s cubic-bezier(0.4, 0, 0.2, 1);
          box-shadow: 0 1px 3px 0 rgba(0, 0, 0, 0.02), 0 1px 2px 0 rgba(0, 0, 0, 0.04);
          position: relative;
          overflow: hidden;
        }
        .card-premium::before {
          content: "";
          position: absolute;
          top: 0; left: 0; right: 0; height: 100%;
          background: linear-gradient(180deg, rgba(255,255,255,0.05) 0%, rgba(255,255,255,0) 100%);
          pointer-events: none;
        }
        .card-premium:hover { 
          transform: translateY(-4px); 
          box-shadow: 0 20px 25px -5px rgba(0, 0, 0, 0.05), 0 10px 10px -5px rgba(0, 0, 0, 0.02);
          border-color: rgba(226, 232, 240, 1);
        }
        .inner-glow {
          box-shadow: inset 0 2px 4px 0 rgba(0, 0, 0, 0.05);
        }
        .text-gradient-indigo {
          background: linear-gradient(135deg, #4f46e5 0%, #7c3aed 100%);
          -webkit-background-clip: text;
          -webkit-text-fill-color: transparent;
        }
        .badge-pulse {
          position: relative;
        }
        .badge-pulse::after {
          content: "";
          position: absolute;
          width: 6px; height: 6px;
          border-radius: 100%;
          background: currentColor;
          right: -8px; top: 50%;
          transform: translateY(-50%);
          animation: pulse 2s infinite;
        }
        @keyframes pulse {
          0% { transform: translateY(-50%) scale(0.95); opacity: 0.7; }
          70% { transform: translateY(-50%) scale(2.5); opacity: 0; }
          100% { transform: translateY(-50%) scale(0.95); opacity: 0; }
        }
        .recharts-area-dot { filter: drop-shadow(0 4px 6px rgba(0,0,0,0.1)); }
      `}</style>
      
      <div className="dashboard-ui min-h-screen bg-[#f8fafc] pb-20">
        <div className="w-full mx-auto px-6 lg:px-10 pt-8">
          
          {/* Simplified Premium Header */}
          <header className="mb-10 p-6 rounded-[20px] bg-white/50 backdrop-blur-md border border-white/20 shadow-[0_8px_32px_rgba(0,0,0,0.02)] flex items-center justify-between gap-4 relative overflow-hidden">
            <div className="absolute top-0 left-0 w-1 h-full bg-indigo-600"></div>
            <div className="flex items-center gap-4">
              <div className="w-12 h-12 rounded-xl bg-indigo-50 flex items-center justify-center border border-indigo-100/50 shadow-inner">
                <svg className="w-6 h-6 text-indigo-600" fill="none" viewBox="0 0 24 24" stroke="currentColor">
                  <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M4 6a2 2 0 012-2h2a2 2 0 012 2v2a2 2 0 01-2 2H6a2 2 0 01-2-2V6zM14 6a2 2 0 012-2h2a2 2 0 012 2v2a2 2 0 01-2 2h-2a2 2 0 01-2-2V6zM4 16a2 2 0 012-2h2a2 2 0 012 2v2a2 2 0 01-2 2H6a2 2 0 01-2-2v-2zM14 16a2 2 0 012-2h2a2 2 0 012 2v2a2 2 0 01-2 2h-2a2 2 0 01-2-2v-2z" />
                </svg>
              </div>
              <div>
                <h1 className="text-2xl font-black text-slate-900 tracking-tight">
                  System Dashboard
                </h1>
              </div>
            </div>
          </header>

          {loading ? (
            <div className="grid grid-cols-1 md:grid-cols-3 gap-5">
              <SkeletonCard />
              <SkeletonCard />
              <SkeletonCard />
            </div>
          ) : (
            <>
              {/* Primary 3-Column Grid */}
              <div className="grid grid-cols-1 md:grid-cols-3 gap-5 mb-5">
                
                {/* User Distribution */}
                <div className="card-premium p-6 rounded-[16px] shadow-sm flex flex-col h-[440px]">
                  <div className="flex justify-between items-start mb-6">
                    <div>
                      <p className="text-[11px] font-bold text-slate-400 uppercase tracking-[0.1em] mb-1 flex items-center gap-1.5">
                        <span className="w-1 h-1 rounded-full bg-indigo-400"></span> Assets
                      </p>
                      <h2 className="text-[17px] font-bold text-slate-800 tracking-tight">User Distribution</h2>
                    </div>
                  </div>
                  
                  <div className="mb-8 relative">
                    <div className="flex items-baseline gap-2">
                      <span className="text-[40px] font-bold text-slate-900 leading-none tracking-tighter">{totalUsers}</span>
                      <span className="text-[12px] font-bold text-emerald-500 bg-emerald-50 px-1.5 py-0.5 rounded flex items-center gap-0.5">
                        <svg className="w-3 h-3" fill="none" viewBox="0 0 24 24" stroke="currentColor"><path strokeLinecap="round" strokeLinejoin="round" strokeWidth={3} d="M5 15l7-7 7 7" /></svg>
                        12%
                      </span>
                    </div>
                    <p className="text-[13px] font-medium text-slate-500 mt-2 flex items-center gap-1.5">
                      Total system active personnel
                    </p>
                  </div>

                  <div className="mt-auto space-y-6">
                    <div className="bg-slate-50/50 p-4 rounded-xl border border-slate-100/50">
                      <div className="flex justify-between items-center mb-2.5">
                        <div className="flex items-center gap-2">
                          <div className="w-2 h-2 rounded-full bg-indigo-600"></div>
                          <span className="text-[13px] font-bold text-slate-700">Employees</span>
                        </div>
                        <span className="text-[13px] font-bold text-slate-900">{employeePerc}%</span>
                      </div>
                      <div className="h-2 w-full bg-slate-100 rounded-full overflow-hidden inner-glow">
                        <div className="h-full bg-gradient-to-r from-indigo-500 to-indigo-600 rounded-full transition-all duration-1000" style={{ width: `${employeePerc}%` }}></div>
                      </div>
                    </div>

                    <div className="bg-slate-50/50 p-4 rounded-xl border border-slate-100/50">
                      <div className="flex justify-between items-center mb-2.5">
                        <div className="flex items-center gap-2">
                          <div className="w-2 h-2 rounded-full bg-emerald-500"></div>
                          <span className="text-[13px] font-bold text-slate-700">Visitors</span>
                        </div>
                        <span className="text-[13px] font-bold text-slate-900">{visitorPerc}%</span>
                      </div>
                      <div className="h-2 w-full bg-slate-100 rounded-full overflow-hidden inner-glow">
                        <div className="h-full bg-gradient-to-r from-emerald-400 to-emerald-500 rounded-full transition-all duration-1000" style={{ width: `${visitorPerc}%` }}></div>
                      </div>
                    </div>
                  </div>
                </div>

                {/* Violations Overview - Premium Redesign */}
                <div className="card-premium p-7 md:p-8 rounded-[16px] shadow-sm flex flex-col h-[440px]">
                  <div className="flex justify-between items-start mb-4">
                    <div className="w-full">
                      <p className="text-[11px] font-bold text-slate-400 uppercase tracking-[0.15em] mb-1.5 leading-none flex items-center gap-1.5">
                        <span className="w-1 h-1 rounded-full bg-rose-400"></span> Security
                      </p>
                      <h2 className="text-[18px] font-bold text-slate-800 leading-tight">Violations Overview</h2>
                    </div>
                  </div>
                  
                  <div className="flex-1 flex flex-col items-center justify-center relative">
                    <div className="relative w-[190px] h-[190px] flex items-center justify-center">
                      {/* Glow effect for chart */}
                      <div className="absolute inset-4 rounded-full bg-rose-100/10 blur-2xl"></div>
                      <ResponsiveContainer width="100%" height="100%">
                        <PieChart margin={{ top: 0, right: 0, bottom: 0, left: 0 }}>
                          <Pie
                            data={[
                              { name: 'Primary', value: (summary.totalActivities || 10) * 0.7 },
                              { name: 'Minor', value: (summary.totalActivities || 10) * 0.2 },
                              { name: 'Remaining', value: (summary.totalActivities || 10) * 0.1 }
                            ]}
                            cx="50%"
                            cy="50%"
                            innerRadius={78}
                            outerRadius={88}
                            paddingAngle={6}
                            dataKey="value"
                            stroke="none"
                            cornerRadius={100}
                            animationDuration={1500}
                          >
                            <Cell fill="url(#violationGradRed)" />
                            <Cell fill="url(#violationGradOrange)" />
                            <Cell fill="#f1f5f9" />
                          </Pie>
                          <defs>
                            <linearGradient id="violationGradRed" x1="0" y1="0" x2="0" y2="1">
                              <stop offset="0%" stopColor="#ef4444" />
                              <stop offset="100%" stopColor="#dc2626" />
                            </linearGradient>
                            <linearGradient id="violationGradOrange" x1="0" y1="0" x2="0" y2="1">
                              <stop offset="0%" stopColor="#f59e0b" />
                              <stop offset="100%" stopColor="#d97706" />
                            </linearGradient>
                          </defs>
                        </PieChart>
                      </ResponsiveContainer>
                      <div className="absolute inset-0 flex flex-col items-center justify-center pointer-events-none">
                        <span className="text-[40px] font-bold text-slate-900 tracking-tighter leading-none">{summary.totalActivities}</span>
                        <span className="text-[12px] font-bold text-slate-400 uppercase tracking-[0.1em] mt-1.5 opacity-80">Reports</span>
                      </div>
                    </div>
                  </div>

                  <div className="w-full mt-6 pt-8 pb-4 border-t border-slate-50 flex items-center justify-between">
                    <div className="flex-1 flex flex-col items-center">
                      <p className="text-[11px] font-bold text-slate-400 uppercase tracking-[0.1em] mb-2">Total</p>
                      <div className="flex items-baseline gap-1">
                        <span className="text-[26px] font-bold text-slate-900 leading-none">{summary.totalActivities}</span>
                        <span className="text-[10px] font-bold text-rose-500 flex items-center">↑ 2</span>
                      </div>
                    </div>
                    
                    <div className="h-10 w-[1px] bg-slate-100"></div>
                    
                    <div className="flex-1 flex flex-col items-center">
                      <p className="text-[11px] font-bold text-slate-400 uppercase tracking-[0.1em] mb-2">Today</p>
                      <div className="flex items-baseline gap-1">
                        <span className="text-[26px] font-bold text-slate-900 leading-none">{summary.todayActivities}</span>
                        <span className="text-[10px] font-bold text-emerald-500 flex items-center">↓ 1</span>
                      </div>
                    </div>
                  </div>
                </div>

                {/* System Trends */}
                <div className="card-premium p-6 rounded-[16px] shadow-sm flex flex-col h-[440px]">
                  <div className="flex justify-between items-start mb-6">
                    <div>
                      <p className="text-[11px] font-bold text-slate-400 uppercase tracking-[0.1em] mb-1 flex items-center gap-1.5">
                        <span className="w-1 h-1 rounded-full bg-blue-400"></span> Activity
                      </p>
                      <h2 className="text-[17px] font-bold text-slate-800 tracking-tight">Device Trends</h2>
                    </div>
                  </div>
                  
                  <div className="flex-1 w-full min-h-[280px] mt-4 relative">
                    <ResponsiveContainer width="100%" height="100%">
                      <AreaChart data={summary.last7DaysAttendance} margin={{ top: 10, right: 10, left: -20, bottom: 0 }}>
                        <defs>
                          <linearGradient id="primaryGrad" x1="0" y1="0" x2="0" y2="1">
                            <stop offset="5%" stopColor="#4f46e5" stopOpacity={0.15}/>
                            <stop offset="95%" stopColor="#4f46e5" stopOpacity={0}/>
                          </linearGradient>
                          <linearGradient id="successGrad" x1="0" y1="0" x2="0" y2="1">
                            <stop offset="5%" stopColor="#10b981" stopOpacity={0.1}/>
                            <stop offset="95%" stopColor="#10b981" stopOpacity={0}/>
                          </linearGradient>
                        </defs>
                        <XAxis dataKey="name" hide={true} />
                        <YAxis hide={true} />
                        <Tooltip 
                          cursor={{ stroke: '#e2e8f0', strokeWidth: 1, strokeDasharray: '4 4' }}
                          content={({ active, payload, label }) => {
                            if (active && payload && payload.length) {
                              return (
                                <div className="bg-white/95 backdrop-blur-sm p-4 shadow-xl rounded-xl border border-slate-100 min-w-[150px]">
                                  <p className="text-[10px] font-bold text-slate-500 uppercase tracking-widest mb-3 border-b border-slate-100 pb-2">{label}</p>
                                  <div className="space-y-3">
                                    <div className="flex items-center justify-between gap-6">
                                      <div className="flex items-center gap-2">
                                        <div className="w-2 h-2 rounded-full bg-indigo-500 shadow-[0_0_8px_rgba(79,70,229,0.4)]"></div>
                                        <span className="text-[11px] font-bold text-slate-600">Logged In</span>
                                      </div>
                                      <span className="text-[13px] font-black text-slate-900">{payload[0].value}</span>
                                    </div>
                                    <div className="flex items-center justify-between gap-6">
                                      <div className="flex items-center gap-2">
                                        <div className="w-2 h-2 rounded-full bg-emerald-500 shadow-[0_0_8px_rgba(16,185,129,0.4)]"></div>
                                        <span className="text-[11px] font-bold text-slate-600">Logged Out</span>
                                      </div>
                                      <span className="text-[13px] font-black text-slate-900">{payload[1]?.value || 0}</span>
                                    </div>
                                  </div>
                                </div>
                              );
                            }
                            return null;
                          }}
                        />
                        <Area 
                          type="monotone" 
                          dataKey="loggedIn" 
                          name="Logged In"
                          stroke="#4f46e5" 
                          strokeWidth={3} 
                          fillOpacity={1} 
                          fill="url(#primaryGrad)" 
                          dot={{ r: 4, fill: '#fff', stroke: '#4f46e5', strokeWidth: 2, rAct: 6 }}
                          activeDot={{ r: 6, fill: '#4f46e5', stroke: '#fff', strokeWidth: 2 }}
                          animationDuration={2000}
                        />
                        <Area 
                          type="monotone" 
                          dataKey="loggedOut" 
                          name="Logged Out"
                          stroke="#10b981" 
                          strokeWidth={3} 
                          fillOpacity={1} 
                          fill="url(#successGrad)" 
                          dot={{ r: 4, fill: '#fff', stroke: '#10b981', strokeWidth: 2 }}
                          activeDot={{ r: 6, fill: '#10b981', stroke: '#fff', strokeWidth: 2 }}
                          animationDuration={2000}
                        />
                        <Legend 
                          verticalAlign="bottom" 
                          align="center" 
                          height={36}
                          iconType="circle"
                          formatter={(value) => <span className="text-[12px] font-bold text-slate-500 uppercase tracking-wider">{value}</span>}
                        />
                      </AreaChart>
                    </ResponsiveContainer>
                  </div>
                </div>

              </div>
            </>
          )}

        </div>
      </div>
    </>
  );
};

export default SuperAdminDashboard;
