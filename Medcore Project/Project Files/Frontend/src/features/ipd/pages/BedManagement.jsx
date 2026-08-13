import { useState, useEffect } from "react";
import { BedDouble, Search, Plus, Activity, Clock } from "lucide-react";
import { useIPD } from "../hook/useIPD";
import BedCard from "../components/BedCard";
import AdmitModal from "../components/AdmitModal";
import DischargeModal from "../components/DischargeModal";
import { useSocket } from "../../notification/hook/useSocket";

export default function BedManagement() {
  const {
    wards,
    loading,
    patients,
    doctors,
    pendingRequests,
    admitting,
    dischargingBedId,
    admitPatient,
    dischargePatient,
    refreshRequests,
    refreshWards
  } = useIPD();

  const [selectedWard, setSelectedWard] = useState("all");
  const [searchQuery, setSearchQuery] = useState("");
  
  const [isAdmitModalOpen, setIsAdmitModalOpen] = useState(false);
  const [selectedRequest, setSelectedRequest] = useState(null);
  const [dischargeModal, setDischargeModal] = useState({ isOpen: false, bedId: null, admissionId: null });

  // Listen for real-time updates for IPD requests
  useSocket("data_updated", (data) => {
    if (data.resource === "ipd_requests") {
      refreshRequests();
    }
  });

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

  const handleAssignBedClick = (req) => {
    setSelectedRequest(req);
    setIsAdmitModalOpen(true);
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
        <button onClick={() => { setSelectedRequest(null); setIsAdmitModalOpen(true); }} className="bg-hospital-blue text-white px-4 py-2 rounded-lg font-medium hover:bg-blue-700 transition flex items-center gap-2 cursor-pointer shadow-sm">
          <Plus className="w-4 h-4" /> Admit Patient
        </button>
      </div>

      {/* Pending Admission Requests */}
      {pendingRequests && pendingRequests.length > 0 && (
        <div className="bg-orange-50 dark:bg-orange-900/10 border border-orange-200 dark:border-orange-800/50 rounded-xl p-5 mb-6">
          <h2 className="text-lg font-bold text-orange-800 dark:text-orange-400 flex items-center gap-2 mb-4">
            <Activity className="w-5 h-5" /> Pending Admission Requests ({pendingRequests.length})
          </h2>
          <div className="grid grid-cols-1 lg:grid-cols-2 xl:grid-cols-3 gap-4">
            {pendingRequests.map(req => (
              <div key={req._id} className="bg-white dark:bg-slate-800 border border-orange-100 dark:border-orange-900/30 p-4 rounded-xl shadow-sm flex flex-col justify-between gap-4">
                <div>
                  <div className="flex justify-between items-start mb-2">
                    <h3 className="font-bold text-slate-900 dark:text-white">
                      {req.patientId?.firstName} {req.patientId?.lastName}
                    </h3>
                    <span className={`text-xs px-2 py-1 rounded-md font-bold uppercase ${
                      req.priority === 'Critical' ? 'bg-red-100 text-red-700' : 
                      req.priority === 'High' ? 'bg-orange-100 text-orange-700' : 
                      'bg-slate-100 text-slate-700'
                    }`}>
                      {req.priority}
                    </span>
                  </div>
                  <p className="text-sm text-slate-600 dark:text-slate-400 line-clamp-2 mb-2">
                    <span className="font-semibold text-slate-700 dark:text-slate-300">Reason:</span> {req.reasonForAdmission}
                  </p>
                  <p className="text-xs text-slate-500 flex items-center gap-1">
                    <Clock className="w-3 h-3" /> Requested by Dr. {req.requestingDoctorId?.firstName} {req.requestingDoctorId?.lastName} for <span className="font-bold text-slate-700 dark:text-slate-300 ml-1">{req.wardTypeRequested}</span>
                  </p>
                </div>
                <button 
                  onClick={() => handleAssignBedClick(req)}
                  className="w-full py-2 bg-orange-600 hover:bg-orange-700 text-white text-sm font-bold rounded-lg transition-colors cursor-pointer"
                >
                  Assign Bed
                </button>
              </div>
            ))}
          </div>
        </div>
      )}

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
        onClose={() => { setIsAdmitModalOpen(false); setSelectedRequest(null); }}
        patients={patients}
        doctors={doctors}
        wards={wards}
        admitPatient={admitPatient}
        admitting={admitting}
        initialData={selectedRequest}
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
