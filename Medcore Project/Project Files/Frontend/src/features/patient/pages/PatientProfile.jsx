import { useState, useEffect } from "react";
import { useSelector } from "react-redux";
import { ShieldCheck, Mail, Phone, User, CheckCircle, RefreshCw, Edit, MapPin } from "lucide-react";
import { usePatient } from "../hook/usePatient";

export default function PatientProfile() {
  const { user } = useSelector((state) => state.auth);
  const { activeProfile } = useSelector((state) => state.patient);
  const { updateProfile, loading } = usePatient();
  const [isEditing, setIsEditing] = useState(false);
  const [formData, setFormData] = useState({
    firstName: "",
    lastName: "",
    phone: "",
    gender: "",
    address: {
      line1: "",
      city: "",
      state: "",
      pincode: ""
    }
  });

  useEffect(() => {
    if (activeProfile) {
      setFormData({
        firstName: activeProfile.firstName || "",
        lastName: activeProfile.lastName || "",
        phone: activeProfile.phone || "",
        gender: activeProfile.gender || "",
        address: {
          line1: activeProfile.address?.line1 || "",
          city: activeProfile.address?.city || "",
          state: activeProfile.address?.state || "",
          pincode: activeProfile.address?.pincode || ""
        }
      });
    }
  }, [activeProfile]);

  const handleUpdate = async (e) => {
    e.preventDefault();
    if (!activeProfile?._id) return;
    const success = await updateProfile(activeProfile._id, formData);
    if (success) {
      setIsEditing(false);
    }
  };

  return (
    <div className="max-w-4xl mx-auto space-y-6">
      {/* Header */}
      <div>
        <h1 className="text-2xl font-bold text-slate-900 dark:text-white">My Profile</h1>
        <p className="text-sm text-slate-500 dark:text-slate-400 mt-1">Manage your personal and health information</p>
      </div>

      <div className="bg-white dark:bg-slate-800 border border-slate-200 dark:border-slate-700 rounded-2xl shadow-sm overflow-hidden flex flex-col md:flex-row">
        {/* Left Side: Summary */}
        <div className="md:w-1/3 bg-slate-50 dark:bg-slate-900/50 p-8 border-b md:border-b-0 md:border-r border-slate-200 dark:border-slate-700 flex flex-col items-center text-center">
          <div className="w-24 h-24 rounded-full bg-blue-100 text-blue-600 dark:bg-blue-900/30 dark:text-blue-400 flex items-center justify-center text-3xl font-bold shadow-inner mb-4">
            {(activeProfile?.firstName || user?.firstName || "P")[0]}
          </div>
          <h2 className="text-xl font-bold text-slate-900 dark:text-white">
            {activeProfile?.firstName || user?.firstName} {activeProfile?.lastName || user?.lastName}
          </h2>
          <p className="text-sm text-slate-500 dark:text-slate-400 mt-1">
            MRN: <span className="font-semibold text-slate-700 dark:text-slate-300">{activeProfile?.mrn || "Pending"}</span>
          </p>
          
          <div className="w-full mt-8 space-y-4">
            <div className="bg-white dark:bg-slate-800 p-4 rounded-xl border border-slate-200 dark:border-slate-700 shadow-sm text-left">
              <p className="text-xs font-semibold text-slate-500 uppercase tracking-wider mb-1">Blood Group</p>
              <p className="font-bold text-red-600 dark:text-red-400 text-lg">
                {activeProfile?.bloodGroup || "Unknown"}
              </p>
            </div>
            <div className="bg-white dark:bg-slate-800 p-4 rounded-xl border border-slate-200 dark:border-slate-700 shadow-sm text-left">
              <p className="text-xs font-semibold text-slate-500 uppercase tracking-wider mb-1">Date of Birth</p>
              <p className="font-medium text-slate-800 dark:text-slate-200">
                {activeProfile?.dob ? new Date(activeProfile.dob).toLocaleDateString("en-US", { month: "long", day: "numeric", year: "numeric" }) : "Not provided"}
              </p>
            </div>
          </div>
        </div>

        {/* Right Side: Form */}
        <div className="md:w-2/3 p-8">
          <div className="flex justify-between items-center mb-6">
            <h3 className="text-lg font-bold text-slate-900 dark:text-white">Personal Details</h3>
            {!isEditing && (
              <button 
                onClick={() => setIsEditing(true)}
                className="flex items-center gap-1.5 px-3 py-1.5 bg-blue-50 hover:bg-blue-100 text-blue-600 dark:bg-blue-900/30 dark:hover:bg-blue-900/50 dark:text-blue-400 text-sm font-semibold rounded-lg transition-colors cursor-pointer"
              >
                <Edit className="w-4 h-4" />
                Edit
              </button>
            )}
          </div>

          <form onSubmit={handleUpdate} className="space-y-5">
            <div className="grid grid-cols-1 sm:grid-cols-2 gap-5">
              <div className="space-y-1.5">
                <label className="text-sm font-medium text-slate-700 dark:text-slate-300">First Name</label>
                <div className="relative">
                  <div className="absolute inset-y-0 left-0 pl-3 flex items-center pointer-events-none">
                    <User className="w-4 h-4 text-slate-400" />
                  </div>
                  <input
                    type="text"
                    disabled={!isEditing}
                    value={formData.firstName}
                    onChange={(e) => setFormData({...formData, firstName: e.target.value})}
                    className="w-full pl-10 pr-4 py-2.5 bg-slate-50 dark:bg-slate-900 border border-slate-200 dark:border-slate-700 rounded-xl text-sm text-slate-900 dark:text-white focus:ring-2 focus:ring-blue-500 disabled:opacity-60 transition-all outline-none"
                  />
                </div>
              </div>

              <div className="space-y-1.5">
                <label className="text-sm font-medium text-slate-700 dark:text-slate-300">Last Name</label>
                <div className="relative">
                  <div className="absolute inset-y-0 left-0 pl-3 flex items-center pointer-events-none">
                    <User className="w-4 h-4 text-slate-400" />
                  </div>
                  <input
                    type="text"
                    disabled={!isEditing}
                    value={formData.lastName}
                    onChange={(e) => setFormData({...formData, lastName: e.target.value})}
                    className="w-full pl-10 pr-4 py-2.5 bg-slate-50 dark:bg-slate-900 border border-slate-200 dark:border-slate-700 rounded-xl text-sm text-slate-900 dark:text-white focus:ring-2 focus:ring-blue-500 disabled:opacity-60 transition-all outline-none"
                  />
                </div>
              </div>

              <div className="space-y-1.5">
                <label className="text-sm font-medium text-slate-700 dark:text-slate-300">Gender</label>
                <div className="relative">
                  <div className="absolute inset-y-0 left-0 pl-3 flex items-center pointer-events-none">
                    <User className="w-4 h-4 text-slate-400" />
                  </div>
                  <select
                    disabled={!isEditing}
                    value={formData.gender}
                    onChange={(e) => setFormData({...formData, gender: e.target.value})}
                    className="w-full pl-10 pr-4 py-2.5 bg-slate-50 dark:bg-slate-900 border border-slate-200 dark:border-slate-700 rounded-xl text-sm text-slate-900 dark:text-white focus:ring-2 focus:ring-blue-500 disabled:opacity-60 transition-all outline-none appearance-none"
                  >
                    <option value="" disabled>Select Gender</option>
                    <option value="male">Male</option>
                    <option value="female">Female</option>
                    <option value="other">Other</option>
                  </select>
                </div>
              </div>

              <div className="space-y-1.5">
                <label className="text-sm font-medium text-slate-700 dark:text-slate-300">Phone</label>
                <div className="relative">
                  <div className="absolute inset-y-0 left-0 pl-3 flex items-center pointer-events-none">
                    <Phone className="w-4 h-4 text-slate-400" />
                  </div>
                  <input
                    type="text"
                    disabled={!isEditing}
                    value={formData.phone}
                    onChange={(e) => setFormData({...formData, phone: e.target.value})}
                    className="w-full pl-10 pr-4 py-2.5 bg-slate-50 dark:bg-slate-900 border border-slate-200 dark:border-slate-700 rounded-xl text-sm text-slate-900 dark:text-white focus:ring-2 focus:ring-blue-500 disabled:opacity-60 transition-all outline-none"
                  />
                </div>
              </div>

              <div className="space-y-1.5">
                <label className="text-sm font-medium text-slate-700 dark:text-slate-300">Email Address (Read-only)</label>
                <div className="relative">
                  <div className="absolute inset-y-0 left-0 pl-3 flex items-center pointer-events-none">
                    <Mail className="w-4 h-4 text-slate-400" />
                  </div>
                  <input
                    type="email"
                    disabled
                    value={user?.email || ""}
                    className="w-full pl-10 pr-4 py-2.5 bg-slate-100 dark:bg-slate-800 border border-slate-200 dark:border-slate-700 rounded-xl text-sm text-slate-500 dark:text-slate-400 cursor-not-allowed outline-none"
                  />
                </div>
              </div>
            </div>

            <div className="pt-4 mt-4 border-t border-slate-100 dark:border-slate-800">
              <h4 className="text-sm font-bold text-slate-800 dark:text-slate-200 mb-4">Address Information</h4>
              <div className="space-y-4">
                <div className="relative">
                  <div className="absolute top-3 left-3 pointer-events-none">
                    <MapPin className="w-4 h-4 text-slate-400" />
                  </div>
                  <input
                    type="text"
                    disabled={!isEditing}
                    placeholder="Address Line 1"
                    value={formData.address.line1}
                    onChange={(e) => setFormData({...formData, address: {...formData.address, line1: e.target.value}})}
                    className="w-full pl-10 pr-4 py-2.5 bg-slate-50 dark:bg-slate-900 border border-slate-200 dark:border-slate-700 rounded-xl text-sm text-slate-900 dark:text-white focus:ring-2 focus:ring-blue-500 disabled:opacity-60 transition-all outline-none"
                  />
                </div>
                <div className="grid grid-cols-2 sm:grid-cols-3 gap-4">
                  <input
                    type="text"
                    disabled={!isEditing}
                    placeholder="City"
                    value={formData.address.city}
                    onChange={(e) => setFormData({...formData, address: {...formData.address, city: e.target.value}})}
                    className="w-full px-4 py-2.5 bg-slate-50 dark:bg-slate-900 border border-slate-200 dark:border-slate-700 rounded-xl text-sm text-slate-900 dark:text-white focus:ring-2 focus:ring-blue-500 disabled:opacity-60 transition-all outline-none"
                  />
                  <input
                    type="text"
                    disabled={!isEditing}
                    placeholder="State"
                    value={formData.address.state}
                    onChange={(e) => setFormData({...formData, address: {...formData.address, state: e.target.value}})}
                    className="w-full px-4 py-2.5 bg-slate-50 dark:bg-slate-900 border border-slate-200 dark:border-slate-700 rounded-xl text-sm text-slate-900 dark:text-white focus:ring-2 focus:ring-blue-500 disabled:opacity-60 transition-all outline-none"
                  />
                  <input
                    type="text"
                    disabled={!isEditing}
                    placeholder="Pincode"
                    value={formData.address.pincode}
                    onChange={(e) => setFormData({...formData, address: {...formData.address, pincode: e.target.value}})}
                    className="col-span-2 sm:col-span-1 w-full px-4 py-2.5 bg-slate-50 dark:bg-slate-900 border border-slate-200 dark:border-slate-700 rounded-xl text-sm text-slate-900 dark:text-white focus:ring-2 focus:ring-blue-500 disabled:opacity-60 transition-all outline-none"
                  />
                </div>
              </div>
            </div>

            {isEditing && (
              <div className="flex justify-end gap-3 pt-6 mt-6 border-t border-slate-200 dark:border-slate-700">
                <button
                  type="button"
                  onClick={() => setIsEditing(false)}
                  className="px-5 py-2.5 text-sm font-medium text-slate-600 dark:text-slate-300 hover:bg-slate-100 dark:hover:bg-slate-800 rounded-xl transition-colors cursor-pointer"
                >
                  Cancel
                </button>
                <button
                  type="submit"
                  disabled={loading}
                  className="inline-flex items-center gap-2 px-6 py-2.5 bg-blue-600 hover:bg-blue-700 text-white text-sm font-semibold rounded-xl transition-colors shadow-lg shadow-blue-600/20 disabled:opacity-70 cursor-pointer"
                >
                  {loading && <RefreshCw className="w-4 h-4 animate-spin" />}
                  Save Changes
                </button>
              </div>
            )}
          </form>
        </div>
      </div>
    </div>
  );
}
