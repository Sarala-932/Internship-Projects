import { useEffect, useState } from "react";
import { ListTree, Plus, RefreshCw, AlertCircle, Building2, CheckCircle } from "lucide-react";
import { useAdminDepartments } from "../hook/useAdminDepartments";
import toast from "react-hot-toast";
import CardSkeleton from "../../../shared/components/CardSkeleton";

export default function AdminDepartments() {
  const { departments, masterSpecialities, loading, error, fetchDepartments, createDepartment } = useAdminDepartments();

  const [showModal, setShowModal] = useState(false);
  const [formData, setFormData] = useState({ specialityId: "", description: "" });
  const [submitting, setSubmitting] = useState(false);

  useEffect(() => {
    fetchDepartments();
  }, [fetchDepartments]);

  const handleCreate = async (e) => {
    e.preventDefault();
    if (!formData.specialityId) return toast.error("Please select a speciality");

    // Find selected master speciality to get its name and code
    const selectedMaster = masterSpecialities.find(s => s._id === formData.specialityId);
    if (!selectedMaster) return toast.error("Invalid speciality selected");

    try {
      setSubmitting(true);
      const success = await createDepartment({
        name: selectedMaster.name,
        code: selectedMaster.name.substring(0, 3).toUpperCase(),
        description: formData.description || selectedMaster.description
      });
      if (success) {
        setShowModal(false);
        setFormData({ specialityId: "", description: "" });
      }
    } finally {
      setSubmitting(false);
    }
  };

  // Filter out master specialities that are already added to this hospital
  const availableSpecialities = masterSpecialities.filter(
    m => !departments.some(d => d.name === m.name)
  );

  return (
    <div className="space-y-6 max-w-6xl mx-auto">
      <div className="flex flex-col sm:flex-row sm:items-center justify-between gap-4">
        <div>
          <h2 className="text-xl font-bold text-slate-900 dark:text-white flex items-center gap-2">
            <ListTree className="w-6 h-6 text-indigo-500" />
            Hospital Departments
          </h2>
          <p className="text-sm text-slate-500 dark:text-slate-400 mt-0.5">
            Manage the active departments and services offered in your hospital
          </p>
        </div>
        
        <div className="flex items-center gap-3">
          <button 
            onClick={fetchDepartments}
            className="p-2 text-slate-500 hover:text-indigo-600 bg-white dark:bg-slate-800 border border-slate-200 dark:border-slate-700 hover:bg-indigo-50 dark:hover:bg-slate-700 rounded-xl shadow-sm transition-colors"
            title="Refresh"
          >
            <RefreshCw className="w-4 h-4 " />
          </button>
          <button 
            onClick={() => setShowModal(true)}
            className="flex items-center gap-2 bg-indigo-600 hover:bg-indigo-700 text-white px-4 py-2 rounded-xl text-sm font-semibold transition-all shadow-sm"
          >
            <Plus className="w-4 h-4" />
            Add Department
          </button>
        </div>
      </div>

      <div className="bg-white dark:bg-slate-800 rounded-2xl border border-slate-200 dark:border-slate-700 shadow-sm overflow-hidden p-6">
        {loading ? (
          <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-4">
            {Array(6).fill(0).map((_, i) => <CardSkeleton key={i} />)}
          </div>
        ) : error ? (
          <div className="flex flex-col items-center justify-center py-20 text-red-500 gap-2">
            <AlertCircle className="w-8 h-8" />
            <span className="font-medium">{error}</span>
          </div>
        ) : departments.length === 0 ? (
          <div className="flex flex-col items-center justify-center py-20 text-slate-400">
            <Building2 className="w-14 h-14 mb-4 text-slate-300 dark:text-slate-600" />
            <p className="font-medium text-slate-600 dark:text-slate-300">No departments added yet</p>
            <button onClick={() => setShowModal(true)} className="mt-4 text-sm text-indigo-600 font-semibold hover:underline">
              Add your first department
            </button>
          </div>
        ) : (
          <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-4">
            {departments.map((dept) => (
              <div 
                key={dept._id} 
                className="p-5 rounded-xl border border-slate-200 dark:border-slate-700 bg-slate-50 dark:bg-slate-900/50 hover:border-indigo-300 dark:hover:border-indigo-700 transition-all group"
              >
                <div className="flex items-start justify-between mb-3">
                  <div className="flex items-center gap-3">
                    <div className="w-10 h-10 rounded-lg flex items-center justify-center bg-indigo-100 dark:bg-indigo-900/30 text-indigo-600 dark:text-indigo-400">
                      <ListTree className="w-5 h-5" />
                    </div>
                    <div>
                      <h3 className="font-bold text-slate-900 dark:text-white">{dept.name}</h3>
                      <p className="text-xs text-slate-500 font-mono tracking-wider">{dept.code}</p>
                    </div>
                  </div>
                  <span className="inline-flex items-center gap-1 text-[10px] uppercase font-bold tracking-wider text-emerald-600 dark:text-emerald-400 bg-emerald-100 dark:bg-emerald-900/30 px-2 py-0.5 rounded">
                    Active
                  </span>
                </div>
                <p className="text-sm text-slate-600 dark:text-slate-400 line-clamp-2 mt-2">
                  {dept.description || "No description provided."}
                </p>
                <div className="mt-4 pt-3 border-t border-slate-200 dark:border-slate-700/50 flex items-center text-xs text-slate-500 dark:text-slate-400 font-medium">
                  {dept.headDoctorId ? (
                    <span className="flex items-center gap-1 text-slate-700 dark:text-slate-300">
                      <CheckCircle className="w-3.5 h-3.5 text-emerald-500" /> Head Assigned
                    </span>
                  ) : (
                    <span>No Head Assigned</span>
                  )}
                </div>
              </div>
            ))}
          </div>
        )}
      </div>

      {showModal && (
        <div className="fixed inset-0 z-50 flex items-center justify-center p-4 bg-slate-900/50 backdrop-blur-sm">
          <div className="bg-white dark:bg-slate-900 rounded-2xl shadow-xl w-full max-w-md border border-slate-200 dark:border-slate-800 overflow-hidden animate-in fade-in zoom-in-95 duration-200">
            <div className="px-6 py-4 border-b border-slate-200 dark:border-slate-800 flex justify-between items-center">
              <h3 className="text-lg font-bold text-slate-900 dark:text-white">Add Department</h3>
              <button onClick={() => setShowModal(false)} className="text-slate-400 hover:text-slate-500 dark:hover:text-slate-300">
                <AlertCircle className="w-5 h-5" />
              </button>
            </div>
            
            <form onSubmit={handleCreate} className="p-6 space-y-5">
              <div className="space-y-1.5">
                <label className="text-sm font-medium text-slate-700 dark:text-slate-300">Select Speciality *</label>
                <select
                  required
                  value={formData.specialityId}
                  onChange={e => setFormData({...formData, specialityId: e.target.value})}
                  className="w-full px-4 py-2.5 bg-slate-50 dark:bg-slate-900 border border-slate-200 dark:border-slate-700 rounded-xl text-sm focus:ring-2 focus:ring-indigo-500 outline-none"
                >
                  <option value="" disabled>Select from Master List</option>
                  {availableSpecialities.map(spec => (
                    <option key={spec._id} value={spec._id}>{spec.name}</option>
                  ))}
                </select>
                {availableSpecialities.length === 0 && (
                  <p className="text-xs text-amber-500 mt-1">All master specialities have already been added to your hospital.</p>
                )}
              </div>
              
              <div className="space-y-1.5">
                <label className="text-sm font-medium text-slate-700 dark:text-slate-300">Custom Description (Optional)</label>
                <textarea
                  rows={3}
                  value={formData.description}
                  onChange={e => setFormData({...formData, description: e.target.value})}
                  placeholder="Leave blank to use default description..."
                  className="w-full px-4 py-2.5 bg-slate-50 dark:bg-slate-900 border border-slate-200 dark:border-slate-700 rounded-xl text-sm focus:ring-2 focus:ring-indigo-500 outline-none resize-none"
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
                  disabled={submitting || availableSpecialities.length === 0}
                  className="flex items-center gap-2 px-4 py-2 bg-indigo-600 hover:bg-indigo-700 text-white text-sm font-semibold rounded-xl disabled:opacity-70"
                >
                  {submitting && <RefreshCw className="w-4 h-4 animate-spin" />}
                  Add Department
                </button>
              </div>
            </form>
          </div>
        </div>
      )}
    </div>
  );
}
