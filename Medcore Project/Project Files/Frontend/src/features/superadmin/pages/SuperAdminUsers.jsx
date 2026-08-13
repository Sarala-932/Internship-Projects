import { useEffect, useState } from "react";
import { Users, Search, RefreshCw, AlertCircle, ShieldAlert, CheckCircle, ShieldCheck, FileText } from "lucide-react";
import { useSuperAdmin } from "../hook/useSuperAdmin";

export default function SuperAdminUsers() {
  const [isRefreshing, setIsRefreshing] = useState(false);
  const [users, setUsers] = useState([]);
  const { getUsers, updateUserStatus, loading, error } = useSuperAdmin();
  const [searchTerm, setSearchTerm] = useState("");
  const [roleFilter, setRoleFilter] = useState("");

  const fetchUsers = async () => {
    const data = await getUsers();
    if (data) setUsers(data.users || []);
  };

  useEffect(() => {
    fetchUsers();
  }, []);

  const handleToggleStatus = async (id) => {
    const success = await updateUserStatus(id);
    if (success) fetchUsers();
  };

  const filteredUsers = users.filter(user => {
    const matchesSearch = 
      user.firstName?.toLowerCase().includes(searchTerm.toLowerCase()) ||
      user.lastName?.toLowerCase().includes(searchTerm.toLowerCase()) ||
      user.email?.toLowerCase().includes(searchTerm.toLowerCase());
      
    const matchesRole = roleFilter ? user.role === roleFilter : true;
    
    return matchesSearch && matchesRole;
  });

  return (
    <div className="space-y-6 max-w-7xl mx-auto">
      {/* Header */}
      <div className="flex flex-col sm:flex-row sm:items-center justify-between gap-4">
        <div>
          <h2 className="text-xl font-bold text-slate-900 dark:text-white flex items-center gap-2">
            <Users className="w-6 h-6 text-blue-500" />
            Users Directory
          </h2>
          <p className="text-sm text-slate-500 dark:text-slate-400 mt-0.5">
            Manage hospital staff and platform administrators
          </p>
        </div>
        
        {/* Filters */}
        <div className="flex items-center gap-2 bg-white dark:bg-slate-800 p-1.5 rounded-xl border border-slate-200 dark:border-slate-700 shadow-sm">
          <div className="relative flex items-center">
            <Search className="w-4 h-4 text-slate-400 absolute left-3" />
            <input 
              type="text"
              placeholder="Search users..."
              value={searchTerm}
              onChange={(e) => setSearchTerm(e.target.value)}
              className="bg-transparent text-sm text-slate-700 dark:text-slate-300 pl-9 pr-3 py-1.5 border-none focus:ring-0 outline-none w-48"
            />
          </div>
          
          <div className="w-px h-5 bg-slate-200 dark:bg-slate-700 mx-1"></div>
          
          <select 
            value={roleFilter}
            onChange={(e) => setRoleFilter(e.target.value)}
            className="bg-transparent text-sm text-slate-700 dark:text-slate-300 font-medium py-1.5 pl-2 pr-8 border-none focus:ring-0 cursor-pointer outline-none"
          >
            <option value="">All Roles</option>
            <option value="admin">Hospital Admin</option>
            <option value="doctor">Doctor</option>
            <option value="nurse">Nurse</option>
            <option value="receptionist">Receptionist</option>
            <option value="super_admin">Super Admin</option>
          </select>
          
          <div className="w-px h-5 bg-slate-200 dark:bg-slate-700 mx-1"></div>
          
          <button 
            onClick={async () => { setIsRefreshing(true); await fetchUsers(); setIsRefreshing(false); }}
            className="p-1.5 text-slate-500 hover:text-blue-600 hover:bg-blue-50 dark:hover:bg-slate-700 rounded-lg transition-colors cursor-pointer"
            title="Refresh"
          >
            <RefreshCw className={`w-4 h-4 ${isRefreshing ? 'animate-spin' : ''}`} />
          </button>
        </div>
      </div>

      {/* Table */}
      <div className="bg-white dark:bg-slate-800 rounded-2xl border border-slate-200 dark:border-slate-700 shadow-sm overflow-hidden flex flex-col">
        {((loading && users.length === 0) || isRefreshing) ? (
          <div className="flex items-center justify-center py-20">
            <RefreshCw className="w-8 h-8 text-slate-400 animate-spin" />
          </div>
        ) : error ? (
          <div className="flex flex-col items-center justify-center py-20 text-red-500 gap-2">
            <AlertCircle className="w-8 h-8" />
            <span className="font-medium">{error}</span>
            <button onClick={async () => { setIsRefreshing(true); await fetchUsers(); setIsRefreshing(false); }} className="mt-2 text-sm text-blue-600 hover:underline cursor-pointer">Try Again</button>
          </div>
        ) : filteredUsers.length === 0 ? (
          <div className="flex flex-col items-center justify-center py-20 text-slate-400">
            <FileText className="w-14 h-14 mb-4 text-slate-300 dark:text-slate-600" />
            <p className="font-medium text-slate-600 dark:text-slate-300">No users found</p>
          </div>
        ) : (
          <div className="overflow-x-auto">
            <table className="w-full text-left text-sm">
              <thead className="bg-slate-50 dark:bg-slate-900/50 text-slate-500 dark:text-slate-400 text-xs uppercase border-b border-slate-200 dark:border-slate-700">
                <tr>
                  <th className="px-6 py-3.5 font-semibold">Name & Email</th>
                  <th className="px-6 py-3.5 font-semibold">Role</th>
                  <th className="px-6 py-3.5 font-semibold">Hospital</th>
                  <th className="px-6 py-3.5 font-semibold">Status</th>
                  <th className="px-6 py-3.5 font-semibold text-right">Actions</th>
                </tr>
              </thead>
              <tbody className="divide-y divide-slate-100 dark:divide-slate-700/50">
                {filteredUsers.map((user) => (
                  <tr key={user._id} className="hover:bg-slate-50/50 dark:hover:bg-slate-800/50 transition-colors">
                    <td className="px-6 py-4">
                      <div className="flex items-center gap-3">
                        <div className="w-10 h-10 rounded-full bg-blue-100 dark:bg-blue-900/30 flex items-center justify-center text-sm font-bold text-blue-700 dark:text-blue-400">
                          {(user.firstName || "U")[0]}{(user.lastName || "")[0]}
                        </div>
                        <div>
                          <p className="font-medium text-slate-900 dark:text-slate-200">
                            {user.firstName} {user.lastName}
                          </p>
                          <p className="text-xs text-slate-500 dark:text-slate-400">{user.email}</p>
                        </div>
                      </div>
                    </td>
                    <td className="px-6 py-4">
                      <div className="flex items-center gap-1.5">
                        {user.role === 'super_admin' ? (
                          <ShieldCheck className="w-4 h-4 text-amber-500" />
                        ) : user.role === 'admin' ? (
                          <ShieldCheck className="w-4 h-4 text-indigo-500" />
                        ) : null}
                        <span className="capitalize font-medium text-slate-700 dark:text-slate-300">
                          {user.role.replace('_', ' ')}
                        </span>
                      </div>
                    </td>
                    <td className="px-6 py-4">
                      {user.role === "super_admin" ? (
                        <span className="text-xs font-semibold text-slate-400 bg-slate-100 dark:bg-slate-800 px-2 py-1 rounded">PLATFORM</span>
                      ) : (
                        <span className="text-sm text-hospital-blue dark:text-blue-400 font-medium">
                          {user.hospitalId?.name || "—"}
                        </span>
                      )}
                    </td>
                    <td className="px-6 py-4">
                      <span className={`inline-flex items-center gap-1.5 px-2.5 py-1 rounded-full text-xs font-semibold ${
                        user.isActive
                          ? "bg-emerald-100 dark:bg-emerald-900/30 text-emerald-700 dark:text-emerald-400"
                          : "bg-red-100 dark:bg-red-900/30 text-red-700 dark:text-red-400"
                      }`}>
                        {user.isActive ? <CheckCircle className="w-3 h-3" /> : <AlertCircle className="w-3 h-3" />}
                        {user.isActive ? "Active" : "Suspended"}
                      </span>
                    </td>
                    <td className="px-6 py-4 text-right">
                      {user.role !== "super_admin" && (
                        <button
                          onClick={() => handleToggleStatus(user._id)}
                          className={`inline-flex items-center gap-1.5 px-3 py-1.5 rounded-lg text-xs font-semibold transition-colors cursor-pointer ${
                            user.isActive 
                              ? "bg-red-50 hover:bg-red-100 text-red-600 dark:bg-red-900/20 dark:hover:bg-red-900/40 dark:text-red-400"
                              : "bg-emerald-50 hover:bg-emerald-100 text-emerald-600 dark:bg-emerald-900/20 dark:hover:bg-emerald-900/40 dark:text-emerald-400"
                          }`}
                        >
                          <ShieldAlert className="w-3.5 h-3.5" />
                          {user.isActive ? "Suspend" : "Activate"}
                        </button>
                      )}
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
