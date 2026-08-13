import { useState, useEffect } from "react";
import { useSelector } from "react-redux";
import CardSkeleton from "../../../shared/components/CardSkeleton";
import { Pill, Search, FileText, Calendar, Printer, X, Loader2, RefreshCw } from "lucide-react";
import { usePatient } from "../hook/usePatient";
import apiClient from "../../../shared/service/apiClient";
import toast from "react-hot-toast";

export default function PatientPrescriptions() {
  const { activeProfile } = useSelector((state) => state.patient);
  const { getPrescriptions, loading } = usePatient();
  const [prescriptions, setPrescriptions] = useState([]);
  const [previewPdfUrl, setPreviewPdfUrl] = useState(null);
  const [downloadingId, setDownloadingId] = useState(null);

  useEffect(() => {
    const fetchPrescriptions = async () => {
      if (activeProfile?._id) {
        const data = await getPrescriptions(activeProfile._id);
        setPrescriptions(data);
      }
    };
    fetchPrescriptions();
    // eslint-disable-next-line react-hooks/exhaustive-deps
  }, [activeProfile?._id]);

  const handlePreview = async (prescId) => {
    try {
      setDownloadingId(prescId);
      const response = await apiClient.get(`/prescriptions/${prescId}/pdf?format=base64`);
      
      const { pdfBase64 } = response.data;
      
      // Use data URI to bypass IDM blob interception entirely
      const dataUri = `data:application/pdf;base64,${pdfBase64}`;
      setPreviewPdfUrl(dataUri);
    } catch (error) {
      toast.error("Failed to load PDF preview");
    } finally {
      setDownloadingId(null);
    }
  };

  const closePreview = () => {
    setPreviewPdfUrl(null);
  };

  return (
    <div className="max-w-6xl mx-auto space-y-6">
      {/* Header */}
      <div className="flex flex-col sm:flex-row sm:items-center justify-between gap-4">
        <div>
          <h1 className="text-2xl font-bold text-slate-900 dark:text-white">Prescriptions</h1>
          <p className="text-sm text-slate-500 dark:text-slate-400 mt-1">View and download your digital prescriptions</p>
        </div>
        <button 
          onClick={() => {
            if (activeProfile?._id) {
              getPrescriptions(activeProfile._id).then(setPrescriptions);
            }
          }}
          className="p-2 w-fit text-slate-500 hover:text-blue-600 bg-white dark:bg-slate-800 border border-slate-200 dark:border-slate-700 hover:bg-blue-50 dark:hover:bg-slate-700 rounded-xl shadow-sm transition-colors cursor-pointer"
          title="Refresh"
        >
          <RefreshCw className="w-5 h-5 " />
        </button>
      </div>

      {/* Content */}
      <div className="bg-white dark:bg-slate-800 border border-slate-200 dark:border-slate-700 rounded-2xl shadow-sm overflow-hidden">
        {loading && prescriptions.length === 0 ? (
          <CardSkeleton count={3} />
        ) : prescriptions.length === 0 ? (
          <div className="text-center py-20">
            <Pill className="w-16 h-16 text-slate-300 dark:text-slate-600 mx-auto mb-4" />
            <h3 className="text-lg font-bold text-slate-900 dark:text-white">No Prescriptions</h3>
            <p className="text-slate-500 dark:text-slate-400 mt-1">You don't have any prescriptions yet.</p>
          </div>
        ) : (
          <div className="divide-y divide-slate-100 dark:divide-slate-700">
            {prescriptions.map((presc) => (
              <div key={presc._id} className="p-6 hover:bg-slate-50 dark:hover:bg-slate-900/50 transition-colors">
                <div className="flex flex-col md:flex-row md:items-center justify-between gap-4 mb-4">
                  <div className="flex items-center gap-4">
                    <div className="w-12 h-12 rounded-xl bg-emerald-50 dark:bg-emerald-900/20 flex items-center justify-center text-emerald-600 dark:text-emerald-400">
                      <FileText className="w-6 h-6" />
                    </div>
                    <div>
                      <h3 className="font-bold text-slate-900 dark:text-white text-lg">
                        Prescribed by Dr. {presc.doctorId?.firstName} {presc.doctorId?.lastName}
                      </h3>
                      <div className="flex items-center gap-3 text-sm text-slate-500 dark:text-slate-400 mt-1">
                        <span className="flex items-center gap-1">
                          <Calendar className="w-4 h-4" />
                          {new Date(presc.createdAt).toLocaleDateString("en-US", { month: "short", day: "2-digit", year: "numeric" })}
                        </span>
                        {presc.diagnosis && (
                          <span className="bg-slate-100 dark:bg-slate-800 px-2 py-0.5 rounded text-xs">
                            {presc.diagnosis}
                          </span>
                        )}
                      </div>
                    </div>
                  </div>
                  
                  <button 
                    onClick={() => handlePreview(presc._id)}
                    disabled={downloadingId === presc._id}
                    className="inline-flex items-center gap-2 px-4 py-2 border border-slate-200 dark:border-slate-700 hover:bg-slate-50 dark:hover:bg-slate-800 text-slate-700 dark:text-slate-300 text-sm font-medium rounded-xl transition-colors disabled:opacity-70 disabled:cursor-not-allowed cursor-pointer"
                  >
                    {downloadingId === presc._id ? <Loader2 className="w-4 h-4 animate-spin" /> : <Printer className="w-4 h-4" />}
                    {downloadingId === presc._id ? 'Loading...' : 'Preview / Print'}
                  </button>
                </div>

                {/* Medicines Table */}
                <div className="mt-4 bg-slate-50 dark:bg-slate-900/30 rounded-xl overflow-hidden border border-slate-100 dark:border-slate-700">
                  <table className="w-full text-left text-sm">
                    <thead className="bg-slate-100/50 dark:bg-slate-800/50 text-slate-500 dark:text-slate-400 text-xs font-semibold uppercase">
                      <tr>
                        <th className="px-4 py-3">Medicine</th>
                        <th className="px-4 py-3">Dosage</th>
                        <th className="px-4 py-3">Frequency</th>
                        <th className="px-4 py-3">Duration</th>
                        <th className="px-4 py-3">Instructions</th>
                      </tr>
                    </thead>
                    <tbody className="divide-y divide-slate-100 dark:divide-slate-700/50">
                      {presc.medicines?.map((med, i) => (
                        <tr key={i}>
                          <td className="px-4 py-3 font-medium text-slate-900 dark:text-white">{med.name}</td>
                          <td className="px-4 py-3 text-slate-600 dark:text-slate-300">{med.dosage}</td>
                          <td className="px-4 py-3 text-slate-600 dark:text-slate-300">{med.frequency}</td>
                          <td className="px-4 py-3 text-slate-600 dark:text-slate-300">{med.durationDays} days</td>
                          <td className="px-4 py-3 text-slate-600 dark:text-slate-300">{med.instructions || "-"}</td>
                        </tr>
                      ))}
                    </tbody>
                  </table>
                </div>
              </div>
            ))}
          </div>
        )}
      </div>

      {/* PDF Preview Modal */}
      {previewPdfUrl && (
        <div className="fixed inset-0 z-50 flex items-center justify-center p-4 bg-slate-900/50 backdrop-blur-sm">
          <div className="bg-white dark:bg-slate-800 rounded-2xl shadow-xl w-full max-w-4xl h-[90vh] flex flex-col overflow-hidden border border-slate-200 dark:border-slate-700">
            <div className="flex items-center justify-between px-6 py-4 border-b border-slate-100 dark:border-slate-700">
              <h3 className="font-bold text-lg text-slate-900 dark:text-white">Prescription Preview</h3>
              <button 
                onClick={closePreview}
                className="p-2 hover:bg-slate-100 dark:hover:bg-slate-700 rounded-full text-slate-500 transition-colors cursor-pointer"
              >
                <X className="w-5 h-5" />
              </button>
            </div>
            <div className="flex-1 bg-slate-100 dark:bg-slate-900 w-full h-full">
              <object 
                data={`${previewPdfUrl}#toolbar=1&navpanes=0&scrollbar=1`} 
                type="application/pdf" 
                className="w-full h-full border-none"
                title="Prescription PDF"
              >
                <div className="flex flex-col items-center justify-center h-full p-6 text-center">
                  <p className="text-slate-500 mb-4">It looks like a download manager (like IDM) is blocking the preview.</p>
                  <a 
                    href={previewPdfUrl} 
                    download="Prescription.pdf"
                    className="px-6 py-2 bg-blue-600 text-white font-medium rounded-lg hover:bg-blue-700 transition-colors"
                  >
                    Download PDF instead
                  </a>
                </div>
              </object>
            </div>
          </div>
        </div>
      )}
    </div>
  );
}
