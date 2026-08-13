import { Users, CheckCircle2 } from "lucide-react";

export default function BedCard({ bed, searchQuery, onDischargeClick, dischargingBedId }) {
  const isOccupied = bed.status === 'occupied';
  const patient = bed.currentAdmissionId?.patientId;

  // Search filter logic
  if (searchQuery && !bed.bedNumber.toLowerCase().includes(searchQuery.toLowerCase()) && 
      !(patient && `${patient.firstName} ${patient.lastName}`.toLowerCase().includes(searchQuery.toLowerCase()))) {
    return null;
  }

  const getStatusColor = (status) => {
    if (status === "available") return "bg-emerald-100 text-emerald-700 border-emerald-200 dark:bg-emerald-900/30 dark:text-emerald-400 dark:border-emerald-800";
    if (status === "occupied") return "bg-rose-100 text-rose-700 border-rose-200 dark:bg-rose-900/30 dark:text-rose-400 dark:border-rose-800";
    return "bg-amber-100 text-amber-700 border-amber-200 dark:bg-amber-900/30 dark:text-amber-400 dark:border-amber-800";
  };

  return (
    <div className={`p-4 rounded-xl border-2 transition-all hover:shadow-md ${getStatusColor(bed.status)}`}>
      <div className="flex justify-between items-start mb-3">
        <div className="font-bold text-lg">{bed.bedNumber}</div>
        {isOccupied ? (
          <span className="flex items-center gap-1 text-xs font-bold px-2 py-1 rounded bg-rose-200/50 dark:bg-rose-900/50">
            <Users className="w-3 h-3" /> Occupied
          </span>
        ) : (
          <span className="flex items-center gap-1 text-xs font-bold px-2 py-1 rounded bg-emerald-200/50 dark:bg-emerald-900/50">
            <CheckCircle2 className="w-3 h-3" /> Available
          </span>
        )}
      </div>
      
      {isOccupied && patient ? (
        <div className="space-y-3">
          <div>
            <p className="text-sm font-semibold truncate">{patient.firstName} {patient.lastName}</p>
            <p className="text-xs opacity-80">MRN: {patient.mrn}</p>
          </div>
          <button
            onClick={() => onDischargeClick(bed._id, bed.currentAdmissionId._id)}
            disabled={dischargingBedId === bed._id}
            className="w-full py-1.5 px-3 bg-white/50 dark:bg-slate-900/50 hover:bg-white dark:hover:bg-slate-900 text-rose-600 dark:text-rose-400 font-medium text-xs rounded-lg transition-colors border border-rose-200/50 dark:border-rose-800/50"
          >
            {dischargingBedId === bed._id ? "Discharging..." : "Discharge Patient"}
          </button>
        </div>
      ) : (
        <div className="space-y-1">
          <p className="text-sm font-medium opacity-70">Ready for admission</p>
          <p className="text-xs opacity-50">Cleaned & Sanitized</p>
        </div>
      )}
    </div>
  );
}
