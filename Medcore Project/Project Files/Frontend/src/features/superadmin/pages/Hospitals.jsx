import { useEffect, useState } from "react";
import { Plus, Search, Building2, MapPin, Phone, Mail, Activity, ArrowRight, Eye, RefreshCw, XCircle, CheckCircle, Clock, X, AlertCircle, ShieldCheck } from "lucide-react";
import { useSearchParams } from "react-router";
import { useSelector } from "react-redux";
import toast from "react-hot-toast";
import CreateHospitalModal from "../components/CreateHospitalModal";
import CreateStaffModal from "../../admin/components/CreateStaffModal";
import { useSuperAdmin } from "../hook/useSuperAdmin";

export default function Hospitals() {
  const { token } = useSelector((state) => state.auth);
  const [hospitals, setHospitals] = useState([]);
  const [verifying, setVerifying] = useState(null);
  const [showModal, setShowModal] = useState(false);
  const [selectedHospitalForAdmin, setSelectedHospitalForAdmin] = useState(null);

  const { getHospitals, verifyHospital, loading } = useSuperAdmin();

  const fetchHospitals = async () => {
    const data = await getHospitals();
    if (data) setHospitals(data.hospitals || []);
  };

  useEffect(() => { 
    fetchHospitals(); 
  }, [token]);

  // Read URL query params to auto-open modal
  const [searchParams, setSearchParams] = useSearchParams();
  useEffect(() => {
    if (searchParams.get("action") === "add") {
      setShowModal(true);
      // Clean up the URL so refreshing doesn't keep opening it
      setSearchParams({});
    }
  }, [searchParams, setSearchParams]);

  const handleVerify = async (id) => {
    setVerifying(id);
    const success = await verifyHospital(id);
    if (success) fetchHospitals();
    setVerifying(null);
  };

  return (
    <div className="space-y-6">
      {/* Header */}
      <div className="flex items-center justify-between">
        <div>
          <h2 className="text-xl font-bold text-slate-900 dark:text-white">Hospitals</h2>
          <p className="text-sm text-slate-500 dark:text-slate-400 mt-0.5">{hospitals.length} hospitals registered on the platform</p>
        </div>
        <button
          onClick={() => setShowModal(true)}
          className="flex items-center gap-2 bg-blue-600 hover:bg-blue-700 text-white px-4 py-2.5 rounded-xl text-sm font-semibold transition-all shadow-lg shadow-blue-600/20 cursor-pointer"
        >
          <Plus className="w-4 h-4" />
          Add Hospital
        </button>
      </div>

      {/* Table */}
      <div className="bg-white dark:bg-slate-800 rounded-2xl border border-slate-200 dark:border-slate-700 shadow-sm overflow-hidden">
        {loading ? (
          <div className="flex items-center justify-center py-20">
            <RefreshCw className="w-8 h-8 text-slate-400 animate-spin" />
          </div>
        ) : hospitals.length === 0 ? (
          <div className="flex flex-col items-center justify-center py-20 text-slate-400">
            <Building2 className="w-14 h-14 mb-4" />
            <p className="font-medium">No hospitals registered</p>
            <p className="text-sm mt-1">Add a hospital to get started</p>
          </div>
        ) : (
          <div className="overflow-x-auto">
            <table className="w-full text-left text-sm">
              <thead className="bg-slate-50 dark:bg-slate-900/50 text-slate-500 dark:text-slate-400 text-xs uppercase border-b border-slate-200 dark:border-slate-700">
                <tr>
                  <th className="px-6 py-3">Hospital</th>
                  <th className="px-6 py-3">City</th>
                  <th className="px-6 py-3">Phone</th>
                  <th className="px-6 py-3">Status</th>
                  <th className="px-6 py-3">Action</th>
                </tr>
              </thead>
              <tbody className="divide-y divide-slate-100 dark:divide-slate-700">
                {hospitals.map((h) => (
                  <tr key={h._id} className="hover:bg-slate-50 dark:hover:bg-slate-700/50 transition-colors">
                    <td className="px-6 py-4">
                      <div className="flex items-center gap-3">
                        <div className="w-9 h-9 rounded-xl bg-blue-100 dark:bg-blue-900/30 flex items-center justify-center">
                          <Building2 className="w-5 h-5 text-blue-600 dark:text-blue-400" />
                        </div>
                        <div>
                          <p className="font-semibold text-slate-900 dark:text-white">{h.name}</p>
                          <p className="text-xs text-slate-500 dark:text-slate-400">{h.address?.line1 || "No address"}</p>
                        </div>
                      </div>
                    </td>
                    <td className="px-6 py-4 text-slate-600 dark:text-slate-300">{h.address?.city || "—"}</td>
                    <td className="px-6 py-4 text-slate-600 dark:text-slate-300">{h.phone || "—"}</td>
                    <td className="px-6 py-4">
                      <span className={`inline-flex items-center gap-1.5 px-2.5 py-1 rounded-full text-xs font-semibold ${
                        h.status === "active"
                          ? "bg-emerald-100 dark:bg-emerald-900/30 text-emerald-700 dark:text-emerald-400"
                          : "bg-amber-100 dark:bg-amber-900/30 text-amber-700 dark:text-amber-400"
                      }`}>
                        {h.status === "active" ? <CheckCircle className="w-3 h-3" /> : <Clock className="w-3 h-3" />}
                        {h.status === "active" ? "Active" : "Pending"}
                      </span>
                    </td>
                    <td className="px-6 py-4">
                      <div className="flex gap-2">
                        {h.status === "pending" ? (
                          <button
                            onClick={() => handleVerify(h._id)}
                            disabled={verifying === h._id}
                            className="inline-flex items-center gap-1.5 px-3 py-1.5 bg-blue-50 hover:bg-blue-100 dark:bg-blue-900/30 dark:hover:bg-blue-900/50 text-blue-600 dark:text-blue-400 rounded-lg text-xs font-semibold transition-colors disabled:opacity-50 cursor-pointer"
                          >
                            {verifying === h._id ? <RefreshCw className="w-3.5 h-3.5 animate-spin" /> : <ShieldCheck className="w-3.5 h-3.5" />}
                            {verifying === h._id ? "Verifying..." : "Verify"}
                          </button>
                        ) : (
                          <button
                            onClick={() => setSelectedHospitalForAdmin(h)}
                            className="inline-flex items-center gap-1.5 px-3 py-1.5 bg-indigo-50 hover:bg-indigo-100 dark:bg-indigo-900/30 dark:hover:bg-indigo-900/50 text-indigo-600 dark:text-indigo-400 rounded-lg text-xs font-semibold transition-colors cursor-pointer"
                          >
                            <Plus className="w-3.5 h-3.5" />
                            Assign Admin
                          </button>
                        )}
                      </div>
                    </td>
                  </tr>
                ))}
              </tbody>
            </table>
          </div>
        )}
      </div>

      {/* Shared Modal Components */}
      <CreateHospitalModal 
        isOpen={showModal} 
        onClose={() => setShowModal(false)} 
        onSuccess={fetchHospitals} 
      />

      <CreateStaffModal 
        isOpen={!!selectedHospitalForAdmin}
        onClose={() => setSelectedHospitalForAdmin(null)}
        onSuccess={fetchHospitals}
        hospitalId={selectedHospitalForAdmin?._id}
        hospitalName={selectedHospitalForAdmin?.name}
      />
    </div>
  );
}
