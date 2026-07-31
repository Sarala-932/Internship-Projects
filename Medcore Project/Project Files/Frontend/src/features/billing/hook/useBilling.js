import { useDispatch, useSelector } from "react-redux";
import { setBills, updateBillStatus, setLoading, setError } from "../state/billingSlice";
import { getBillsService, initializePaymentService, verifyPaymentService } from "../service/billing.service";
import toast from "react-hot-toast";

export const useBilling = () => {
  const dispatch = useDispatch();
  const { bills, isLoading, error } = useSelector((state) => state.billing);

  const fetchBills = async (queryParams = "") => {
    dispatch(setLoading(true));
    try {
      const data = await getBillsService(queryParams);
      dispatch(setBills(data.bills));
      dispatch(setError(null));
    } catch (err) {
      dispatch(setError(err.response?.data?.message || err.message));
      toast.error("Failed to fetch bills");
    } finally {
      dispatch(setLoading(false));
    }
  };

  const initPayment = async (billId) => {
    try {
      const data = await initializePaymentService(billId);
      return data.razorpayOrder; // Returns the razorpay order object
    } catch (err) {
      toast.error(err.response?.data?.message || "Failed to initialize payment");
      throw err;
    }
  };

  const verifyPayment = async (billId, paymentData) => {
    try {
      const data = await verifyPaymentService(billId, paymentData);
      dispatch(updateBillStatus({ 
        billId, 
        status: "paid", 
        paidAmount: data.bill.paidAmount, 
        dueAmount: 0 
      }));
      toast.success("Payment successful!");
      return data.bill;
    } catch (err) {
      toast.error(err.response?.data?.message || "Payment verification failed");
      throw err;
    }
  };

  return {
    bills,
    isLoading,
    error,
    fetchBills,
    initPayment,
    verifyPayment
  };
};
