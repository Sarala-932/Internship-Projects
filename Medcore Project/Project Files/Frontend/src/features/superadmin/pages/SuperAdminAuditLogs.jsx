import { useEffect, useState } from "react";
import { Clock, RefreshCw, AlertCircle, FileText, Filter } from "lucide-react";
import { useSuperAdmin } from "../hook/useSuperAdmin";

export default function SuperAdminAuditLogs() {
  const [logs, setLogs] = useState([]);
  const [page, setPage] = useState(1);
  const [totalPages, setTotalPages] = useState(1);
  const [actionFilter, setActionFilter] = useState("");
  const { getAuditLogs, loading, error } = useSuperAdmin();

  const fetchLogs = async (pageNum = 1) => {
    const data = await getAuditLogs(pageNum, 15, actionFilter);
    if (data) {
      setLogs(data.logs || []);
      setTotalPages(data.meta?.totalPages || 1);
      setPage(pageNum);
    }
  };

  useEffect(() => {
    fetchLogs(1);
  }, [actionFilter]); // refetch when filter changes

  const handleNextPage = () => {
    if (page < totalPages) fetchLogs(page + 1);
  };
  
  const handlePrevPage = () => {
    if (page > 1) fetchLogs(page - 1);
  };

  return (
    <div className="space-y-6 max-w-6xl mx-auto">
      {/* Header */}
      <div className="flex flex-col sm:flex-row sm:items-center justify-between gap-4">
        <div>
          <h2 className="text-xl font-bold text-slate-900 dark:text-white flex items-center gap-2">
            <Clock className="w-6 h-6 text-indigo-500" />
            Global Audit Logs
          </h2>
          <p className="text-sm text-slate-500 dark:text-slate-400 mt-0.5">
            Track system-wide activity, registrations, and administrative actions
          </p>
        </div>
        
        {/* Filters */}
        <div className="flex items-center gap-2 bg-white dark:bg-slate-800 p-1.5 rounded-xl border border-slate-200 dark:border-slate-700 shadow-sm">
          <Filter className="w-4 h-4 text-slate-400 ml-2" />
          <select 
            value={actionFilter}
            onChange={(e) => setActionFilter(e.target.value)}
            className="bg-transparent text-sm text-slate-700 dark:text-slate-300 font-medium py-1.5 pl-2 pr-8 border-none focus:ring-0 cursor-pointer outline-none"
          >
            <option value="">All Actions</option>
            <option value="register">Register</option>
            <option value="login">Login</option>
            <option value="verify">Verify</option>
            <option value="create_staff">Create Staff</option>
            <option value="update_profile">Update Profile</option>
          </select>
          
          <div className="w-px h-5 bg-slate-200 dark:bg-slate-700 mx-1"></div>
          
          <button 
            onClick={() => fetchLogs(page)}
            className="p-1.5 text-slate-500 hover:text-blue-600 hover:bg-blue-50 dark:hover:bg-slate-700 rounded-lg transition-colors cursor-pointer"
            title="Refresh"
          >
            <RefreshCw className="w-4 h-4 " />
          </button>
        </div>
      </div>

      {/* Table */}
      <div className="bg-white dark:bg-slate-800 rounded-2xl border border-slate-200 dark:border-slate-700 shadow-sm overflow-hidden flex flex-col">
        {loading && logs.length === 0 ? (
          <div className="flex items-center justify-center py-20">
            <RefreshCw className="w-8 h-8 text-slate-400 animate-spin" />
          </div>
        ) : error ? (
          <div className="flex flex-col items-center justify-center py-20 text-red-500 gap-2">
            <AlertCircle className="w-8 h-8" />
            <span className="font-medium">{error}</span>
            <button onClick={() => fetchLogs(page)} className="mt-2 text-sm text-blue-600 hover:underline cursor-pointer">Try Again</button>
          </div>
        ) : logs.length === 0 ? (
          <div className="flex flex-col items-center justify-center py-20 text-slate-400">
            <FileText className="w-14 h-14 mb-4 text-slate-300 dark:text-slate-600" />
            <p className="font-medium text-slate-600 dark:text-slate-300">No activity logs found</p>
            <p className="text-sm mt-1">Adjust filters or check back later</p>
          </div>
        ) : (
          <div className="overflow-x-auto">
            <table className="w-full text-left text-sm">
              <thead className="bg-slate-50 dark:bg-slate-900/50 text-slate-500 dark:text-slate-400 text-xs uppercase border-b border-slate-200 dark:border-slate-700">
                <tr>
                  <th className="px-6 py-3.5 font-semibold">Timestamp</th>
                  <th className="px-6 py-3.5 font-semibold">User</th>
                  <th className="px-6 py-3.5 font-semibold">Action</th>
                  <th className="px-6 py-3.5 font-semibold">Target / Details</th>
                  <th className="px-6 py-3.5 font-semibold">IP Address</th>
                </tr>
              </thead>
              <tbody className="divide-y divide-slate-100 dark:divide-slate-700/50">
                {logs.map((log) => (
                  <tr key={log._id} className="hover:bg-slate-50/50 dark:hover:bg-slate-800/50 transition-colors">
                    <td className="px-6 py-3 whitespace-nowrap text-slate-500 dark:text-slate-400 text-xs">
                      {new Date(log.createdAt).toLocaleString()}
                    </td>
                    <td className="px-6 py-3">
                      <div className="flex items-center gap-2">
                        <div className="w-6 h-6 rounded-full bg-blue-100 dark:bg-blue-900/30 flex items-center justify-center text-[10px] font-bold text-blue-700 dark:text-blue-400">
                          {(log.userId?.firstName || "U")[0]}
                        </div>
                        <div>
                          <p className="font-medium text-slate-900 dark:text-slate-200">
                            {log.userId ? `${log.userId.firstName} ${log.userId.lastName}` : "System"}
                          </p>
                          {log.userId?.role && (
                            <p className="text-[10px] text-slate-500 uppercase">{log.userId.role.replace('_', ' ')}</p>
                          )}
                        </div>
                      </div>
                    </td>
                    <td className="px-6 py-3">
                      <span className="inline-flex px-2 py-0.5 rounded text-[10px] font-bold uppercase tracking-wider bg-slate-100 dark:bg-slate-700 text-slate-600 dark:text-slate-300 border border-slate-200 dark:border-slate-600">
                        {log.action}
                      </span>
                    </td>
                    <td className="px-6 py-3">
                      <div className="text-xs text-slate-600 dark:text-slate-300 max-w-xs truncate">
                        {log.metadata?.hospitalName && (
                          <span className="font-semibold text-hospital-blue dark:text-blue-400 mr-1">
                            {log.metadata.hospitalName}
                          </span>
                        )}
                        {log.metadata?.email && `(${log.metadata.email})`}
                        {log.metadata?.role && `[${log.metadata.role}]`}
                        {/* Fallback to JSON if needed */}
                        {!log.metadata?.hospitalName && !log.metadata?.email && !log.metadata?.role && log.metadata && (
                           <span className="text-slate-400">{JSON.stringify(log.metadata)}</span>
                        )}
                      </div>
                    </td>
                    <td className="px-6 py-3 text-xs text-slate-500 font-mono">
                      {log.ipAddress || "—"}
                    </td>
                  </tr>
                ))}
              </tbody>
            </table>
          </div>
        )}
        
        {/* Pagination Footer */}
        {totalPages > 1 && (
          <div className="px-6 py-4 border-t border-slate-200 dark:border-slate-700 flex items-center justify-between bg-slate-50 dark:bg-slate-900/30">
            <p className="text-xs text-slate-500 dark:text-slate-400 font-medium">
              Page {page} of {totalPages}
            </p>
            <div className="flex gap-2">
              <button 
                onClick={handlePrevPage} 
                disabled={page === 1}
                className="px-3 py-1.5 text-xs font-semibold rounded-lg border border-slate-200 dark:border-slate-700 bg-white dark:bg-slate-800 text-slate-600 dark:text-slate-300 disabled:opacity-50 hover:bg-slate-50 dark:hover:bg-slate-700 transition-colors cursor-pointer"
              >
                Previous
              </button>
              <button 
                onClick={handleNextPage} 
                disabled={page === totalPages}
                className="px-3 py-1.5 text-xs font-semibold rounded-lg border border-slate-200 dark:border-slate-700 bg-white dark:bg-slate-800 text-slate-600 dark:text-slate-300 disabled:opacity-50 hover:bg-slate-50 dark:hover:bg-slate-700 transition-colors cursor-pointer"
              >
                Next
              </button>
            </div>
          </div>
        )}
      </div>
    </div>
  );
}
