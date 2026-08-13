import { AlertCircle } from "lucide-react";

export default function DischargeModal({ isOpen, onClose, bedId, admissionId, confirmDischarge }) {
  if (!isOpen) return null;

  return (
    <div className="fixed inset-0 z-50 flex items-center justify-center p-4 bg-slate-900/50 backdrop-blur-sm">
      <div className="bg-white dark:bg-slate-800 rounded-2xl w-full max-w-sm overflow-hidden shadow-2xl border border-slate-200 dark:border-slate-700">
        <div className="p-6 text-center space-y-4">
          <div className="w-16 h-16 bg-rose-100 dark:bg-rose-900/30 text-rose-500 rounded-full flex items-center justify-center mx-auto">
            <AlertCircle className="w-8 h-8" />
          </div>
          <div>
            <h2 className="text-xl font-bold text-slate-900 dark:text-white mb-2">Discharge Patient?</h2>
            <p className="text-slate-500 dark:text-slate-400 text-sm">
              Are you sure you want to discharge this patient? The bed will become available and billing will be calculated immediately.
            </p>
          </div>
          <div className="flex items-center gap-3 pt-2">
            <button 
              className="flex-1 px-4 py-2 bg-slate-100 hover:bg-slate-200 dark:bg-slate-700 dark:hover:bg-slate-600 text-slate-700 dark:text-slate-200 rounded-lg font-medium transition"
              onClick={onClose}
            >
              Cancel
            </button>
            <button 
              className="flex-1 px-4 py-2 bg-rose-600 hover:bg-rose-700 text-white rounded-lg font-medium transition"
              onClick={() => confirmDischarge(bedId, admissionId)}
            >
              Confirm
            </button>
          </div>
        </div>
      </div>
    </div>
  );
}
