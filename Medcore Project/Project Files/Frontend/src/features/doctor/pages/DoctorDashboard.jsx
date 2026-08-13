import { Users, Calendar, Activity, RefreshCw, AlertCircle, Clock } from "lucide-react";
import { useSelector } from "react-redux";
import { useNavigate } from "react-router";
import { useDoctorDashboard } from "../hook/useDoctorDashboard";
import { LineChart, Line, XAxis, YAxis, CartesianGrid, Tooltip, ResponsiveContainer } from "recharts";

export default function DoctorDashboard() {
  const { user } = useSelector((state) => state.auth);
  const navigate = useNavigate();
  const { stats: data, loading, refreshStats } = useDoctorDashboard();

  if (loading && !data) {
    return (
      <div className="space-y-8 max-w-7xl mx-auto animate-pulse">
        {/* Banner Skeleton */}
        <div className="h-32 bg-slate-200 dark:bg-slate-700 rounded-2xl w-full"></div>
        {/* Stats Skeleton */}
        <div className="grid grid-cols-1 sm:grid-cols-2 gap-5">
          <div className="h-24 bg-slate-100 dark:bg-slate-800 rounded-xl"></div>
          <div className="h-24 bg-slate-100 dark:bg-slate-800 rounded-xl"></div>
        </div>
        {/* Chart/Queue Skeleton */}
        <div className="h-96 bg-slate-100 dark:bg-slate-800 rounded-2xl"></div>
      </div>
    );
  }

  if (!data) return null;

  const stats = [
    { label: "Appointments Today", value: data.stats.appointmentsToday || "0", icon: Calendar, color: "text-blue-600 dark:text-blue-400", bg: "bg-blue-50 dark:bg-blue-900/30" },
    { label: "Total Patients Seen", value: data.stats.totalPatients || "0", icon: Users, color: "text-indigo-600 dark:text-indigo-400", bg: "bg-indigo-50 dark:bg-indigo-900/30" },
  ];

  const getStatusBadge = (status) => {
    switch (status) {
      case "scheduled":
        return <span className="px-2.5 py-1 rounded-full text-xs font-bold uppercase tracking-wider bg-amber-100 text-amber-700 dark:bg-amber-900/30 dark:text-amber-400">Scheduled</span>;
      case "checked_in":
        return <span className="px-2.5 py-1 rounded-full text-xs font-bold uppercase tracking-wider bg-blue-100 text-blue-700 dark:bg-blue-900/30 dark:text-blue-400">Checked In</span>;
      case "in_consultation":
        return <span className="px-2.5 py-1 rounded-full text-xs font-bold uppercase tracking-wider bg-purple-100 text-purple-700 dark:bg-purple-900/30 dark:text-purple-400">In Consult</span>;
      case "completed":
        return <span className="px-2.5 py-1 rounded-full text-xs font-bold uppercase tracking-wider bg-emerald-100 text-emerald-700 dark:bg-emerald-900/30 dark:text-emerald-400">Completed</span>;
      default:
        return <span className="px-2.5 py-1 rounded-full text-xs font-bold uppercase tracking-wider bg-slate-100 text-slate-700 dark:bg-slate-800 dark:text-slate-400">{status}</span>;
    }
  };

  return (
    <div className="space-y-8 max-w-7xl mx-auto">
      {/* Welcome Banner */}
      <div className="bg-gradient-to-r from-blue-600 to-indigo-700 rounded-2xl p-6 sm:p-8 flex flex-col sm:flex-row justify-between items-start sm:items-center gap-4">
        <div>
          <h2 className="text-2xl font-bold text-white mb-1">Good Morning, Dr. {user?.firstName}!</h2>
          <p className="text-blue-100 text-sm">You have {data.stats.appointmentsToday} appointments scheduled for today.</p>
        </div>
        <button 
          onClick={() => navigate('/doctor/appointments')}
          className="cursor-pointer bg-white/10 hover:bg-white/20 text-white px-4 py-2 rounded-lg text-sm font-medium transition-colors border border-white/20"
        >
          View Schedule
        </button>
      </div>

      {/* Stats */}
      <div className="grid grid-cols-1 sm:grid-cols-2 gap-5">
        {stats.map((stat, i) => (
          <div key={i} className="bg-white dark:bg-slate-800 rounded-xl p-5 border border-slate-200 dark:border-slate-700 shadow-sm flex items-center justify-between">
            <div>
              <p className="text-sm font-medium text-slate-500 dark:text-slate-400 mb-1">{stat.label}</p>
              <p className={`text-3xl font-bold ${stat.color}`}>{stat.value}</p>
            </div>
            <div className={`p-4 rounded-xl ${stat.bg}`}>
              <stat.icon className={`w-8 h-8 ${stat.color}`} />
            </div>
          </div>
        ))}
      </div>

      {/* Analytics Chart */}
      {data.charts?.appointments && data.charts.appointments.length > 0 && (
        <div className="bg-white dark:bg-slate-800 rounded-2xl border border-slate-200 dark:border-slate-700 shadow-sm p-6">
          <h3 className="font-bold text-slate-900 dark:text-white flex items-center gap-2 mb-6">
            <Activity className="w-5 h-5 text-indigo-500" />
            Appointments Trend (Last 7 Days)
          </h3>
          <div className="h-72 w-full">
            <ResponsiveContainer width="100%" height="100%">
              <LineChart data={data.charts.appointments}>
                <CartesianGrid strokeDasharray="3 3" vertical={false} stroke="#e2e8f0" />
                <XAxis dataKey="date" tickLine={false} axisLine={false} tick={{ fontSize: 12, fill: '#64748b' }} tickFormatter={(val) => new Date(val).toLocaleDateString(undefined, { weekday: 'short' })} />
                <YAxis tickLine={false} axisLine={false} tick={{ fontSize: 12, fill: '#64748b' }} allowDecimals={false} />
                <Tooltip 
                  contentStyle={{ borderRadius: '8px', border: 'none', boxShadow: '0 4px 6px -1px rgb(0 0 0 / 0.1)' }}
                  labelFormatter={(val) => new Date(val).toLocaleDateString()}
                />
                <Line type="monotone" dataKey="count" name="Appointments" stroke="#6366f1" strokeWidth={3} dot={{ r: 4, fill: '#6366f1', strokeWidth: 2, stroke: '#fff' }} activeDot={{ r: 6 }} />
              </LineChart>
            </ResponsiveContainer>
          </div>
        </div>
      )}

      {/* Today's Appointments */}
      <div className="bg-white dark:bg-slate-800 rounded-2xl border border-slate-200 dark:border-slate-700 shadow-sm overflow-hidden flex flex-col">
        <div className="px-6 py-5 border-b border-slate-200 dark:border-slate-700 flex justify-between items-center bg-slate-50/50 dark:bg-slate-900/50">
          <h3 className="font-bold text-slate-900 dark:text-white flex items-center gap-2">
            <Clock className="w-5 h-5 text-blue-500" />
            Today's Queue
          </h3>
          <button onClick={refreshStats} className="cursor-pointer text-slate-500 hover:text-blue-600 transition-colors" title="Refresh Dashboard">
            <RefreshCw className="w-4 h-4 " />
          </button>
        </div>
        
        {data.recentAppointments?.length === 0 ? (
          <div className="flex flex-col items-center justify-center py-16 text-slate-400">
            <Calendar className="w-12 h-12 mb-3 text-slate-300 dark:text-slate-600" />
            <p className="font-medium text-slate-600 dark:text-slate-300">No appointments scheduled for today.</p>
          </div>
        ) : (
          <div className="overflow-x-auto">
            <table className="w-full text-left text-sm">
              <thead className="bg-slate-50 dark:bg-slate-900/50 text-slate-500 dark:text-slate-400 text-xs uppercase border-b border-slate-200 dark:border-slate-700">
                <tr>
                  <th className="px-6 py-3.5 font-semibold">Time</th>
                  <th className="px-6 py-3.5 font-semibold">Patient</th>
                  <th className="px-6 py-3.5 font-semibold">Type</th>
                  <th className="px-6 py-3.5 font-semibold">Status</th>
                  <th className="px-6 py-3.5 font-semibold text-right">Action</th>
                </tr>
              </thead>
              <tbody className="divide-y divide-slate-100 dark:divide-slate-700/50">
                {data.recentAppointments?.map((apt) => (
                  <tr key={apt._id} className="hover:bg-slate-50/50 dark:hover:bg-slate-800/50 transition-colors">
                    <td className="px-6 py-4 whitespace-nowrap">
                      <p className="font-bold text-slate-900 dark:text-white">
                        {new Date(apt.scheduledAt).toLocaleTimeString([], { hour: '2-digit', minute: '2-digit' })}
                      </p>
                    </td>
                    <td className="px-6 py-4">
                      <p className="font-semibold text-slate-900 dark:text-white">
                        {apt.patientId?.firstName} {apt.patientId?.lastName}
                      </p>
                      <p className="text-xs text-slate-500">{apt.patientId?.mrn}</p>
                    </td>
                    <td className="px-6 py-4">
                      <span className="capitalize text-slate-600 dark:text-slate-300 font-medium">
                        {apt.type ? apt.type.replace('-', ' ') : 'N/A'}
                      </span>
                    </td>
                    <td className="px-6 py-4">
                      {getStatusBadge(apt.status)}
                    </td>
                    <td className="px-6 py-4 text-right">
                      <a href={`/doctor/appointments/${apt._id}`} className="cursor-pointer text-blue-600 hover:text-blue-700 dark:text-blue-400 font-semibold text-xs transition-colors px-3 py-1.5 bg-blue-50 dark:bg-blue-900/30 rounded-lg">
                        View Details
                      </a>
                    </td>
                  </tr>
                ))}
              </tbody>
            </table>
          </div>
        )}
      </div>
    </div>
  );
}
