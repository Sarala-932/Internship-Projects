import { useEffect, useState } from "react";
import { Building2, Users, CheckCircle, Clock, TrendingUp, Plus, Eye, ShieldCheck, AlertCircle, RefreshCw, Activity } from "lucide-react";
import { useSelector } from "react-redux";
import { Link } from "react-router";
import { useSuperAdmin } from "../hook/useSuperAdmin";
import { AreaChart, Area, XAxis, YAxis, CartesianGrid, Tooltip, ResponsiveContainer } from "recharts";

import CreateHospitalModal from "../components/CreateHospitalModal";

export default function SuperAdminDashboard() {
  const { token } = useSelector((state) => state.auth);
  const [hospitals, setHospitals] = useState([]);
  const [showModal, setShowModal] = useState(false);
  const [analytics, setAnalytics] = useState(null);
  const { getHospitals, getPlatformStats, loading, error } = useSuperAdmin();

  const loadData = async () => {
    const statsData = await getPlatformStats();
    if (statsData) setAnalytics(statsData);

    const hospitalData = await getHospitals();
    if (hospitalData) setHospitals(hospitalData.hospitals || []);
  };

  useEffect(() => {
    loadData();
  }, [token]);

  const stats = [
    { title: "Total Hospitals", value: analytics?.kpis?.totalHospitals || 0, icon: Building2, trend: "+12%", color: "text-blue-600 dark:text-blue-400", bg: "bg-blue-100 dark:bg-blue-900/30", border: "border-blue-200 dark:border-blue-800" },
    { title: "Active Facilities", value: analytics?.kpis?.activeHospitals || 0, icon: Activity, trend: "+5%", color: "text-emerald-600 dark:text-emerald-400", bg: "bg-emerald-100 dark:bg-emerald-900/30", border: "border-emerald-200 dark:border-emerald-800" },
    { title: "Pending Approvals", value: analytics?.kpis?.pendingHospitals || 0, icon: AlertCircle, trend: "-2%", color: "text-amber-600 dark:text-amber-400", bg: "bg-amber-100 dark:bg-amber-900/30", border: "border-amber-200 dark:border-amber-800" },
    { title: "Platform Status", value: analytics?.kpis?.platformStatus || "Live", icon: ShieldCheck, trend: "99.9% Uptime", color: "text-indigo-600 dark:text-indigo-400", bg: "bg-indigo-100 dark:bg-indigo-900/30", border: "border-indigo-200 dark:border-indigo-800" },
  ];

  return (
    <div className="space-y-8">
      {/* Welcome Banner */}
      <div className="bg-gradient-to-r from-slate-900 to-blue-900 rounded-2xl p-6 flex items-center justify-between">
        <div>
          <div className="flex items-center gap-2 mb-1">
            <ShieldCheck className="w-5 h-5 text-amber-400" />
            <span className="text-amber-400 text-sm font-semibold">Super Admin Console</span>
          </div>
          <h2 className="text-2xl font-bold text-white">Platform Overview</h2>
          <p className="text-slate-400 text-sm mt-1">Manage all hospitals and platform-level settings from here.</p>
        </div>
        <button
          onClick={() => setShowModal(true)}
          className="flex items-center gap-2 bg-blue-600 hover:bg-blue-500 text-white px-5 py-2.5 rounded-xl text-sm font-semibold transition-all shadow-lg shadow-blue-600/30"
        >
          <Plus className="w-4 h-4" />
          Add Hospital
        </button>
      </div>

      {/* Stats - Global Analytics */}
      <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-4 gap-5">
        {stats.map((stat, i) => (
          <div key={i} className={`bg-white dark:bg-slate-800 rounded-xl p-5 border ${stat.border} shadow-sm`}>
            <div className="flex items-center justify-between mb-3">
              <p className="text-sm font-medium text-slate-500 dark:text-slate-400">{stat.title}</p>
              <div className={`p-2 rounded-lg ${stat.bg}`}>
                <stat.icon className={`w-5 h-5 ${stat.color}`} />
              </div>
            </div>
            <p className={`text-3xl font-bold ${stat.color}`}>{stat.value}</p>
          </div>
        ))}
      </div>

      {/* Analytics Chart */}
      {analytics?.charts?.hospitals && analytics.charts.hospitals.length > 0 && (
        <div className="bg-white dark:bg-slate-800 rounded-2xl border border-slate-200 dark:border-slate-700 shadow-sm p-6">
          <h3 className="font-bold text-slate-900 dark:text-white flex items-center gap-2 mb-6">
            <TrendingUp className="w-5 h-5 text-emerald-500" />
            Hospital Growth (Last 7 Days)
          </h3>
          <div className="h-72 w-full">
            <ResponsiveContainer width="100%" height="100%">
              <AreaChart data={analytics.charts.hospitals}>
                <defs>
                  <linearGradient id="colorHosp" x1="0" y1="0" x2="0" y2="1">
                    <stop offset="5%" stopColor="#10b981" stopOpacity={0.3}/>
                    <stop offset="95%" stopColor="#10b981" stopOpacity={0}/>
                  </linearGradient>
                </defs>
                <CartesianGrid strokeDasharray="3 3" vertical={false} stroke="#e2e8f0" />
                <XAxis dataKey="date" tickLine={false} axisLine={false} tick={{ fontSize: 12, fill: '#64748b' }} tickFormatter={(val) => new Date(val).toLocaleDateString(undefined, { weekday: 'short' })} />
                <YAxis tickLine={false} axisLine={false} tick={{ fontSize: 12, fill: '#64748b' }} allowDecimals={false} />
                <Tooltip 
                  contentStyle={{ borderRadius: '8px', border: 'none', boxShadow: '0 4px 6px -1px rgb(0 0 0 / 0.1)' }}
                  labelFormatter={(val) => new Date(val).toLocaleDateString()}
                />
                <Area type="monotone" dataKey="count" name="New Hospitals" stroke="#10b981" strokeWidth={3} fillOpacity={1} fill="url(#colorHosp)" />
              </AreaChart>
            </ResponsiveContainer>
          </div>
        </div>
      )}

      {/* Hospitals Table */}
      <div className="bg-white dark:bg-slate-800 rounded-2xl border border-slate-200 dark:border-slate-700 shadow-sm overflow-hidden">
        <div className="px-6 py-4 border-b border-slate-200 dark:border-slate-700 flex items-center justify-between">
          <div>
            <h3 className="font-bold text-slate-900 dark:text-white">All Hospitals</h3>
            <p className="text-xs text-slate-500 dark:text-slate-400 mt-0.5">Manage and verify hospitals on the platform</p>
          </div>
          <Link to="/super-admin/hospitals" className="text-sm text-hospital-blue dark:text-blue-400 hover:underline font-medium">
            Manage All →
          </Link>
        </div>

        {loading ? (
          <div className="flex items-center justify-center py-16">
            <RefreshCw className="w-8 h-8 text-slate-400 animate-spin" />
          </div>
        ) : error ? (
          <div className="flex items-center justify-center gap-2 py-16 text-red-500">
            <AlertCircle className="w-5 h-5" />
            <span className="text-sm">{error}</span>
          </div>
        ) : hospitals.length === 0 ? (
          <div className="flex flex-col items-center justify-center py-16 text-slate-400">
            <Building2 className="w-12 h-12 mb-3" />
            <p className="text-sm font-medium">No hospitals yet</p>
            <p className="text-xs mt-1">Click "Add Hospital" to get started</p>
          </div>
        ) : (
          <div className="overflow-x-auto">
            <table className="w-full text-left text-sm">
              <thead className="bg-slate-50 dark:bg-slate-900/50 text-slate-500 dark:text-slate-400 text-xs uppercase">
                <tr>
                  <th className="px-6 py-3">Hospital Name</th>
                  <th className="px-6 py-3">City</th>
                  <th className="px-6 py-3">Phone</th>
                  <th className="px-6 py-3">Status</th>
                  <th className="px-6 py-3">Actions</th>
                </tr>
              </thead>
              <tbody className="divide-y divide-slate-100 dark:divide-slate-700">
                {hospitals.slice(0, 5).map((hospital) => (
                  <tr key={hospital._id} className="hover:bg-slate-50 dark:hover:bg-slate-700/50 transition-colors">
                    <td className="px-6 py-4">
                      <div className="flex items-center gap-3">
                        <div className="w-8 h-8 rounded-lg bg-blue-100 dark:bg-blue-900/30 flex items-center justify-center">
                          <Building2 className="w-4 h-4 text-blue-600 dark:text-blue-400" />
                        </div>
                        <span className="font-medium text-slate-900 dark:text-white">{hospital.name}</span>
                      </div>
                    </td>
                    <td className="px-6 py-4 text-slate-600 dark:text-slate-300">{hospital.address?.city || "—"}</td>
                    <td className="px-6 py-4 text-slate-600 dark:text-slate-300">{hospital.phone || "—"}</td>
                    <td className="px-6 py-4">
                      <span className={`inline-flex items-center gap-1.5 px-2.5 py-1 rounded-full text-xs font-semibold ${
                        hospital.status === "active"
                          ? "bg-emerald-100 dark:bg-emerald-900/30 text-emerald-700 dark:text-emerald-400"
                          : "bg-amber-100 dark:bg-amber-900/30 text-amber-700 dark:text-amber-400"
                      }`}>
                        {hospital.status === "active" ? <CheckCircle className="w-3 h-3" /> : <Clock className="w-3 h-3" />}
                        {hospital.status === "active" ? "Active" : "Pending"}
                      </span>
                    </td>
                    <td className="px-6 py-4">
                      <Link to="/super-admin/hospitals" className="flex items-center gap-1 text-hospital-blue dark:text-blue-400 hover:underline text-sm font-medium">
                        <Eye className="w-4 h-4" />
                        Manage
                      </Link>
                    </td>
                  </tr>
                ))}
              </tbody>
            </table>
          </div>
        )}
      </div>

      {/* Global Activity Logs (Document Requirements) */}
      <div className="bg-white dark:bg-slate-800 rounded-2xl border border-slate-200 dark:border-slate-700 shadow-sm p-6">
        <div className="flex items-center justify-between mb-4">
          <h3 className="font-bold text-slate-900 dark:text-white flex items-center gap-2">
            <span className="w-8 h-8 rounded-lg bg-indigo-100 dark:bg-indigo-900/30 flex items-center justify-center">
              <Clock className="w-4 h-4 text-indigo-600 dark:text-indigo-400" />
            </span>
            Global Activity Logs
          </h3>
        </div>
        
        {loading ? (
          <div className="flex justify-center p-8"><RefreshCw className="w-6 h-6 animate-spin text-slate-400" /></div>
        ) : !analytics?.activityLogs?.length ? (
          <div className="text-center p-8 text-slate-500">No recent activity</div>
        ) : (
          <div className="space-y-4 relative before:absolute before:inset-0 before:ml-2 before:-translate-x-px md:before:mx-auto md:before:translate-x-0 before:h-full before:w-0.5 before:bg-gradient-to-b before:from-transparent before:via-slate-200 dark:before:via-slate-700 before:to-transparent">
            {analytics.activityLogs.map((log) => (
              <div key={log._id} className="relative flex items-center justify-between md:justify-normal md:odd:flex-row-reverse group is-active">
                <div className="flex items-center justify-center w-5 h-5 rounded-full border-2 border-white dark:border-slate-800 bg-slate-300 dark:bg-slate-600 text-slate-500 shrink-0 md:order-1 md:group-odd:-translate-x-1/2 md:group-even:translate-x-1/2 shadow"></div>
                <div className="w-[calc(100%-2rem)] md:w-[calc(50%-1.5rem)] p-3 rounded-xl border border-slate-200 dark:border-slate-700 bg-white dark:bg-slate-800 shadow-sm">
                  <div className="flex items-center justify-between mb-1">
                    <span className="text-xs font-semibold text-slate-500 dark:text-slate-400">
                      {new Date(log.createdAt).toLocaleString()}
                    </span>
                    <span className="text-[10px] uppercase font-bold text-slate-400 bg-slate-100 dark:bg-slate-700 px-2 py-0.5 rounded">
                      {log.action}
                    </span>
                  </div>
                  <div className="text-sm text-slate-700 dark:text-slate-300">
                    <span className="font-semibold">{log.userId?.firstName || 'User'}</span> {log.action === "register" ? "registered a new hospital" : log.action === "verify" ? "verified hospital" : log.action} <span className="font-semibold text-hospital-blue">{log.metadata?.hospitalName}</span>.
                  </div>
                </div>
              </div>
            ))}
          </div>
        )}
      </div>

      {/* Render the Modal directly on Dashboard */}
      <CreateHospitalModal 
        isOpen={showModal} 
        onClose={() => setShowModal(false)} 
        onSuccess={() => {
          loadData();
        }} 
      />
    </div>
  );
}
