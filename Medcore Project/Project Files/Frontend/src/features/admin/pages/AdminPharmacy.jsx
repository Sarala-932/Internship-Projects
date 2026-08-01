import { useState, useEffect } from "react";
import { Pill, Plus, RefreshCw, AlertCircle, Search, Package, IndianRupee, Calendar, FileText, CheckCircle2 } from "lucide-react";
import apiClient from "../../../shared/service/apiClient";
import toast from "react-hot-toast";
import { useRealtime } from "../../../shared/hooks/useRealtime";
import Pagination from "../../../shared/components/Pagination";

export default function AdminPharmacy() {
  const [activeTab, setActiveTab] = useState("inventory"); // 'inventory' | 'prescriptions'
  
  const [inventory, setInventory] = useState([]);
  const [pendingPrescriptions, setPendingPrescriptions] = useState([]);
  const [loading, setLoading] = useState(true);
  
  // Search & Pagination
  const [searchInput, setSearchInput] = useState("");
  const [search, setSearch] = useState("");
  const [page, setPage] = useState(1);
  const [limit] = useState(10);
  const [meta, setMeta] = useState(null);
  
  const [error, setError] = useState(null);

  // Modal State - Inventory
  const [showModal, setShowModal] = useState(false);
  const [editItem, setEditItem] = useState(null);
  const [submitting, setSubmitting] = useState(false);
  const [formData, setFormData] = useState({
    medicineName: "", genericName: "", category: "tablet", batchNumber: "", quantity: 0, unitPrice: 0, mrp: 0, expiryDate: ""
  });

  // Modal State - Dispense
  const [showDispenseModal, setShowDispenseModal] = useState(false);
  const [selectedPrescription, setSelectedPrescription] = useState(null);
  const [dispenseItems, setDispenseItems] = useState([]); 

  const fetchInventory = async () => {
    try {
      setLoading(true);
      setError(null);
      let url = `/pharmacy/inventory?page=${page}&limit=${limit}`;
      if (search) url += `&search=${encodeURIComponent(search)}`;
      
      const res = await apiClient.get(url);
      setInventory(res.data.inventory || []);
      setMeta(res.data.meta || null);
    } catch (err) {
      setError("Failed to fetch inventory.");
      toast.error(err.response?.data?.message || "Error fetching inventory");
    } finally {
      setLoading(false);
    }
  };

  const fetchPendingPrescriptions = async () => {
    try {
      setLoading(true);
      setError(null);
      const res = await apiClient.get("/prescriptions/pending");
      setPendingPrescriptions(res.data.prescriptions || []);
    } catch (err) {
      setError("Failed to fetch pending prescriptions.");
      toast.error(err.response?.data?.message || "Error fetching prescriptions");
    } finally {
      setLoading(false);
    }
  };

  // Debounce search input
  useEffect(() => {
    const timer = setTimeout(() => {
      setSearch(searchInput);
      setPage(1);
    }, 500);
    return () => clearTimeout(timer);
  }, [searchInput]);

  useEffect(() => {
    if (activeTab === "inventory") {
      fetchInventory();
    } else {
      fetchPendingPrescriptions();
    }
  }, [search, activeTab, page]);

  useRealtime("pharmacy", () => {
    if (activeTab === "inventory") fetchInventory();
    else fetchPendingPrescriptions();
  });

  const handleAddStock = async (e) => {
    e.preventDefault();
    try {
      setSubmitting(true);
      const payload = {
        ...formData,
        quantity: Number(formData.quantity),
        unitPrice: Number(formData.unitPrice),
        mrp: Number(formData.mrp)
      };
      
      let res;
      if (editItem) {
        res = await apiClient.patch(`/pharmacy/inventory/${editItem._id}`, payload);
        toast.success(res.data.message || "Stock updated successfully");
      } else {
        res = await apiClient.post("/pharmacy/inventory", payload);
        toast.success(res.data.message || "Stock added successfully");
      }
      
      closeModal();
      fetchInventory();
    } catch (err) {
      toast.error(err.response?.data?.message || "Failed to save stock");
    } finally {
      setSubmitting(false);
    }
  };

  const openEditModal = (item) => {
    setEditItem(item);
    setFormData({
      medicineName: item.medicineName, genericName: item.genericName || "", category: item.category,
      batchNumber: item.batchNumber, quantity: item.quantity, unitPrice: item.unitPrice, mrp: item.mrp,
      expiryDate: new Date(item.expiryDate).toISOString().split('T')[0]
    });
    setShowModal(true);
  };

  const openAddModal = () => {
    setEditItem(null);
    setFormData({
      medicineName: "", genericName: "", category: "tablet", batchNumber: "", quantity: 0, unitPrice: 0, mrp: 0, expiryDate: ""
    });
    setShowModal(true);
  };

  const closeModal = () => {
    setShowModal(false);
    setEditItem(null);
  };

  const openDispenseModal = (prescription) => {
    setSelectedPrescription(prescription);
    
    // Auto-map medicines to inventory if possible
    const items = prescription.medicines.map(med => {
      const matchedInv = inventory.find(i => i.medicineName.toLowerCase() === med.name.toLowerCase());
      
      // Attempt to auto-calculate quantity based on frequency (e.g., 1-0-1, OD, BD) and durationDays
      let calcQty = 1;
      if (med.frequency) {
        let timesPerDay = 1;
        const freqStr = med.frequency.toLowerCase();
        
        if (freqStr.includes('-')) {
          timesPerDay = freqStr.split('-').reduce((sum, val) => sum + (parseInt(val) || 0), 0);
        } else if (freqStr === 'od') {
          timesPerDay = 1;
        } else if (freqStr === 'bd' || freqStr === 'bid') {
          timesPerDay = 2;
        } else if (freqStr === 'tid' || freqStr === 'tds') {
          timesPerDay = 3;
        } else if (freqStr === 'qid') {
          timesPerDay = 4;
        }
        
        let dose = 1;
        if (med.dosage) {
          const num = parseFloat(med.dosage);
          if (!isNaN(num) && num > 0 && num < 10) { 
             dose = num;
          }
        }
        
        const days = med.durationDays || 1;
        calcQty = (timesPerDay > 0 ? timesPerDay : 1) * dose * days;
      }
      
      // If it's a syrup, default to 1 bottle unless it specifies otherwise
      if (med.name.toLowerCase().includes('syrup')) {
          calcQty = 1;
      }

      const available = matchedInv ? matchedInv.quantity : 0;
      // Cap at available stock
      const finalQty = Math.min(calcQty, available);

      return {
        originalName: med.name,
        dosage: med.dosage,
        frequency: med.frequency,
        durationDays: med.durationDays,
        inventoryId: matchedInv ? matchedInv._id : "",
        availableQty: available,
        recommendedQty: calcQty,
        dispenseQty: finalQty,
        unitPrice: matchedInv ? matchedInv.unitPrice : 0,
      };
    });
    
    setDispenseItems(items);
    setShowDispenseModal(true);
  };

  const handleDispenseItemChange = (index, field, value) => {
    const newItems = [...dispenseItems];
    if (field === "inventoryId") {
       const matchedInv = inventory.find(i => i._id === value);
       newItems[index].inventoryId = value;
       newItems[index].availableQty = matchedInv ? matchedInv.quantity : 0;
       newItems[index].unitPrice = matchedInv ? matchedInv.unitPrice : 0;
       
       // Auto-fill quantity when user manually selects an inventory item
       if (matchedInv && newItems[index].dispenseQty === 0) {
           newItems[index].dispenseQty = Math.min(newItems[index].recommendedQty, matchedInv.quantity);
       }
    } else {
       newItems[index][field] = value;
    }
    setDispenseItems(newItems);
  };

  const handleDispenseSubmit = async (e) => {
    e.preventDefault();
    const validItems = dispenseItems.filter(item => item.inventoryId && item.dispenseQty > 0);
    if (validItems.length === 0) {
      toast.error("Please map and provide quantity for at least one medicine.");
      return;
    }

    try {
      setSubmitting(true);
      await apiClient.post("/pharmacy/dispense", {
        prescriptionId: selectedPrescription._id,
        patientId: selectedPrescription.patientId._id,
        items: validItems.map(item => ({
          inventoryId: item.inventoryId,
          quantity: Number(item.dispenseQty)
        })),
        notes: "Dispensed via Admin Portal"
      });
      
      toast.success("Medicines dispensed and Bill generated successfully!");
      setShowDispenseModal(false);
      fetchPendingPrescriptions();
      fetchInventory(); 
    } catch (err) {
      toast.error(err.response?.data?.message || "Failed to dispense medicines");
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
            <Pill className="w-6 h-6 text-amber-500" />
            Pharmacy Central
          </h2>
          <p className="text-sm text-slate-500 dark:text-slate-400 mt-0.5">
            Manage inventory and dispense patient prescriptions.
          </p>
        </div>
        
        <div className="flex flex-col sm:flex-row items-center gap-3 w-full sm:w-auto">
          <div className="relative w-full sm:w-64">
            <Search className="w-4 h-4 text-slate-400 absolute left-3 top-1/2 -translate-y-1/2" />
            <input 
              type="text" 
              placeholder={activeTab === 'inventory' ? "Search medicines..." : "Search prescriptions..."}
              value={search}
              onChange={e => setSearch(e.target.value)}
              className="w-full pl-9 pr-4 py-2 bg-white dark:bg-slate-800 border border-slate-200 dark:border-slate-700 rounded-xl text-sm focus:ring-2 focus:ring-amber-500 outline-none"
            />
          </div>
          <button 
            onClick={activeTab === 'inventory' ? fetchInventory : fetchPendingPrescriptions}
            className="p-2 text-slate-500 hover:text-amber-600 bg-white dark:bg-slate-800 border border-slate-200 dark:border-slate-700 hover:bg-amber-50 dark:hover:bg-slate-700 rounded-xl shadow-sm transition-colors"
            title="Refresh"
          >
            <RefreshCw className={`w-4 h-4 ${loading ? 'animate-spin' : ''}`} />
          </button>
          {activeTab === 'inventory' && (
            <button 
              onClick={openAddModal}
              className="flex items-center justify-center gap-2 bg-amber-500 hover:bg-amber-600 text-white px-4 py-2 w-full sm:w-auto rounded-xl text-sm font-semibold transition-all shadow-sm"
            >
              <Plus className="w-4 h-4" />
              Add Stock
            </button>
          )}
        </div>
      </div>

      {/* Tabs */}
      <div className="flex items-center gap-4 border-b border-slate-200 dark:border-slate-700">
        <button
          onClick={() => setActiveTab('inventory')}
          className={`px-4 py-2 text-sm font-bold border-b-2 transition-colors ${
            activeTab === 'inventory' 
              ? 'border-amber-500 text-amber-600 dark:text-amber-500' 
              : 'border-transparent text-slate-500 hover:text-slate-700 dark:hover:text-slate-300'
          }`}
        >
          Inventory Stock
        </button>
        <button
          onClick={() => setActiveTab('prescriptions')}
          className={`px-4 py-2 text-sm font-bold border-b-2 transition-colors flex items-center gap-2 ${
            activeTab === 'prescriptions' 
              ? 'border-amber-500 text-amber-600 dark:text-amber-500' 
              : 'border-transparent text-slate-500 hover:text-slate-700 dark:hover:text-slate-300'
          }`}
        >
          Pending to Dispense
          {pendingPrescriptions.length > 0 && (
            <span className="bg-amber-100 text-amber-700 dark:bg-amber-900/30 dark:text-amber-400 py-0.5 px-2 rounded-full text-xs">
              {pendingPrescriptions.length}
            </span>
          )}
        </button>
      </div>

      {/* Content Area */}
      <div className="bg-white dark:bg-slate-800 rounded-2xl border border-slate-200 dark:border-slate-700 shadow-sm overflow-hidden flex flex-col">
        {loading && ((activeTab === 'inventory' && inventory.length === 0) || (activeTab === 'prescriptions' && pendingPrescriptions.length === 0)) ? (
          <div className="flex items-center justify-center py-20">
            <RefreshCw className="w-8 h-8 text-slate-400 animate-spin" />
          </div>
        ) : error ? (
          <div className="flex flex-col items-center justify-center py-20 text-red-500 gap-2">
            <AlertCircle className="w-8 h-8" />
            <span className="font-medium">{error}</span>
          </div>
        ) : activeTab === 'inventory' ? (
          /* INVENTORY VIEW */
          inventory.length === 0 ? (
            <div className="flex flex-col items-center justify-center py-20 text-slate-400">
              <Package className="w-14 h-14 mb-4 text-slate-300 dark:text-slate-600" />
              <p className="font-medium text-slate-600 dark:text-slate-300">
                {search ? "No medicines found." : "Inventory is empty."}
              </p>
            </div>
          ) : (
            <div className="flex flex-col h-full">
              <div className="overflow-x-auto">
                <table className="w-full text-left text-sm">
                  <thead className="bg-slate-50 dark:bg-slate-900/50 text-slate-500 dark:text-slate-400 text-xs uppercase border-b border-slate-200 dark:border-slate-700">
                    <tr>
                      <th className="px-6 py-3.5 font-semibold">Medicine Name</th>
                      <th className="px-6 py-3.5 font-semibold">Category</th>
                      <th className="px-6 py-3.5 font-semibold">Batch & Expiry</th>
                      <th className="px-6 py-3.5 font-semibold">Stock</th>
                      <th className="px-6 py-3.5 font-semibold">Pricing</th>
                      <th className="px-6 py-3.5 font-semibold text-right">Actions</th>
                    </tr>
                  </thead>
                  <tbody className="divide-y divide-slate-100 dark:divide-slate-700/50">
                    {inventory.map((item) => (
                      <tr key={item._id} className="hover:bg-slate-50/50 dark:hover:bg-slate-800/50 transition-colors">
                        <td className="px-6 py-4">
                          <p className="font-bold text-slate-900 dark:text-white">{item.medicineName}</p>
                          {item.genericName && <p className="text-xs text-slate-500 dark:text-slate-400">{item.genericName}</p>}
                        </td>
                        <td className="px-6 py-4">
                          <span className="inline-flex items-center px-2.5 py-0.5 rounded-full text-xs font-medium bg-slate-100 text-slate-800 dark:bg-slate-700 dark:text-slate-300 capitalize">
                            {item.category}
                          </span>
                        </td>
                        <td className="px-6 py-4">
                          <div className="space-y-1 text-sm">
                            <p className="font-mono text-slate-600 dark:text-slate-300">{item.batchNumber}</p>
                            <p className="text-xs flex items-center gap-1 text-slate-500">
                              <Calendar className="w-3.5 h-3.5" /> Exp: {new Date(item.expiryDate).toLocaleDateString()}
                            </p>
                          </div>
                        </td>
                        <td className="px-6 py-4">
                          <div className="flex items-center gap-2">
                            <span className={`font-bold ${item.quantity <= item.reorderLevel ? 'text-red-500' : 'text-slate-900 dark:text-white'}`}>
                              {item.quantity}
                            </span>
                            {item.quantity <= item.reorderLevel && (
                              <span className="flex h-2 w-2 rounded-full bg-red-500" title="Low Stock"></span>
                            )}
                          </div>
                        </td>
                        <td className="px-6 py-4">
                          <p className="font-semibold text-slate-900 dark:text-white flex items-center">
                            <IndianRupee className="w-3.5 h-3.5 mr-0.5 text-slate-400" />{item.mrp}
                          </p>
                        </td>
                        <td className="px-6 py-4 text-right space-x-3">
                          <button onClick={() => openEditModal(item)} className="text-amber-600 hover:text-amber-700 font-semibold text-xs transition-colors">Edit</button>
                        </td>
                      </tr>
                    ))}
                  </tbody>
                </table>
              </div>
              <Pagination meta={meta} onPageChange={(p) => setPage(p)} />
            </div>
          )
        ) : (
          /* PRESCRIPTIONS VIEW */
          pendingPrescriptions.length === 0 ? (
            <div className="flex flex-col items-center justify-center py-20 text-slate-400">
              <FileText className="w-14 h-14 mb-4 text-slate-300 dark:text-slate-600" />
              <p className="font-medium text-slate-600 dark:text-slate-300">
                No pending prescriptions to dispense.
              </p>
            </div>
          ) : (
            <div className="divide-y divide-slate-100 dark:divide-slate-700">
              {pendingPrescriptions.map((presc) => (
                <div key={presc._id} className="p-6 flex flex-col md:flex-row items-center justify-between gap-4 hover:bg-slate-50 dark:hover:bg-slate-900/50 transition-colors">
                  <div>
                    <h3 className="font-bold text-slate-900 dark:text-white text-lg">
                      {presc.patientId?.firstName} {presc.patientId?.lastName} <span className="text-sm font-normal text-slate-500">({presc.patientId?.mrn})</span>
                    </h3>
                    <div className="text-sm text-slate-500 dark:text-slate-400 mt-1 flex flex-wrap items-center gap-4">
                      <span>Doctor: Dr. {presc.doctorId?.lastName}</span>
                      <span>Date: {new Date(presc.createdAt).toLocaleDateString()}</span>
                      <span className="px-2 py-0.5 bg-blue-100 text-blue-700 dark:bg-blue-900/30 dark:text-blue-400 rounded-full text-xs font-medium">{presc.medicines.length} Medicines</span>
                    </div>
                  </div>
                  <button 
                    onClick={() => openDispenseModal(presc)}
                    className="flex items-center gap-2 px-6 py-2.5 bg-blue-600 hover:bg-blue-700 text-white font-bold rounded-xl shadow-sm transition-colors w-full md:w-auto justify-center"
                  >
                    <CheckCircle2 className="w-4 h-4" />
                    Dispense & Bill
                  </button>
                </div>
              ))}
            </div>
          )
        )}
      </div>

      {/* Add/Edit Stock Modal */}
      {showModal && (
        <div className="fixed inset-0 z-50 flex items-center justify-center p-4 bg-slate-900/50 backdrop-blur-sm overflow-y-auto">
          <div className="bg-white dark:bg-slate-900 rounded-2xl shadow-xl w-full max-w-2xl border border-slate-200 dark:border-slate-800 overflow-hidden my-8">
            <div className="px-6 py-4 border-b border-slate-200 dark:border-slate-800 flex justify-between items-center bg-slate-50/50 dark:bg-slate-900/50">
              <h3 className="text-lg font-bold text-slate-900 dark:text-white flex items-center gap-2">
                <Package className="w-5 h-5 text-amber-500" /> {editItem ? "Edit Inventory" : "Add New Stock"}
              </h3>
            </div>
            
            <form onSubmit={handleAddStock} className="p-6">
              
              <div className="grid grid-cols-1 md:grid-cols-2 gap-5 mb-5">
                <div className="space-y-1.5">
                  <label className="text-sm font-medium text-slate-700 dark:text-slate-300">Medicine Name <span className="text-red-500">*</span></label>
                  <input type="text" required value={formData.medicineName} onChange={e => setFormData({...formData, medicineName: e.target.value})}
                    placeholder="e.g. Paracetamol 500mg"
                    className="w-full px-4 py-2 bg-slate-50 dark:bg-slate-800/50 border border-slate-200 dark:border-slate-700 rounded-xl text-sm focus:ring-2 focus:ring-amber-500 outline-none" />
                </div>
                <div className="space-y-1.5">
                  <label className="text-sm font-medium text-slate-700 dark:text-slate-300">Generic Name</label>
                  <input type="text" value={formData.genericName} onChange={e => setFormData({...formData, genericName: e.target.value})}
                    placeholder="e.g. Acetaminophen"
                    className="w-full px-4 py-2 bg-slate-50 dark:bg-slate-800/50 border border-slate-200 dark:border-slate-700 rounded-xl text-sm focus:ring-2 focus:ring-amber-500 outline-none" />
                </div>
              </div>

              <div className="grid grid-cols-1 md:grid-cols-3 gap-5 mb-5">
                <div className="space-y-1.5">
                  <label className="text-sm font-medium text-slate-700 dark:text-slate-300">Category <span className="text-red-500">*</span></label>
                  <select required value={formData.category} onChange={e => setFormData({...formData, category: e.target.value})}
                    className="w-full px-4 py-2 bg-slate-50 dark:bg-slate-800/50 border border-slate-200 dark:border-slate-700 rounded-xl text-sm focus:ring-2 focus:ring-amber-500 outline-none">
                    <option value="tablet">Tablet</option>
                    <option value="syrup">Syrup</option>
                    <option value="injection">Injection</option>
                    <option value="capsule">Capsule</option>
                    <option value="ointment">Ointment</option>
                    <option value="drops">Drops</option>
                    <option value="other">Other</option>
                  </select>
                </div>
                <div className="space-y-1.5">
                  <label className="text-sm font-medium text-slate-700 dark:text-slate-300">Batch Number <span className="text-red-500">*</span></label>
                  <input type="text" required disabled={!!editItem} value={formData.batchNumber} onChange={e => setFormData({...formData, batchNumber: e.target.value})}
                    className="w-full px-4 py-2 bg-slate-50 dark:bg-slate-800/50 border border-slate-200 dark:border-slate-700 rounded-xl text-sm focus:ring-2 focus:ring-amber-500 outline-none font-mono disabled:opacity-50" />
                </div>
                <div className="space-y-1.5">
                  <label className="text-sm font-medium text-slate-700 dark:text-slate-300">Expiry Date <span className="text-red-500">*</span></label>
                  <input type="date" required value={formData.expiryDate} onChange={e => setFormData({...formData, expiryDate: e.target.value})}
                    min={new Date().toISOString().split("T")[0]}
                    className="w-full px-4 py-2 bg-slate-50 dark:bg-slate-800/50 border border-slate-200 dark:border-slate-700 rounded-xl text-sm focus:ring-2 focus:ring-amber-500 outline-none" />
                </div>
              </div>

              <div className="grid grid-cols-1 md:grid-cols-3 gap-5 mb-8">
                <div className="space-y-1.5">
                  <label className="text-sm font-medium text-slate-700 dark:text-slate-300">Quantity (Units) <span className="text-red-500">*</span></label>
                  <input type="number" required min="1" value={formData.quantity} onChange={e => setFormData({...formData, quantity: e.target.value})}
                    className="w-full px-4 py-2 bg-slate-50 dark:bg-slate-800/50 border border-slate-200 dark:border-slate-700 rounded-xl text-sm focus:ring-2 focus:ring-amber-500 outline-none" />
                </div>
                <div className="space-y-1.5">
                  <label className="text-sm font-medium text-slate-700 dark:text-slate-300">Unit Price <span className="text-red-500">*</span></label>
                  <input type="number" required min="0" step="0.01" value={formData.unitPrice} onChange={e => setFormData({...formData, unitPrice: e.target.value})}
                    className="w-full px-4 py-2 bg-slate-50 dark:bg-slate-800/50 border border-slate-200 dark:border-slate-700 rounded-xl text-sm focus:ring-2 focus:ring-amber-500 outline-none" />
                </div>
                <div className="space-y-1.5">
                  <label className="text-sm font-medium text-slate-700 dark:text-slate-300">MRP <span className="text-red-500">*</span></label>
                  <input type="number" required min="0" step="0.01" value={formData.mrp} onChange={e => setFormData({...formData, mrp: e.target.value})}
                    className="w-full px-4 py-2 bg-slate-50 dark:bg-slate-800/50 border border-slate-200 dark:border-slate-700 rounded-xl text-sm focus:ring-2 focus:ring-amber-500 outline-none" />
                </div>
              </div>

              <div className="pt-4 border-t border-slate-200 dark:border-slate-800 flex items-center justify-end gap-3">
                <button type="button" onClick={closeModal}
                  className="px-4 py-2 text-sm font-medium text-slate-600 dark:text-slate-400 hover:bg-slate-100 dark:hover:bg-slate-800 rounded-xl transition-colors">
                  Cancel
                </button>
                <button type="submit" disabled={submitting}
                  className="flex items-center gap-2 px-6 py-2 bg-amber-500 hover:bg-amber-600 text-white text-sm font-semibold rounded-xl disabled:opacity-70 transition-colors shadow-sm">
                  {submitting && <RefreshCw className="w-4 h-4 animate-spin" />}
                  {editItem ? "Save Changes" : "Save Stock"}
                </button>
              </div>
            </form>
          </div>
        </div>
      )}

      {/* Dispense Modal */}
      {showDispenseModal && selectedPrescription && (
        <div className="fixed inset-0 z-50 flex items-center justify-center p-4 bg-slate-900/50 backdrop-blur-sm overflow-y-auto">
          <div className="bg-white dark:bg-slate-900 rounded-2xl shadow-xl w-full max-w-4xl border border-slate-200 dark:border-slate-800 overflow-hidden my-8">
            <div className="px-6 py-4 border-b border-slate-200 dark:border-slate-800 flex justify-between items-center bg-slate-50/50 dark:bg-slate-900/50">
              <h3 className="text-lg font-bold text-slate-900 dark:text-white flex items-center gap-2">
                <Pill className="w-5 h-5 text-blue-500" /> Dispense Medicines & Bill
              </h3>
            </div>
            
            <form onSubmit={handleDispenseSubmit} className="p-6 space-y-6">
              
              {/* Patient Info */}
              <div className="bg-slate-50 dark:bg-slate-800/50 p-4 rounded-xl border border-slate-200 dark:border-slate-700">
                <h4 className="font-bold text-slate-900 dark:text-white">Patient: {selectedPrescription.patientId?.firstName} {selectedPrescription.patientId?.lastName}</h4>
                <p className="text-sm text-slate-500 mt-1">Prescribed by Dr. {selectedPrescription.doctorId?.lastName} on {new Date(selectedPrescription.createdAt).toLocaleDateString()}</p>
              </div>

              {/* Medicines Table */}
              <div className="border border-slate-200 dark:border-slate-700 rounded-xl overflow-hidden">
                <table className="w-full text-left text-sm">
                  <thead className="bg-slate-50 dark:bg-slate-900/50 text-slate-500 dark:text-slate-400 text-xs uppercase border-b border-slate-200 dark:border-slate-700">
                    <tr>
                      <th className="px-4 py-3 font-semibold">Prescribed Medicine</th>
                      <th className="px-4 py-3 font-semibold w-1/3">Map to Inventory</th>
                      <th className="px-4 py-3 font-semibold w-24">Dispense Qty</th>
                      <th className="px-4 py-3 font-semibold text-right">Price</th>
                    </tr>
                  </thead>
                  <tbody className="divide-y divide-slate-100 dark:divide-slate-700/50">
                    {dispenseItems.map((item, index) => (
                      <tr key={index} className="hover:bg-slate-50/50 dark:hover:bg-slate-800/50 transition-colors">
                        <td className="px-4 py-3">
                          <p className="font-bold text-slate-900 dark:text-white">{item.originalName}</p>
                          <p className="text-xs text-slate-500">{item.dosage} • {item.frequency} • {item.durationDays} days</p>
                        </td>
                        <td className="px-4 py-3">
                          <select 
                            value={item.inventoryId}
                            onChange={(e) => handleDispenseItemChange(index, "inventoryId", e.target.value)}
                            className="w-full px-3 py-2 bg-white dark:bg-slate-800 border border-slate-200 dark:border-slate-700 rounded-lg text-sm outline-none"
                          >
                            <option value="">Select Inventory Item</option>
                            {inventory.map(inv => (
                              <option key={inv._id} value={inv._id}>
                                {inv.medicineName} ({inv.quantity} in stock)
                              </option>
                            ))}
                          </select>
                          {item.inventoryId && (
                            <p className="text-xs text-emerald-600 mt-1 font-medium">{item.availableQty} units available</p>
                          )}
                        </td>
                        <td className="px-4 py-3">
                          <input 
                            type="number"
                            min="0"
                            max={item.availableQty}
                            value={item.dispenseQty}
                            onChange={(e) => handleDispenseItemChange(index, "dispenseQty", e.target.value)}
                            disabled={!item.inventoryId}
                            className="w-full px-3 py-2 bg-white dark:bg-slate-800 border border-slate-200 dark:border-slate-700 rounded-lg text-sm outline-none disabled:opacity-50"
                          />
                        </td>
                        <td className="px-4 py-3 text-right font-medium text-slate-900 dark:text-white">
                          <IndianRupee className="w-3 h-3 inline mr-0.5 text-slate-400" />
                          {(item.unitPrice * (item.dispenseQty || 0)).toFixed(2)}
                        </td>
                      </tr>
                    ))}
                  </tbody>
                  <tfoot className="bg-slate-50 dark:bg-slate-900/50 border-t border-slate-200 dark:border-slate-700">
                    <tr>
                      <td colSpan="3" className="px-4 py-3 text-right font-bold text-slate-700 dark:text-slate-300">Total Bill Amount:</td>
                      <td className="px-4 py-3 text-right font-bold text-blue-600 dark:text-blue-400 text-lg">
                        <IndianRupee className="w-4 h-4 inline mr-0.5" />
                        {dispenseItems.reduce((acc, curr) => acc + (curr.unitPrice * (curr.dispenseQty || 0)), 0).toFixed(2)}
                      </td>
                    </tr>
                  </tfoot>
                </table>
              </div>

              <div className="pt-4 flex items-center justify-end gap-3">
                <button type="button" onClick={() => setShowDispenseModal(false)}
                  className="px-4 py-2 text-sm font-medium text-slate-600 dark:text-slate-400 hover:bg-slate-100 dark:hover:bg-slate-800 rounded-xl transition-colors">
                  Cancel
                </button>
                <button type="submit" disabled={submitting}
                  className="flex items-center gap-2 px-6 py-2 bg-blue-600 hover:bg-blue-700 text-white text-sm font-bold rounded-xl disabled:opacity-70 transition-colors shadow-sm">
                  {submitting ? <RefreshCw className="w-4 h-4 animate-spin" /> : <CheckCircle2 className="w-4 h-4" />}
                  Confirm Dispense & Generate Bill
                </button>
              </div>
            </form>
          </div>
        </div>
      )}

    </div>
  );
}
