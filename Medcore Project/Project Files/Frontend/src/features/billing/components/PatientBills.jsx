import { useEffect } from "react";
import { useSelector } from "react-redux";
import { useBilling } from "../hook/useBilling";
import { useRazorpay } from "../hook/useRazorpay";
import { CreditCard, FileText, Download, CheckCircle2, AlertCircle } from "lucide-react";
import toast from "react-hot-toast";

export default function PatientBills() {
  const { bills, isLoading, fetchBills, initPayment, verifyPayment } = useBilling();
  const { openRazorpayModal } = useRazorpay();
  const { user } = useSelector((state) => state.auth);

  useEffect(() => {
    fetchBills();
    // eslint-disable-next-line react-hooks/exhaustive-deps
  }, []);

  const handlePay = async (bill) => {
    try {
      // 1. Initialize Order from Backend
      const orderDetails = await initPayment(bill._id);

      // 2. Open Razorpay Modal
      openRazorpayModal({
        orderDetails,
        userDetails: { name: user?.firstName, email: user?.email, phone: user?.phone },
        onSuccess: async (paymentResult) => {
          // 3. Verify Payment with Backend
          await verifyPayment(bill._id, {
            transactionId: paymentResult.razorpayPaymentId,
            method: "netbanking", // In a real app, Razorpay gives this info optionally, or we just pass 'razorpay'
          });
        }
      });
    } catch (err) {
      console.error("Payment flow error:", err);
    }
  };

  const getStatusColor = (status) => {
    switch (status) {
      case 'paid': return 'bg-green-100 text-green-700 border-green-200';
      case 'issued': return 'bg-amber-100 text-amber-700 border-amber-200';
      case 'cancelled': return 'bg-red-100 text-red-700 border-red-200';
      default: return 'bg-slate-100 text-slate-700 border-slate-200';
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
              <h1 style="margin: 0 0 4px; font-size: 24px;">INVOICE / RECEIPT</h1>
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
    setTimeout(() => {
      printWindow.print();
    }, 500);
  };

  return (
    <div className="space-y-6">
      <div className="flex flex-col sm:flex-row justify-between items-start sm:items-center gap-4">
        <div>
          <h2 className="text-2xl font-bold text-slate-900 dark:text-white">My Invoices</h2>
          <p className="text-sm text-slate-500 dark:text-slate-400 mt-1">View and pay your medical bills</p>
        </div>
      </div>

      {isLoading ? (
        <div className="flex justify-center items-center py-20">
          <div className="animate-spin rounded-full h-8 w-8 border-b-2 border-blue-600"></div>
        </div>
      ) : bills.length === 0 ? (
        <div className="bg-white dark:bg-slate-800 rounded-2xl border border-slate-200 dark:border-slate-700 p-12 text-center shadow-sm">
          <div className="w-16 h-16 bg-blue-50 dark:bg-slate-800 rounded-full flex items-center justify-center mx-auto mb-4 border border-blue-100 dark:border-slate-700">
            <FileText className="w-8 h-8 text-blue-500" />
          </div>
          <h3 className="text-lg font-bold text-slate-900 dark:text-white">No Invoices Found</h3>
          <p className="text-sm text-slate-500 dark:text-slate-400 mt-1 max-w-sm mx-auto">
            You don't have any medical bills or invoices generated yet.
          </p>
        </div>
      ) : (
        <div className="grid gap-4">
          {bills.map((bill) => (
            <div 
              key={bill._id} 
              className="bg-white dark:bg-slate-800 rounded-xl border border-slate-200 dark:border-slate-700 p-5 sm:p-6 shadow-sm hover:shadow-md transition-shadow flex flex-col sm:flex-row gap-6 justify-between"
            >
              <div className="flex gap-4">
                <div className={`w-12 h-12 rounded-full flex items-center justify-center flex-shrink-0 ${
                  bill.status === 'paid' ? 'bg-green-50 dark:bg-green-900/20' : 'bg-blue-50 dark:bg-blue-900/20'
                }`}>
                  <FileText className={`w-6 h-6 ${
                    bill.status === 'paid' ? 'text-green-600 dark:text-green-400' : 'text-blue-600 dark:text-blue-400'
                  }`} />
                </div>
                
                <div>
                  <div className="flex items-center gap-3 mb-1">
                    <h3 className="text-lg font-bold text-slate-900 dark:text-white">{bill.billNumber}</h3>
                    <span className={`px-2.5 py-0.5 rounded-full text-xs font-semibold border ${getStatusColor(bill.status)} capitalize`}>
                      {bill.status}
                    </span>
                  </div>
                  
                  <p className="text-sm text-slate-500 dark:text-slate-400 mb-3">
                    Issued on {new Date(bill.issuedAt || bill.createdAt).toLocaleDateString()}
                  </p>
                  
                  <div className="flex flex-col gap-1">
                    {bill.items.map((item, idx) => (
                      <div key={idx} className="text-sm flex items-center gap-2">
                        <span className="w-1.5 h-1.5 rounded-full bg-slate-300 dark:bg-slate-600"></span>
                        <span className="text-slate-700 dark:text-slate-300">{item.description}</span>
                      </div>
                    ))}
                  </div>
                </div>
              </div>
              
              <div className="flex flex-col items-start sm:items-end justify-between border-t sm:border-t-0 sm:border-l border-slate-100 dark:border-slate-700 pt-4 sm:pt-0 sm:pl-6 min-w-[200px]">
                <div className="mb-4 sm:mb-0 w-full sm:w-auto">
                  <p className="text-xs text-slate-500 dark:text-slate-400 uppercase font-semibold tracking-wider mb-1 sm:text-right">Total Amount</p>
                  <p className="text-2xl font-bold text-slate-900 dark:text-white sm:text-right">₹{bill.totalAmount}</p>
                </div>
                
                <div className="w-full flex gap-2">
                  <button onClick={() => handlePrint(bill)} className="flex-1 sm:flex-none p-2 rounded-lg text-slate-500 hover:bg-slate-50 dark:text-slate-400 dark:hover:bg-slate-700 border border-slate-200 dark:border-slate-600 transition-colors tooltip" title="Download / Print Receipt">
                    <Download className="w-5 h-5 mx-auto" />
                  </button>
                  
                  {bill.status === "issued" ? (
                    <button 
                      onClick={() => handlePay(bill)}
                      className="flex-1 sm:flex-none px-6 py-2 bg-blue-600 hover:bg-blue-700 text-white text-sm font-medium rounded-lg transition-colors flex items-center justify-center gap-2"
                    >
                      <CreditCard className="w-4 h-4" />
                      Pay ₹{bill.dueAmount}
                    </button>
                  ) : bill.status === "paid" ? (
                    <div className="flex-1 sm:flex-none px-6 py-2 bg-green-50 dark:bg-green-900/20 text-green-700 dark:text-green-400 text-sm font-medium rounded-lg flex items-center justify-center gap-2">
                      <CheckCircle2 className="w-4 h-4" />
                      Paid
                    </div>
                  ) : null}
                </div>
              </div>
            </div>
          ))}
        </div>
      )}
    </div>
  );
}
