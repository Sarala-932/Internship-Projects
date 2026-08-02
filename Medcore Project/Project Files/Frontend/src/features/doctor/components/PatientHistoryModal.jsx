import { useState, useEffect } from "react";
import { X, RefreshCw, AlertCircle, Calendar, FileText, Pill, Activity, Stethoscope } from "lucide-react";
import doctorService from "../service/doctorService";

export default function PatientHistoryModal({ isOpen, onClose, patientId, patientName }) {
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState(null);
  const [historyData, setHistoryData] = useState([]); 
  const [expandedId, setExpandedId] = useState(null);

  useEffect(() => {
    if (isOpen && patientId) {
      fetchHistory();
    }
  }, [isOpen, patientId]);

  const fetchHistory = async () => {
    try {
      setLoading(true);
      setError(null);
      
      const [encountersRes, prescriptionsRes] = await Promise.all([
        doctorService.getEncountersByPatient(patientId),
        doctorService.getPrescriptionsByPatient(patientId)
      ]);

      const encounters = encountersRes.encounters || [];
      const prescriptions = prescriptionsRes.prescriptions || [];

      // Combine by encounterId
      const combined = encounters.map(enc => {
        const relatedRx = prescriptions.find(rx => 
          (rx.encounterId?._id || rx.encounterId) === enc._id
        );
        return {
          encounter: enc,
          prescription: relatedRx || null
        };
      });

      // Sort by date descending
      combined.sort((a, b) => new Date(b.encounter.createdAt) - new Date(a.encounter.createdAt));
      
      setHistoryData(combined);
      if (combined.length > 0) {
        setExpandedId(combined[0].encounter._id); 
      }
    } catch (err) {
      setError("Failed to load patient history.");
      console.error(err);
    } finally {
      setLoading(false);
    }
  };

  if (!isOpen) return null;

  return (
    <div className="fixed inset-0 z-50 flex items-center justify-center p-4 bg-slate-900/50 backdrop-blur-sm overflow-y-auto">
      <div className="bg-white dark:bg-slate-900 rounded-2xl shadow-xl w-full max-w-4xl border border-slate-200 dark:border-slate-800 flex flex-col max-h-[90vh]">
        
        {/* Header */}
        <div className="px-6 py-4 border-b border-slate-200 dark:border-slate-800 flex justify-between items-center bg-slate-50/50 dark:bg-slate-900/50 rounded-t-2xl shrink-0">
          <div>
            <h3 className="text-lg font-bold text-slate-900 dark:text-white flex items-center gap-2">
              <FileText className="w-5 h-5 text-indigo-500" />
              Patient History
            </h3>
            {patientName && <p className="text-sm text-slate-500 mt-0.5">{patientName}</p>}
          </div>
          <button 
            onClick={onClose}
            className="cursor-pointer p-2 text-slate-400 hover:text-slate-600 dark:hover:text-slate-200 hover:bg-slate-100 dark:hover:bg-slate-800 rounded-full transition-colors"
          >
            <X className="w-5 h-5" />
          </button>
        </div>

        {/* Content */}
        <div className="p-6 overflow-y-auto flex-1">
          {loading ? (
            <div className="flex items-center justify-center py-20">
              <RefreshCw className="w-8 h-8 text-indigo-500 animate-spin" />
            </div>
          ) : error ? (
            <div className="flex flex-col items-center justify-center py-20 text-red-500 gap-2">
              <AlertCircle className="w-8 h-8" />
              <span className="font-medium">{error}</span>
            </div>
          ) : historyData.length === 0 ? (
            <div className="text-center py-16 text-slate-400">
              <FileText className="w-12 h-12 mx-auto mb-4 opacity-50" />
              <p className="font-medium">No past encounters found for this patient.</p>
            </div>
          ) : (
            <div className="space-y-4">
              {historyData.map(({ encounter, prescription }) => (
                <div 
                  key={encounter._id} 
                  className={`border rounded-xl overflow-hidden transition-colors ${
                    expandedId === encounter._id 
                      ? 'border-indigo-300 dark:border-indigo-700 bg-indigo-50/30 dark:bg-indigo-900/10' 
                      : 'border-slate-200 dark:border-slate-700 hover:border-slate-300 dark:hover:border-slate-600'
                  }`}
                >
                  {/* Header / Summary */}
                  <div 
                    className="p-4 cursor-pointer flex items-center justify-between gap-4"
                    onClick={() => setExpandedId(expandedId === encounter._id ? null : encounter._id)}
                  >
                    <div className="flex items-center gap-4">
                      <div className="w-10 h-10 rounded-full bg-slate-100 dark:bg-slate-800 flex items-center justify-center shrink-0">
                        <Calendar className="w-5 h-5 text-slate-500" />
                      </div>
                      <div>
                        <p className="font-bold text-slate-900 dark:text-white">
                          {new Date(encounter.createdAt).toLocaleDateString()}
                        </p>
                        <p className="text-xs text-slate-500 font-medium">
                          Dr. {encounter.doctorId?.lastName || "Unknown"} • {encounter.diagnosis || "No Diagnosis"}
                        </p>
                      </div>
                    </div>
                    <div className="flex items-center gap-3">
                      {prescription && prescription.medicines?.length > 0 && (
                        <span className="flex items-center gap-1 text-xs font-medium bg-emerald-100 text-emerald-700 dark:bg-emerald-900/30 dark:text-emerald-400 px-2 py-1 rounded-full">
                          <Pill className="w-3.5 h-3.5" />
                          {prescription.medicines.length} Meds
                        </span>
                      )}
                      <span className={`px-2.5 py-1 rounded-full text-xs font-bold uppercase tracking-wider ${
                        encounter.status === 'signed' 
                          ? 'bg-blue-100 text-blue-700 dark:bg-blue-900/30 dark:text-blue-400'
                          : 'bg-slate-100 text-slate-700 dark:bg-slate-800 dark:text-slate-400'
                      }`}>
                        {encounter.status}
                      </span>
                    </div>
                  </div>

                  {/* Expanded Content */}
                  {expandedId === encounter._id && (
                    <div className="p-5 border-t border-slate-200 dark:border-slate-700 bg-white dark:bg-slate-900 grid grid-cols-1 md:grid-cols-2 gap-6">
                      
                      {/* Clinical Notes & Vitals */}
                      <div className="space-y-5">
                        <div>
                          <h4 className="flex items-center gap-2 font-bold text-slate-800 dark:text-slate-200 text-sm mb-2">
                            <Stethoscope className="w-4 h-4 text-indigo-500" /> Clinical Assessment
                          </h4>
                          <div className="bg-slate-50 dark:bg-slate-800/50 p-3 rounded-lg text-sm space-y-2">
                            <p><span className="text-slate-500">Chief Complaint:</span> <span className="font-medium dark:text-slate-300">{encounter.chiefComplaint || "-"}</span></p>
                            <p><span className="text-slate-500">Diagnosis:</span> <span className="font-medium dark:text-slate-300">{encounter.diagnosis || "-"}</span></p>
                            <p><span className="text-slate-500">Notes:</span> <span className="font-medium dark:text-slate-300">{encounter.clinicalNotes || "-"}</span></p>
                          </div>
                        </div>

                        {encounter.vitals && (
                          <div>
                            <h4 className="flex items-center gap-2 font-bold text-slate-800 dark:text-slate-200 text-sm mb-2">
                              <Activity className="w-4 h-4 text-red-500" /> Vitals
                            </h4>
                            <div className="grid grid-cols-2 gap-2 text-sm bg-slate-50 dark:bg-slate-800/50 p-3 rounded-lg">
                              <p><span className="text-slate-500">BP:</span> <span className="font-medium dark:text-slate-300">{encounter.vitals.bloodPressure || "-"}</span></p>
                              <p><span className="text-slate-500">Temp:</span> <span className="font-medium dark:text-slate-300">{encounter.vitals.temperature || "-"}</span></p>
                              <p><span className="text-slate-500">HR:</span> <span className="font-medium dark:text-slate-300">{encounter.vitals.heartRate || "-"}</span></p>
                              <p><span className="text-slate-500">Weight:</span> <span className="font-medium dark:text-slate-300">{encounter.vitals.weightKg ? `${encounter.vitals.weightKg} kg` : "-"}</span></p>
                            </div>
                          </div>
                        )}
                      </div>

                      {/* Prescription Details */}
                      <div>
                        <h4 className="flex items-center gap-2 font-bold text-slate-800 dark:text-slate-200 text-sm mb-2">
                          <Pill className="w-4 h-4 text-emerald-500" /> Prescribed Medicines
                        </h4>
                        {!prescription || !prescription.medicines || prescription.medicines.length === 0 ? (
                          <div className="bg-slate-50 dark:bg-slate-800/50 p-3 rounded-lg text-sm text-slate-500">
                            No medicines prescribed.
                          </div>
                        ) : (
                          <div className="space-y-2">
                            {prescription.medicines.map((med, idx) => (
                              <div key={idx} className="bg-slate-50 dark:bg-slate-800/50 p-3 rounded-lg border border-slate-100 dark:border-slate-700">
                                <p className="font-bold text-slate-800 dark:text-slate-200 text-sm">{med.name}</p>
                                <div className="flex flex-wrap gap-x-4 gap-y-1 mt-1 text-xs text-slate-500">
                                  <span>Dosage: <span className="font-medium text-slate-700 dark:text-slate-300">{med.dosage}</span></span>
                                  <span>Freq: <span className="font-medium text-slate-700 dark:text-slate-300">{med.frequency}</span></span>
                                  <span>Days: <span className="font-medium text-slate-700 dark:text-slate-300">{med.durationDays}</span></span>
                                </div>
                              </div>
                            ))}
                          </div>
                        )}
                      </div>

                    </div>
                  )}
                </div>
              ))}
            </div>
          )}
        </div>
      </div>
    </div>
  );
}
