import { useState, useEffect } from "react";
import { useSelector } from "react-redux";
import { Calendar, Clock, MapPin, Search, Plus, User, FileText, CheckCircle2, XCircle } from "lucide-react";
import { usePatient } from "../hook/usePatient";
import toast from "react-hot-toast";
import BookAppointmentModal from "../components/BookAppointmentModal";
import CancelAppointmentModal from "../components/CancelAppointmentModal";
import { useRealtime } from "../../../shared/hooks/useRealtime";

export default function PatientAppointments() {
  const { activeProfile } = useSelector((state) => state.patient);
  const { getAppointments, cancelAppointment, loading } = usePatient();
  const [appointments, setAppointments] = useState([]);
  const [isModalOpen, setIsModalOpen] = useState(false);
  const [appointmentToCancel, setAppointmentToCancel] = useState(null);

  const fetchAppointments = async () => {
    if (activeProfile?._id) {
      const data = await getAppointments(activeProfile._id);
      setAppointments(data);
    }
  };

  useEffect(() => {
    fetchAppointments();
    // eslint-disable-next-line react-hooks/exhaustive-deps
  }, [activeProfile?._id]);

  useRealtime("appointment", fetchAppointments);

  const handleCancelClick = (app) => {
    setAppointmentToCancel(app);
  };

  const getStatusBadge = (status) => {
    switch (status) {
      case 'scheduled':
        return <span className="px-2.5 py-1 bg-blue-100 text-blue-700 dark:bg-blue-900/30 dark:text-blue-400 rounded-full text-xs font-medium">Scheduled</span>;
      case 'completed':
        return <span className="px-2.5 py-1 bg-emerald-100 text-emerald-700 dark:bg-emerald-900/30 dark:text-emerald-400 rounded-full text-xs font-medium">Completed</span>;
      case 'cancelled':
      case 'no_show':
        return <span className="px-2.5 py-1 bg-red-100 text-red-700 dark:bg-red-900/30 dark:text-red-400 rounded-full text-xs font-medium">Cancelled</span>;
      default:
        return <span className="px-2.5 py-1 bg-slate-100 text-slate-700 dark:bg-slate-800 dark:text-slate-400 rounded-full text-xs font-medium">{status}</span>;
    }
  };

  return (
    <div className="max-w-6xl mx-auto space-y-6">
      {/* Header */}
      <div className="flex flex-col sm:flex-row sm:items-center justify-between gap-4">
        <div>
          <h1 className="text-2xl font-bold text-slate-900 dark:text-white">My Appointments</h1>
          <p className="text-sm text-slate-500 dark:text-slate-400 mt-1">Manage your upcoming and past appointments</p>
        </div>
        <button
          onClick={() => setIsModalOpen(true)}
          className="inline-flex items-center gap-2 bg-blue-600 hover:bg-blue-700 text-white px-5 py-2.5 rounded-xl text-sm font-semibold transition-all shadow-lg shadow-blue-600/20 cursor-pointer"
        >
          <Plus className="w-4 h-4" />
          Book Appointment
        </button>
      </div>

      {/* List */}
      <div className="bg-white dark:bg-slate-800 border border-slate-200 dark:border-slate-700 rounded-2xl shadow-sm overflow-hidden">
        {loading && appointments.length === 0 ? (
          <div className="flex justify-center py-20">
            <Clock className="w-8 h-8 text-slate-400 animate-spin" />
          </div>
        ) : appointments.length === 0 ? (
          <div className="text-center py-20">
            <Calendar className="w-16 h-16 text-slate-300 dark:text-slate-600 mx-auto mb-4" />
            <h3 className="text-lg font-bold text-slate-900 dark:text-white">No Appointments Found</h3>
            <p className="text-slate-500 dark:text-slate-400 mt-1">You haven't booked any appointments yet.</p>
          </div>
        ) : (
          <div className="divide-y divide-slate-100 dark:divide-slate-700">
            {appointments.map((app) => (
              <div key={app._id} className="p-6 flex flex-col sm:flex-row gap-6 items-start sm:items-center hover:bg-slate-50 dark:hover:bg-slate-900/50 transition-colors">
                
                {/* Date Box */}
                <div className="flex flex-col items-center justify-center w-20 h-20 rounded-2xl bg-blue-50 dark:bg-blue-900/20 border border-blue-100 dark:border-blue-900/50 flex-shrink-0">
                  <span className="text-sm font-semibold text-blue-600 dark:text-blue-400 uppercase">
                    {new Date(app.scheduledAt).toLocaleDateString("en-US", { month: "short" })}
                  </span>
                  <span className="text-2xl font-bold text-slate-900 dark:text-white">
                    {new Date(app.scheduledAt).toLocaleDateString("en-US", { day: "2-digit" })}
                  </span>
                </div>

                {/* Details */}
                <div className="flex-1 space-y-2">
                  <div className="flex items-start justify-between gap-4">
                    <div>
                      <h3 className="text-lg font-bold text-slate-900 dark:text-white">
                        Consultation with Dr. {app.doctorId?.firstName} {app.doctorId?.lastName}
                      </h3>
                      <p className="text-sm font-medium text-slate-600 dark:text-slate-300">
                        {app.departmentId?.name || "General"}
                      </p>
                    </div>
                    {getStatusBadge(app.status)}
                  </div>
                  
                  <div className="flex flex-wrap items-center gap-4 text-sm text-slate-500 dark:text-slate-400">
                    <div className="flex items-center gap-1.5">
                      <Clock className="w-4 h-4" />
                      {new Date(app.scheduledAt).toLocaleTimeString("en-US", { hour: "numeric", minute: "2-digit" })}
                    </div>
                    <div className="flex items-center gap-1.5">
                      <FileText className="w-4 h-4" />
                      {app.reason || "Routine Checkup"}
                    </div>
                    {app.status === 'cancelled' && app.cancelReason && (
                      <div className="flex items-center gap-1.5 text-red-600 dark:text-red-400 w-full sm:w-auto">
                        <XCircle className="w-4 h-4" />
                        <span className="font-medium">Cancelled: {app.cancelReason}</span>
                      </div>
                    )}
                  </div>
                </div>

                {/* Actions */}
                <div className="flex sm:flex-col gap-2 w-full sm:w-auto mt-4 sm:mt-0">
                  {app.status === 'scheduled' && (
                    <button
                      onClick={() => handleCancelClick(app)}
                      className="flex-1 sm:flex-none px-4 py-2 text-sm font-semibold text-red-600 dark:text-red-400 bg-red-50 dark:bg-red-900/20 hover:bg-red-100 dark:hover:bg-red-900/40 rounded-xl transition-colors cursor-pointer"
                    >
                      Cancel
                    </button>
                  )}
                </div>
              </div>
            ))}
          </div>
        )}
      </div>

      <BookAppointmentModal 
        isOpen={isModalOpen}
        onClose={() => setIsModalOpen(false)}
        onSuccess={fetchAppointments}
      />

      <CancelAppointmentModal
        isOpen={!!appointmentToCancel}
        onClose={() => setAppointmentToCancel(null)}
        appointment={appointmentToCancel}
        onSuccess={fetchAppointments}
      />
    </div>
  );
}
