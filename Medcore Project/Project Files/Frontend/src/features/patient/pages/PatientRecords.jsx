import { ClipboardList, Download, FileText, FlaskConical, RefreshCw } from "lucide-react";
import { useEffect, useState } from "react";
import { useDispatch, useSelector } from "react-redux";
import { getMyLabRecordsService } from "../service/lab.service";
import { setLabRecordsData } from "../state/patientSlice";
import toast from "react-hot-toast";
import CardSkeleton from "../../../shared/components/CardSkeleton";

export default function PatientRecords() {
  const [isRefreshing, setIsRefreshing] = useState(false);
  const dispatch = useDispatch();
  const { activeProfile, labRecords: cachedRecords } = useSelector((state) => state.patient);
  const [labOrders, setLabOrders] = useState(cachedRecords || []);
  const [isLoading, setIsLoading] = useState(false);

  const fetchRecords = async () => {
    try {
      if (labOrders.length === 0) setIsLoading(true);
      const orders = await getMyLabRecordsService(activeProfile._id);
      const myOrders = orders.filter((o) => o.overallStatus === "completed");
      dispatch(setLabRecordsData(myOrders));
      setLabOrders(myOrders);
    } catch (error) {
      console.error("Failed to fetch records:", error);
      toast.error("Failed to load medical records");
    } finally {
      setIsLoading(false);
    }
  };

  useEffect(() => {
    if (activeProfile?._id) {
      if (!cachedRecords || cachedRecords.length === 0) {
        fetchRecords();
      } else {
        setLabOrders(cachedRecords);
      }
    }
    // eslint-disable-next-line react-hooks/exhaustive-deps
  }, [activeProfile]);


  return (
    <div className="max-w-6xl mx-auto space-y-6">
      {/* Header */}
      <div className="flex flex-col sm:flex-row sm:items-center justify-between gap-4">
        <div>
          <h1 className="text-2xl font-bold text-slate-900 dark:text-white">Medical Records</h1>
          <p className="text-sm text-slate-500 dark:text-slate-400 mt-1">View your lab reports and medical documents</p>
        </div>
        <button 
          onClick={async () => { setIsRefreshing(true); if (activeProfile?._id) { await fetchRecords(); } setIsRefreshing(false); }}
          className="p-2 w-fit text-slate-500 hover:text-blue-600 bg-white dark:bg-slate-800 border border-slate-200 dark:border-slate-700 hover:bg-blue-50 dark:hover:bg-slate-700 rounded-xl shadow-sm transition-colors cursor-pointer"
          title="Refresh"
        >
          <RefreshCw className={`w-5 h-5 ${isRefreshing ? 'animate-spin' : ''}`} />
        </button>
      </div>

      {(isLoading || isRefreshing) ? (
        <div className="grid gap-4 md:grid-cols-2 lg:grid-cols-3">
          {Array(3).fill(0).map((_, i) => <CardSkeleton key={i} />)}
        </div>
      ) : labOrders.length === 0 ? (
        <div className="bg-white dark:bg-slate-800 border border-slate-200 dark:border-slate-700 rounded-2xl shadow-sm overflow-hidden flex flex-col items-center justify-center py-24">
          <div className="w-16 h-16 bg-blue-50 dark:bg-blue-900/20 rounded-full flex items-center justify-center mb-4">
            <ClipboardList className="w-8 h-8 text-blue-500 dark:text-blue-400" />
          </div>
          <h3 className="text-lg font-bold text-slate-900 dark:text-white">No Records Found</h3>
          <p className="text-slate-500 dark:text-slate-400 mt-2 max-w-sm text-center">
            You don't have any finalized lab reports or medical records yet.
          </p>
        </div>
      ) : (
        <div className="grid gap-4 md:grid-cols-2 lg:grid-cols-3">
          {labOrders.map((order) => (
            <div key={order._id} className="bg-white dark:bg-slate-800 rounded-xl border border-slate-200 dark:border-slate-700 p-5 shadow-sm hover:shadow-md transition-shadow">
              <div className="flex justify-between items-start mb-4">
                <div className="w-10 h-10 rounded-full bg-blue-50 dark:bg-blue-900/20 flex items-center justify-center">
                  <FlaskConical className="w-5 h-5 text-blue-600 dark:text-blue-400" />
                </div>
                <span className="text-xs font-semibold px-2.5 py-0.5 rounded-full bg-green-100 text-green-700 dark:bg-green-900/30 dark:text-green-400">
                  Completed
                </span>
              </div>
              
              <h3 className="text-lg font-bold text-slate-900 dark:text-white mb-1">
                Lab Report
              </h3>
              <p className="text-sm text-slate-500 dark:text-slate-400 mb-4">
                Order: {order.orderNumber}
              </p>

              <div className="space-y-2 mb-6">
                {order.tests.map((test, idx) => (
                  <div key={idx} className="flex items-center gap-2 text-sm text-slate-700 dark:text-slate-300">
                    <FileText className="w-4 h-4 text-slate-400" />
                    <span>{test.name}</span>
                  </div>
                ))}
                <p className="text-xs text-slate-400 mt-2">
                  Date: {new Date(order.createdAt).toLocaleDateString()}
                </p>
              </div>

              {/* Find the first test that has a reportUrl */}
              {order.tests.find((t) => t.result?.reportUrl) ? (
                <a 
                  href={order.tests.find((t) => t.result?.reportUrl).result.reportUrl} 
                  target="_blank" 
                  rel="noreferrer"
                  className="w-full py-2 bg-slate-100 hover:bg-slate-200 dark:bg-slate-700 dark:hover:bg-slate-600 text-slate-700 dark:text-white text-sm font-medium rounded-lg flex items-center justify-center gap-2 transition-colors cursor-pointer"
                >
                  <Download className="w-4 h-4" />
                  Download PDF
                </a>
              ) : (
                <button disabled className="w-full py-2 bg-slate-50 dark:bg-slate-800 text-slate-400 text-sm font-medium rounded-lg flex items-center justify-center gap-2 border border-slate-200 dark:border-slate-700 cursor-not-allowed cursor-pointer">
                  No PDF Available
                </button>
              )}
            </div>
          ))}
        </div>
      )}
    </div>
  );
}
