import { useState, useEffect } from "react";
import { Calendar, Plus, RefreshCw, AlertCircle, Clock, FileText, CheckCircle, Search, User, UserCheck } from "lucide-react";
import apiClient from "../../../shared/service/apiClient";
import toast from "react-hot-toast";
import TableSkeleton from "../../../shared/components/TableSkeleton";
import { useSelector, useDispatch } from "react-redux";
import { setAppointments } from "../state/adminSlice";
import ReceptionistAppointmentEntry from "../components/ReceptionistAppointmentEntry";
import { useRealtime } from "../../../shared/hooks/useRealtime";

export default function AdminAppointments() {
  const [isRefreshing, setIsRefreshing] = useState(false);
  const { user } = useSelector(state => state.auth);
  const dispatch = useDispatch();
  const { appointments } = useSelector(state => state.admin);
  const [patients, setPatients] = useState([]);
  const [doctors, setDoctors] = useState([]);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState(null);

  // Modal State
  const [showModal, setShowModal] = useState(false);
  const [selectedAppointment, setSelectedAppointment] = useState(null); // Added for Details Modal

  const fetchData = async () => {
    try {
      setLoading(true);
      setError(null);
      // Fetch appointments, patients (for dropdown), and doctors (for dropdown)
      const [apptsRes, patientsRes, usersRes] = await Promise.all([
        apiClient.get("/appointments"),
        apiClient.get("/patients"),
        apiClient.get("/users?role=doctor")
      ]);
      dispatch(setAppointments(apptsRes.data.appointments || []));
      setPatients(patientsRes.data.patients || []);
      setDoctors(usersRes.data.users || []);
    } catch (err) {
      setError("Failed to load appointments.");
      toast.error("Error loading data");
    } finally {
      setLoading(false);
    }
  };

  useEffect(() => {
    fetchData();
  }, []);

  useRealtime("appointment", fetchData);

  const handleStatusChange = async (id, newStatus) => {
    try {
      await apiClient.patch(`/appointments/${id}/status`, { status: newStatus });
      toast.success("Status updated");
      fetchData();
    } catch (err) {
      toast.error("Failed to update status");
    }
  };

  const getStatusColor = (status) => {
    switch(status) {
      case 'scheduled': return 'bg-blue-100 text-blue-700 dark:bg-blue-900/30 dark:text-blue-400';
      case 'checked_in': return 'bg-amber-100 text-amber-700 dark:bg-amber-900/30 dark:text-amber-400';
      case 'in_consultation': return 'bg-purple-100 text-purple-700 dark:bg-purple-900/30 dark:text-purple-400';
      case 'completed': return 'bg-emerald-100 text-emerald-700 dark:bg-emerald-900/30 dark:text-emerald-400';
      case 'cancelled': 
      case 'no_show': return 'bg-red-100 text-red-700 dark:bg-red-900/30 dark:text-red-400';
      default: return 'bg-slate-100 text-slate-700 dark:bg-slate-800 dark:text-slate-400';
    }
  };

  return (
    <div className="space-y-6 max-w-7xl mx-auto">
      {/* Header */}
      <div className="flex flex-col sm:flex-row sm:items-center justify-between gap-4">
        <div>
          <h2 className="text-xl font-bold text-slate-900 dark:text-white flex items-center gap-2">
            <Calendar className="w-6 h-6 text-indigo-500" />
            Appointments Engine
          </h2>
          <p className="text-sm text-slate-500 dark:text-slate-400 mt-0.5">
            Manage upcoming patient consultations and doctor schedules.
          </p>
        </div>
        
        <div className="flex items-center gap-3">
          <button 
            onClick={async () => { setIsRefreshing(true); await fetchData(); setIsRefreshing(false); }}
            className="p-2 text-slate-500 hover:text-indigo-600 bg-white dark:bg-slate-800 border border-slate-200 dark:border-slate-700 hover:bg-indigo-50 dark:hover:bg-slate-700 rounded-xl shadow-sm transition-colors cursor-pointer"
            title="Refresh"
          >
            <RefreshCw className={`w-4 h-4 ${isRefreshing ? 'animate-spin' : ''}`} />
          </button>
          <button 
            onClick={() => setShowModal(true)}
            className="flex items-center justify-center gap-2 bg-indigo-600 hover:bg-indigo-700 text-white px-4 py-2 w-full sm:w-auto rounded-xl text-sm font-semibold transition-all shadow-sm cursor-pointer"
          >
            <Plus className="w-4 h-4" />
            Book Appointment
          </button>
        </div>
      </div>

      {/* Appointments List */}
      <div className="bg-white dark:bg-slate-800 rounded-2xl border border-slate-200 dark:border-slate-700 shadow-sm overflow-hidden flex flex-col">
        {((loading && appointments.length === 0) || isRefreshing) ? (
          <TableSkeleton columns={6} rows={5} />
        ) : error && appointments.length === 0 ? (
          <div className="flex flex-col items-center justify-center py-20 text-red-500 gap-2">
            <AlertCircle className="w-8 h-8" />
            <span className="font-medium">{error}</span>
          </div>
        ) : appointments.length === 0 ? (
          <div className="flex flex-col items-center justify-center py-20 text-slate-400">
            <Calendar className="w-14 h-14 mb-4 text-slate-300 dark:text-slate-600" />
            <p className="font-medium text-slate-600 dark:text-slate-300">No upcoming appointments.</p>
            <button onClick={() => setShowModal(true)} className="mt-4 text-sm text-indigo-600 font-semibold hover:underline cursor-pointer">
              Book the first appointment
            </button>
          </div>
        ) : (
          <div className="overflow-x-auto">
            <table className="w-full text-left text-sm">
              <thead className="bg-slate-50 dark:bg-slate-900/50 text-slate-500 dark:text-slate-400 text-xs uppercase border-b border-slate-200 dark:border-slate-700">
                <tr>
                  <th className="px-6 py-3.5 font-semibold">Time & Date</th>
                  <th className="px-6 py-3.5 font-semibold">Patient</th>
                  <th className="px-6 py-3.5 font-semibold">Doctor</th>
                  <th className="px-6 py-3.5 font-semibold">Type</th>
                  <th className="px-6 py-3.5 font-semibold">Status</th>
                  <th className="px-6 py-3.5 font-semibold text-right">Actions</th>
                </tr>
              </thead>
              <tbody className="divide-y divide-slate-100 dark:divide-slate-700/50">
                {appointments.map((appt) => (
                  <tr key={appt._id} className="hover:bg-slate-50/50 dark:hover:bg-slate-800/50 transition-colors">
                    <td className="px-6 py-4">
                      <div className="flex items-center gap-2">
                        <Clock className="w-4 h-4 text-indigo-500" />
                        <div>
                          <p className="font-bold text-slate-900 dark:text-white">
                            {new Date(appt.scheduledAt).toLocaleTimeString([], {hour: '2-digit', minute:'2-digit'})}
                          </p>
                          <p className="text-xs text-slate-500 dark:text-slate-400">
                            {new Date(appt.scheduledAt).toLocaleDateString()}
                          </p>
                        </div>
                      </div>
                    </td>
                    <td className="px-6 py-4">
                      <p className="font-semibold text-slate-900 dark:text-slate-200">
                        {appt.patientId?.firstName} {appt.patientId?.lastName}
                      </p>
                      <p className="text-xs font-mono text-slate-500">{appt.patientId?.mrn}</p>
                    </td>
                    <td className="px-6 py-4">
                      <p className="font-medium text-slate-700 dark:text-slate-300">
                        Dr. {appt.doctorId?.firstName} {appt.doctorId?.lastName}
                      </p>
                      <p className="text-xs text-slate-500">{appt.departmentId?.name || "General"}</p>
                    </td>
                    <td className="px-6 py-4">
                      <span className="uppercase text-xs font-bold text-slate-500 dark:text-slate-400 tracking-wider">
                        {appt.type.replace('_', ' ')}
                      </span>
                    </td>
                    <td className="px-6 py-4">
                      <select 
                        value={appt.status}
                        onChange={(e) => handleStatusChange(appt._id, e.target.value)}
                        className={`text-xs font-bold px-2 py-1 rounded-lg uppercase tracking-wider outline-none cursor-pointer border border-transparent hover:border-slate-300 dark:hover:border-slate-600 transition-colors ${getStatusColor(appt.status)}`}
                      >
                        <option value="scheduled">Scheduled</option>
                        <option value="checked_in">Checked In</option>
                        <option value="in_consultation">In Consultation</option>
                        <option value="completed">Completed</option>
                        <option value="cancelled">Cancelled</option>
                        <option value="no_show">No Show</option>
                      </select>
                    </td>
                    <td className="px-6 py-4 text-right">
                      <button 
                        onClick={() => setSelectedAppointment(appt)}
                        className="text-indigo-600 hover:text-indigo-700 dark:text-indigo-400 dark:hover:text-indigo-300 font-semibold text-xs transition-colors cursor-pointer"
                      >
                        Details
                      </button>
                    </td>
                  </tr>
                ))}
              </tbody>
            </table>
          </div>
        )}
      </div>

      {/* Booking Modal */}
      {showModal && (
        <ReceptionistAppointmentEntry 
          onClose={() => setShowModal(false)}
          onSuccess={() => {
            setShowModal(false);
            fetchData();
          }}
        />
      )}

      {/* Appointment Details Modal */}
      {selectedAppointment && (
        <div className="fixed inset-0 z-50 flex items-center justify-center p-4 bg-slate-900/50 backdrop-blur-sm overflow-y-auto">
          <div className="bg-white dark:bg-slate-900 rounded-2xl shadow-xl w-full max-w-lg border border-slate-200 dark:border-slate-800 overflow-hidden my-8">
            <div className="px-6 py-4 border-b border-slate-200 dark:border-slate-800 flex justify-between items-center bg-slate-50/50 dark:bg-slate-900/50">
              <h3 className="text-lg font-bold text-slate-900 dark:text-white flex items-center gap-2">
                Appointment Details
              </h3>
              <button onClick={() => setSelectedAppointment(null)} className="text-slate-400 hover:text-slate-500 cursor-pointer">
                <AlertCircle className="w-5 h-5" />
              </button>
            </div>
            
            <div className="p-6">
              <div className="flex items-start gap-4 mb-6">
                <div className="w-14 h-14 rounded-2xl bg-indigo-100 dark:bg-indigo-900/30 flex items-center justify-center text-xl font-bold text-indigo-700 dark:text-indigo-400 mt-1">
                  {selectedAppointment.patientId?.firstName?.[0]}{selectedAppointment.patientId?.lastName?.[0]}
                </div>
                <div>
                  <h2 className="text-xl font-bold text-slate-900 dark:text-white">
                    {selectedAppointment.patientId?.firstName} {selectedAppointment.patientId?.lastName}
                  </h2>
                  <p className="text-sm font-mono text-indigo-600 font-semibold">{selectedAppointment.patientId?.mrn}</p>
                  <span className={`inline-block mt-2 px-2.5 py-0.5 rounded-full text-xs font-bold uppercase tracking-wider ${getStatusColor(selectedAppointment.status)}`}>
                    {selectedAppointment.status.replace('_', ' ')}
                  </span>
                </div>
              </div>

              <div className="grid grid-cols-2 gap-y-5 gap-x-6 text-sm mb-6">
                <div>
                  <p className="text-slate-500 dark:text-slate-400 mb-1 flex items-center gap-1.5"><UserCheck className="w-3.5 h-3.5" /> Doctor</p>
                  <p className="font-medium text-slate-900 dark:text-white">Dr. {selectedAppointment.doctorId?.firstName} {selectedAppointment.doctorId?.lastName}</p>
                  <p className="text-xs text-slate-500">{selectedAppointment.departmentId?.name || "General"}</p>
                </div>
                <div>
                  <p className="text-slate-500 dark:text-slate-400 mb-1 flex items-center gap-1.5"><Clock className="w-3.5 h-3.5" /> Schedule</p>
                  <p className="font-medium text-slate-900 dark:text-white">{new Date(selectedAppointment.scheduledAt).toLocaleDateString()}</p>
                  <p className="font-semibold text-indigo-600">{new Date(selectedAppointment.scheduledAt).toLocaleTimeString([], {hour: '2-digit', minute:'2-digit'})}</p>
                </div>
                <div>
                  <p className="text-slate-500 dark:text-slate-400 mb-1">Type</p>
                  <p className="font-medium text-slate-900 dark:text-white capitalize">{selectedAppointment.type.replace('_', ' ')}</p>
                </div>
                <div>
                  <p className="text-slate-500 dark:text-slate-400 mb-1">Duration</p>
                  <p className="font-medium text-slate-900 dark:text-white">{selectedAppointment.durationMin} mins</p>
                </div>
              </div>

              <div className="bg-slate-50 dark:bg-slate-800/50 p-4 rounded-xl border border-slate-100 dark:border-slate-800">
                <p className="text-slate-500 dark:text-slate-400 text-xs font-semibold uppercase tracking-wider mb-2 flex items-center gap-1.5"><FileText className="w-3.5 h-3.5" /> Reason for Visit</p>
                <p className="text-slate-700 dark:text-slate-300 text-sm">
                  {selectedAppointment.reason || "No reason provided at time of booking."}
                </p>
              </div>
            </div>
            
            <div className="px-6 py-4 border-t border-slate-200 dark:border-slate-800 bg-slate-50/50 dark:bg-slate-900/50 flex justify-between items-center">
              <p className="text-xs text-slate-500">Booked on {new Date(selectedAppointment.createdAt).toLocaleDateString()}</p>
              <button 
                onClick={() => setSelectedAppointment(null)}
                className="px-5 py-2 bg-slate-200 dark:bg-slate-700 hover:bg-slate-300 dark:hover:bg-slate-600 text-slate-800 dark:text-white text-sm font-medium rounded-xl transition-colors cursor-pointer"
              >
                Close
              </button>
            </div>
          </div>
        </div>
      )}
    </div>
  );
}
