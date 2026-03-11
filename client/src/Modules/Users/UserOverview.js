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
        <div className="bg-white p-4 rounded-lg text-gray-700 font-semibold text-xl flex gap-4 list-user-title items-center justify-between">
          <div className="flex items-center gap-3">
            <button
              className="px-3 py-1.5 rounded-md border border-gray-200 text-sm text-gray-700 hover:bg-gray-50"
              onClick={() => navigate(backPath)}
            >
              Back
            </button>
            <div>
              <div className="font-semibold">
                {profile?.name || "-"}{" "}
                <span className="text-gray-500 text-sm font-semibold">
                  ({principalType})
                </span>
              </div>
              <div className="text-sm text-gray-500 font-medium">
                Employee Id: {profile?.employeeId || employeeId}
              </div>
            </div>
          </div>
        </div>

        {loading ? (
          <div className="p-4">Loading...</div>
        ) : !overview ? (
          <div className="p-4 text-red-600">No data found.</div>
        ) : (
          <>
            <div className="grid grid-cols-1 md:grid-cols-3 gap-4 mt-6">
              <button
                onClick={() => navigate(`/dashboard/users/activity?employeeId=${employeeId}&type=camera_activity`)}
                className="bg-white border border-gray-100 rounded-xl p-4 text-left hover:shadow-md transition-all min-h-[105px] flex flex-col justify-between"
              >
                <div className="text-[11px] text-gray-500 font-bold uppercase tracking-wider mb-1">Camera Activity</div>
                <div className="flex flex-wrap items-baseline gap-1.5 mt-auto">
                  <div className="text-2xl font-bold text-gray-900 leading-none">{counts.camera || 0}</div>
                  <div className="text-[11px] text-red-500 font-bold">({categorized.camera.today} Today)</div>
                </div>
              </button>
              <button
                onClick={() => navigate(`/dashboard/users/activity?employeeId=${employeeId}&type=app_access`)}
                className="bg-white border border-gray-100 rounded-xl p-4 text-left hover:shadow-md transition-all min-h-[105px] flex flex-col justify-between"
              >
                <div className="text-[11px] text-gray-500 font-bold uppercase tracking-wider mb-1">App Access</div>
                <div className="flex flex-wrap items-baseline gap-1.5 mt-auto">
                  <div className="text-2xl font-bold text-gray-900 leading-none">{counts.appAccess || 0}</div>
                  <div className="text-[11px] text-red-500 font-bold">({categorized.appAccess.today} Today)</div>
                </div>
              </button>
              <button
                onClick={() => navigate(`/dashboard/users/activity?employeeId=${employeeId}&type=security_permission`)}
                className="bg-white border border-gray-100 rounded-xl p-4 text-left hover:shadow-md transition-all min-h-[105px] flex flex-col justify-between"
              >
                <div className="text-[11px] text-gray-500 font-bold uppercase tracking-wider mb-1">Security & Permissions</div>
                <div className="flex flex-wrap items-baseline gap-1.5 mt-auto">
                  <div className="text-2xl font-bold text-gray-900 leading-none">{counts.securityPermission || 0}</div>
                  <div className="text-[11px] text-red-500 font-bold">({categorized.security.today} Today)</div>
                </div>
              </button>
            </div>

            <div id="details" className="bg-white border border-gray-100 rounded-2xl p-5 mt-6">
              <div className="text-lg font-bold text-gray-800 mb-4">User Details</div>
              <div className="grid grid-cols-1 md:grid-cols-2 gap-3 text-sm">
                <div>
                  <div className="text-gray-500">Name</div>
                  <div className="font-semibold text-gray-900">{profile.name || "-"}</div>
                </div>
                <div>
                  <div className="text-gray-500">Employee Id</div>
                  <div className="font-semibold text-gray-900">{profile.employeeId || employeeId}</div>
                </div>
                <div>
                  <div className="text-gray-500">Email</div>
                  <div className="font-semibold text-gray-900">{profile.email || "-"}</div>
                </div>
                <div>
                  <div className="text-gray-500">Department</div>
                  <div className="font-semibold text-gray-900">{profile.department || "-"}</div>
                </div>
                <div>
                  <div className="text-gray-500">Gender</div>
                  <div className="font-semibold text-gray-900">{profile.gender || "-"}</div>
                </div>
                <div>
                  <div className="text-gray-500">Session</div>
                  <div className="font-semibold text-gray-900">{profile.sessionStatus || "-"}</div>
                </div>
                <div>
                  <div className="text-gray-500">Location</div>
                  <div className="font-semibold text-gray-900">{profile.location || "-"}</div>
                </div>
                <div>
                  <div className="text-gray-500">RFID</div>
                  <div className="font-semibold text-gray-900">{profile.rfid || "-"}</div>
                </div>
              </div>
            </div>

            <div id="devices" className="bg-white border border-gray-100 rounded-2xl p-5 mt-6">
              <div className="flex items-center justify-between mb-4">
                <div className="text-lg font-bold text-gray-800">Devices</div>
                <div className="text-sm text-gray-500 font-semibold">{devices.length} registered</div>
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
                          <td className="py-2 pr-4 font-semibold text-gray-900">{d.deviceId || "-"}</td>
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
                  onClick={() => navigate(`/dashboard/users/activity?employeeId=${employeeId}&type=in_out`)}
                >
                  Attendance
                  <svg width="16" height="16" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2.5" strokeLinecap="round" strokeLinejoin="round">
                    <path d="M18 13v6a2 2 0 0 1-2 2H5a2 2 0 0 1-2-2V8a2 2 0 0 1 2-2h6"></path>
                    <polyline points="15 3 21 3 21 9"></polyline>
                    <line x1="10" y1="14" x2="21" y2="3"></line>
                  </svg>
                </div>
                <div className="text-sm text-gray-500 font-semibold">{attendance.length} records</div>
              </div>
              {attendance.length === 0 ? (
                <div className="text-sm text-gray-500">No attendance found.</div>
              ) : (
                <div className="overflow-auto">
                  <table className="min-w-full text-sm">
                    <thead>
                      <tr className="text-left text-gray-600 border-b">
                        <th className="py-2 pr-4">Date</th>
                        <th className="py-2 pr-4">Status</th>
                        <th className="py-2 pr-4">Section</th>
                        <th className="py-2 pr-4">Entry</th>
                        <th className="py-2 pr-4">Exit</th>
                        <th className="py-2 pr-4">Work Hours</th>
                      </tr>
                    </thead>
                    <tbody>
                      {attendance.map((a) => (
                        <tr key={a._id || a.id || `${a.employeeId}-${a.date}`} className="border-b last:border-b-0">
                          <td className="py-2 pr-4 font-semibold text-gray-900">{formatDate(a.date)}</td>
                          <td className="py-2 pr-4">{a.status || "-"}</td>
                          <td className="py-2 pr-4">{a.sectionAssigned || "-"}</td>
                          <td className="py-2 pr-4">{formatDateTime(a.entryGateIn || a.workfloorIn)}</td>
                          <td className="py-2 pr-4">{formatDateTime(a.exitGateOut || a.workfloorOut)}</td>
                          <td className="py-2 pr-4">
                            {typeof a.totalWorkHours === "number" ? a.totalWorkHours : "-"}
                          </td>
                        </tr>
                      ))}
                    </tbody>
                  </table>
                </div>
              )}
            </div>
          </>
        )}
      </div>


    </div>
  );
}


