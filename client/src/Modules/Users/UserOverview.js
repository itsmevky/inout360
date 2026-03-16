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

  const normalizeSessionStatus = (value) => {
    const raw = String(value || "").trim();
    const lower = raw.toLowerCase();
    if (!raw) return { label: "Offline", isOnline: false };
    if (lower.includes("logged in") || lower === "login" || lower === "loggedin") {
      return { label: "Online", isOnline: true };
    }
    if (lower.includes("logged out") || lower === "logout" || lower === "loggedout") {
      return { label: "Offline", isOnline: false };
    }
    return { label: raw, isOnline: lower.includes("in") && !lower.includes("out") };
  };

  const sessionUi = normalizeSessionStatus(profile.sessionStatus);

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
  const dashboardPrefix = (location.pathname || "").startsWith("/dashboard/employee")
    ? "/dashboard/employee"
    : "/dashboard/users";
  const backPath = principalType === "visitor"
    ? `${dashboardPrefix}/visitors`
    : `${dashboardPrefix}/employees`;

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

  const infoItems = useMemo(() => {
    const items = [];
    if (profile.email) {
      items.push({
        label: "Email Address",
        value: profile.email,
        iconColor: "bg-blue-500",
        content: <p className="text-sm font-bold text-gray-800 break-all">{profile.email}</p>
      });
    }
    if (profile.phone) {
      items.push({
        label: "Phone Number",
        value: profile.phone,
        iconColor: "bg-green-500",
        content: <p className="text-sm font-bold text-gray-800">{profile.phone}</p>
      });
    }
    if (profile.gender || profile.rfid) {
      items.push({
        label: "Gender / RFID",
        value: profile.gender || profile.rfid,
        iconColor: "bg-indigo-500",
        content: (
          <div className="flex items-center gap-2 text-sm font-bold text-gray-800">
            {profile.gender && profile.gender !== "-" && <span>{profile.gender}</span>}
            {profile.gender && profile.gender !== "-" && profile.rfid && profile.rfid !== "No RFID Tag" && <span className="text-gray-200">|</span>}
            {profile.rfid && profile.rfid !== "No RFID Tag" && <span className="text-xs text-gray-500">{profile.rfid}</span>}
            {!profile.gender && (!profile.rfid || profile.rfid === "No RFID Tag") && <span>-</span>}
          </div>
        )
      });
    }
    if (profile.designation) {
      items.push({
        label: "Designation",
        value: profile.designation,
        iconColor: "bg-orange-500",
        content: <p className="text-sm font-bold text-gray-800">{profile.designation}</p>
      });
    }
    if (sessionUi.label) {
      const lastOnlineStr = profile.lastSeen ? ` (Last seen ${formatDate(profile.lastSeen)})` : "";
      items.push({
        label: "Mobile Session",
        value: sessionUi.label,
        iconColor: sessionUi.isOnline ? "bg-green-500" : "bg-red-500",
        content: (
          <p className={`text-sm font-bold ${sessionUi.isOnline ? "text-green-600" : "text-red-600"}`}>
            {sessionUi.label}
            {lastOnlineStr && <span className="text-[10px] text-gray-400 font-medium ml-1.5">{lastOnlineStr}</span>}
          </p>
        )
      });
    }
    return items;
  }, [profile, sessionUi]);

  const activityItems = useMemo(() => {
    const items = [];
    const navigateTo = (type) => () => navigate(`/dashboard/users/activity?employeeId=${employeeId}&type=${type}`);

    // Activity Integrated Details
    items.push({
      label: "Cam Activity",
      onClick: navigateTo("camera_activity"),
      iconColor: "bg-blue-400",
      content: (
        <div className="text-sm font-bold text-gray-800 flex items-center gap-1.5">
          {counts.camera || 0}
          <span className="text-[10px] text-gray-400 font-medium">({categorized.camera.today || 0} today)</span>
        </div>
      )
    });

    items.push({
      label: "App Access",
      onClick: navigateTo("app_access"),
      iconColor: "bg-indigo-400",
      content: (
        <div className="text-sm font-bold text-gray-800 flex items-center gap-1.5">
          {counts.appAccess || 0}
          <span className="text-[10px] text-gray-400 font-medium">({categorized.appAccess.today || 0} today)</span>
        </div>
      )
    });

    items.push({
      label: "Security Events",
      onClick: navigateTo("security_permission"),
      iconColor: "bg-purple-400",
      content: (
        <div className="text-sm font-bold text-gray-800 flex items-center gap-1.5">
          {counts.securityPermission || 0}
          <span className="text-[10px] text-gray-400 font-medium">({categorized.security.today || 0} today)</span>
        </div>
      )
    });

    return items;
  }, [counts, categorized, employeeId, navigate]);



  return (
    <div className="m-0">
      <div className="relative p-4 !m-0">
        {loading ? (
          <div className="p-12 text-center text-gray-400 font-bold italic">Gathering intelligence...</div>
        ) : !overview ? (
          <div className="p-12 text-center bg-red-50 border border-red-100 rounded-[2rem] text-red-600 font-bold">
            Target unidentified. Profile data incomplete.
          </div>
        ) : (
          <div className="bg-white rounded-[2rem] overflow-hidden shadow-sm border border-gray-100 mb-6 group transition-all hover:shadow-xl hover:shadow-blue-500/5">
            {/* Back Button */}
            <div className="pt-6 px-8">
              <button
                className="w-10 h-10 flex items-center justify-center rounded-xl bg-gray-50 text-gray-700 hover:bg-gray-100 transition-all border border-gray-100 shadow-sm"
                onClick={() => navigate(backPath)}
                title="Go Back"
              >
                <svg width="20" height="20" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2.5" strokeLinecap="round" strokeLinejoin="round">
                  <path d="m15 18-6-6 6-6" />
                </svg>
              </button>
            </div>

            <div className="px-8 pb-8 pt-4 relative">
              <div className="flex flex-col md:flex-row gap-8 items-start">
                {/* Avatar Area */}
                <div className="relative group">
                  <div className="w-32 h-32 rounded-[2.5rem] bg-white p-2 shadow-2xl border border-white rotate-3 group-hover:rotate-0 transition-transform duration-500">
                    <div className="w-full h-full rounded-[2rem] bg-gradient-to-br from-blue-600 to-indigo-700 flex items-center justify-center text-4xl font-black text-white uppercase shadow-inner">
                      {profile?.name?.charAt(0) || "U"}
                    </div>
                  </div>
                  <div
                    className={`absolute -bottom-2 -right-2 w-10 h-10 rounded-2xl border-4 border-white shadow-lg flex items-center justify-center ${sessionUi.isOnline ? "bg-green-500" : "bg-gray-400"}`}
                    title={sessionUi.isOnline ? "User Online" : "User Offline"}
                  >
                    <div className={`w-2.5 h-2.5 rounded-full bg-white ${sessionUi.isOnline ? "animate-pulse" : ""}`}></div>
                  </div>
                </div>

                {/* Identity Section */}
                <div className="flex-1 mb-2">
                  <div className="flex flex-wrap items-center gap-4 mb-2">
                    <h1 className="text-3xl font-black text-gray-900 tracking-tight">{profile?.name || "-"}</h1>
                    <span className="px-3 py-1 bg-blue-50 text-blue-600 text-[10px] font-black uppercase rounded-lg tracking-widest border border-blue-100 flex items-center gap-1.5 shadow-sm">
                      <span className="w-1.5 h-1.5 rounded-full bg-blue-500 animate-pulse"></span>
                      {principalType}
                    </span>
                  </div>
                  <div className="flex flex-wrap items-center gap-6 text-sm font-bold text-gray-400">
                    <span className="flex items-center gap-2">
                      <svg className="w-4 h-4 text-blue-500/50" fill="currentColor" viewBox="0 0 24 24">
                        <path d="M12 2C6.48 2 2 6.48 2 12s4.48 10 10 10 10-4.48 10-10S17.52 2 12 2zm1 15h-2v-6h2v6zm0-8h-2V7h2v2z" />
                      </svg>
                      ID: <span className="text-gray-900">{profile?.employeeId || employeeId}</span>
                    </span>
                    <span className="flex items-center gap-2 border-l border-gray-100 pl-6">
                      <svg className="w-4 h-4 text-indigo-500/50" fill="currentColor" viewBox="0 0 24 24">
                        <path d="M12 2C8.13 2 5 5.13 5 9c0 5.25 7 13 7 13s7-7.75 7-13c0-3.87-3.13-7-7-7zm0 9.5c-1.38 0-2.5-1.12-2.5-2.5s1.12-2.5 2.5-2.5 2.5 1.12 2.5 2.5-1.12 2.5-2.5 2.5z" />
                      </svg>
                      SITE: <span className="text-gray-900 truncate max-w-[250px] font-black">{profile.location || "-"}</span>
                    </span>
                  </div>
                </div>

                {/* Header Profile Stats */}
                <div className="flex flex-wrap gap-3">
                  {profile.department && (
                    <div className="p-4 bg-gray-50 rounded-3xl border border-gray-100 text-center min-w-[110px] transition-all hover:bg-white hover:shadow-md cursor-default">
                      <p className="text-[10px] text-gray-400 font-black uppercase tracking-widest mb-1">Department</p>
                      <p className="text-sm font-black text-gray-800">{profile.department}</p>
                    </div>
                  )}
                  {profile.designation && (
                    <div className="p-4 bg-gray-50 rounded-3xl border border-gray-100 text-center min-w-[110px] transition-all hover:bg-white hover:shadow-md cursor-default">
                      <p className="text-[10px] text-gray-400 font-black uppercase tracking-widest mb-1">Designation</p>
                      <p className="text-sm font-black text-gray-800">{profile.designation}</p>
                    </div>
                  )}
                </div>
              </div>

              {/* Expanded Info Grid */}
              <div className={`grid grid-cols-2 md:grid-cols-3 lg:grid-cols-${Math.max(2, Math.min(4, infoItems.length))} gap-8 mt-12 border-t border-gray-50 pt-10`}>
                {infoItems.map((item, idx) => (
                  <div key={idx} className="space-y-1">
                    <p className="text-[11px] text-gray-600 font-black uppercase tracking-widest flex items-center gap-2">
                      <span className={`w-1 h-1 rounded-full ${item.iconColor}`}></span>
                      {item.label}
                    </p>
                    {item.content}
                  </div>
                ))}
                {infoItems.length === 0 && (
                  <div className="col-span-full py-4 text-center text-gray-400 italic text-sm">
                    No additional profile information available.
                  </div>
                )}
              </div>

              {/* Activity Section */}
              <div className="grid grid-cols-2 md:grid-cols-3 lg:grid-cols-4 gap-8 mt-10 border-t border-gray-50 pt-10">
                <div className="col-span-full -mb-4">
                  <p className="text-sm text-gray-900 font-black uppercase tracking-[0.2em]">Activity Highlights</p>
                </div>
                {activityItems.map((item, idx) => (
                  <div key={idx} className="space-y-1">
                    <p
                      className={`text-[11px] text-gray-600 font-black uppercase tracking-widest flex items-center gap-2 ${item.onClick ? "cursor-pointer hover:text-blue-600 transition-colors" : ""}`}
                      onClick={item.onClick}
                    >
                      <span className={`w-1 h-1 rounded-full ${item.iconColor}`}></span>
                      {item.label}
                    </p>
                    <div onClick={item.onClick} className={item.onClick ? "cursor-pointer" : ""}>
                      {item.content}
                    </div>
                  </div>
                ))}
              </div>

              {/* Devices Section */}
              <div id="devices" className="mt-10 border-t border-gray-50 pt-10">
                <div className="flex items-center justify-between mb-6">
                  <div className="flex items-center gap-3">
                    <p className="text-sm text-gray-900 font-black uppercase tracking-[0.2em]">Registered Devices</p>
                    <span className="px-2 py-0.5 bg-gray-100 text-gray-500 text-[10px] font-black rounded-md">{devices.length}</span>
                  </div>
                </div>
                {devices.length === 0 ? (
                  <div className="text-sm text-gray-500 italic">No devices found.</div>
                ) : (
                  <div className="overflow-auto rounded-xl border border-gray-100">
                    <table className="min-w-full text-sm">
                      <thead className="bg-gray-50 border-b border-gray-100">
                        <tr className="text-left text-gray-900 uppercase text-[10px] font-black tracking-widest">
                          <th className="py-3 px-4">Device Id</th>
                          <th className="py-3 px-4">Device Name</th>
                          <th className="py-3 px-4">Platform</th>
                          <th className="py-3 px-4 text-right">Last Seen</th>
                        </tr>
                      </thead>
                      <tbody className="divide-y divide-gray-50">
                        {devices.map((d) => (
                          <tr key={d._id || d.deviceId} className="hover:bg-gray-50/50 transition-colors">
                            <td className="py-3 px-4 font-bold text-gray-900">
                              <span
                                className="cursor-pointer hover:text-blue-600 transition-colors"
                                onClick={() => navigate(`/dashboard/users/device?employeeId=${employeeId}&openModal=true`)}
                              >
                                {d.deviceId || "-"}
                              </span>
                            </td>
                            <td className="py-3 px-4 text-gray-600">{d.deviceName || "-"}</td>
                            <td className="py-3 px-4">
                              <span className="px-2 py-0.5 bg-blue-50 text-blue-600 text-[10px] font-black rounded uppercase tracking-tighter">
                                {d.platform || "-"}
                              </span>
                            </td>
                            <td className="py-3 px-4 text-gray-500 text-right font-medium">
                              {formatDateTime(d.lastSeen || d.lastOnline)}
                            </td>
                          </tr>
                        ))}
                      </tbody>
                    </table>
                  </div>
                )}
              </div>

              {/* Attendance Section */}
              <div id="attendance" className="mt-10 border-t border-gray-50 pt-10">
                <div className="flex items-center justify-between mb-6">
                  <div
                    className="flex items-center gap-3 cursor-pointer group/title"
                    onClick={() => navigate(`/dashboard/users/attendance?searchTerm=${employeeId}`)}
                  >
                    <p className="text-sm text-gray-900 font-black uppercase tracking-[0.2em] group-hover/title:text-blue-700">
                      Attendance Log
                    </p>
                    <svg
                      className="w-3 h-3 text-blue-400 group-hover/title:translate-x-0.5 transition-transform"
                      viewBox="0 0 24 24"
                      fill="none"
                      stroke="currentColor"
                      strokeWidth="3"
                      strokeLinecap="round"
                      strokeLinejoin="round"
                    >
                      <path d="M5 12h14M12 5l7 7-7 7" />
                    </svg>
                  </div>

                  <div className="flex flex-wrap items-center gap-4">
                    <div className="flex items-center gap-2 bg-gray-50 p-1 rounded-xl border border-gray-100">
                      <input
                        type="date"
                        className="text-[10px] font-bold bg-transparent border-none focus:ring-0 px-2 py-1 text-gray-600 outline-none"
                        value={fromDate}
                        onChange={(e) => setFromDate(e.target.value)}
                      />
                      <span className="text-[10px] text-gray-300 font-black">-</span>
                      <input
                        type="date"
                        className="text-[10px] font-bold bg-transparent border-none focus:ring-0 px-2 py-1 text-gray-600 outline-none"
                        value={toDate}
                        onChange={(e) => setToDate(e.target.value)}
                      />
                    </div>
                    {(fromDate || toDate) && (
                      <button
                        onClick={() => {
                          setFromDate("");
                          setToDate("");
                        }}
                        className="text-[10px] font-black text-red-500 hover:text-red-600 uppercase tracking-widest"
                      >
                        Clear
                      </button>
                    )}
                    <div className="px-2 py-0.5 bg-gray-100 text-gray-500 text-[10px] font-black rounded-md">
                      {displayAttendance.length} Records
                    </div>
                  </div>
                </div>

                {scanEvents.length === 0 ? (
                  <div className="text-center py-10 bg-gray-50/50 rounded-2xl border border-dashed border-gray-200">
                    <p className="text-xs text-gray-400 font-medium italic">
                      {fromDate || toDate
                        ? "Search complete. No matching logs found."
                        : "No attendance activity detected for today."}
                    </p>
                  </div>
                ) : (
                  <div className="overflow-hidden border border-gray-100 rounded-xl">
                    <table className="min-w-full text-sm text-left">
                      <thead className="bg-[#1e293b] text-white">
                        <tr className="text-[11px] uppercase font-black tracking-[0.15em]">
                          <th className="py-3 px-6">Entry/Exit</th>
                          <th className="py-3 px-6">System Status</th>
                          <th className="py-3 px-6">Date</th>
                          <th className="py-3 px-6 text-right">Timestamp</th>
                        </tr>
                      </thead>
                      <tbody className="divide-y divide-gray-50 bg-white">
                        {scanEvents.map((event, idx) => {
                          const eventDate = new Date(event.time);
                          const timeString = eventDate.toLocaleTimeString([], {
                            hour: "2-digit",
                            minute: "2-digit",
                            second: "2-digit",
                            hour12: true,
                          });

                          return (
                            <tr key={idx} className="hover:bg-gray-50/50 transition-colors">
                              <td className="py-4 px-6">
                                <span
                                  className={`inline-flex items-center px-3 py-1 rounded-lg text-[9px] font-black uppercase tracking-widest ${event.type === "Entry"
                                    ? "bg-green-50 text-green-700 border border-green-100"
                                    : "bg-orange-50 text-orange-700 border border-orange-100"
                                    }`}
                                >
                                  {event.type}
                                </span>
                              </td>
                              <td className="py-4 px-6">
                                <span className="text-xs font-bold text-gray-600">{event.status}</span>
                              </td>
                              <td className="py-4 px-6 text-gray-500 font-medium">{formatDate(event.date)}</td>
                              <td className="py-4 px-6 text-right font-black text-gray-900 tabular-nums">
                                {timeString}
                              </td>
                            </tr>
                          );
                        })}
                      </tbody>
                    </table>
                    {scanEvents.length > 5 && (
                      <div className="bg-gray-50/50 border-t border-gray-50 py-3 text-center">
                        <button
                          onClick={() => navigate(`/dashboard/users/attendance?searchTerm=${employeeId}`)}
                          className="text-[10px] text-blue-600 hover:text-blue-700 font-black uppercase tracking-[0.2em] transition-all hover:gap-2 flex items-center justify-center gap-1 mx-auto"
                        >
                          Explore Complete History
                          <svg className="w-3 h-3" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                            <path
                              strokeLinecap="round"
                              strokeLinejoin="round"
                              strokeWidth="3"
                              d="M17 8l4 4m0 0l-4 4m4-4H3"
                            />
                          </svg>
                        </button>
                      </div>
                    )}
                  </div>
                )}
              </div>
            </div>
          </div>
        )}
      </div>
    </div>
  );
}
