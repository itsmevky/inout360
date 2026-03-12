import React, { useEffect, useMemo, useState } from "react";
import { useLocation, useNavigate, useParams } from "react-router-dom";
import { getData } from "../../Helpers/api.js";
import { toast } from "react-toastify";

const safeText = (value) => String(value || "").trim();

const isCameraEvent = (value) => /camera|screenshot|video/i.test(String(value || ""));
const isAppAccessEvent = (value) =>
  /youtube|whatsapp|instagram|facebook|restricted app opened/i.test(String(value || ""));
const isSecurityPermissionEvent = (value) =>
  /overlay|notification permission|location permission|device admin|accessibility|usage access/i.test(
    String(value || "")
  );

const formatDateTime = (value) => {
  if (!value) return "-";
  const d = new Date(value);
  if (Number.isNaN(d.getTime())) return "-";
  return d.toLocaleString();
};

const formatDate = (value) => {
  if (!value) return "-";
  const d = new Date(value);
  if (Number.isNaN(d.getTime())) return "-";
  return d.toLocaleDateString();
};

const scrollToId = (id) => {
  const node = document.getElementById(id);
  if (!node) return;
  node.scrollIntoView({ behavior: "smooth", block: "start" });
};

export default function UserOverview() {
  const { employeeId } = useParams();
  const navigate = useNavigate();
  const location = useLocation();

  const [loading, setLoading] = useState(true);
  const [overview, setOverview] = useState(null);
  const [fromDate, setFromDate] = useState("");
  const [toDate, setToDate] = useState("");

  useEffect(() => {
    const fetchOverview = async () => {
      setLoading(true);
      try {
        const res = await getData(`/employees/overview/${encodeURIComponent(employeeId)}`);
        if (res?.status && res?.data) {
          setOverview(res.data);
        } else {
          setOverview(null);
          toast.error(res?.message || "Failed to load user overview");
        }
      } catch (error) {
        setOverview(null);
        toast.error("Failed to load user overview");
      } finally {
        setLoading(false);
      }
    };
    fetchOverview();
  }, [employeeId]);

  useEffect(() => {
    const hash = safeText(location.hash).replace("#", "");
    if (!hash) return;
    const t = setTimeout(() => scrollToId(hash), 50);
    return () => clearTimeout(t);
  }, [location.hash, loading]);

  const profile = overview?.profile || {};
  const counts = overview?.counts || {};
  const devices = Array.isArray(overview?.devices) ? overview.devices : [];
  const attendance = Array.isArray(overview?.attendance) ? overview.attendance : [];

  const displayAttendance = useMemo(() => {
    if (!fromDate && !toDate) {
      const todayAt = new Date();
      todayAt.setHours(0, 0, 0, 0);
      return attendance.filter((a) => {
        const d = new Date(a.date);
        d.setHours(0, 0, 0, 0);
        return d.getTime() === todayAt.getTime();
      });
    }

    const start = fromDate ? new Date(fromDate + "T00:00:00") : null;
    const end = toDate ? new Date(toDate + "T23:59:59") : null;

    return attendance.filter((a) => {
      const d = new Date(a.date);
      if (start && d < start) return false;
      if (end && d > end) return false;
      return true;
    }).sort((a, b) => new Date(b.date) - new Date(a.date));
  }, [attendance, fromDate, toDate]);

  const scanEvents = useMemo(() => {
    const events = [];
    displayAttendance.forEach((a) => {
      // Inward scans
      if (a.entryGateIn || a.workfloorIn) {
        events.push({
          date: a.date,
          time: a.entryGateIn || a.workfloorIn,
          type: "Entry",
          status: "Logged In",
        });
      }
      // Outward scans
      if (a.exitGateOut || a.workfloorOut) {
        events.push({
          date: a.date,
          time: a.exitGateOut || a.workfloorOut,
          type: "Exit",
          status: "Logged Out",
        });
      }
    });
    return events.sort((a, b) => new Date(b.time) - new Date(a.time));
  }, [displayAttendance]);

  const violationEvents = Array.isArray(overview?.violationEvents) ? overview.violationEvents : [];
  const principalType = overview?.principalType || "user";
  const backPath = principalType === "visitor" ? "/dashboard/users/visitors" : "/dashboard/users/employees";

  const categorized = useMemo(() => {
    const today = new Date();
    today.setHours(0, 0, 0, 0);

    const isToday = (ts) => {
      const d = new Date(ts);
      d.setHours(0, 0, 0, 0);
      return d.getTime() === today.getTime();
    };

    const res = {
      camera: { all: [], today: 0 },
      appAccess: { all: [], today: 0 },
      security: { all: [], today: 0 },
      policyViolations: { all: violationEvents, today: 0 },
    };

    for (const item of violationEvents) {
      if (isToday(item.timestamp)) res.policyViolations.today++;

      const text = `${item?.event || ""} ${item?.narrative || ""} ${item?.metadata?.narrative || ""}`;
      if (isCameraEvent(text)) {
        res.camera.all.push(item);
        if (isToday(item.timestamp)) res.camera.today++;
      } else if (isAppAccessEvent(text)) {
        res.appAccess.all.push(item);
        if (isToday(item.timestamp)) res.appAccess.today++;
      } else if (isSecurityPermissionEvent(text)) {
        res.security.all.push(item);
        if (isToday(item.timestamp)) res.security.today++;
      }
    }
    return res;
  }, [violationEvents]);



  return (
    <div className="m-0">
      <div className="relative p-4 !m-0">
        {/* Premium Profile Section */}
        <div className="bg-white rounded-[2rem] overflow-hidden shadow-sm border border-gray-100 mb-6 group transition-all hover:shadow-xl hover:shadow-blue-500/5">
          {/* Cover Decor */}
          <div className="h-32 bg-[#1e293b] relative overflow-hidden">
            <div className="absolute inset-0 opacity-20 pointer-events-none" style={{ backgroundImage: 'radial-gradient(circle at 2px 2px, white 1px, transparent 0)', backgroundSize: '24px 24px' }}></div>
            <div className="absolute top-4 left-4">
              <button
                className="w-10 h-10 flex items-center justify-center rounded-xl bg-white/10 backdrop-blur-md text-white hover:bg-white hover:text-gray-900 transition-all border border-white/10 shadow-lg"
                onClick={() => navigate(backPath)}
                title="Go Back"
              >
                <svg width="20" height="20" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2.5" strokeLinecap="round" strokeLinejoin="round">
                  <path d="m15 18-6-6 6-6" />
                </svg>
              </button>
            </div>
          </div>

          <div className="px-8 pb-8 -mt-12 relative">
            <div className="flex flex-col md:flex-row gap-8 items-end">
              {/* Avatar Area */}
              <div className="relative group">
                <div className="w-32 h-32 rounded-[2.5rem] bg-white p-2 shadow-2xl border border-white rotate-3 group-hover:rotate-0 transition-transform duration-500">
                  <div className="w-full h-full rounded-[2rem] bg-gradient-to-br from-blue-600 to-indigo-700 flex items-center justify-center text-4xl font-black text-white uppercase shadow-inner">
                    {profile?.name?.charAt(0) || "U"}
                  </div>
                </div>
                <div className="absolute -bottom-2 -right-2 w-10 h-10 rounded-2xl bg-green-500 border-4 border-white shadow-lg flex items-center justify-center" title="User Online">
                  <div className="w-2.5 h-2.5 rounded-full bg-white animate-pulse"></div>
                </div>
              </div>

              {/* Identity Section */}
              <div className="flex-1 mb-2">
                <div className="flex flex-wrap items-center gap-4 mb-2">
                  <h1 className="text-3xl font-black text-gray-900 tracking-tight">
                    {profile?.name || "-"}
                  </h1>
                  <span className="px-3 py-1 bg-blue-50 text-blue-600 text-[10px] font-black uppercase rounded-lg tracking-widest border border-blue-100 flex items-center gap-1.5 shadow-sm">
                    <span className="w-1.5 h-1.5 rounded-full bg-blue-500 animate-pulse"></span>
                    {principalType}
                  </span>
                </div>
                <div className="flex flex-wrap items-center gap-6 text-sm font-bold text-gray-400">
                  <span className="flex items-center gap-2">
                    <svg className="w-4 h-4 text-blue-500/50" fill="currentColor" viewBox="0 0 24 24"><path d="M12 2C6.48 2 2 6.48 2 12s4.48 10 10 10 10-4.48 10-10S17.52 2 12 2zm1 15h-2v-6h2v6zm0-8h-2V7h2v2z" /></svg>
                    ID: <span className="text-gray-900">{profile?.employeeId || employeeId}</span>
                  </span>
                  <span className="flex items-center gap-2 border-l border-gray-100 pl-6">
                    <svg className="w-4 h-4 text-indigo-500/50" fill="currentColor" viewBox="0 0 24 24"><path d="M12 2C8.13 2 5 5.13 5 9c0 5.25 7 13 7 13s7-7.75 7-13c0-3.87-3.13-7-7-7zm0 9.5c-1.38 0-2.5-1.12-2.5-2.5s1.12-2.5 2.5-2.5 2.5 1.12 2.5 2.5-1.12 2.5-2.5 2.5z" /></svg>
                    SITE: <span className="text-gray-900 truncate max-w-[150px]">{profile.location || "-"}</span>
                  </span>
                </div>
              </div>

              {/* Activity Integrated Stats */}
              <div className="flex gap-3 mb-2">
                <div className="p-4 bg-gray-50 rounded-3xl border border-gray-100 text-center min-w-[100px] transition-all hover:bg-white hover:shadow-md cursor-default">
                  <p className="text-[10px] text-gray-400 font-black uppercase tracking-widest mb-1">Status</p>
                  <p className={`text-sm font-black ${profile.sessionStatus === 'Logged In' ? 'text-green-600' : 'text-gray-600'}`}>
                    {profile.sessionStatus || "Offline"}
                  </p>
                </div>
                {profile.department && (
                  <div className="p-4 bg-gray-50 rounded-3xl border border-gray-100 text-center min-w-[100px] transition-all hover:bg-white hover:shadow-md cursor-default">
                    <p className="text-[10px] text-gray-400 font-black uppercase tracking-widest mb-1">Department</p>
                    <p className="text-sm font-black text-gray-800">{profile.department}</p>
                  </div>
                )}
              </div>
            </div>

            {/* Expanded Info Grid */}
            <div className="grid grid-cols-2 lg:grid-cols-4 gap-8 mt-12 border-t border-gray-50 pt-10">
              <div className="space-y-1">
                <p className="text-[10px] text-gray-400 font-black uppercase tracking-widest flex items-center gap-2">
                  <span className="w-1 h-1 rounded-full bg-blue-500"></span>
                  Email Address
                </p>
                <p className="text-sm font-bold text-gray-800 break-all">{profile.email || "-"}</p>
              </div>
              <div className="space-y-1">
                <p className="text-[10px] text-gray-400 font-black uppercase tracking-widest flex items-center gap-2">
                  <span className="w-1 h-1 rounded-full bg-indigo-500"></span>
                  Gender / RFID
                </p>
                <div className="flex items-center gap-2 text-sm font-bold text-gray-800">
                  <span>{profile.gender || "-"}</span>
                  <span className="text-gray-200">|</span>
                  <span className="text-xs text-gray-500">{profile.rfid || "No RFID Tag"}</span>
                </div>
              </div>
              <div className="space-y-1">
                <p className="text-[10px] text-gray-400 font-black uppercase tracking-widest flex items-center gap-2">
                  <span className="w-1 h-1 rounded-full bg-purple-500"></span>
                  Mobile Session
                </p>
                <p className="text-sm font-bold text-gray-800">{profile.sessionStatus || "Logout"}</p>
              </div>
              <div className="space-y-1">
                <p className="text-[10px] text-gray-400 font-black uppercase tracking-widest flex items-center gap-2">
                  <span className="w-1 h-1 rounded-full bg-pink-500"></span>
                  Last Online
                </p>
                <p className="text-sm font-bold text-gray-800">{formatDate(profile.lastSeen) || "-"}</p>
              </div>
            </div>
          </div>
        </div>

        {loading ? (
          <div className="p-12 text-center text-gray-400 font-bold italic">Gathering intelligence...</div>
        ) : !overview ? (
          <div className="p-12 text-center bg-red-50 border border-red-100 rounded-[2rem] text-red-600 font-bold">Target unidentified. Profile data incomplete.</div>
        ) : (
          <>
            <div className="grid grid-cols-1 md:grid-cols-3 gap-6">
              <button
                onClick={() => navigate(`/dashboard/users/activity?employeeId=${employeeId}&type=camera_activity`)}
                className="bg-white border border-gray-100 rounded-[2rem] p-6 text-left hover:shadow-2xl hover:shadow-blue-500/10 hover:-translate-y-1 transition-all flex flex-col gap-4 group relative overflow-hidden"
              >
                <div className="absolute top-0 right-0 w-24 h-24 bg-blue-50/50 rounded-bl-[4rem] group-hover:bg-blue-100/50 transition-colors -mr-12 -mt-12"></div>
                <div className="flex items-center gap-3">
                  <div className="w-10 h-10 bg-blue-50 rounded-2xl flex items-center justify-center group-hover:bg-blue-600 group-hover:text-white transition-all duration-300">
                    <svg width="20" height="20" fill="currentColor" viewBox="0 0 24 24"><path d="M23 6.00012L17 10.4201V7.00012C17 6.45012 16.55 6.00012 16 6.00012H3C2.45 6.00012 2 6.45012 2 7.00012V17.0001C2 17.5501 2.45 18.0001 3 18.0001H16C16.55 18.0001 17 17.5501 17 17.0001V13.5801L23 18.0001V6.00012Z" /></svg>
                  </div>
                  <span className="text-[11px] text-gray-400 font-black uppercase tracking-[0.2em]">Monitoring</span>
                </div>
                <div className="flex items-center justify-between w-full mt-2 bg-gray-50 p-3 rounded-2xl border border-gray-100 group-hover:bg-white group-hover:border-blue-100 transition-all">
                  <div className="flex items-baseline gap-2">
                    <span className="text-2xl font-black text-gray-900 leading-none">{counts.camera || 0}</span>
                    <span className="text-[10px] text-gray-400 font-bold uppercase tracking-tight">Logs</span>
                  </div>
                  <div className="text-[10px] text-red-500 font-black px-2 py-1 bg-red-50 rounded-lg">
                    +{categorized.camera.today} TODAY
                  </div>
                </div>
              </button>
              <button
                onClick={() => navigate(`/dashboard/users/activity?employeeId=${employeeId}&type=app_access`)}
                className="bg-white border border-gray-100 rounded-[2rem] p-6 text-left hover:shadow-2xl hover:shadow-indigo-500/10 hover:-translate-y-1 transition-all flex flex-col gap-4 group relative overflow-hidden"
              >
                <div className="absolute top-0 right-0 w-24 h-24 bg-indigo-50/50 rounded-bl-[4rem] group-hover:bg-indigo-100/50 transition-colors -mr-12 -mt-12"></div>
                <div className="flex items-center gap-3">
                  <div className="w-10 h-10 bg-indigo-50 rounded-2xl flex items-center justify-center group-hover:bg-indigo-600 group-hover:text-white transition-all duration-300">
                    <svg width="20" height="20" fill="currentColor" viewBox="0 0 24 24"><path d="M4 6H20V16H4V6ZM2 4C0.89543 4 0 4.89543 0 6V18C0 19.1046 0.89543 20 2 20H22C23.1046 20 24 19.1046 24 18V6C24 4.89543 23.1046 4 22 4H2Z" /></svg>
                  </div>
                  <span className="text-[11px] text-gray-400 font-black uppercase tracking-[0.2em]">Usage access</span>
                </div>
                <div className="flex items-center justify-between w-full mt-2 bg-gray-50 p-3 rounded-2xl border border-gray-100 group-hover:bg-white group-hover:border-indigo-100 transition-all">
                  <div className="flex items-baseline gap-2">
                    <span className="text-2xl font-black text-gray-900 leading-none">{counts.appAccess || 0}</span>
                    <span className="text-[10px] text-gray-400 font-bold uppercase tracking-tight">Access</span>
                  </div>
                  <div className="text-[10px] text-red-500 font-black px-2 py-1 bg-red-50 rounded-lg">
                    +{categorized.appAccess.today} TODAY
                  </div>
                </div>
              </button>
              <button
                onClick={() => navigate(`/dashboard/users/activity?employeeId=${employeeId}&type=security_permission`)}
                className="bg-white border border-gray-100 rounded-[2rem] p-6 text-left hover:shadow-2xl hover:shadow-red-500/10 hover:-translate-y-1 transition-all flex flex-col gap-4 group relative overflow-hidden"
              >
                <div className="absolute top-0 right-0 w-24 h-24 bg-red-50/50 rounded-bl-[4rem] group-hover:bg-red-100/50 transition-colors -mr-12 -mt-12"></div>
                <div className="flex items-center gap-3">
                  <div className="w-10 h-10 bg-red-50 rounded-2xl flex items-center justify-center group-hover:bg-red-600 group-hover:text-white transition-all duration-300">
                    <svg width="20" height="20" fill="currentColor" viewBox="0 0 24 24"><path d="M12 2L4 5V11C4 16.19 7.41 21.05 12 22C16.59 21.05 20 16.19 20 11V5L12 2Z" /></svg>
                  </div>
                  <span className="text-[11px] text-gray-400 font-black uppercase tracking-[0.2em]">Compliance</span>
                </div>
                <div className="flex items-center justify-between w-full mt-2 bg-gray-50 p-3 rounded-2xl border border-gray-100 group-hover:bg-white group-hover:border-red-100 transition-all">
                  <div className="flex items-baseline gap-2">
                    <span className="text-2xl font-black text-gray-900 leading-none">{counts.securityPermission || 0}</span>
                    <span className="text-[10px] text-gray-400 font-bold uppercase tracking-tight">Policy</span>
                  </div>
                  <div className="text-[10px] text-red-500 font-black px-2 py-1 bg-red-50 rounded-lg">
                    +{categorized.security.today} TODAY
                  </div>
                </div>
              </button>
            </div>

            <div id="devices" className="bg-white border border-gray-100 rounded-2xl p-5 mt-6">
              <div className="flex items-center justify-between mb-4">
                <div className="text-lg font-bold text-gray-800">Devices</div>
                <div className="flex items-center gap-2 bg-gray-50 px-3 py-1 rounded-lg border border-gray-100 shadow-sm">
                  <span className="text-[10px] text-gray-400 font-black uppercase tracking-wider">Registered</span>
                  <span className="text-xs font-black text-gray-900">{devices.length}</span>
                </div>
              </div>
              {devices.length === 0 ? (
                <div className="text-sm text-gray-500">No devices found.</div>
              ) : (
                <div className="overflow-auto">
                  <table className="min-w-full text-sm">
                    <thead>
                      <tr className="text-left text-gray-600 border-b">
                        <th className="py-2 pr-4">Device Id</th>
                        <th className="py-2 pr-4">Device Name</th>
                        <th className="py-2 pr-4">Platform</th>
                        <th className="py-2 pr-4">Status</th>
                        <th className="py-2 pr-4">Last Seen</th>
                      </tr>
                    </thead>
                    <tbody>
                      {devices.map((d) => (
                        <tr key={d._id || d.deviceId} className="border-b last:border-b-0">
                          <td className="py-2 pr-4 font-semibold text-gray-900">
                            <span
                              className="cursor-pointer hover:text-blue-600 transition-colors"
                              onClick={() => navigate(`/dashboard/users/device?search=${d.deviceId}&openModal=1`)}
                            >
                              {d.deviceId || "-"}
                            </span>
                          </td>
                          <td className="py-2 pr-4">{d.deviceName || "-"}</td>
                          <td className="py-2 pr-4">{d.platform || "-"}</td>
                          <td className="py-2 pr-4">{d.status || d.deviceStatus || "-"}</td>
                          <td className="py-2 pr-4">{formatDateTime(d.lastSeen || d.lastOnline)}</td>
                        </tr>
                      ))}
                    </tbody>
                  </table>
                </div>
              )}
            </div>



            <div id="attendance" className="bg-white border border-gray-100 rounded-2xl p-5 mt-6">
              <div className="flex items-center justify-between mb-4">
                <div
                  className="text-lg font-bold text-gray-800 cursor-pointer hover:text-blue-600 transition-colors flex items-center gap-2"
                  onClick={() => navigate(`/dashboard/users/attendance?searchTerm=${employeeId}`)}
                >
                  Attendance
                  <svg width="16" height="16" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2.5" strokeLinecap="round" strokeLinejoin="round">
                    <path d="M18 13v6a2 2 0 0 1-2 2H5a2 2 0 0 1-2-2V8a2 2 0 0 1 2-2h6"></path>
                    <polyline points="15 3 21 3 21 9"></polyline>
                    <line x1="10" y1="14" x2="21" y2="3"></line>
                  </svg>
                </div>
                <div className="flex flex-wrap items-center gap-3">
                  <div className="flex items-center gap-2">
                    <input
                      type="date"
                      className="text-xs border border-gray-200 rounded-lg px-2 py-1 focus:outline-none focus:ring-1 focus:ring-blue-500"
                      value={fromDate}
                      onChange={(e) => setFromDate(e.target.value)}
                    />
                    <span className="text-gray-400 text-xs">to</span>
                    <input
                      type="date"
                      className="text-xs border border-gray-200 rounded-lg px-2 py-1 focus:outline-none focus:ring-1 focus:ring-blue-500"
                      value={toDate}
                      onChange={(e) => setToDate(e.target.value)}
                    />
                  </div>
                  {(fromDate || toDate) && (
                    <button
                      onClick={() => { setFromDate(""); setToDate(""); }}
                      className="text-xs text-red-500 hover:text-red-600 font-medium"
                    >
                      Clear
                    </button>
                  )}
                  <div className="flex items-center gap-2 bg-gray-50 px-3 py-1 rounded-lg border border-gray-100 shadow-sm">
                    <span className="text-[10px] text-gray-400 font-black uppercase tracking-wider">Records</span>
                    <span className="text-xs font-black text-gray-900">{displayAttendance.length}</span>
                  </div>
                </div>
              </div>

              {scanEvents.length === 0 ? (
                <div className="text-sm text-gray-500 py-12 text-center border-2 border-dashed border-gray-100 rounded-2xl bg-gray-50/50">
                  <div className="flex flex-col items-center gap-2">
                    <svg className="w-8 h-8 text-gray-300" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                      <path strokeLinecap="round" strokeLinejoin="round" strokeWidth="2" d="M8 7V3m8 4V3m-9 8h10M5 21h14a2 2 0 002-2V7a2 2 0 00-2-2H5a2 2 0 00-2 2v12a2 2 0 002 2z" />
                    </svg>
                    <span>{fromDate || toDate ? "No activity found for this date range." : "No attendance activity for today."}</span>
                  </div>
                </div>
              ) : (
                <div className="overflow-hidden border border-gray-100 rounded-xl shadow-sm">
                  <table className="min-w-full text-sm text-left">
                    <thead className="bg-[#1e293b] text-white">
                      <tr>
                        <th className="py-3 px-6 font-semibold tracking-wide">Activity</th>
                        <th className="py-3 px-6 font-semibold tracking-wide">Status</th>
                        <th className="py-3 px-6 font-semibold tracking-wide">Date</th>
                        <th className="py-3 px-6 font-semibold tracking-wide">Time</th>
                      </tr>
                    </thead>
                    <tbody className="divide-y divide-gray-100 bg-white">
                      {scanEvents.map((event, idx) => {
                        const eventDate = new Date(event.time);
                        const timeString = eventDate.toLocaleTimeString([], {
                          hour: '2-digit',
                          minute: '2-digit',
                          second: '2-digit',
                          hour12: true
                        });

                        return (
                          <tr key={idx} className="hover:bg-gray-50/80 transition-all">
                            <td className="py-4 px-6">
                              <span className={`inline-flex items-center px-4 py-1.5 rounded-full text-xs font-bold uppercase tracking-wider ${event.type === 'Entry'
                                ? 'bg-green-50 text-green-700 ring-1 ring-green-100'
                                : 'bg-orange-50 text-orange-700 ring-1 ring-orange-100'
                                }`}>
                                {event.type}
                              </span>
                            </td>
                            <td className="py-4 px-6">
                              <span className="inline-flex items-center px-4 py-1.5 rounded-lg bg-blue-50 text-blue-600 text-xs font-bold ring-1 ring-blue-100">
                                {event.status}
                              </span>
                            </td>
                            <td className="py-4 px-6">
                              <span className="text-gray-900 font-medium">
                                {formatDate(event.date)}
                              </span>
                            </td>
                            <td className="py-4 px-6">
                              <span className="text-gray-700 font-semibold tabular-nums">
                                {timeString}
                              </span>
                            </td>
                          </tr>
                        );
                      })}
                    </tbody>
                  </table>
                  {scanEvents.length > 8 && (
                    <div className="bg-gray-50 border-t border-gray-100 py-2 text-center text-[10px] text-gray-400 uppercase tracking-widest font-bold">
                      Scroll for more history
                    </div>
                  )}
                </div>
              )}

              <div className="mt-6 pt-4 border-t border-gray-50 flex justify-center">
                <button
                  onClick={() => navigate(`/dashboard/users/attendance?searchTerm=${employeeId}`)}
                  className="text-blue-600 hover:text-blue-700 font-semibold text-sm flex items-center gap-1 transition-colors hover:underline"
                >
                  Show full attendance data
                  <svg width="14" height="14" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2" strokeLinecap="round" strokeLinejoin="round">
                    <path d="M5 12h14"></path>
                    <path d="m12 5 7 7-7 7"></path>
                  </svg>
                </button>
              </div>
            </div>
          </>
        )
        }
      </div >


    </div >
  );
}


