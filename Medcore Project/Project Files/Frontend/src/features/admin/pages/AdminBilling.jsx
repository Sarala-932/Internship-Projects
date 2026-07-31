import { useState, useEffect } from "react";
import { FileText, Plus, RefreshCw, AlertCircle, Search, FileDigit, IndianRupee, Printer, User, Trash2, CheckCircle } from "lucide-react";
import apiClient from "../../../shared/service/apiClient";
import toast from "react-hot-toast";
import { useRealtime } from "../../../shared/hooks/useRealtime";

export default function AdminBilling() {
  const [bills, setBills] = useState([]);
  const [patients, setPatients] = useState([]);
  const [loading, setLoading] = useState(true);
  const [search, setSearch] = useState("");
  const [error, setError] = useState(null);

  // Modal State
  const [showModal, setShowModal] = useState(false);
  const [paymentModal, setPaymentModal] = useState({ show: false, bill: null });
  const [paymentMethod, setPaymentMethod] = useState("cash");
  const [submitting, setSubmitting] = useState(false);
  
  const [patientId, setPatientId] = useState("");
  const [globalDiscount, setGlobalDiscount] = useState(0);
  const [globalTax, setGlobalTax] = useState(0);
  
  const [items, setItems] = useState([
    { type: "consultation", description: "OPD Consultation", unitPrice: 0, quantity: 1, discount: 0, tax: 0 }
  ]);

  const fetchData = async () => {
    try {
      setLoading(true);
      setError(null);
      // Fetch both bills and patients for the dropdown
      const [billsRes, patientsRes] = await Promise.all([
        apiClient.get(search ? `/billing?search=${encodeURIComponent(search)}` : "/billing"),
        apiClient.get("/patients")
      ]);
      setBills(billsRes.data.bills || []);
      setPatients(patientsRes.data.patients || []);
    } catch (err) {
      setError("Failed to fetch billing data.");
      toast.error(err.response?.data?.message || "Error fetching data");
    } finally {
      setLoading(false);
    }
  };

  useRealtime("billing", fetchData);

  useEffect(() => {
    const timer = setTimeout(() => {
      fetchData();
    }, 500);
    return () => clearTimeout(timer);
  }, [search]);

  // Form Handlers
  const handleAddItem = () => {
    setItems([...items, { type: "other", description: "", unitPrice: 0, quantity: 1, discount: 0, tax: 0 }]);
  };

  const handleRemoveItem = (index) => {
    const newItems = items.filter((_, i) => i !== index);
    setItems(newItems);
  };

  const updateItem = (index, field, value) => {
    const newItems = [...items];
    newItems[index][field] = value;
    setItems(newItems);
  };

  const handleGenerateBill = async (e) => {
    e.preventDefault();
    if (items.length === 0) return toast.error("Please add at least one item to the bill");

    try {
      setSubmitting(true);
      
      const payloadItems = items.map(item => ({
        ...item,
        unitPrice: Number(item.unitPrice),
        quantity: Number(item.quantity),
        discount: Number(item.discount),
        tax: Number(item.tax),
        totalPrice: (Number(item.unitPrice) * Number(item.quantity)) - Number(item.discount) + Number(item.tax)
      }));

      const payload = {
        patientId,
        items: payloadItems,
        discount: Number(globalDiscount),
        tax: Number(globalTax)
      };

      const res = await apiClient.post("/billing", payload);
      toast.success(res.data.message || "Invoice generated successfully");
      setShowModal(false);
      resetForm();
      fetchData();
    } catch (err) {
      toast.error(err.response?.data?.message || "Failed to generate invoice");
    } finally {
      setSubmitting(false);
    }
  };

  const resetForm = () => {
    setPatientId("");
    setGlobalDiscount(0);
    setGlobalTax(0);
    setItems([{ type: "consultation", description: "OPD Consultation", unitPrice: 0, quantity: 1, discount: 0, tax: 0 }]);
  };

  const calculateSubtotal = () => {
    return items.reduce((acc, item) => acc + (Number(item.unitPrice) * Number(item.quantity)), 0);
  };
  
  const calculateTotal = () => {
    return calculateSubtotal() - Number(globalDiscount) + Number(globalTax);
  };

  const handleProcessPayment = async (e) => {
    e.preventDefault();
    if (!paymentModal.bill) return;

    try {
      setSubmitting(true);
      const res = await apiClient.post(`/billing/${paymentModal.bill._id}/verify`, { method: paymentMethod });
      toast.success(res.data.message || "Payment processed successfully");
      setPaymentModal({ show: false, bill: null });
      fetchData();
    } catch (err) {
      toast.error(err.response?.data?.message || "Failed to process payment");
    } finally {
      setSubmitting(false);
    }
  };

  const handlePrint = (bill) => {
    const printWindow = window.open('', '_blank');
    printWindow.document.write(`
      <html>
        <head>
          <title>Invoice ${bill.billNumber}</title>
          <style>
            body { font-family: system-ui, -apple-system, sans-serif; color: #333; line-height: 1.6; padding: 40px; }
            .header { display: flex; justify-content: space-between; margin-bottom: 40px; border-bottom: 2px solid #eee; padding-bottom: 20px; }
            .logo { font-size: 24px; font-weight: bold; color: #2563eb; }
            .bill-info { text-align: right; }
            .patient-info { margin-bottom: 40px; }
            table { width: 100%; border-collapse: collapse; margin-bottom: 40px; }
            th, td { border-bottom: 1px solid #eee; padding: 12px 8px; text-align: left; }
            th { background-color: #f8fafc; font-weight: 600; color: #64748b; text-transform: uppercase; font-size: 12px; }
            .text-right { text-align: right; }
            .totals { width: 300px; margin-left: auto; }
            .totals-row { display: flex; justify-content: space-between; margin-bottom: 8px; }
            .totals-row.final { font-size: 18px; font-weight: bold; border-top: 2px solid #eee; padding-top: 12px; margin-top: 12px; }
            .status { display: inline-block; padding: 4px 12px; border-radius: 99px; font-size: 12px; font-weight: bold; text-transform: uppercase; background: ${bill.status === 'paid' ? '#dcfce7' : '#fef3c7'}; color: ${bill.status === 'paid' ? '#166534' : '#92400e'}; }
          </style>
        </head>
        <body>
          <div class="header">
            <div>
              <div class="logo">MedCore Hospital</div>
              <p style="margin: 4px 0 0; color: #64748b; font-size: 14px;">123 Healthcare Avenue, Medical City</p>
            </div>
            <div class="bill-info">
              <h1 style="margin: 0 0 4px; font-size: 24px;">INVOICE</h1>
              <p style="margin: 0; color: #64748b;">${bill.billNumber}</p>
              <p style="margin: 4px 0 0; color: #64748b;">Date: ${new Date(bill.createdAt).toLocaleDateString()}</p>
              <div style="margin-top: 8px;"><span class="status">${bill.status}</span></div>
            </div>
          </div>
          
          <div class="patient-info">
            <h3 style="margin: 0 0 8px; color: #64748b; font-size: 14px; text-transform: uppercase;">Bill To:</h3>
            <p style="margin: 0; font-weight: 600; font-size: 18px;">${bill.patientId?.firstName} ${bill.patientId?.lastName}</p>
            <p style="margin: 4px 0 0; color: #64748b;">MRN: ${bill.patientId?.mrn}</p>
          </div>

          <table>
            <thead>
              <tr>
                <th>Item / Description</th>
                <th class="text-right">Qty</th>
                <th class="text-right">Unit Price</th>
                <th class="text-right">Total</th>
              </tr>
            </thead>
            <tbody>
              ${bill.items.map(item => `
                <tr>
                  <td>
                    <div style="font-weight: 500;">${item.description}</div>
                    <div style="font-size: 12px; color: #64748b; text-transform: capitalize;">${item.type}</div>
                  </td>
                  <td class="text-right">${item.quantity}</td>
                  <td class="text-right">₹${item.unitPrice.toLocaleString('en-IN')}</td>
                  <td class="text-right">₹${item.totalPrice.toLocaleString('en-IN')}</td>
                </tr>
              `).join('')}
            </tbody>
          </table>

          <div class="totals">
            <div class="totals-row">
              <span style="color: #64748b;">Subtotal</span>
              <span>₹${bill.subtotal.toLocaleString('en-IN')}</span>
            </div>
            ${bill.totalDiscount > 0 ? `
              <div class="totals-row" style="color: #ef4444;">
                <span>Discount</span>
                <span>-₹${bill.totalDiscount.toLocaleString('en-IN')}</span>
              </div>
            ` : ''}
            ${bill.totalTax > 0 ? `
              <div class="totals-row" style="color: #64748b;">
                <span>Tax/GST</span>
                <span>+₹${bill.totalTax.toLocaleString('en-IN')}</span>
              </div>
            ` : ''}
            <div class="totals-row final">
              <span>Total Amount</span>
              <span>₹${bill.totalAmount.toLocaleString('en-IN')}</span>
            </div>
            ${bill.status === 'paid' ? `
              <div class="totals-row" style="color: #10b981; margin-top: 8px;">
                <span>Amount Paid</span>
                <span>₹${bill.paidAmount.toLocaleString('en-IN')}</span>
              </div>
              <div class="totals-row" style="margin-top: 8px;">
                <span>Amount Due</span>
                <span>₹0</span>
              </div>
            ` : `
              <div class="totals-row" style="color: #ef4444; margin-top: 8px;">
                <span>Amount Due</span>
                <span>₹${bill.dueAmount.toLocaleString('en-IN')}</span>
              </div>
            `}
          </div>
          
          <div style="margin-top: 80px; text-align: center; color: #64748b; font-size: 12px; border-top: 1px solid #eee; padding-top: 20px;">
            Thank you for choosing MedCore Hospital. Wishing you a speedy recovery!
          </div>
        </body>
      </html>
    `);
    printWindow.document.close();
    printWindow.focus();
    // setTimeout to ensure images/fonts load before printing
    setTimeout(() => {
      printWindow.print();
    }, 500);
  };

  const getStatusColor = (status) => {
    switch(status) {
      case 'paid': return 'bg-emerald-100 text-emerald-700 dark:bg-emerald-900/30 dark:text-emerald-400';
      case 'partial': return 'bg-amber-100 text-amber-700 dark:bg-amber-900/30 dark:text-amber-400';
      case 'issued': return 'bg-blue-100 text-blue-700 dark:bg-blue-900/30 dark:text-blue-400';
      case 'draft': return 'bg-slate-100 text-slate-700 dark:bg-slate-800 dark:text-slate-400';
      case 'cancelled': 
      case 'refunded': return 'bg-red-100 text-red-700 dark:bg-red-900/30 dark:text-red-400';
      default: return 'bg-slate-100 text-slate-700 dark:bg-slate-800 dark:text-slate-400';
    }
  };

  return (
    <div className="space-y-6 max-w-7xl mx-auto">
      {/* Header */}
      <div className="flex flex-col sm:flex-row sm:items-center justify-between gap-4">
        <div>
          <h2 className="text-xl font-bold text-slate-900 dark:text-white flex items-center gap-2">
            <FileText className="w-6 h-6 text-blue-500" />
            Billing & Invoicing
          </h2>
          <p className="text-sm text-slate-500 dark:text-slate-400 mt-0.5">
            Generate patient invoices, track payments, and manage revenue.
          </p>
        </div>
        
        <div className="flex flex-col sm:flex-row items-center gap-3 w-full sm:w-auto">
          <div className="relative w-full sm:w-64">
            <Search className="w-4 h-4 text-slate-400 absolute left-3 top-1/2 -translate-y-1/2" />
            <input 
              type="text" 
              placeholder="Search invoice or patient..." 
              value={search}
              onChange={e => setSearch(e.target.value)}
              className="w-full pl-9 pr-4 py-2 bg-white dark:bg-slate-800 border border-slate-200 dark:border-slate-700 rounded-xl text-sm focus:ring-2 focus:ring-blue-500 outline-none"
            />
          </div>
          <button 
            onClick={fetchData}
            className="p-2 text-slate-500 hover:text-blue-600 bg-white dark:bg-slate-800 border border-slate-200 dark:border-slate-700 hover:bg-blue-50 dark:hover:bg-slate-700 rounded-xl shadow-sm transition-colors"
            title="Refresh"
          >
            <RefreshCw className={`w-4 h-4 ${loading ? 'animate-spin' : ''}`} />
          </button>
          <button 
            onClick={() => setShowModal(true)}
            className="flex items-center justify-center gap-2 bg-blue-600 hover:bg-blue-700 text-white px-4 py-2 w-full sm:w-auto rounded-xl text-sm font-semibold transition-all shadow-sm"
          >
            <Plus className="w-4 h-4" />
            Generate Invoice
          </button>
        </div>
      </div>

      {/* Bills Table */}
      <div className="bg-white dark:bg-slate-800 rounded-2xl border border-slate-200 dark:border-slate-700 shadow-sm overflow-hidden flex flex-col">
        {loading && bills.length === 0 ? (
          <div className="flex items-center justify-center py-20">
            <RefreshCw className="w-8 h-8 text-slate-400 animate-spin" />
          </div>
        ) : error && bills.length === 0 ? (
          <div className="flex flex-col items-center justify-center py-20 text-red-500 gap-2">
            <AlertCircle className="w-8 h-8" />
            <span className="font-medium">{error}</span>
          </div>
        ) : bills.length === 0 ? (
          <div className="flex flex-col items-center justify-center py-20 text-slate-400">
            <FileDigit className="w-14 h-14 mb-4 text-slate-300 dark:text-slate-600" />
            <p className="font-medium text-slate-600 dark:text-slate-300">
              {search ? "No invoices found." : "No invoices generated yet."}
            </p>
            {!search && (
              <button onClick={() => setShowModal(true)} className="mt-4 text-sm text-blue-600 font-semibold hover:underline">
                Create the first invoice
              </button>
            )}
          </div>
        ) : (
          <div className="overflow-x-auto">
            <table className="w-full text-left text-sm">
              <thead className="bg-slate-50 dark:bg-slate-900/50 text-slate-500 dark:text-slate-400 text-xs uppercase border-b border-slate-200 dark:border-slate-700">
                <tr>
                  <th className="px-6 py-3.5 font-semibold">Invoice No & Date</th>
                  <th className="px-6 py-3.5 font-semibold">Patient Details</th>
                  <th className="px-6 py-3.5 font-semibold">Amount</th>
                  <th className="px-6 py-3.5 font-semibold">Status</th>
                  <th className="px-6 py-3.5 font-semibold text-right">Actions</th>
                </tr>
              </thead>
              <tbody className="divide-y divide-slate-100 dark:divide-slate-700/50">
                {bills.map((bill) => (
                  <tr key={bill._id} className="hover:bg-slate-50/50 dark:hover:bg-slate-800/50 transition-colors">
                    <td className="px-6 py-4">
                      <p className="font-bold font-mono text-blue-600 dark:text-blue-400">
                        {bill.billNumber}
                      </p>
                      <p className="text-xs text-slate-500 dark:text-slate-400 mt-0.5">
                        {new Date(bill.createdAt).toLocaleDateString()}
                      </p>
                    </td>
                    <td className="px-6 py-4">
                      <p className="font-semibold text-slate-900 dark:text-white">
                        {bill.patientId?.firstName} {bill.patientId?.lastName}
                      </p>
                      <p className="text-xs font-mono text-slate-500">{bill.patientId?.mrn}</p>
                    </td>
                    <td className="px-6 py-4">
                      <div className="flex items-center gap-1 font-bold text-slate-900 dark:text-white text-base">
                        <IndianRupee className="w-4 h-4 text-slate-400" />
                        {bill.totalAmount.toLocaleString('en-IN', { minimumFractionDigits: 2 })}
                      </div>
                      <p className="text-xs text-slate-500 mt-0.5 flex items-center">
                        <span className="text-red-500 font-medium">Due: ₹{bill.dueAmount.toLocaleString('en-IN')}</span>
                      </p>
                    </td>
                    <td className="px-6 py-4">
                      <span className={`inline-flex items-center px-2.5 py-1 rounded-full text-xs font-bold uppercase tracking-wider ${getStatusColor(bill.status)}`}>
                        {bill.status}
                      </span>
                    </td>
                    <td className="px-6 py-4 text-right space-x-3">
                      {bill.status !== 'paid' && (
                        <button 
                          onClick={() => setPaymentModal({ show: true, bill })}
                          className="text-emerald-600 hover:text-emerald-700 dark:text-emerald-400 font-semibold text-xs transition-colors"
                        >
                          Process Payment
                        </button>
                      )}
                      <button 
                        onClick={() => handlePrint(bill)}
                        className="text-slate-500 hover:text-slate-700 dark:text-slate-400 dark:hover:text-slate-200 transition-colors" title="Print Invoice"
                      >
                        <Printer className="w-4 h-4 inline" />
                      </button>
                    </td>
                  </tr>
                ))}
              </tbody>
            </table>
          </div>
        )}
      </div>

      {/* Generate Invoice Modal */}
      {showModal && (
        <div className="fixed inset-0 z-50 flex items-center justify-center p-4 bg-slate-900/50 backdrop-blur-sm overflow-y-auto">
          <div className="bg-white dark:bg-slate-900 rounded-2xl shadow-xl w-full max-w-4xl border border-slate-200 dark:border-slate-800 overflow-hidden my-8 flex flex-col max-h-[90vh]">
            <div className="px-6 py-4 border-b border-slate-200 dark:border-slate-800 flex justify-between items-center bg-slate-50/50 dark:bg-slate-900/50 flex-shrink-0">
              <h3 className="text-lg font-bold text-slate-900 dark:text-white flex items-center gap-2">
                <FileText className="w-5 h-5 text-blue-500" /> Generate New Invoice
              </h3>
            </div>
            
            <div className="p-6 overflow-y-auto flex-1">
              <div className="mb-6">
                <label className="text-sm font-medium text-slate-700 dark:text-slate-300 flex items-center gap-1.5 mb-2">
                  <User className="w-4 h-4 text-slate-400" /> Select Patient <span className="text-red-500">*</span>
                </label>
                <select required value={patientId} onChange={e => setPatientId(e.target.value)}
                  className="w-full md:w-1/2 px-4 py-2.5 bg-slate-50 dark:bg-slate-800/50 border border-slate-200 dark:border-slate-700 rounded-xl text-sm focus:ring-2 focus:ring-blue-500 outline-none">
                  <option value="" disabled>Choose Patient...</option>
                  {patients.map(p => (
                    <option key={p._id} value={p._id}>{p.firstName} {p.lastName} ({p.mrn})</option>
                  ))}
                </select>
              </div>

              <div className="mb-4 flex items-center justify-between">
                <h4 className="font-bold text-slate-900 dark:text-white">Line Items</h4>
                <button type="button" onClick={handleAddItem} className="flex items-center gap-1.5 text-sm font-semibold text-blue-600 hover:text-blue-700 transition-colors">
                  <Plus className="w-4 h-4" /> Add Item
                </button>
              </div>

              <div className="space-y-3 mb-8">
                <div className="hidden md:grid grid-cols-12 gap-3 text-xs font-semibold text-slate-500 dark:text-slate-400 uppercase tracking-wider px-2">
                  <div className="col-span-2">Type</div>
                  <div className="col-span-4">Description</div>
                  <div className="col-span-2 text-right">Unit Price (₹)</div>
                  <div className="col-span-1 text-center">Qty</div>
                  <div className="col-span-2 text-right">Total (₹)</div>
                  <div className="col-span-1"></div>
                </div>
                
                {items.map((item, index) => (
                  <div key={index} className="grid grid-cols-1 md:grid-cols-12 gap-3 items-center bg-slate-50 dark:bg-slate-800/30 p-3 md:p-2 rounded-xl border border-slate-100 dark:border-slate-700/50">
                    <div className="col-span-1 md:col-span-2">
                      <select value={item.type} onChange={(e) => updateItem(index, 'type', e.target.value)}
                        className="w-full px-3 py-2 bg-white dark:bg-slate-800 border border-slate-200 dark:border-slate-700 rounded-lg text-sm outline-none">
                        <option value="consultation">Consultation</option>
                        <option value="medicine">Medicine</option>
                        <option value="lab">Lab Test</option>
                        <option value="procedure">Procedure</option>
                        <option value="room">Room Charge</option>
                        <option value="other">Other</option>
                      </select>
                    </div>
                    <div className="col-span-1 md:col-span-4">
                      <input type="text" placeholder="Description" value={item.description} onChange={(e) => updateItem(index, 'description', e.target.value)} required
                        className="w-full px-3 py-2 bg-white dark:bg-slate-800 border border-slate-200 dark:border-slate-700 rounded-lg text-sm outline-none" />
                    </div>
                    <div className="col-span-1 md:col-span-2">
                      <input type="number" min="0" placeholder="0.00" value={item.unitPrice} onChange={(e) => updateItem(index, 'unitPrice', e.target.value)} required
                        className="w-full px-3 py-2 bg-white dark:bg-slate-800 border border-slate-200 dark:border-slate-700 rounded-lg text-sm outline-none text-right" />
                    </div>
                    <div className="col-span-1 md:col-span-1">
                      <input type="number" min="1" value={item.quantity} onChange={(e) => updateItem(index, 'quantity', e.target.value)} required
                        className="w-full px-3 py-2 bg-white dark:bg-slate-800 border border-slate-200 dark:border-slate-700 rounded-lg text-sm outline-none text-center" />
                    </div>
                    <div className="col-span-1 md:col-span-2 text-right font-bold text-slate-900 dark:text-white px-3">
                      ₹ {(Number(item.unitPrice) * Number(item.quantity)).toLocaleString('en-IN')}
                    </div>
                    <div className="col-span-1 flex justify-end md:justify-center">
                      <button type="button" onClick={() => handleRemoveItem(index)} disabled={items.length === 1}
                        className="p-1.5 text-slate-400 hover:text-red-500 hover:bg-red-50 dark:hover:bg-red-900/20 rounded-lg transition-colors disabled:opacity-30">
                        <Trash2 className="w-4 h-4" />
                      </button>
                    </div>
                  </div>
                ))}
              </div>

              <div className="border-t border-slate-200 dark:border-slate-700 pt-6">
                <div className="flex flex-col md:flex-row justify-end items-end gap-6 text-sm">
                  <div className="w-full md:w-64 space-y-3">
                    <div className="flex justify-between items-center text-slate-600 dark:text-slate-400">
                      <span>Subtotal</span>
                      <span className="font-semibold text-slate-900 dark:text-white">₹ {calculateSubtotal().toLocaleString('en-IN')}</span>
                    </div>
                    <div className="flex justify-between items-center">
                      <span className="text-slate-600 dark:text-slate-400">Discount (₹)</span>
                      <input type="number" min="0" value={globalDiscount} onChange={(e) => setGlobalDiscount(e.target.value)}
                        className="w-24 px-2 py-1 bg-slate-50 dark:bg-slate-800 border border-slate-200 dark:border-slate-700 rounded text-right outline-none text-red-500" />
                    </div>
                    <div className="flex justify-between items-center">
                      <span className="text-slate-600 dark:text-slate-400">Tax/GST (₹)</span>
                      <input type="number" min="0" value={globalTax} onChange={(e) => setGlobalTax(e.target.value)}
                        className="w-24 px-2 py-1 bg-slate-50 dark:bg-slate-800 border border-slate-200 dark:border-slate-700 rounded text-right outline-none text-emerald-500" />
                    </div>
                    <div className="h-px bg-slate-200 dark:bg-slate-700 w-full my-2"></div>
                    <div className="flex justify-between items-center text-lg font-bold">
                      <span className="text-slate-900 dark:text-white">Total Amount</span>
                      <span className="text-blue-600 dark:text-blue-400 flex items-center">
                        <IndianRupee className="w-5 h-5 mr-0.5" />
                        {calculateTotal().toLocaleString('en-IN')}
                      </span>
                    </div>
                  </div>
                </div>
              </div>
            </div>
            
            <div className="px-6 py-4 border-t border-slate-200 dark:border-slate-800 bg-slate-50/50 dark:bg-slate-900/50 flex justify-end gap-3 flex-shrink-0">
              <button type="button" onClick={() => {setShowModal(false); resetForm();}}
                className="px-5 py-2.5 text-sm font-medium text-slate-600 dark:text-slate-400 hover:bg-slate-100 dark:hover:bg-slate-800 rounded-xl transition-colors">
                Cancel
              </button>
              <button type="button" onClick={handleGenerateBill} disabled={submitting || !patientId}
                className="flex items-center gap-2 px-6 py-2.5 bg-blue-600 hover:bg-blue-700 text-white text-sm font-semibold rounded-xl disabled:opacity-70 transition-colors shadow-sm">
                {submitting ? <RefreshCw className="w-4 h-4 animate-spin" /> : <CheckCircle className="w-4 h-4" />}
                Save & Issue Invoice
              </button>
            </div>
          </div>
        </div>
      )}

      {/* Process Payment Modal */}
      {paymentModal.show && paymentModal.bill && (
        <div className="fixed inset-0 z-50 flex items-center justify-center p-4 bg-slate-900/50 backdrop-blur-sm overflow-y-auto">
          <div className="bg-white dark:bg-slate-900 rounded-2xl shadow-xl w-full max-w-md border border-slate-200 dark:border-slate-800 overflow-hidden my-8">
            <div className="px-6 py-4 border-b border-slate-200 dark:border-slate-800 flex justify-between items-center bg-slate-50/50 dark:bg-slate-900/50">
              <h3 className="text-lg font-bold text-slate-900 dark:text-white flex items-center gap-2">
                Process Payment
              </h3>
            </div>
            
            <form onSubmit={handleProcessPayment} className="p-6">
              <div className="mb-6 space-y-2 text-center bg-slate-50 dark:bg-slate-800/50 p-4 rounded-xl border border-slate-100 dark:border-slate-700/50">
                <p className="text-sm font-medium text-slate-500 dark:text-slate-400">Due Amount for {paymentModal.bill.billNumber}</p>
                <div className="text-3xl font-bold text-slate-900 dark:text-white flex items-center justify-center gap-1">
                  <IndianRupee className="w-6 h-6 text-slate-400" />
                  {paymentModal.bill.dueAmount.toLocaleString('en-IN')}
                </div>
              </div>

              <div className="space-y-1.5 mb-8">
                <label className="text-sm font-medium text-slate-700 dark:text-slate-300">Payment Method <span className="text-red-500">*</span></label>
                <select required value={paymentMethod} onChange={e => setPaymentMethod(e.target.value)}
                  className="w-full px-4 py-2.5 bg-slate-50 dark:bg-slate-800/50 border border-slate-200 dark:border-slate-700 rounded-xl text-sm focus:ring-2 focus:ring-emerald-500 outline-none">
                  <option value="cash">Cash</option>
                  <option value="card">Credit / Debit Card</option>
                  <option value="upi">UPI / QR</option>
                  <option value="insurance">Insurance</option>
                  <option value="netbanking">Net Banking</option>
                </select>
              </div>

              <div className="pt-4 border-t border-slate-200 dark:border-slate-800 flex items-center justify-end gap-3">
                <button type="button" onClick={() => setPaymentModal({ show: false, bill: null })}
                  className="px-4 py-2 text-sm font-medium text-slate-600 dark:text-slate-400 hover:bg-slate-100 dark:hover:bg-slate-800 rounded-xl transition-colors">
                  Cancel
                </button>
                <button type="submit" disabled={submitting}
                  className="flex items-center gap-2 px-6 py-2 bg-emerald-600 hover:bg-emerald-700 text-white text-sm font-semibold rounded-xl disabled:opacity-70 transition-colors shadow-sm">
                  {submitting && <RefreshCw className="w-4 h-4 animate-spin" />}
                  Confirm Payment
                </button>
              </div>
            </form>
          </div>
        </div>
      )}
    </div>
  );
}
