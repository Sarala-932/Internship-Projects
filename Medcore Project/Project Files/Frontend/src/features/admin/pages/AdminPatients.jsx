import { useState, useEffect } from "react";
import { Activity, Plus, RefreshCw, AlertCircle, Search, User, Phone, Mail, Calendar, Droplet, CheckCircle } from "lucide-react";
import { useAdminPatients } from "../hook/useAdminPatients";
import TableSkeleton from "../../../shared/components/TableSkeleton";

export default function AdminPatients() {
  const [search, setSearch] = useState("");
  const { patients, loading, error, fetchPatients, registerPatient } = useAdminPatients();

  // Modal State
  const [showModal, setShowModal] = useState(false);
  const [selectedPatient, setSelectedPatient] = useState(null); // Added for View Profile
  const [submitting, setSubmitting] = useState(false);
  const [formData, setFormData] = useState({
    firstName: "",
    lastName: "",
    email: "",
    phone: "",
    dob: "",
    gender: "male",
    bloodGroup: "unknown"
  });

  // Debounced search effect
  useEffect(() => {
    const timer = setTimeout(() => {
      fetchPatients(search);
    }, 500); // 500ms debounce
    return () => clearTimeout(timer);
  }, [search, fetchPatients]);

  const handleRegister = async (e) => {
    e.preventDefault();
    try {
      setSubmitting(true);
      const success = await registerPatient(formData);
      if (success) {
        setShowModal(false);
        setFormData({
          firstName: "", lastName: "", email: "", phone: "", dob: "", gender: "male", bloodGroup: "unknown"
        });
      }
    } finally {
      setSubmitting(false);
    }
  };

  return (
    <div className="space-y-6 max-w-7xl mx-auto">
      {/* Header & Controls */}
      <div className="flex flex-col sm:flex-row sm:items-center justify-between gap-4">
        <div>
          <h2 className="text-xl font-bold text-slate-900 dark:text-white flex items-center gap-2">
            <Activity className="w-6 h-6 text-emerald-500" />
            Patients Directory
          </h2>
          <p className="text-sm text-slate-500 dark:text-slate-400 mt-0.5">
            Manage hospital patients, EMR, and admission details.
          </p>
        </div>
        
        <div className="flex flex-col sm:flex-row items-center gap-3 w-full sm:w-auto">
          <div className="relative w-full sm:w-64">
            <Search className="w-4 h-4 text-slate-400 absolute left-3 top-1/2 -translate-y-1/2" />
            <input 
              type="text" 
              placeholder="Search by name, MRN, phone..." 
              value={search}
              onChange={e => setSearch(e.target.value)}
              className="w-full pl-9 pr-4 py-2 bg-white dark:bg-slate-800 border border-slate-200 dark:border-slate-700 rounded-xl text-sm focus:ring-2 focus:ring-emerald-500 outline-none"
            />
          </div>
          <button 
            onClick={() => fetchPatients(search)}
            className="p-2 text-slate-500 hover:text-emerald-600 bg-white dark:bg-slate-800 border border-slate-200 dark:border-slate-700 hover:bg-emerald-50 dark:hover:bg-slate-700 rounded-xl shadow-sm transition-colors"
            title="Refresh"
          >
            <RefreshCw className={`w-4 h-4 ${loading ? 'animate-spin' : ''}`} />
          </button>
          <button 
            onClick={() => setShowModal(true)}
            className="flex items-center justify-center gap-2 bg-emerald-600 hover:bg-emerald-700 text-white px-4 py-2 w-full sm:w-auto rounded-xl text-sm font-semibold transition-all shadow-sm"
          >
            <Plus className="w-4 h-4" />
            Register Patient
          </button>
        </div>
      </div>

      {/* Patients Table */}
      <div className="bg-white dark:bg-slate-800 rounded-2xl border border-slate-200 dark:border-slate-700 shadow-sm overflow-hidden flex flex-col">
        {loading && patients.length === 0 ? (
          <TableSkeleton columns={5} rows={5} />
        ) : error && patients.length === 0 ? (
          <div className="flex flex-col items-center justify-center py-20 text-red-500 gap-2">
            <AlertCircle className="w-8 h-8" />
            <span className="font-medium">{error}</span>
          </div>
        ) : patients.length === 0 ? (
          <div className="flex flex-col items-center justify-center py-20 text-slate-400">
            <Activity className="w-14 h-14 mb-4 text-slate-300 dark:text-slate-600" />
            <p className="font-medium text-slate-600 dark:text-slate-300">
              {search ? "No patients found matching your search." : "No patients registered yet."}
            </p>
            {!search && (
              <button onClick={() => setShowModal(true)} className="mt-4 text-sm text-emerald-600 font-semibold hover:underline">
                Register your first patient
              </button>
            )}
          </div>
        ) : (
          <div className="overflow-x-auto">
            <table className="w-full text-left text-sm">
              <thead className="bg-slate-50 dark:bg-slate-900/50 text-slate-500 dark:text-slate-400 text-xs uppercase border-b border-slate-200 dark:border-slate-700">
                <tr>
                  <th className="px-6 py-3.5 font-semibold">MRN & Name</th>
                  <th className="px-6 py-3.5 font-semibold">Contact Info</th>
                  <th className="px-6 py-3.5 font-semibold">Demographics</th>
                  <th className="px-6 py-3.5 font-semibold">Registered</th>
                  <th className="px-6 py-3.5 font-semibold text-right">Actions</th>
                </tr>
              </thead>
              <tbody className="divide-y divide-slate-100 dark:divide-slate-700/50">
                {patients.map((patient) => (
                  <tr key={patient._id} className="hover:bg-slate-50/50 dark:hover:bg-slate-800/50 transition-colors">
                    <td className="px-6 py-4">
                      <div className="flex items-center gap-3">
                        <div className="w-10 h-10 rounded-full bg-emerald-100 dark:bg-emerald-900/30 flex items-center justify-center text-sm font-bold text-emerald-700 dark:text-emerald-400">
                          {patient.firstName[0]}{patient.lastName[0]}
                        </div>
                        <div>
                          <p className="font-bold text-slate-900 dark:text-slate-200 flex items-center gap-1.5">
                            {patient.firstName} {patient.lastName}
                          </p>
                          <p className="text-xs font-mono font-semibold text-emerald-600 dark:text-emerald-400 mt-0.5">{patient.mrn}</p>
                        </div>
                      </div>
                    </td>
                    <td className="px-6 py-4">
                      <div className="space-y-1">
                        <div className="flex items-center gap-1.5 text-slate-600 dark:text-slate-300">
                          <Phone className="w-3.5 h-3.5" />
                          <span>{patient.phone || "N/A"}</span>
                        </div>
                        <div className="flex items-center gap-1.5 text-slate-600 dark:text-slate-300 text-xs">
                          <Mail className="w-3.5 h-3.5" />
                          <span className="truncate max-w-[150px]">{patient.email || "N/A"}</span>
                        </div>
                      </div>
                    </td>
                    <td className="px-6 py-4">
                      <div className="flex items-center gap-3 text-slate-700 dark:text-slate-300">
                        <span className="capitalize">{patient.gender}</span>
                        <span className="w-1 h-1 rounded-full bg-slate-300 dark:bg-slate-600"></span>
                        <span className="flex items-center gap-1 font-medium text-red-500">
                          <Droplet className="w-3 h-3 fill-red-500" />
                          {patient.bloodGroup !== "unknown" ? patient.bloodGroup : "—"}
                        </span>
                      </div>
                      <p className="text-xs text-slate-500 mt-1 flex items-center gap-1">
                        <Calendar className="w-3.5 h-3.5" />
                        DOB: {new Date(patient.dob).toLocaleDateString()}
                      </p>
                    </td>
                    <td className="px-6 py-4">
                      <span className="text-slate-600 dark:text-slate-300 text-xs">
                        {new Date(patient.createdAt).toLocaleDateString()}
                      </span>
                    </td>
                    <td className="px-6 py-4 text-right">
                      <button 
                        onClick={() => setSelectedPatient(patient)}
                        className="text-emerald-600 hover:text-emerald-700 dark:text-emerald-400 dark:hover:text-emerald-300 font-semibold text-xs transition-colors"
                      >
                        View Profile
                      </button>
                    </td>
                  </tr>
                ))}
              </tbody>
            </table>
          </div>
        )}
      </div>

      {/* Registration Modal */}
      {showModal && (
        <div className="fixed inset-0 z-50 flex items-center justify-center p-4 bg-slate-900/50 backdrop-blur-sm overflow-y-auto">
          <div className="bg-white dark:bg-slate-900 rounded-2xl shadow-xl w-full max-w-2xl border border-slate-200 dark:border-slate-800 overflow-hidden my-8">
            <div className="px-6 py-4 border-b border-slate-200 dark:border-slate-800 flex justify-between items-center bg-slate-50/50 dark:bg-slate-900/50">
              <h3 className="text-lg font-bold text-slate-900 dark:text-white flex items-center gap-2">
                <Activity className="w-5 h-5 text-emerald-500" /> Patient Registration
              </h3>
            </div>
            
            <form onSubmit={handleRegister} className="p-6">
              <div className="grid grid-cols-1 md:grid-cols-2 gap-5 mb-5">
                <div className="space-y-1.5">
                  <label className="text-sm font-medium text-slate-700 dark:text-slate-300">First Name <span className="text-red-500">*</span></label>
                  <input type="text" required value={formData.firstName} onChange={e => setFormData({...formData, firstName: e.target.value})}
                    className="w-full px-4 py-2 bg-slate-50 dark:bg-slate-800/50 border border-slate-200 dark:border-slate-700 rounded-xl text-sm focus:ring-2 focus:ring-emerald-500 outline-none" />
                </div>
                <div className="space-y-1.5">
                  <label className="text-sm font-medium text-slate-700 dark:text-slate-300">Last Name <span className="text-red-500">*</span></label>
                  <input type="text" required value={formData.lastName} onChange={e => setFormData({...formData, lastName: e.target.value})}
                    className="w-full px-4 py-2 bg-slate-50 dark:bg-slate-800/50 border border-slate-200 dark:border-slate-700 rounded-xl text-sm focus:ring-2 focus:ring-emerald-500 outline-none" />
                </div>
              </div>

              <div className="grid grid-cols-1 md:grid-cols-2 gap-5 mb-5">
                <div className="space-y-1.5">
                  <label className="text-sm font-medium text-slate-700 dark:text-slate-300">Email Address</label>
                  <div className="relative">
                    <Mail className="w-4 h-4 text-slate-400 absolute left-3 top-1/2 -translate-y-1/2" />
                    <input type="email" value={formData.email} onChange={e => setFormData({...formData, email: e.target.value})}
                      className="w-full pl-9 pr-4 py-2 bg-slate-50 dark:bg-slate-800/50 border border-slate-200 dark:border-slate-700 rounded-xl text-sm focus:ring-2 focus:ring-emerald-500 outline-none" />
                  </div>
                </div>
                <div className="space-y-1.5">
                  <label className="text-sm font-medium text-slate-700 dark:text-slate-300">Phone Number <span className="text-red-500">*</span></label>
                  <div className="relative">
                    <Phone className="w-4 h-4 text-slate-400 absolute left-3 top-1/2 -translate-y-1/2" />
                    <input type="tel" required value={formData.phone} onChange={e => setFormData({...formData, phone: e.target.value})}
                      className="w-full pl-9 pr-4 py-2 bg-slate-50 dark:bg-slate-800/50 border border-slate-200 dark:border-slate-700 rounded-xl text-sm focus:ring-2 focus:ring-emerald-500 outline-none" />
                  </div>
                </div>
              </div>

              <div className="grid grid-cols-1 md:grid-cols-3 gap-5 mb-8">
                <div className="space-y-1.5">
                  <label className="text-sm font-medium text-slate-700 dark:text-slate-300">Date of Birth <span className="text-red-500">*</span></label>
                  <input type="date" required value={formData.dob} onChange={e => setFormData({...formData, dob: e.target.value})}
                    max={new Date().toISOString().split("T")[0]}
                    className="w-full px-4 py-2 bg-slate-50 dark:bg-slate-800/50 border border-slate-200 dark:border-slate-700 rounded-xl text-sm focus:ring-2 focus:ring-emerald-500 outline-none" />
                </div>
                <div className="space-y-1.5">
                  <label className="text-sm font-medium text-slate-700 dark:text-slate-300">Gender <span className="text-red-500">*</span></label>
                  <select required value={formData.gender} onChange={e => setFormData({...formData, gender: e.target.value})}
                    className="w-full px-4 py-2 bg-slate-50 dark:bg-slate-800/50 border border-slate-200 dark:border-slate-700 rounded-xl text-sm focus:ring-2 focus:ring-emerald-500 outline-none">
                    <option value="male">Male</option>
                    <option value="female">Female</option>
                    <option value="other">Other</option>
                  </select>
                </div>
                <div className="space-y-1.5">
                  <label className="text-sm font-medium text-slate-700 dark:text-slate-300 flex items-center gap-1">Blood Group <Droplet className="w-3 h-3 text-red-500" /></label>
                  <select value={formData.bloodGroup} onChange={e => setFormData({...formData, bloodGroup: e.target.value})}
                    className="w-full px-4 py-2 bg-slate-50 dark:bg-slate-800/50 border border-slate-200 dark:border-slate-700 rounded-xl text-sm focus:ring-2 focus:ring-emerald-500 outline-none">
                    <option value="unknown">Unknown</option>
                    <option value="A+">A+</option>
                    <option value="A-">A-</option>
                    <option value="B+">B+</option>
                    <option value="B-">B-</option>
                    <option value="AB+">AB+</option>
                    <option value="AB-">AB-</option>
                    <option value="O+">O+</option>
                    <option value="O-">O-</option>
                  </select>
                </div>
              </div>

              <div className="pt-4 border-t border-slate-200 dark:border-slate-800 flex items-center justify-end gap-3">
                <button type="button" onClick={() => setShowModal(false)}
                  className="px-4 py-2 text-sm font-medium text-slate-600 dark:text-slate-400 hover:bg-slate-100 dark:hover:bg-slate-800 rounded-xl transition-colors">
                  Cancel
                </button>
                <button type="submit" disabled={submitting}
                  className="flex items-center gap-2 px-6 py-2 bg-emerald-600 hover:bg-emerald-700 text-white text-sm font-semibold rounded-xl disabled:opacity-70 transition-colors shadow-sm">
                  {submitting ? <RefreshCw className="w-4 h-4 animate-spin" /> : <CheckCircle className="w-4 h-4" />}
                  Register Patient
                </button>
              </div>
            </form>
          </div>
        </div>
      )}

      {/* Patient Profile View Modal */}
      {selectedPatient && (
        <div className="fixed inset-0 z-50 flex items-center justify-center p-4 bg-slate-900/50 backdrop-blur-sm overflow-y-auto">
          <div className="bg-white dark:bg-slate-900 rounded-2xl shadow-xl w-full max-w-lg border border-slate-200 dark:border-slate-800 overflow-hidden my-8">
            <div className="px-6 py-4 border-b border-slate-200 dark:border-slate-800 flex justify-between items-center bg-slate-50/50 dark:bg-slate-900/50">
              <h3 className="text-lg font-bold text-slate-900 dark:text-white flex items-center gap-2">
                Patient Profile
              </h3>
              <button onClick={() => setSelectedPatient(null)} className="text-slate-400 hover:text-slate-500">
                <AlertCircle className="w-5 h-5" />
              </button>
            </div>
            
            <div className="p-6">
              <div className="flex items-center gap-4 mb-6">
                <div className="w-16 h-16 rounded-2xl bg-emerald-100 dark:bg-emerald-900/30 flex items-center justify-center text-2xl font-bold text-emerald-700 dark:text-emerald-400">
                  {selectedPatient.firstName[0]}{selectedPatient.lastName[0]}
                </div>
                <div>
                  <h2 className="text-xl font-bold text-slate-900 dark:text-white">
                    {selectedPatient.firstName} {selectedPatient.lastName}
                  </h2>
                  <p className="text-sm font-mono text-emerald-600 font-semibold">{selectedPatient.mrn}</p>
                </div>
              </div>

              <div className="grid grid-cols-2 gap-y-4 gap-x-6 text-sm">
                <div>
                  <p className="text-slate-500 dark:text-slate-400 mb-1">Email</p>
                  <p className="font-medium text-slate-900 dark:text-white">{selectedPatient.email || "N/A"}</p>
                </div>
                <div>
                  <p className="text-slate-500 dark:text-slate-400 mb-1">Phone</p>
                  <p className="font-medium text-slate-900 dark:text-white">{selectedPatient.phone || "N/A"}</p>
                </div>
                <div>
                  <p className="text-slate-500 dark:text-slate-400 mb-1">Date of Birth</p>
                  <p className="font-medium text-slate-900 dark:text-white">{new Date(selectedPatient.dob).toLocaleDateString()}</p>
                </div>
                <div>
                  <p className="text-slate-500 dark:text-slate-400 mb-1">Gender</p>
                  <p className="font-medium text-slate-900 dark:text-white capitalize">{selectedPatient.gender}</p>
                </div>
                <div>
                  <p className="text-slate-500 dark:text-slate-400 mb-1">Blood Group</p>
                  <p className="font-medium text-red-500">{selectedPatient.bloodGroup}</p>
                </div>
                <div>
                  <p className="text-slate-500 dark:text-slate-400 mb-1">Registered On</p>
                  <p className="font-medium text-slate-900 dark:text-white">{new Date(selectedPatient.createdAt).toLocaleDateString()}</p>
                </div>
              </div>

              <div className="mt-8 pt-4 border-t border-slate-200 dark:border-slate-800 text-center">
                <p className="text-xs text-slate-500 italic">Full Medical Records (EMR) module is coming in a future update.</p>
              </div>
            </div>
            
            <div className="px-6 py-4 border-t border-slate-200 dark:border-slate-800 bg-slate-50/50 dark:bg-slate-900/50 text-right">
              <button 
                onClick={() => setSelectedPatient(null)}
                className="px-4 py-2 bg-slate-200 dark:bg-slate-700 hover:bg-slate-300 dark:hover:bg-slate-600 text-slate-800 dark:text-white text-sm font-medium rounded-xl transition-colors"
              >
                Close
              </button>
            </div>
          </div>
        </div>
      )}
    </div>
  );
}
