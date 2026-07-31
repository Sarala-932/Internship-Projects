import { useState } from "react";
import { X, AlertCircle, Loader2 } from "lucide-react";
import toast from "react-hot-toast";
import { usePatient } from "../hook/usePatient";

export default function CancelAppointmentModal({ isOpen, onClose, appointment, onSuccess }) {
  const [reason, setReason] = useState("");
  const { cancelAppointment, loading } = usePatient();

  if (!isOpen || !appointment) return null;

  const handleCancel = async () => {
    if (!reason.trim()) {
      toast.error("Please provide a reason for cancellation");
      return;
    }

    const success = await cancelAppointment(appointment._id, reason);
    if (success) {
      if (onSuccess) onSuccess();
      onClose();
      setReason("");
    }
  };

  return (
    <div className="fixed inset-0 z-50 flex items-center justify-center p-4 bg-slate-900/50 backdrop-blur-sm">
      <div className="bg-white dark:bg-slate-800 rounded-2xl w-full max-w-md shadow-2xl overflow-hidden animate-in fade-in zoom-in-95 duration-200">
        
        {/* Header */}
        <div className="px-6 py-4 border-b border-slate-200 dark:border-slate-700 flex items-center justify-between bg-red-50 dark:bg-red-900/20">
          <div className="flex items-center gap-3">
            <div className="w-10 h-10 rounded-full bg-red-100 dark:bg-red-900/50 flex items-center justify-center text-red-600 dark:text-red-400">
              <AlertCircle className="w-5 h-5" />
            </div>
            <h2 className="text-lg font-bold text-slate-900 dark:text-white">Cancel Appointment</h2>
          </div>
          <button 
            onClick={onClose}
            className="p-2 hover:bg-red-100 dark:hover:bg-red-900/40 rounded-full transition-colors text-slate-500 dark:text-slate-400"
          >
            <X className="w-5 h-5" />
          </button>
        </div>

        {/* Content */}
        <div className="p-6 space-y-4">
          <p className="text-sm text-slate-600 dark:text-slate-300">
            You are about to cancel your appointment with <span className="font-semibold text-slate-900 dark:text-white">Dr. {appointment.doctorId?.lastName}</span> on <span className="font-semibold text-slate-900 dark:text-white">{new Date(appointment.scheduledAt).toLocaleDateString()}</span>.
          </p>

          <div className="space-y-2">
            <label className="text-sm font-medium text-slate-700 dark:text-slate-300">
              Reason for Cancellation <span className="text-red-500">*</span>
            </label>
            <textarea
              value={reason}
              onChange={(e) => setReason(e.target.value)}
              className="w-full px-4 py-3 rounded-xl border border-slate-300 dark:border-slate-600 bg-white dark:bg-slate-900 text-slate-900 dark:text-white focus:ring-2 focus:ring-red-500 focus:border-red-500 outline-none transition-all resize-none"
              rows="3"
              placeholder="Please let us know why you are cancelling..."
            />
          </div>
        </div>

        {/* Footer */}
        <div className="px-6 py-4 border-t border-slate-200 dark:border-slate-700 bg-slate-50 dark:bg-slate-800/50 flex justify-end gap-3">
          <button
            onClick={onClose}
            disabled={loading}
            className="px-5 py-2.5 text-sm font-medium text-slate-700 dark:text-slate-300 hover:bg-slate-200 dark:hover:bg-slate-700 rounded-xl transition-colors disabled:opacity-50"
          >
            Keep Appointment
          </button>
          <button
            onClick={handleCancel}
            disabled={loading || !reason.trim()}
            className="flex items-center gap-2 px-5 py-2.5 text-sm font-medium text-white bg-red-600 hover:bg-red-700 rounded-xl transition-colors disabled:opacity-50"
          >
            {loading ? (
              <>
                <Loader2 className="w-4 h-4 animate-spin" />
                Cancelling...
              </>
            ) : (
              "Yes, Cancel it"
            )}
          </button>
        </div>

      </div>
    </div>
  );
}
