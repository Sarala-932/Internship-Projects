import { Users, Activity, IndianRupee, UserCheck } from "lucide-react";

const stats = [
  { name: 'Total Patients', stat: '1,429', icon: Users, change: '+12%', changeType: 'increase' },
  { name: 'Today\'s Appointments', stat: '42', icon: Activity, change: '+5.4%', changeType: 'increase' },
  { name: 'Active Doctors', stat: '24', icon: UserCheck, change: '0%', changeType: 'neutral' },
  { name: 'Revenue (Today)', stat: '₹45,230', icon: IndianRupee, change: '+18%', changeType: 'increase' },
];

export default function Dashboard() {
  return (
    <div className="space-y-6">
      {/* Stats Cards */}
      <div className="grid grid-cols-1 gap-5 sm:grid-cols-2 lg:grid-cols-4">
        {stats.map((item) => (
          <div key={item.name} className="relative overflow-hidden rounded-xl bg-white p-6 shadow-sm border border-slate-200">
            <dt>
              <div className="absolute rounded-lg bg-hospital-light p-3">
                <item.icon className="h-6 w-6 text-hospital-blue" aria-hidden="true" />
              </div>
              <p className="ml-16 truncate text-sm font-medium text-slate-500">{item.name}</p>
            </dt>
            <dd className="ml-16 flex items-baseline pb-1">
              <p className="text-2xl font-semibold text-slate-900">{item.stat}</p>
              <p className={`ml-2 flex items-baseline text-sm font-semibold ${item.changeType === 'increase' ? 'text-green-600' : 'text-slate-500'}`}>
                {item.change}
              </p>
            </dd>
          </div>
        ))}
      </div>

      <div className="grid grid-cols-1 gap-6 lg:grid-cols-2">
        {/* Recent Appointments Placeholder */}
        <div className="bg-white dark:bg-slate-800 rounded-xl shadow-sm border border-slate-200 dark:border-slate-700 p-6">
          <div className="flex items-center justify-between mb-4">
            <h3 className="text-lg font-semibold text-slate-800 dark:text-white">Recent Appointments</h3>
            <button className="cursor-pointer text-sm text-hospital-blue hover:underline">View All</button>
          </div>
          <div className="overflow-x-auto">
            <table className="w-full text-left text-sm text-slate-600 dark:text-slate-300">
              <thead className="bg-slate-50 dark:bg-slate-900/50 text-slate-700 dark:text-slate-400 text-xs uppercase border-b border-slate-200 dark:border-slate-700">
                <tr>
                  <th className="px-4 py-3">Patient Name</th>
                  <th className="px-4 py-3">Doctor</th>
                  <th className="px-4 py-3">Status</th>
                </tr>
              </thead>
              <tbody className="divide-y divide-slate-100 dark:divide-slate-700">
                <tr className="hover:bg-slate-50 dark:hover:bg-slate-700/50">
                  <td className="px-4 py-3 font-medium text-slate-900 dark:text-white">Rahul Sharma</td>
                  <td className="px-4 py-3">Dr. Ananya</td>
                  <td className="px-4 py-3"><span className="px-2 py-1 bg-yellow-100 dark:bg-yellow-900/30 text-yellow-800 dark:text-yellow-400 rounded-full text-xs font-medium">Pending</span></td>
                </tr>
                <tr className="hover:bg-slate-50 dark:hover:bg-slate-700/50">
                  <td className="px-4 py-3 font-medium text-slate-900 dark:text-white">Priya Singh</td>
                  <td className="px-4 py-3">Dr. Mehta</td>
                  <td className="px-4 py-3"><span className="px-2 py-1 bg-green-100 dark:bg-green-900/30 text-green-800 dark:text-green-400 rounded-full text-xs font-medium">Completed</span></td>
                </tr>
                <tr className="hover:bg-slate-50 dark:hover:bg-slate-700/50">
                  <td className="px-4 py-3 font-medium text-slate-900 dark:text-white">Amit Patel</td>
                  <td className="px-4 py-3">Dr. Sharma</td>
                  <td className="px-4 py-3"><span className="px-2 py-1 bg-blue-100 dark:bg-blue-900/30 text-blue-800 dark:text-blue-400 rounded-full text-xs font-medium">In Consult</span></td>
                </tr>
              </tbody>
            </table>
          </div>
        </div>

        {/* Revenue Chart Placeholder */}
        <div className="bg-white dark:bg-slate-800 rounded-xl shadow-sm border border-slate-200 dark:border-slate-700 p-6 flex flex-col justify-center items-center text-slate-400 min-h-[300px]">
          <Activity className="w-12 h-12 mb-4 text-slate-300 dark:text-slate-600" />
          <p>Revenue Chart Area</p>
          <p className="text-sm">(We will add Recharts later)</p>
        </div>
      </div>
    </div>
  );
}
