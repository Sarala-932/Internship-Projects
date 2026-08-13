import { useEffect, useState } from "react";
import { MessageSquare, RefreshCw, AlertCircle, CheckCircle, Clock, Search, FileText } from "lucide-react";
import { useSuperAdmin } from "../hook/useSuperAdmin";

export default function SuperAdminTickets() {
  const [tickets, setTickets] = useState([]);
  const { getTickets, updateTicketStatus, loading, error } = useSuperAdmin();
  const [statusFilter, setStatusFilter] = useState("");

  const fetchTickets = async () => {
    const data = await getTickets(statusFilter);
    if (data) setTickets(data.tickets || []);
  };

  useEffect(() => {
    fetchTickets();
  }, [statusFilter]);

  const handleUpdateStatus = async (id, newStatus) => {
    const success = await updateTicketStatus(id, newStatus);
    if (success) fetchTickets();
  };

  return (
    <div className="space-y-6 max-w-6xl mx-auto">
      {/* Header */}
      <div className="flex flex-col sm:flex-row sm:items-center justify-between gap-4">
        <div>
          <h2 className="text-xl font-bold text-slate-900 dark:text-white flex items-center gap-2">
            <MessageSquare className="w-6 h-6 text-amber-500" />
            Support Tickets
          </h2>
          <p className="text-sm text-slate-500 dark:text-slate-400 mt-0.5">
            Resolve issues reported by Hospital Administrators
          </p>
        </div>
        
        {/* Filters */}
        <div className="flex items-center gap-2 bg-white dark:bg-slate-800 p-1.5 rounded-xl border border-slate-200 dark:border-slate-700 shadow-sm">
          <select 
            value={statusFilter}
            onChange={(e) => setStatusFilter(e.target.value)}
            className="bg-transparent text-sm text-slate-700 dark:text-slate-300 font-medium py-1.5 pl-3 pr-8 border-none focus:ring-0 cursor-pointer outline-none"
          >
            <option value="">All Statuses</option>
            <option value="open">Open</option>
            <option value="in_progress">In Progress</option>
            <option value="resolved">Resolved</option>
          </select>
          
          <div className="w-px h-5 bg-slate-200 dark:bg-slate-700 mx-1"></div>
          
          <button 
            onClick={fetchTickets}
            className="p-1.5 text-slate-500 hover:text-amber-600 hover:bg-amber-50 dark:hover:bg-slate-700 rounded-lg transition-colors cursor-pointer"
            title="Refresh"
          >
            <RefreshCw className="w-4 h-4 " />
          </button>
        </div>
      </div>

      {/* List */}
      <div className="bg-white dark:bg-slate-800 rounded-2xl border border-slate-200 dark:border-slate-700 shadow-sm overflow-hidden flex flex-col">
        {loading && tickets.length === 0 ? (
          <div className="flex items-center justify-center py-20">
            <RefreshCw className="w-8 h-8 text-slate-400 animate-spin" />
          </div>
        ) : error ? (
          <div className="flex flex-col items-center justify-center py-20 text-red-500 gap-2">
            <AlertCircle className="w-8 h-8" />
            <span className="font-medium">{error}</span>
          </div>
        ) : tickets.length === 0 ? (
          <div className="flex flex-col items-center justify-center py-20 text-slate-400">
            <FileText className="w-14 h-14 mb-4 text-slate-300 dark:text-slate-600" />
            <p className="font-medium text-slate-600 dark:text-slate-300">No tickets found</p>
            <p className="text-sm mt-1">Looks like everything is running smoothly!</p>
          </div>
        ) : (
          <div className="divide-y divide-slate-100 dark:divide-slate-700/50">
            {tickets.map((ticket) => (
              <div key={ticket._id} className="p-6 hover:bg-slate-50/50 dark:hover:bg-slate-800/50 transition-colors">
                <div className="flex flex-col lg:flex-row lg:items-start justify-between gap-4">
                  <div className="space-y-2 flex-1">
                    <div className="flex items-center gap-2">
                      <span className={`inline-flex items-center gap-1.5 px-2.5 py-0.5 rounded-full text-[10px] font-bold uppercase tracking-wider ${
                        ticket.status === 'open' ? 'bg-red-100 text-red-700 dark:bg-red-900/30 dark:text-red-400' :
                        ticket.status === 'in_progress' ? 'bg-amber-100 text-amber-700 dark:bg-amber-900/30 dark:text-amber-400' :
                        'bg-emerald-100 text-emerald-700 dark:bg-emerald-900/30 dark:text-emerald-400'
                      }`}>
                        {ticket.status === 'open' ? <AlertCircle className="w-3 h-3" /> :
                         ticket.status === 'in_progress' ? <Clock className="w-3 h-3" /> :
                         <CheckCircle className="w-3 h-3" />}
                        {ticket.status.replace('_', ' ')}
                      </span>
                      
                      <span className={`inline-flex px-2 py-0.5 rounded text-[10px] font-bold uppercase tracking-wider border ${
                        ticket.priority === 'high' || ticket.priority === 'critical' 
                          ? 'border-red-200 text-red-600 dark:border-red-800 dark:text-red-400' 
                          : 'border-slate-200 text-slate-500 dark:border-slate-700'
                      }`}>
                        Priority: {ticket.priority}
                      </span>
                    </div>
                    
                    <div>
                      <h3 className="text-lg font-bold text-slate-900 dark:text-white">{ticket.title}</h3>
                      <p className="text-sm text-slate-600 dark:text-slate-300 mt-1 max-w-3xl whitespace-pre-wrap">
                        {ticket.description}
                      </p>
                    </div>
                    
                    <div className="flex items-center gap-4 text-xs text-slate-500 pt-2">
                      <span>Hospital: <span className="font-semibold text-slate-700 dark:text-slate-300">{ticket.hospitalId?.name || "Unknown"}</span></span>
                      <span>•</span>
                      <span>Reported by: <span className="font-semibold text-slate-700 dark:text-slate-300">{ticket.createdBy?.firstName} {ticket.createdBy?.lastName}</span></span>
                      <span>•</span>
                      <span>{new Date(ticket.createdAt).toLocaleString()}</span>
                    </div>
                  </div>
                  
                  <div className="flex items-center gap-2">
                    {ticket.status !== 'open' && (
                      <button 
                        onClick={() => handleUpdateStatus(ticket._id, 'open')}
                        className="px-3 py-1.5 text-xs font-semibold rounded-lg border border-slate-200 dark:border-slate-700 text-slate-600 dark:text-slate-300 hover:bg-slate-50 dark:hover:bg-slate-800 cursor-pointer"
                      >
                        Re-open
                      </button>
                    )}
                    {ticket.status !== 'in_progress' && ticket.status !== 'resolved' && (
                      <button 
                        onClick={() => handleUpdateStatus(ticket._id, 'in_progress')}
                        className="px-3 py-1.5 text-xs font-semibold rounded-lg bg-amber-50 text-amber-600 hover:bg-amber-100 dark:bg-amber-900/20 dark:hover:bg-amber-900/40 cursor-pointer"
                      >
                        Start Progress
                      </button>
                    )}
                    {ticket.status !== 'resolved' && (
                      <button 
                        onClick={() => handleUpdateStatus(ticket._id, 'resolved')}
                        className="px-3 py-1.5 text-xs font-semibold rounded-lg bg-emerald-50 text-emerald-600 hover:bg-emerald-100 dark:bg-emerald-900/20 dark:hover:bg-emerald-900/40 cursor-pointer"
                      >
                        Mark Resolved
                      </button>
                    )}
                  </div>
                </div>
              </div>
            ))}
          </div>
        )}
      </div>
    </div>
  );
}
