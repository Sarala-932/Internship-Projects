import { useState, useEffect } from "react";
import { BedDouble, Users, CheckCircle2, AlertCircle, Search, Plus } from "lucide-react";
import toast from "react-hot-toast";
import apiClient from "../../../shared/service/apiClient";

export default function BedManagement() {
  const [wards, setWards] = useState([]);
  const [loading, setLoading] = useState(true);
  const [selectedWard, setSelectedWard] = useState("all");
  const [searchQuery, setSearchQuery] = useState("");
  
  // Admit Modal State
  const [isAdmitModalOpen, setIsAdmitModalOpen] = useState(false);
  const [admitForm, setAdmitForm] = useState({ patientId: "", wardId: "", bedId: "", attendingDoctorId: "", reasonForAdmission: "" });
  const [admitting, setAdmitting] = useState(false);
  const [dischargingBedId, setDischargingBedId] = useState(null);
  
  // Discharge Modal State
  const [dischargeModal, setDischargeModal] = useState({ isOpen: false, bedId: null, admissionId: null });

  // Dropdown Lists
  const [patients, setPatients] = useState([]);
  const [doctors, setDoctors] = useState([]);

  useEffect(() => {
    fetchWards();
    fetchPatientsAndDoctors();
  }, []);

  const fetchWards = async () => {
    try {
      const { data } = await apiClient.get("/ipd/wards");
      setWards(data.wards || []);
    } catch (err) {
      console.error(err);
    } finally {
      setLoading(false);
    }
  };

  const fetchPatientsAndDoctors = async () => {
    try {
      const [patientsRes, doctorsRes] = await Promise.all([
        apiClient.get("/patients?limit=500"),
        apiClient.get("/users?role=doctor&limit=100")
      ]);
      setPatients(patientsRes.data.patients || []);
      setDoctors(doctorsRes.data.users || []);
    } catch (err) {
      console.error("Failed to fetch dropdown data", err);
    }
  };

  const handleAdmit = async () => {
    if (!admitForm.reasonForAdmission.trim()) {
      toast.error("Please provide a reason for admission.");
      return;
    }
    
    try {
      setAdmitting(true);
      await apiClient.post("/ipd/admit", admitForm);
      setIsAdmitModalOpen(false);
      setAdmitForm({ patientId: "", wardId: "", bedId: "", attendingDoctorId: "", reasonForAdmission: "" });
      toast.success("Patient admitted successfully!");
      fetchWards(); // refresh grid
    } catch (err) {
      toast.error(err.response?.data?.message || "Failed to admit patient");
    } finally {
      setAdmitting(false);
    }
  };

  const handleDischargeClick = (bedId, admissionId) => {
    setDischargeModal({ isOpen: true, bedId, admissionId });
  };

  const confirmDischarge = async () => {
    const { bedId, admissionId } = dischargeModal;
    if (!bedId || !admissionId) return;
    
    try {
      setDischargeModal({ isOpen: false, bedId: null, admissionId: null });
      setDischargingBedId(bedId);
      await apiClient.post(`/ipd/discharge/${admissionId}`, { dischargeSummary: "Discharged from Admin Portal" });
      toast.success("Patient discharged successfully!");
      fetchWards(); // refresh grid
    } catch (err) {
      toast.error(err.response?.data?.message || "Failed to discharge patient");
    } finally {
      setDischargingBedId(null);
    }
  };

  const getStatusColor = (status) => {
    if (status === "available") return "bg-emerald-100 text-emerald-700 border-emerald-200 dark:bg-emerald-900/30 dark:text-emerald-400 dark:border-emerald-800";
    if (status === "occupied") return "bg-rose-100 text-rose-700 border-rose-200 dark:bg-rose-900/30 dark:text-rose-400 dark:border-rose-800";
    return "bg-amber-100 text-amber-700 border-amber-200 dark:bg-amber-900/30 dark:text-amber-400 dark:border-amber-800";
  };

  const filteredWards = wards.filter(w => selectedWard === "all" || w._id === selectedWard);

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
              {ward.beds.map(bed => {
                const isOccupied = bed.status === 'occupied';
                const patient = bed.currentAdmissionId?.patientId;
                
                // Search filter logic
                if (searchQuery && !bed.bedNumber.toLowerCase().includes(searchQuery.toLowerCase()) && 
                    !(patient && `${patient.firstName} ${patient.lastName}`.toLowerCase().includes(searchQuery.toLowerCase()))) {
                  return null;
                }

                return (
                  <div key={bed._id} className={`p-4 rounded-xl border-2 transition-all cursor-pointer hover:shadow-md ${getStatusColor(bed.status)}`}>
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
                          onClick={() => handleDischargeClick(bed._id, bed.currentAdmissionId._id)}
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
              })}
            </div>
          </div>
        ))}
        {wards.length === 0 && (
          <div className="text-center py-12 text-slate-500">No wards configured yet.</div>
        )}
      </div>

      {/* Admit Modal */}
      {isAdmitModalOpen && (
        <div className="fixed inset-0 z-50 flex items-center justify-center p-4 bg-slate-900/50 backdrop-blur-sm">
          <div className="bg-white dark:bg-slate-800 rounded-2xl w-full max-w-md overflow-hidden shadow-2xl border border-slate-200 dark:border-slate-700">
            <div className="px-6 py-4 border-b border-slate-200 dark:border-slate-700 flex justify-between items-center bg-slate-50 dark:bg-slate-900/50">
              <h2 className="text-lg font-bold">Admit Patient</h2>
              <button onClick={() => setIsAdmitModalOpen(false)} className="text-slate-500 hover:text-slate-700 dark:hover:text-slate-300">×</button>
            </div>
            <div className="p-6 space-y-4">
              <div>
                <label className="block text-sm font-medium mb-1">Select Patient</label>
                <select 
                  value={admitForm.patientId} 
                  onChange={e => setAdmitForm({...admitForm, patientId: e.target.value})}
                  className="w-full bg-slate-50 dark:bg-slate-900 border border-slate-200 dark:border-slate-700 rounded-lg px-4 py-2"
                >
                  <option value="">Choose Patient</option>
                  {patients.map(p => (
                    <option key={p._id} value={p._id}>{p.firstName} {p.lastName} (MRN: {p.mrn})</option>
                  ))}
                </select>
              </div>
              <div className="grid grid-cols-2 gap-4">
                <div>
                  <label className="block text-sm font-medium mb-1">Select Ward</label>
                  <select 
                    value={admitForm.wardId}
                    onChange={e => setAdmitForm({...admitForm, wardId: e.target.value, bedId: ""})}
                    className="w-full bg-slate-50 dark:bg-slate-900 border border-slate-200 dark:border-slate-700 rounded-lg px-4 py-2"
                  >
                    <option value="">Choose Ward</option>
                    {wards.map(w => <option key={w._id} value={w._id}>{w.name}</option>)}
                  </select>
                </div>
                <div>
                  <label className="block text-sm font-medium mb-1">Select Bed</label>
                  <select 
                    value={admitForm.bedId}
                    onChange={e => setAdmitForm({...admitForm, bedId: e.target.value})}
                    className="w-full bg-slate-50 dark:bg-slate-900 border border-slate-200 dark:border-slate-700 rounded-lg px-4 py-2"
                  >
                    <option value="">Choose Bed</option>
                    {admitForm.wardId && wards.find(w => w._id === admitForm.wardId)?.beds
                        .filter(b => b.status === 'available')
                        .map(b => (
                          <option key={b._id} value={b._id}>{b.bedNumber}</option>
                        ))}
                  </select>
                </div>
              </div>
              <div>
                <label className="block text-sm font-medium mb-1">Attending Doctor</label>
                <select 
                  value={admitForm.attendingDoctorId}
                  onChange={e => setAdmitForm({...admitForm, attendingDoctorId: e.target.value})}
                  className="w-full bg-slate-50 dark:bg-slate-900 border border-slate-200 dark:border-slate-700 rounded-lg px-4 py-2"
                >
                  <option value="">Choose Doctor</option>
                  {doctors.map(d => (
                    <option key={d._id} value={d._id}>Dr. {d.firstName} {d.lastName}</option>
                  ))}
                </select>
              </div>
              <div>
                <label className="block text-sm font-medium mb-1">Reason for Admission</label>
                <textarea 
                  value={admitForm.reasonForAdmission}
                  onChange={e => setAdmitForm({...admitForm, reasonForAdmission: e.target.value})}
                  className="w-full bg-slate-50 dark:bg-slate-900 border border-slate-200 dark:border-slate-700 rounded-lg px-4 py-2" 
                  rows="3" 
                  placeholder="Symptoms, diagnosis, etc."
                ></textarea>
              </div>
              <button 
                className="w-full bg-hospital-blue text-white rounded-lg py-2 font-medium hover:bg-blue-700 transition disabled:opacity-50" 
                onClick={handleAdmit}
                disabled={admitting || !admitForm.patientId || !admitForm.bedId || !admitForm.attendingDoctorId}
              >
                {admitting ? "Admitting..." : "Confirm Admission"}
              </button>
            </div>
          </div>
        </div>
      )}

      {/* Discharge Confirm Modal */}
      {dischargeModal.isOpen && (
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
                  onClick={() => setDischargeModal({ isOpen: false, bedId: null, admissionId: null })}
                >
                  Cancel
                </button>
                <button 
                  className="flex-1 px-4 py-2 bg-rose-600 hover:bg-rose-700 text-white rounded-lg font-medium transition"
                  onClick={confirmDischarge}
                >
                  Confirm
                </button>
              </div>
            </div>
          </div>
        </div>
      )}
    </div>
  );
}
