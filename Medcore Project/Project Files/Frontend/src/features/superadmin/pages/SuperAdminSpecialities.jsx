import { useEffect, useState } from "react";
import { ListTree, Plus, RefreshCw, AlertCircle, Search, FileText, CheckCircle, XCircle } from "lucide-react";
import { useSuperAdmin } from "../hook/useSuperAdmin";

export default function SuperAdminSpecialities() {
  const [specialities, setSpecialities] = useState([]);
  const { getSpecialities, updateSpecialityStatus, createSpeciality, loading, error } = useSuperAdmin();
  const [searchTerm, setSearchParams] = useState("");

  const [showModal, setShowModal] = useState(false);
  const [formData, setFormData] = useState({ name: "", description: "", icon: "Activity" });
  const [submitting, setSubmitting] = useState(false);

  const fetchSpecialities = async () => {
    const data = await getSpecialities();
    if (data) setSpecialities(data.specialities || []);
  };

  useEffect(() => {
    fetchSpecialities();
  }, []);

  const handleToggleStatus = async (id) => {
    const success = await updateSpecialityStatus(id);
    if (success) fetchSpecialities();
  };

  const handleCreate = async (e) => {
    e.preventDefault();
    setSubmitting(true);
    const success = await createSpeciality(formData);
    if (success) {
      setShowModal(false);
      setFormData({ name: "", description: "", icon: "Activity" });
      fetchSpecialities();
    }
    setSubmitting(false);
  };

  const filteredList = specialities.filter(s => 
    s.name.toLowerCase().includes(searchTerm.toLowerCase())
  );

  return (
    <div className="space-y-6 max-w-6xl mx-auto">
      {/* Header */}
      <div className="flex flex-col sm:flex-row sm:items-center justify-between gap-4">
        <div>
          <h2 className="text-xl font-bold text-slate-900 dark:text-white flex items-center gap-2">
            <ListTree className="w-6 h-6 text-emerald-500" />
            Master Specialities
          </h2>
          <p className="text-sm text-slate-500 dark:text-slate-400 mt-0.5">
            Manage the global list of hospital departments and specialities
          </p>
        </div>
        
        <div className="flex items-center gap-3">
          <div className="relative">
            <Search className="w-4 h-4 text-slate-400 absolute left-3 top-1/2 -translate-y-1/2" />
            <input 
              type="text"
              placeholder="Search..."
              value={searchTerm}
              onChange={(e) => setSearchParams(e.target.value)}
              className="pl-9 pr-4 py-2 bg-white dark:bg-slate-800 border border-slate-200 dark:border-slate-700 rounded-xl text-sm focus:ring-2 focus:ring-emerald-500 outline-none w-64"
            />
          </div>
          <button 
            onClick={() => setShowModal(true)}
            className="flex items-center gap-2 bg-emerald-600 hover:bg-emerald-700 text-white px-4 py-2 rounded-xl text-sm font-semibold transition-all shadow-sm"
          >
            <Plus className="w-4 h-4" />
            Add New
          </button>
        </div>
      </div>

      {/* Grid List */}
      <div className="bg-white dark:bg-slate-800 rounded-2xl border border-slate-200 dark:border-slate-700 shadow-sm overflow-hidden p-6">
        {loading ? (
          <div className="flex items-center justify-center py-20">
            <RefreshCw className="w-8 h-8 text-slate-400 animate-spin" />
          </div>
        ) : error ? (
          <div className="flex flex-col items-center justify-center py-20 text-red-500 gap-2">
            <AlertCircle className="w-8 h-8" />
            <span className="font-medium">{error}</span>
          </div>
        ) : filteredList.length === 0 ? (
          <div className="flex flex-col items-center justify-center py-20 text-slate-400">
            <FileText className="w-14 h-14 mb-4 text-slate-300 dark:text-slate-600" />
            <p className="font-medium text-slate-600 dark:text-slate-300">No specialities found</p>
          </div>
        ) : (
          <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-4">
            {filteredList.map((spec) => (
              <div 
                key={spec._id} 
                className={`p-4 rounded-xl border transition-all ${
                  spec.isActive 
                    ? "border-slate-200 dark:border-slate-700 bg-slate-50 dark:bg-slate-900/50 hover:border-emerald-300 dark:hover:border-emerald-700" 
                    : "border-slate-200 dark:border-slate-700 bg-slate-100 dark:bg-slate-800 opacity-60 grayscale-[50%]"
                }`}
              >
                <div className="flex items-start justify-between mb-2">
                  <div className="flex items-center gap-3">
                    <div className={`w-10 h-10 rounded-lg flex items-center justify-center ${
                      spec.isActive ? "bg-emerald-100 dark:bg-emerald-900/30 text-emerald-600 dark:text-emerald-400" : "bg-slate-200 dark:bg-slate-700 text-slate-500"
                    }`}>
                      <ListTree className="w-5 h-5" />
                    </div>
                    <div>
                      <h3 className="font-bold text-slate-900 dark:text-white">{spec.name}</h3>
                      <p className="text-xs text-slate-500 line-clamp-1">{spec.description || "No description"}</p>
                    </div>
                  </div>
                </div>
                
                <div className="flex items-center justify-between mt-4 pt-3 border-t border-slate-200 dark:border-slate-700/50">
                  <span className={`inline-flex items-center gap-1 text-[10px] uppercase font-bold tracking-wider ${
                    spec.isActive ? "text-emerald-600 dark:text-emerald-400" : "text-slate-500"
                  }`}>
                    {spec.isActive ? <CheckCircle className="w-3 h-3" /> : <XCircle className="w-3 h-3" />}
                    {spec.isActive ? "Active" : "Disabled"}
                  </span>
                  
                  <button 
                    onClick={() => handleToggleStatus(spec._id)}
                    className="text-xs font-semibold text-blue-600 hover:text-blue-700 dark:text-blue-400 dark:hover:text-blue-300"
                  >
                    {spec.isActive ? "Disable" : "Enable"}
                  </button>
                </div>
              </div>
            ))}
          </div>
        )}
      </div>

      {/* Create Modal */}
      {showModal && (
        <div className="fixed inset-0 z-50 flex items-center justify-center p-4 bg-slate-900/50 backdrop-blur-sm">
          <div className="bg-white dark:bg-slate-900 rounded-2xl shadow-xl w-full max-w-md border border-slate-200 dark:border-slate-800 overflow-hidden animate-in fade-in zoom-in-95 duration-200">
            <div className="px-6 py-4 border-b border-slate-200 dark:border-slate-800 flex justify-between items-center">
              <h3 className="text-lg font-bold text-slate-900 dark:text-white">Add Speciality</h3>
              <button onClick={() => setShowModal(false)} className="text-slate-400 hover:text-slate-500 dark:hover:text-slate-300">
                <AlertCircle className="w-5 h-5" />
              </button>
            </div>
            
            <form onSubmit={handleCreate} className="p-6 space-y-4">
              <div className="space-y-1.5">
                <label className="text-sm font-medium text-slate-700 dark:text-slate-300">Name</label>
                <input
                  type="text"
                  required
                  value={formData.name}
                  onChange={e => setFormData({...formData, name: e.target.value})}
                  placeholder="e.g. Cardiology"
                  className="w-full px-4 py-2.5 bg-slate-50 dark:bg-slate-900 border border-slate-200 dark:border-slate-700 rounded-xl text-sm focus:ring-2 focus:ring-emerald-500 outline-none"
                />
              </div>
              
              <div className="space-y-1.5">
                <label className="text-sm font-medium text-slate-700 dark:text-slate-300">Description</label>
                <textarea
                  rows={3}
                  value={formData.description}
                  onChange={e => setFormData({...formData, description: e.target.value})}
                  placeholder="Brief description of the department..."
                  className="w-full px-4 py-2.5 bg-slate-50 dark:bg-slate-900 border border-slate-200 dark:border-slate-700 rounded-xl text-sm focus:ring-2 focus:ring-emerald-500 outline-none resize-none"
                ></textarea>
              </div>

              <div className="pt-4 flex items-center justify-end gap-3">
                <button
                  type="button"
                  onClick={() => setShowModal(false)}
                  className="px-4 py-2 text-sm font-medium text-slate-600 dark:text-slate-400 hover:bg-slate-100 dark:hover:bg-slate-800 rounded-xl"
                >
                  Cancel
                </button>
                <button
                  type="submit"
                  disabled={submitting}
                  className="flex items-center gap-2 px-4 py-2 bg-emerald-600 hover:bg-emerald-700 text-white text-sm font-semibold rounded-xl disabled:opacity-70"
                >
                  {submitting && <RefreshCw className="w-4 h-4 animate-spin" />}
                  Save Speciality
                </button>
              </div>
            </form>
          </div>
        </div>
      )}
    </div>
  );
}
