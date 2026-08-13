import { useState } from "react";
import { BedDouble, Search, Plus } from "lucide-react";
import { useIPD } from "../hook/useIPD";
import BedCard from "../components/BedCard";
import AdmitModal from "../components/AdmitModal";
import DischargeModal from "../components/DischargeModal";

export default function BedManagement() {
  const {
    wards,
    loading,
    patients,
    doctors,
    admitting,
    dischargingBedId,
    admitPatient,
    dischargePatient
  } = useIPD();

  const [selectedWard, setSelectedWard] = useState("all");
  const [searchQuery, setSearchQuery] = useState("");
  
  const [isAdmitModalOpen, setIsAdmitModalOpen] = useState(false);
  const [dischargeModal, setDischargeModal] = useState({ isOpen: false, bedId: null, admissionId: null });

  const filteredWards = wards.filter(w => selectedWard === "all" || w._id === selectedWard);

  const handleDischargeClick = (bedId, admissionId) => {
    setDischargeModal({ isOpen: true, bedId, admissionId });
  };

  const confirmDischarge = async (bedId, admissionId) => {
    const success = await dischargePatient(bedId, admissionId);
    if (success) {
      setDischargeModal({ isOpen: false, bedId: null, admissionId: null });
    }
  };

  if (loading) return <div className="p-8 text-center">Loading wards...</div>;

  return (
    <div className="space-y-6">
      <div className="flex flex-col sm:flex-row justify-between items-start sm:items-center gap-4">
        <div>
          <h1 className="text-2xl font-bold text-slate-900 dark:text-white flex items-center gap-2">
            <BedDouble className="w-6 h-6 text-hospital-blue" /> Bed & Ward Management
          </h1>
          <p className="text-slate-500 dark:text-slate-400 text-sm mt-1">Manage hospital admissions and bed allocations in real-time.</p>
        </div>
        <button onClick={() => setIsAdmitModalOpen(true)} className="bg-hospital-blue text-white px-4 py-2 rounded-lg font-medium hover:bg-blue-700 transition flex items-center gap-2 cursor-pointer shadow-sm">
          <Plus className="w-4 h-4" /> Admit Patient
        </button>
      </div>

      {/* Filters */}
      <div className="flex flex-col sm:flex-row gap-4 bg-white dark:bg-slate-800 p-4 rounded-xl border border-slate-200 dark:border-slate-700">
        <select 
          className="bg-slate-50 dark:bg-slate-900 border border-slate-200 dark:border-slate-700 rounded-lg px-4 py-2 text-sm text-slate-700 dark:text-slate-300 w-full sm:w-48 outline-none focus:border-hospital-blue"
          value={selectedWard}
          onChange={(e) => setSelectedWard(e.target.value)}
        >
          <option value="all">All Wards</option>
          {wards.map(w => (
            <option key={w._id} value={w._id}>{w.name} ({w.type})</option>
          ))}
        </select>
        
        <div className="relative flex-1">
          <Search className="w-4 h-4 absolute left-3 top-2.5 text-slate-400" />
          <input 
            type="text"
            placeholder="Search beds or patients..."
            className="w-full bg-slate-50 dark:bg-slate-900 border border-slate-200 dark:border-slate-700 rounded-lg pl-10 pr-4 py-2 text-sm text-slate-700 dark:text-slate-300 outline-none focus:border-hospital-blue"
            value={searchQuery}
            onChange={(e) => setSearchQuery(e.target.value)}
          />
        </div>
      </div>

      {/* Wards Grid */}
      <div className="space-y-8">
        {filteredWards.map(ward => (
          <div key={ward._id} className="space-y-4">
            <div className="flex items-center gap-2">
              <h2 className="text-lg font-bold text-slate-800 dark:text-slate-100 uppercase tracking-wider">{ward.name}</h2>
              <span className="text-xs font-medium px-2 py-1 bg-slate-100 dark:bg-slate-700 text-slate-600 dark:text-slate-400 rounded-md">
                {ward.type} • {ward.beds.length} Beds
              </span>
            </div>
            
            <div className="grid grid-cols-2 md:grid-cols-3 xl:grid-cols-4 gap-4">
              {ward.beds.map(bed => (
                <BedCard 
                  key={bed._id}
                  bed={bed}
                  searchQuery={searchQuery}
                  onDischargeClick={handleDischargeClick}
                  dischargingBedId={dischargingBedId}
                />
              ))}
            </div>
          </div>
        ))}
        {wards.length === 0 && (
          <div className="text-center py-12 text-slate-500">No wards configured yet.</div>
        )}
      </div>

      <AdmitModal 
        isOpen={isAdmitModalOpen}
        onClose={() => setIsAdmitModalOpen(false)}
        patients={patients}
        doctors={doctors}
        wards={wards}
        admitPatient={admitPatient}
        admitting={admitting}
      />

      <DischargeModal 
        isOpen={dischargeModal.isOpen}
        onClose={() => setDischargeModal({ isOpen: false, bedId: null, admissionId: null })}
        bedId={dischargeModal.bedId}
        admissionId={dischargeModal.admissionId}
        confirmDischarge={confirmDischarge}
      />
    </div>
  );
}
