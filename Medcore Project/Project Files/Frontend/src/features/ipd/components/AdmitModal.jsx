import { useState, useEffect } from "react";
import toast from "react-hot-toast";

export default function AdmitModal({ isOpen, onClose, patients, doctors, wards, admitPatient, admitting, initialData }) {
  const [admitForm, setAdmitForm] = useState({ patientId: "", wardId: "", bedId: "", attendingDoctorId: "", reasonForAdmission: "", requestId: "" });

  useEffect(() => {
    if (initialData && isOpen) {
      setAdmitForm(prev => ({
        ...prev,
        patientId: initialData.patientId?._id || initialData.patientId || "",
        attendingDoctorId: initialData.requestingDoctorId?._id || initialData.requestingDoctorId || "",
        reasonForAdmission: initialData.reasonForAdmission || "",
        requestId: initialData._id || ""
      }));
    }
  }, [initialData, isOpen]);

  if (!isOpen) return null;

  const handleAdmit = async () => {
    if (!admitForm.reasonForAdmission.trim()) {
      toast.error("Please provide a reason for admission.");
      return;
    }
    const success = await admitPatient(admitForm);
    if (success) {
      setAdmitForm({ patientId: "", wardId: "", bedId: "", attendingDoctorId: "", reasonForAdmission: "", requestId: "" });
      onClose();
    }
  };

  return (
    <div className="fixed inset-0 z-50 flex items-center justify-center p-4 bg-slate-900/50 backdrop-blur-sm">
      <div className="bg-white dark:bg-slate-800 rounded-2xl w-full max-w-md overflow-hidden shadow-2xl border border-slate-200 dark:border-slate-700">
        <div className="px-6 py-4 border-b border-slate-200 dark:border-slate-700 flex justify-between items-center bg-slate-50 dark:bg-slate-900/50">
          <h2 className="text-lg font-bold">Admit Patient</h2>
          <button onClick={onClose} className="text-slate-500 hover:text-slate-700 dark:hover:text-slate-300">×</button>
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
  );
}
