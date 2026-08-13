import { useState, useEffect } from "react";
import { Users, Search, RefreshCw, AlertCircle, FileText } from "lucide-react";
import { useDoctorPatients } from "../hook/useDoctorPatients";
import PatientHistoryModal from "../components/PatientHistoryModal";
import Pagination from "../../../shared/components/Pagination";
import CardSkeleton from "../../../shared/components/CardSkeleton";

export default function DoctorPatients() {
  const [isRefreshing, setIsRefreshing] = useState(false);
  const [searchInput, setSearchInput] = useState("");
  const [searchQuery, setSearchQuery] = useState("");
  const [page, setPage] = useState(1);
  const [limit] = useState(12);

  // Debounce search input
  useEffect(() => {
    const timer = setTimeout(() => {
      setSearchQuery(searchInput);
      setPage(1); // Reset to first page on new search
    }, 500);
    return () => clearTimeout(timer);
  }, [searchInput]);

  const { patients, meta, loading, error, refreshPatients } = useDoctorPatients({
    page,
    limit,
    search: searchQuery,
  });

  const [historyModalOpen, setHistoryModalOpen] = useState(false);
  const [selectedPatientId, setSelectedPatientId] = useState(null);
  const [selectedPatientName, setSelectedPatientName] = useState("");

  const handleOpenHistory = (patient) => {
    setSelectedPatientId(patient._id);
    setSelectedPatientName(`${patient.firstName} ${patient.lastName}`);
    setHistoryModalOpen(true);
  };

  return (
    <div className="space-y-6 max-w-7xl mx-auto pb-10">
      {/* Header */}
      <div className="flex flex-col sm:flex-row sm:items-center justify-between gap-4">
        <div>
          <h2 className="text-xl font-bold text-slate-900 dark:text-white flex items-center gap-2">
            <Users className="w-6 h-6 text-indigo-500" />
            Patient Directory
          </h2>
          <p className="text-sm text-slate-500 dark:text-slate-400 mt-0.5">
            Search and view records of registered patients in your hospital.
          </p>
        </div>
        
        <div className="flex items-center gap-3 w-full sm:w-auto">
          <div className="relative w-full sm:w-64">
            <Search className="w-4 h-4 absolute left-3 top-1/2 -translate-y-1/2 text-slate-400" />
            <input 
              type="text"
              placeholder="Search by MRN, Name, Phone..."
              value={searchInput}
              onChange={(e) => setSearchInput(e.target.value)}
              className="w-full pl-9 pr-4 py-2 bg-white dark:bg-slate-800 border border-slate-200 dark:border-slate-700 rounded-xl text-sm focus:ring-2 focus:ring-indigo-500 outline-none"
            />
          </div>
          <button 
            onClick={async () => { setIsRefreshing(true); await refreshPatients(); setIsRefreshing(false); }}
            className="cursor-pointer p-2 text-slate-500 hover:text-indigo-600 bg-white dark:bg-slate-800 border border-slate-200 dark:border-slate-700 hover:bg-indigo-50 dark:hover:bg-slate-700 rounded-xl shadow-sm transition-colors"
            title="Refresh"
          >
            <RefreshCw className={`w-4 h-4 ${isRefreshing ? 'animate-spin' : ''}`} />
          </button>
        </div>
      </div>

      {/* Main Grid */}
      {((loading && patients.length === 0) || isRefreshing) ? (
        <CardSkeleton count={8} />
      ) : error && patients.length === 0 ? (
        <div className="flex flex-col items-center justify-center py-20 text-red-500 gap-2">
          <AlertCircle className="w-8 h-8" />
          <span className="font-medium">{error}</span>
        </div>
      ) : patients.length === 0 ? (
        <div className="bg-white dark:bg-slate-800 rounded-2xl border border-slate-200 dark:border-slate-700 shadow-sm flex flex-col items-center justify-center py-24 text-slate-400">
          <Users className="w-14 h-14 mb-4 text-slate-300 dark:text-slate-600" />
          <p className="font-medium text-slate-600 dark:text-slate-300">No patients found matching your search.</p>
        </div>
      ) : (
        <div className="bg-white dark:bg-slate-800 rounded-2xl border border-slate-200 dark:border-slate-700 shadow-sm overflow-hidden flex flex-col">
          <div className="p-5 grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 xl:grid-cols-4 gap-5">
            {patients.map((patient) => (
              <div key={patient._id} className="bg-white dark:bg-slate-800 rounded-2xl border border-slate-200 dark:border-slate-700 shadow-sm p-5 hover:shadow-md transition-shadow group flex flex-col">
                <div className="flex items-start gap-4 mb-4">
                  <div className="w-12 h-12 rounded-full bg-indigo-50 dark:bg-indigo-900/30 flex flex-shrink-0 items-center justify-center text-indigo-600 dark:text-indigo-400 font-bold text-lg">
                    {patient.firstName?.[0]}{patient.lastName?.[0]}
                  </div>
                  <div className="min-w-0">
                    <h3 className="font-bold text-slate-900 dark:text-white truncate">
                      {patient.firstName} {patient.lastName}
                    </h3>
                    <p className="text-xs font-mono text-slate-500 truncate">{patient.mrn}</p>
                  </div>
                </div>
                
                <div className="space-y-2 mb-5 flex-1">
                  <div className="flex items-center justify-between text-sm">
                    <span className="text-slate-500 dark:text-slate-400">Gender</span>
                    <span className="font-medium text-slate-900 dark:text-white capitalize">{patient.gender || "-"}</span>
                  </div>
                  <div className="flex items-center justify-between text-sm">
                    <span className="text-slate-500 dark:text-slate-400">Blood Group</span>
                    <span className="font-medium text-slate-900 dark:text-white">{patient.bloodGroup || "-"}</span>
                  </div>
                  <div className="flex items-center justify-between text-sm">
                    <span className="text-slate-500 dark:text-slate-400">Contact</span>
                    <span className="font-medium text-slate-900 dark:text-white truncate max-w-[120px]">{patient.phone || "-"}</span>
                  </div>
                </div>
                
                <div className="pt-4 border-t border-slate-100 dark:border-slate-700 mt-auto flex gap-2">
                  <button 
                    onClick={() => handleOpenHistory(patient)}
                    className="cursor-pointer flex-1 py-2 bg-indigo-50 hover:bg-indigo-100 dark:bg-indigo-900/30 dark:hover:bg-indigo-900/50 border border-indigo-100 dark:border-indigo-800 rounded-lg text-sm font-semibold text-indigo-700 dark:text-indigo-400 transition-colors flex items-center justify-center gap-1.5"
                  >
                    <FileText className="w-4 h-4" /> View History
                  </button>
                </div>
              </div>
            ))}
          </div>

          <Pagination meta={meta} onPageChange={(p) => setPage(p)} />
        </div>
      )}

      <PatientHistoryModal 
        isOpen={historyModalOpen}
        onClose={() => setHistoryModalOpen(false)}
        patientId={selectedPatientId}
        patientName={selectedPatientName}
      />
    </div>
  );
}
