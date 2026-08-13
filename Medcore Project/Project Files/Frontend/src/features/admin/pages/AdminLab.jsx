import { useState, useEffect } from "react";
import { FlaskConical, Search, RefreshCw, AlertCircle, FileText, CheckCircle2, ChevronRight, Download, Trash2 } from "lucide-react";
import apiClient from "../../../shared/service/apiClient";
import toast from "react-hot-toast";
import CardSkeleton from "../../../shared/components/CardSkeleton";

export default function AdminLab() {
  const [isRefreshing, setIsRefreshing] = useState(false);
  const [labOrders, setLabOrders] = useState([]);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState(null);
  const [search, setSearch] = useState("");
  const [activeTab, setActiveTab] = useState("pending"); // pending, completed

  // Modal State
  const [showModal, setShowModal] = useState(false);
  const [selectedOrder, setSelectedOrder] = useState(null);
  const [selectedTest, setSelectedTest] = useState(null);
  const [submitting, setSubmitting] = useState(false);
  
  // Form Data (Array of result parameters)
  const [results, setResults] = useState([]);
  const [notes, setNotes] = useState("");

  const fetchLabOrders = async () => {
    try {
      setLoading(true);
      setError(null);
      
      const res = await apiClient.get(`/lab-orders`);
      let orders = res.data.orders || [];
      
      // Filter based on tab
      if (activeTab === "completed") {
        orders = orders.filter(o => o.overallStatus === "completed");
      } else {
        orders = orders.filter(o => o.overallStatus === "pending" || o.overallStatus === "partial");
      }

      // Filter by search
      if (search) {
        const s = search.toLowerCase();
        orders = orders.filter(o => 
          o.orderNumber?.toLowerCase().includes(s) ||
          o.patientId?.firstName?.toLowerCase().includes(s) ||
          o.patientId?.lastName?.toLowerCase().includes(s) ||
          o.patientId?.mrn?.toLowerCase().includes(s)
        );
      }

      setLabOrders(orders);
    } catch (err) {
      setError("Failed to fetch lab orders.");
      toast.error(err.response?.data?.message || "Error fetching lab orders");
    } finally {
      setLoading(false);
    }
  };

  useEffect(() => {
    const timer = setTimeout(() => {
      fetchLabOrders();
    }, 500);
    return () => clearTimeout(timer);
  }, [search, activeTab]);

  const openEnterResults = (order, test) => {
    setSelectedOrder(order);
    setSelectedTest(test);
    setNotes("");

    // Initialize default parameters based on test name
    const defaultParams = getDefaultParams(test.name);
    setResults(defaultParams);
    
    setShowModal(true);
  };

  const getDefaultParams = (testName) => {
    const name = testName.toLowerCase();
    if (name.includes("cbc") || name.includes("blood count")) {
      return [
        { parameter: "WBC", value: "", unit: "x10^3/uL", refRange: "4.5 - 11.0", flag: "Normal" },
        { parameter: "RBC", value: "", unit: "x10^6/uL", refRange: "4.5 - 5.9", flag: "Normal" },
        { parameter: "Hemoglobin", value: "", unit: "g/dL", refRange: "13.5 - 17.5", flag: "Normal" },
        { parameter: "Platelets", value: "", unit: "x10^3/uL", refRange: "150 - 450", flag: "Normal" },
      ];
    } else if (name.includes("lipid")) {
      return [
        { parameter: "Total Cholesterol", value: "", unit: "mg/dL", refRange: "< 200", flag: "Normal" },
        { parameter: "HDL", value: "", unit: "mg/dL", refRange: "> 40", flag: "Normal" },
        { parameter: "LDL", value: "", unit: "mg/dL", refRange: "< 100", flag: "Normal" },
        { parameter: "Triglycerides", value: "", unit: "mg/dL", refRange: "< 150", flag: "Normal" },
      ];
    } else if (name.includes("sugar") || name.includes("glucose")) {
      return [
        { parameter: "Fasting Blood Sugar", value: "", unit: "mg/dL", refRange: "70 - 100", flag: "Normal" },
      ];
    }
    // Generic fallback
    return [
      { parameter: "Result", value: "", unit: "", refRange: "", flag: "Normal" }
    ];
  };

  const handleResultChange = (index, field, value) => {
    const newResults = [...results];
    newResults[index][field] = value;
    
    // Auto-calculate flags if possible
    if (field === "value" && newResults[index].refRange) {
        const numVal = parseFloat(value);
        if (!isNaN(numVal)) {
            const range = newResults[index].refRange;
            if (range.includes("-")) {
                const [minStr, maxStr] = range.split("-");
                const min = parseFloat(minStr);
                const max = parseFloat(maxStr);
                if (!isNaN(min) && !isNaN(max)) {
                    if (numVal < min) newResults[index].flag = "Low";
                    else if (numVal > max) newResults[index].flag = "High";
                    else newResults[index].flag = "Normal";
                }
            } else if (range.includes("<")) {
                const max = parseFloat(range.replace("<", ""));
                if (!isNaN(max)) {
                    if (numVal >= max) newResults[index].flag = "High";
                    else newResults[index].flag = "Normal";
                }
            } else if (range.includes(">")) {
                const min = parseFloat(range.replace(">", ""));
                if (!isNaN(min)) {
                    if (numVal <= min) newResults[index].flag = "Low";
                    else newResults[index].flag = "Normal";
                }
            }
        }
    }
    
    setResults(newResults);
  };

  const handleDeleteOrder = async (orderId) => {
    if (!window.confirm("Are you sure you want to delete this lab order? This action cannot be undone.")) return;
    
    try {
      await apiClient.delete(`/lab-orders/${orderId}`);
      toast.success("Lab order deleted successfully");
      fetchLabOrders();
    } catch (err) {
      toast.error(err.response?.data?.message || "Failed to delete lab order");
    }
  };

  const handleSubmit = async (e) => {
    e.preventDefault();
    try {
      setSubmitting(true);
      await apiClient.patch(`/lab-orders/${selectedOrder._id}/results`, {
        testName: selectedTest.name,
        resultData: {
          values: results.filter(r => r.value.trim() !== ""), // only send filled values
          notes: notes
        }
      });
      
      toast.success("Test results saved successfully");
      setShowModal(false);
      fetchLabOrders(); // Refresh the list
    } catch (err) {
      toast.error(err.response?.data?.message || "Failed to save results");
    } finally {
      setSubmitting(false);
    }
  };

  return (
    <div className="space-y-6 max-w-7xl mx-auto">
      {/* Header */}
      <div className="flex flex-col sm:flex-row sm:items-center justify-between gap-4">
        <div>
          <h2 className="text-xl font-bold text-slate-900 dark:text-white flex items-center gap-2">
            <FlaskConical className="w-6 h-6 text-purple-500" />
            Laboratory Central
          </h2>
          <p className="text-sm text-slate-500 dark:text-slate-400 mt-0.5">
            Manage lab orders and enter test results.
          </p>
        </div>
        
        <div className="flex flex-col sm:flex-row items-center gap-3 w-full sm:w-auto">
          <div className="relative w-full sm:w-64">
            <Search className="w-4 h-4 text-slate-400 absolute left-3 top-1/2 -translate-y-1/2" />
            <input 
              type="text" 
              placeholder="Search by order no, patient..."
              value={search}
              onChange={e => setSearch(e.target.value)}
              className="w-full pl-9 pr-4 py-2 bg-white dark:bg-slate-800 border border-slate-200 dark:border-slate-700 rounded-xl text-sm focus:ring-2 focus:ring-purple-500 outline-none"
            />
          </div>
          <button 
            onClick={async () => { setIsRefreshing(true); await fetchLabOrders(); setIsRefreshing(false); }}
            className="p-2 text-slate-500 hover:text-purple-600 bg-white dark:bg-slate-800 border border-slate-200 dark:border-slate-700 hover:bg-purple-50 dark:hover:bg-slate-700 rounded-xl shadow-sm transition-colors"
            title="Refresh"
          >
            <RefreshCw className={`w-4 h-4 ${isRefreshing ? 'animate-spin' : ''}`} />
          </button>
        </div>
      </div>

      {/* Tabs */}
      <div className="flex items-center gap-4 border-b border-slate-200 dark:border-slate-700">
        <button
          onClick={() => setActiveTab('pending')}
          className={`px-4 py-2 text-sm font-bold border-b-2 transition-colors ${
            activeTab === 'pending' 
              ? 'border-purple-500 text-purple-600 dark:text-purple-500' 
              : 'border-transparent text-slate-500 hover:text-slate-700 dark:hover:text-slate-300'
          }`}
        >
          Pending Tests
        </button>
        <button
          onClick={() => setActiveTab('completed')}
          className={`px-4 py-2 text-sm font-bold border-b-2 transition-colors flex items-center gap-2 ${
            activeTab === 'completed' 
              ? 'border-purple-500 text-purple-600 dark:text-purple-500' 
              : 'border-transparent text-slate-500 hover:text-slate-700 dark:hover:text-slate-300'
          }`}
        >
          Completed Orders
        </button>
      </div>

      {/* Content Area */}
      <div className="bg-white dark:bg-slate-800 rounded-2xl border border-slate-200 dark:border-slate-700 shadow-sm overflow-hidden flex flex-col">
        {((loading && labOrders.length === 0) || isRefreshing) ? (
          <div className="flex flex-col gap-4 p-4">
            {Array(3).fill(0).map((_, i) => <CardSkeleton key={i} />)}
          </div>
        ) : error ? (
          <div className="flex flex-col items-center justify-center py-20 text-red-500 gap-2">
            <AlertCircle className="w-8 h-8" />
            <span className="font-medium">{error}</span>
          </div>
        ) : labOrders.length === 0 ? (
          <div className="flex flex-col items-center justify-center py-20 text-slate-400">
            <FileText className="w-14 h-14 mb-4 text-slate-300 dark:text-slate-600" />
            <p className="font-medium text-slate-600 dark:text-slate-300">
              No lab orders found.
            </p>
          </div>
        ) : (
          <div className="divide-y divide-slate-100 dark:divide-slate-700">
            {labOrders.map((order) => (
              <div key={order._id} className="p-6 hover:bg-slate-50 dark:hover:bg-slate-900/50 transition-colors">
                <div className="flex flex-col md:flex-row md:items-center justify-between gap-4 mb-4">
                  <div>
                    <div className="flex items-center gap-3">
                        <h3 className="font-bold text-slate-900 dark:text-white text-lg">
                        {order.patientId?.firstName} {order.patientId?.lastName} <span className="text-sm font-normal text-slate-500">({order.patientId?.mrn})</span>
                        </h3>
                        <span className={`px-2 py-0.5 rounded-full text-xs font-medium ${
                            order.priority === 'stat' ? 'bg-red-100 text-red-700' :
                            order.priority === 'urgent' ? 'bg-orange-100 text-orange-700' :
                            'bg-blue-100 text-blue-700'
                        }`}>
                            {order.priority.toUpperCase()}
                        </span>
                    </div>
                    <div className="text-sm text-slate-500 dark:text-slate-400 mt-1 flex flex-wrap items-center gap-4">
                      <span>Order: <span className="font-mono">{order.orderNumber}</span></span>
                      <span>Doctor: Dr. {order.orderedByDoctorId?.lastName}</span>
                      <span>Date: {new Date(order.createdAt).toLocaleString()}</span>
                    </div>
                  </div>
                  <div className="flex items-center gap-3">
                    <span className={`px-3 py-1 rounded-lg text-sm font-medium ${
                      order.overallStatus === 'completed' ? 'bg-green-100 text-green-700 dark:bg-green-900/30 dark:text-green-400' :
                      order.overallStatus === 'partial' ? 'bg-yellow-100 text-yellow-700 dark:bg-yellow-900/30 dark:text-yellow-400' :
                      'bg-slate-100 text-slate-700 dark:bg-slate-700 dark:text-slate-300'
                    }`}>
                      {order.overallStatus.toUpperCase()}
                    </span>
                    <button 
                      onClick={() => handleDeleteOrder(order._id)}
                      className="p-1.5 text-red-400 hover:text-red-600 hover:bg-red-50 dark:hover:bg-red-900/20 rounded-lg transition-colors"
                      title="Delete Order"
                    >
                      <Trash2 className="w-5 h-5" />
                    </button>
                  </div>
                </div>

                {/* Tests List */}
                <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-3 gap-4 mt-4">
                    {order.tests.map((test, idx) => (
                        <div key={idx} className="bg-slate-50 dark:bg-slate-800/80 border border-slate-200 dark:border-slate-700 rounded-xl p-4 flex flex-col justify-between">
                            <div>
                                <h4 className="font-bold text-slate-800 dark:text-slate-200">{test.name}</h4>
                                <p className="text-xs text-slate-500 mt-1">Sample: {test.sampleType || "N/A"}</p>
                            </div>
                            <div className="mt-4 pt-3 border-t border-slate-200 dark:border-slate-700 flex items-center justify-between">
                                <span className={`text-xs font-semibold ${test.status === 'completed' ? 'text-green-600' : 'text-amber-600'}`}>
                                    {test.status === 'completed' ? "RESULTS ENTERED" : "PENDING"}
                                </span>
                                
                                {test.status !== 'completed' ? (
                                    <button 
                                        onClick={() => openEnterResults(order, test)}
                                        className="text-xs bg-white dark:bg-slate-700 border border-slate-200 dark:border-slate-600 px-3 py-1.5 rounded-lg font-medium text-purple-600 dark:text-purple-400 hover:bg-purple-50 dark:hover:bg-slate-600 transition-colors"
                                    >
                                        Enter Results
                                    </button>
                                ) : (
                                    test.result?.reportUrl ? (
                                        <a href={test.result.reportUrl} target="_blank" rel="noreferrer" className="text-xs flex items-center gap-1 text-blue-600 hover:underline">
                                            <Download className="w-3.5 h-3.5" /> View PDF
                                        </a>
                                    ) : (
                                        <span className="text-xs text-slate-400">PDF processing...</span>
                                    )
                                )}
                            </div>
                        </div>
                    ))}
                </div>
              </div>
            ))}
          </div>
        )}
      </div>

      {/* Enter Results Modal */}
      {showModal && selectedTest && (
        <div className="fixed inset-0 z-50 flex items-center justify-center p-4 bg-slate-900/50 backdrop-blur-sm overflow-y-auto">
          <div className="bg-white dark:bg-slate-900 rounded-2xl shadow-xl w-full max-w-4xl border border-slate-200 dark:border-slate-800 overflow-hidden my-8">
            <div className="px-6 py-4 border-b border-slate-200 dark:border-slate-800 flex justify-between items-center bg-slate-50/50 dark:bg-slate-900/50">
              <h3 className="text-lg font-bold text-slate-900 dark:text-white flex items-center gap-2">
                <FlaskConical className="w-5 h-5 text-purple-500" /> Enter Results: {selectedTest.name}
              </h3>
            </div>
            
            <form onSubmit={handleSubmit} className="p-6">
              
              <div className="bg-purple-50 dark:bg-purple-900/10 p-4 rounded-xl border border-purple-100 dark:border-purple-900/30 mb-6">
                <p className="text-sm text-purple-800 dark:text-purple-300">
                  <strong>Patient:</strong> {selectedOrder?.patientId?.firstName} {selectedOrder?.patientId?.lastName} ({selectedOrder?.patientId?.mrn})
                </p>
                <p className="text-sm text-purple-800 dark:text-purple-300 mt-1">
                  <strong>Order No:</strong> {selectedOrder?.orderNumber}
                </p>
              </div>

              <div className="overflow-x-auto mb-6">
                <table className="w-full text-left text-sm">
                    <thead className="bg-slate-50 dark:bg-slate-800 text-slate-500 dark:text-slate-400 text-xs uppercase border-b border-slate-200 dark:border-slate-700">
                        <tr>
                            <th className="px-4 py-3">Parameter</th>
                            <th className="px-4 py-3">Result Value</th>
                            <th className="px-4 py-3">Unit</th>
                            <th className="px-4 py-3">Ref Range</th>
                            <th className="px-4 py-3">Flag</th>
                            <th className="px-4 py-3 w-10"></th>
                        </tr>
                    </thead>
                    <tbody className="divide-y divide-slate-100 dark:divide-slate-700/50">
                        {results.map((row, index) => (
                            <tr key={index}>
                                <td className="px-4 py-2">
                                    <input type="text" value={row.parameter} onChange={e => handleResultChange(index, 'parameter', e.target.value)} required
                                        className="w-full px-3 py-1.5 bg-slate-50 dark:bg-slate-800 border border-slate-200 dark:border-slate-700 rounded-lg text-sm outline-none" />
                                </td>
                                <td className="px-4 py-2">
                                    <input type="text" value={row.value} onChange={e => handleResultChange(index, 'value', e.target.value)} required
                                        className="w-full px-3 py-1.5 bg-slate-50 dark:bg-slate-800 border border-slate-200 dark:border-slate-700 rounded-lg text-sm outline-none focus:ring-2 focus:ring-purple-500" />
                                </td>
                                <td className="px-4 py-2">
                                    <input type="text" value={row.unit} onChange={e => handleResultChange(index, 'unit', e.target.value)}
                                        className="w-full px-3 py-1.5 bg-transparent border-0 text-slate-600 dark:text-slate-400 outline-none" />
                                </td>
                                <td className="px-4 py-2">
                                    <input type="text" value={row.refRange} onChange={e => handleResultChange(index, 'refRange', e.target.value)}
                                        className="w-full px-3 py-1.5 bg-transparent border-0 text-slate-600 dark:text-slate-400 outline-none" />
                                </td>
                                <td className="px-4 py-2">
                                    <select value={row.flag} onChange={e => handleResultChange(index, 'flag', e.target.value)}
                                        className={`w-full px-3 py-1.5 bg-slate-50 dark:bg-slate-800 border border-slate-200 dark:border-slate-700 rounded-lg text-sm outline-none ${row.flag === 'High' ? 'text-red-500 font-bold' : row.flag === 'Low' ? 'text-orange-500 font-bold' : ''}`}>
                                        <option value="Normal">Normal</option>
                                        <option value="High">High (H)</option>
                                        <option value="Low">Low (L)</option>
                                    </select>
                                </td>
                                <td className="px-4 py-2 text-center">
                                    <button type="button" onClick={() => setResults(results.filter((_, i) => i !== index))} className="text-red-400 hover:text-red-600 font-bold text-xl">&times;</button>
                                </td>
                            </tr>
                        ))}
                    </tbody>
                </table>
                <button type="button" onClick={() => setResults([...results, {parameter: "", value: "", unit: "", refRange: "", flag: "Normal"}])}
                    className="mt-3 text-sm text-purple-600 font-medium hover:underline flex items-center gap-1 px-4">
                    + Add Parameter
                </button>
              </div>

              <div className="mb-6">
                <label className="text-sm font-medium text-slate-700 dark:text-slate-300 mb-1.5 block">Additional Notes / Remarks</label>
                <textarea 
                    value={notes}
                    onChange={e => setNotes(e.target.value)}
                    rows={2}
                    className="w-full px-4 py-2 bg-slate-50 dark:bg-slate-800 border border-slate-200 dark:border-slate-700 rounded-xl text-sm outline-none"
                    placeholder="E.g., Sample was slightly hemolyzed"
                ></textarea>
              </div>

              <div className="pt-4 border-t border-slate-200 dark:border-slate-800 flex items-center justify-end gap-3">
                <button type="button" onClick={() => setShowModal(false)}
                  className="px-4 py-2 text-sm font-medium text-slate-600 dark:text-slate-400 hover:bg-slate-100 dark:hover:bg-slate-800 rounded-xl transition-colors">
                  Cancel
                </button>
                <button type="submit" disabled={submitting}
                  className="flex items-center gap-2 px-6 py-2 bg-purple-600 hover:bg-purple-700 text-white text-sm font-semibold rounded-xl disabled:opacity-70 transition-colors shadow-sm">
                  {submitting ? <RefreshCw className="w-4 h-4 animate-spin" /> : <CheckCircle2 className="w-4 h-4" />}
                  Save Results
                </button>
              </div>
            </form>
          </div>
        </div>
      )}
    </div>
  );
}
