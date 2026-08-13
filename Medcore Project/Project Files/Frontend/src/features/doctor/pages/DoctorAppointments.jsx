import { useState, useEffect } from "react";
import { Calendar, Search, RefreshCw, AlertCircle, CalendarDays, Clock, PlayCircle, CheckCircle2 } from "lucide-react";
import { useSelector } from "react-redux";
import { useNavigate } from "react-router";
import { useDoctorAppointments } from "../hook/useDoctorAppointments";
import { useRealtime } from "../../../shared/hooks/useRealtime";
import PatientHistoryModal from "../components/PatientHistoryModal";
import TableSkeleton from "../../../shared/components/TableSkeleton";

export default function DoctorAppointments() {
  const [isRefreshing, setIsRefreshing] = useState(false);
  const { user } = useSelector((state) => state.auth);
  const navigate = useNavigate();
  const [filterDate, setFilterDate] = useState(new Date().toISOString().split('T')[0]);
  
  const doctorId = user?._id || user?.id;
  const { appointments, loading, error, refreshAppointments, updateStatus } = useDoctorAppointments(doctorId, filterDate);

  useRealtime("appointment", refreshAppointments);

  const [historyModalOpen, setHistoryModalOpen] = useState(false);
  const [selectedPatientId, setSelectedPatientId] = useState(null);
  const [selectedPatientName, setSelectedPatientName] = useState("");

  const handleOpenHistory = (patient) => {
    setSelectedPatientId(patient._id);
    setSelectedPatientName(`${patient.firstName} ${patient.lastName}`);
    setHistoryModalOpen(true);
  };

  const handleStatusChange = async (id, newStatus) => {
    await updateStatus(id, newStatus);
  };

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
      case "cancelled":
      case "no_show":
        return <span className="px-2.5 py-1 rounded-full text-xs font-bold uppercase tracking-wider bg-red-100 text-red-700 dark:bg-red-900/30 dark:text-red-400">{status.replace('_', ' ')}</span>;
      default:
        return <span className="px-2.5 py-1 rounded-full text-xs font-bold uppercase tracking-wider bg-slate-100 text-slate-700 dark:bg-slate-800 dark:text-slate-400">{status}</span>;
    }
  };

  return (
    <div className="space-y-6 max-w-7xl mx-auto">
      {/* Header */}
      <div className="flex flex-col sm:flex-row sm:items-center justify-between gap-4">
        <div>
          <h2 className="text-xl font-bold text-slate-900 dark:text-white flex items-center gap-2">
            <Calendar className="w-6 h-6 text-blue-500" />
            My Appointments
          </h2>
          <p className="text-sm text-slate-500 dark:text-slate-400 mt-0.5">
            Manage your daily schedule and consultation sessions.
          </p>
        </div>
        
        <div className="flex items-center gap-3 w-full sm:w-auto">
          <input 
            type="date"
            value={filterDate}
            onChange={(e) => setFilterDate(e.target.value)}
            className="w-full sm:w-auto px-4 py-2 bg-white dark:bg-slate-800 border border-slate-200 dark:border-slate-700 rounded-xl text-sm focus:ring-2 focus:ring-blue-500 outline-none"
          />
          {filterDate && (
            <button
              onClick={() => setFilterDate('')}
              className="cursor-pointer text-sm font-medium text-slate-500 hover:text-slate-800 dark:hover:text-slate-200 transition-colors mr-2"
              title="Clear date filter to see all appointments"
            >
              Clear
            </button>
          )}
          <button 
            onClick={async () => { setIsRefreshing(true); await refreshAppointments(); setIsRefreshing(false); }}
            className="cursor-pointer p-2 text-slate-500 hover:text-blue-600 bg-white dark:bg-slate-800 border border-slate-200 dark:border-slate-700 hover:bg-blue-50 dark:hover:bg-slate-700 rounded-xl shadow-sm transition-colors"
            title="Refresh"
          >
            <RefreshCw className={`w-4 h-4 ${isRefreshing ? 'animate-spin' : ''}`} />
          </button>
        </div>
      </div>

      {/* Main List */}
      <div className="bg-white dark:bg-slate-800 rounded-2xl border border-slate-200 dark:border-slate-700 shadow-sm overflow-hidden flex flex-col">
        {((loading && appointments.length === 0) || isRefreshing) ? (
          <TableSkeleton />
        ) : error && appointments.length === 0 ? (
          <div className="flex flex-col items-center justify-center py-20 text-red-500 gap-2">
            <AlertCircle className="w-8 h-8" />
            <span className="font-medium">{error}</span>
          </div>
        ) : appointments.length === 0 ? (
          <div className="flex flex-col items-center justify-center py-20 text-slate-400">
            <CalendarDays className="w-14 h-14 mb-4 text-slate-300 dark:text-slate-600" />
            <p className="font-medium text-slate-600 dark:text-slate-300">
              {filterDate ? `No appointments found for ${filterDate}.` : 'No appointments found.'}
            </p>
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
                  <th className="px-6 py-3.5 font-semibold text-right">Actions</th>
                </tr>
              </thead>
              <tbody className="divide-y divide-slate-100 dark:divide-slate-700/50">
                {appointments.map((apt) => (
                  <tr key={apt._id} className="hover:bg-slate-50/50 dark:hover:bg-slate-800/50 transition-colors">
                    <td className="px-6 py-4">
                      <div className="flex items-center gap-2">
                        <Clock className="w-4 h-4 text-blue-500" />
                        <div>
                          <p className="font-bold text-slate-900 dark:text-white">
                            {new Date(apt.scheduledAt).toLocaleTimeString([], { hour: '2-digit', minute: '2-digit' })}
                          </p>
                          <p className="text-xs text-slate-500 dark:text-slate-400">{apt.durationMin} mins</p>
                        </div>
                      </div>
                    </td>
                    <td className="px-6 py-4">
                      <p className="font-semibold text-slate-900 dark:text-white">
                        {apt.patientId?.firstName} {apt.patientId?.lastName}
                      </p>
                      <p className="text-xs font-mono text-slate-500">{apt.patientId?.mrn}</p>
                      {apt.reason && <p className="text-xs text-slate-400 mt-1 line-clamp-1 italic">"{apt.reason}"</p>}
                    </td>
                    <td className="px-6 py-4">
                      <span className="capitalize text-slate-600 dark:text-slate-300 font-medium">
                        {apt.type.replace('-', ' ')}
                      </span>
                    </td>
                    <td className="px-6 py-4">
                      {getStatusBadge(apt.status)}
                    </td>
                    <td className="px-6 py-4 text-right">
                      {apt.status === "scheduled" || apt.status === "checked_in" ? (
                        <button 
                          onClick={() => handleStatusChange(apt._id, "in_consultation")}
                          className="cursor-pointer flex items-center justify-end gap-1.5 w-full text-blue-600 hover:text-blue-700 dark:text-blue-400 font-semibold text-xs transition-colors"
                        >
                          <PlayCircle className="w-4 h-4" /> Start Consult
                        </button>
                      ) : apt.status === "in_consultation" ? (
                        <button 
                          onClick={() => navigate(`/doctor/appointments/${apt._id}`)}
                          className="cursor-pointer flex items-center justify-end gap-1.5 w-full text-purple-600 hover:text-purple-700 dark:text-purple-400 font-semibold text-xs transition-colors"
                        >
                          Open Encounter
                        </button>
                      ) : apt.status === "completed" ? (
                        <div className="flex flex-col items-end gap-2">
                          <button 
                            onClick={() => navigate(`/doctor/appointments/${apt._id}`)}
                            className="cursor-pointer text-slate-500 hover:text-slate-700 dark:text-slate-400 dark:hover:text-slate-200 font-medium text-xs transition-colors"
                          >
                            View Encounter
                          </button>
                          <button 
                            onClick={() => handleOpenHistory(apt.patientId)}
                            className="cursor-pointer text-indigo-500 hover:text-indigo-700 dark:text-indigo-400 font-medium text-xs transition-colors flex items-center gap-1"
                          >
                            <CalendarDays className="w-3.5 h-3.5" /> History
                          </button>
                        </div>
                      ) : null}
                    </td>
                  </tr>
                ))}
              </tbody>
            </table>
          </div>
        )}
      </div>

      <PatientHistoryModal 
        isOpen={historyModalOpen}
        onClose={() => setHistoryModalOpen(false)}
        patientId={selectedPatientId}
        patientName={selectedPatientName}
      />
    </div>
  );
}
