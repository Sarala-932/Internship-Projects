import { useEffect } from "react";
import { Users, Activity, UserCheck, IndianRupee, Building2, TrendingUp, RefreshCw, Bed } from "lucide-react";
import { useSelector } from "react-redux";
import { useAdminDashboard } from "../hook/useAdminDashboard";
import { BarChart, Bar, LineChart, Line, XAxis, YAxis, CartesianGrid, Tooltip, ResponsiveContainer } from "recharts";

export default function AdminDashboard() {
  const { user } = useSelector((state) => state.auth);
  const { stats: data, loading, fetchDashboardStats } = useAdminDashboard();

  useEffect(() => {
    fetchDashboardStats();
  }, [fetchDashboardStats]);

  if (loading && !data) {
    return (
      <div className="space-y-8 animate-pulse">
        {/* Banner Skeleton */}
        <div className="h-32 bg-slate-200 dark:bg-slate-700 rounded-2xl w-full"></div>
        {/* Stats Skeleton */}
        <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-4 gap-5">
          <div className="h-24 bg-slate-100 dark:bg-slate-800 rounded-xl"></div>
          <div className="h-24 bg-slate-100 dark:bg-slate-800 rounded-xl"></div>
          <div className="h-24 bg-slate-100 dark:bg-slate-800 rounded-xl"></div>
          <div className="h-24 bg-slate-100 dark:bg-slate-800 rounded-xl"></div>
        </div>
        {/* Chart Skeleton */}
        <div className="grid grid-cols-1 lg:grid-cols-2 gap-6">
          <div className="h-80 bg-slate-100 dark:bg-slate-800 rounded-2xl"></div>
          <div className="h-80 bg-slate-100 dark:bg-slate-800 rounded-2xl"></div>
        </div>
      </div>
    );
  }

  if (!data) return null;

  const stats = [
    { label: "Total Staff", value: data.stats.totalStaff || "0", icon: UserCheck, color: "text-blue-600 dark:text-blue-400", bg: "bg-blue-50 dark:bg-blue-900/30" },
    { label: "Total Patients", value: data.stats.totalPatients || "0", icon: Users, color: "text-indigo-600 dark:text-indigo-400", bg: "bg-indigo-50 dark:bg-indigo-900/30" },
    { label: "Appointments Today", value: data.stats.appointmentsToday || "0", icon: Activity, color: "text-amber-600 dark:text-amber-400", bg: "bg-amber-50 dark:bg-amber-900/30" },
    { label: "Revenue (MTD)", value: `₹${(data.stats.revenueMTD || 0).toLocaleString('en-IN')}`, icon: IndianRupee, color: "text-emerald-600 dark:text-emerald-400", bg: "bg-emerald-50 dark:bg-emerald-900/30" },
  ];

  return (
    <div className="space-y-8">
      {/* Welcome Banner */}
      <div className="bg-gradient-to-r from-indigo-600 to-blue-700 rounded-2xl p-6">
        <div className="flex items-center gap-2 mb-1">
          <Building2 className="w-5 h-5 text-indigo-200" />
          <span className="text-indigo-200 text-sm font-medium">Admin Console</span>
        </div>
        <h2 className="text-2xl font-bold text-white">Welcome, {user?.firstName}!</h2>
        <p className="text-indigo-200 text-sm mt-1">Here's your hospital's overview for today.</p>
      </div>

      {/* Stats */}
      <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-4 gap-5">
        {stats.map((stat, i) => (
          <div key={i} className="bg-white dark:bg-slate-800 rounded-xl p-5 border border-slate-200 dark:border-slate-700 shadow-sm">
            <div className="flex items-center justify-between mb-3">
              <p className="text-sm font-medium text-slate-500 dark:text-slate-400">{stat.label}</p>
              <div className={`p-2 rounded-lg ${stat.bg}`}>
                <stat.icon className={`w-5 h-5 ${stat.color}`} />
              </div>
            </div>
            <p className={`text-3xl font-bold ${stat.color}`}>{stat.value}</p>
          </div>
        ))}
      </div>

      {/* Analytics Charts */}
      {data.charts && (
        <div className="grid grid-cols-1 lg:grid-cols-2 gap-6">
          {/* Revenue Chart */}
          <div className="bg-white dark:bg-slate-800 rounded-2xl border border-slate-200 dark:border-slate-700 shadow-sm p-6">
            <h3 className="font-bold text-slate-900 dark:text-white flex items-center gap-2 mb-6">
              <IndianRupee className="w-5 h-5 text-emerald-500" />
              Revenue Trend (Last 7 Days)
            </h3>
            <div className="h-64 w-full">
              <ResponsiveContainer width="100%" height="100%">
                <BarChart data={data.charts.revenue}>
                  <CartesianGrid strokeDasharray="3 3" vertical={false} stroke="#e2e8f0" />
                  <XAxis dataKey="date" tickLine={false} axisLine={false} tick={{ fontSize: 12, fill: '#64748b' }} tickFormatter={(val) => new Date(val).toLocaleDateString(undefined, { weekday: 'short' })} />
                  <YAxis tickLine={false} axisLine={false} tick={{ fontSize: 12, fill: '#64748b' }} tickFormatter={(val) => `₹${val}`} />
                  <Tooltip 
                    contentStyle={{ borderRadius: '8px', border: 'none', boxShadow: '0 4px 6px -1px rgb(0 0 0 / 0.1)' }}
                    labelFormatter={(val) => new Date(val).toLocaleDateString()}
                    formatter={(val) => [`₹${val}`, 'Revenue']}
                  />
                  <Bar dataKey="amount" fill="#10b981" radius={[4, 4, 0, 0]} barSize={32} />
                </BarChart>
              </ResponsiveContainer>
            </div>
          </div>

          {/* Patients Chart */}
          <div className="bg-white dark:bg-slate-800 rounded-2xl border border-slate-200 dark:border-slate-700 shadow-sm p-6">
            <h3 className="font-bold text-slate-900 dark:text-white flex items-center gap-2 mb-6">
              <Users className="w-5 h-5 text-indigo-500" />
              Patient Growth (Last 7 Days)
            </h3>
            <div className="h-64 w-full">
              <ResponsiveContainer width="100%" height="100%">
                <LineChart data={data.charts.patients}>
                  <CartesianGrid strokeDasharray="3 3" vertical={false} stroke="#e2e8f0" />
                  <XAxis dataKey="date" tickLine={false} axisLine={false} tick={{ fontSize: 12, fill: '#64748b' }} tickFormatter={(val) => new Date(val).toLocaleDateString(undefined, { weekday: 'short' })} />
                  <YAxis tickLine={false} axisLine={false} tick={{ fontSize: 12, fill: '#64748b' }} allowDecimals={false} />
                  <Tooltip 
                    contentStyle={{ borderRadius: '8px', border: 'none', boxShadow: '0 4px 6px -1px rgb(0 0 0 / 0.1)' }}
                    labelFormatter={(val) => new Date(val).toLocaleDateString()}
                  />
                  <Line type="monotone" dataKey="count" name="New Patients" stroke="#6366f1" strokeWidth={3} dot={{ r: 4, fill: '#6366f1', strokeWidth: 2, stroke: '#fff' }} activeDot={{ r: 6 }} />
                </LineChart>
              </ResponsiveContainer>
            </div>
          </div>
        </div>
      )}

      {/* Staff + Quick Actions */}
      <div className="grid grid-cols-1 lg:grid-cols-3 gap-6">
        {/* Staff Table */}
        <div className="lg:col-span-2 bg-white dark:bg-slate-800 rounded-2xl border border-slate-200 dark:border-slate-700 shadow-sm overflow-hidden">
          <div className="px-6 py-4 border-b border-slate-200 dark:border-slate-700 flex items-center justify-between">
            <h3 className="font-bold text-slate-900 dark:text-white">Staff Overview</h3>
            <a href="/admin/staff" className="text-sm text-hospital-blue dark:text-blue-400 hover:underline font-medium">Manage →</a>
          </div>
          <table className="w-full text-sm">
            <thead className="bg-slate-50 dark:bg-slate-900/50 text-slate-500 dark:text-slate-400 text-xs uppercase">
              <tr>
                <th className="px-6 py-3 text-left">Name</th>
                <th className="px-6 py-3 text-left">Role</th>
                <th className="px-6 py-3 text-left">Department</th>
                <th className="px-6 py-3 text-left">Status</th>
              </tr>
            </thead>
            <tbody className="divide-y divide-slate-100 dark:divide-slate-700">
              {data.recentStaff?.length > 0 ? (
                data.recentStaff.map((staff, i) => (
                  <tr key={staff._id || i} className="hover:bg-slate-50 dark:hover:bg-slate-700/50 transition-colors">
                    <td className="px-6 py-3 font-medium text-slate-900 dark:text-white">
                      {staff.firstName} {staff.lastName}
                    </td>
                    <td className="px-6 py-3 text-slate-600 dark:text-slate-300 capitalize">{staff.role.replace('_', ' ')}</td>
                    <td className="px-6 py-3 text-slate-600 dark:text-slate-300">{staff.departmentId?.name || "—"}</td>
                    <td className="px-6 py-3">
                      <span className={`px-2 py-1 rounded-full text-[10px] font-bold uppercase tracking-wider ${
                        staff.isActive 
                          ? "bg-emerald-100 dark:bg-emerald-900/30 text-emerald-700 dark:text-emerald-400"
                          : "bg-red-100 dark:bg-red-900/30 text-red-700 dark:text-red-400"
                      }`}>
                        {staff.isActive ? 'Active' : 'Suspended'}
                      </span>
                    </td>
                  </tr>
                ))
              ) : (
                <tr>
                  <td colSpan="4" className="px-6 py-8 text-center text-slate-500">
                    No staff added yet.
                  </td>
                </tr>
              )}
            </tbody>
          </table>
        </div>

        {/* Quick Actions */}
        <div className="bg-white dark:bg-slate-800 rounded-2xl border border-slate-200 dark:border-slate-700 shadow-sm p-6">
          <h3 className="font-bold text-slate-900 dark:text-white mb-4">Quick Actions</h3>
          <div className="space-y-3">
            {[
              { label: "Add New Doctor", href: "/admin/staff", icon: UserCheck, color: "text-blue-600 dark:text-blue-400 bg-blue-50 dark:bg-blue-900/20" },
              { label: "Add New Staff", href: "/admin/staff", icon: Users, color: "text-indigo-600 dark:text-indigo-400 bg-indigo-50 dark:bg-indigo-900/20" },
              { label: "Manage Beds & Wards", href: "/admin/ipd", icon: Bed, color: "text-purple-600 dark:text-purple-400 bg-purple-50 dark:bg-purple-900/20" },
              { label: "View Reports", href: "#", icon: TrendingUp, color: "text-emerald-600 dark:text-emerald-400 bg-emerald-50 dark:bg-emerald-900/20" },
            ].map((action, i) => (
              <a key={i} href={action.href} className="flex items-center gap-3 p-3 rounded-xl hover:bg-slate-50 dark:hover:bg-slate-700 transition-colors group">
                <div className={`w-9 h-9 rounded-lg flex items-center justify-center ${action.color}`}>
                  <action.icon className="w-5 h-5" />
                </div>
                <span className="text-sm font-medium text-slate-700 dark:text-slate-300 group-hover:text-slate-900 dark:group-hover:text-white">{action.label}</span>
              </a>
            ))}
          </div>
        </div>
      </div>
    </div>
  );
}
