import { useState } from "react";
import { X, Building2, MapPin, Phone, Mail, Loader2, CheckCircle, Save } from "lucide-react";
import apiClient from "../../../shared/service/apiClient";
import toast from "react-hot-toast";

export default function CreateHospitalModal({ isOpen, onClose, onSuccess }) {
  const [formData, setFormData] = useState({ name: "", email: "", city: "", phone: "", address: "" });
  const [creating, setCreating] = useState(false);

  if (!isOpen) return null;

  const handleCreate = async (e) => {
    e.preventDefault();
    try {
      setCreating(true);
      
      const payload = {
        name: formData.name,
        email: formData.email,
        phone: formData.phone,
        address: {
          line1: formData.address,
          city: formData.city
        }
      };

      await apiClient.post("/hospitals", payload);
      toast.success("Hospital created!");
      setFormData({ name: "", email: "", city: "", phone: "", address: "" });
      onSuccess(); // Refresh data
      onClose(); // Close modal
    } catch (err) {
      toast.error(err.response?.data?.message || "Failed to create hospital");
    } finally {
      setCreating(false);
    }
  };

  return (
    <div className="fixed inset-0 bg-black/60 backdrop-blur-sm z-50 flex items-center justify-center p-4">
      <div className="bg-white dark:bg-slate-800 rounded-2xl shadow-2xl w-full max-w-md border border-slate-200 dark:border-slate-700">
        <div className="flex items-center justify-between p-6 border-b border-slate-200 dark:border-slate-700">
          <h3 className="text-lg font-bold text-slate-900 dark:text-white">Create New Hospital</h3>
          <button onClick={onClose} className="text-slate-400 hover:text-slate-600 dark:hover:text-slate-300 p-1 rounded-lg transition-colors cursor-pointer">
            <X className="w-5 h-5" />
          </button>
        </div>
        <form onSubmit={handleCreate} className="p-6 space-y-4">
          {[
            { label: "Hospital Name", key: "name", placeholder: "City General Hospital", required: true, type: "text" },
            { label: "Contact Email", key: "email", placeholder: "admin@cityhospital.com", required: true, type: "email" },
            { label: "City", key: "city", placeholder: "Mumbai", type: "text" },
            { label: "Phone", key: "phone", placeholder: "+91 98765 43210", type: "text" },
            { label: "Address", key: "address", placeholder: "123 Medical Road", type: "text" },
          ].map(({ label, key, placeholder, required, type }) => (
            <div key={key} className="space-y-1.5">
              <label className="text-sm font-medium text-slate-700 dark:text-slate-300">{label}</label>
              <input
                type={type}
                value={formData[key]}
                onChange={(e) => setFormData({ ...formData, [key]: e.target.value })}
                placeholder={placeholder}
                required={required}
                className="w-full px-3 py-2.5 border border-slate-300 dark:border-slate-600 rounded-lg text-sm dark:bg-slate-700 dark:text-white focus:ring-2 focus:ring-blue-500 focus:border-blue-500 outline-none transition-all"
              />
            </div>
          ))}
          <div className="flex gap-3 pt-2">
            <button type="button" onClick={onClose} className="flex-1 py-2.5 border border-slate-300 dark:border-slate-600 rounded-xl text-sm font-medium text-slate-700 dark:text-slate-300 hover:bg-slate-50 dark:hover:bg-slate-700 transition-colors cursor-pointer">
              Cancel
            </button>
            <button type="submit" disabled={creating} className="flex-1 py-2.5 bg-blue-600 hover:bg-blue-700 text-white rounded-xl text-sm font-semibold transition-all disabled:opacity-70 flex items-center justify-center gap-2 cursor-pointer">
              {creating ? <RefreshCw className="w-4 h-4 animate-spin" /> : <Plus className="w-4 h-4" />}
              {creating ? "Creating..." : "Create Hospital"}
            </button>
          </div>
        </form>
      </div>
    </div>
  );
}
