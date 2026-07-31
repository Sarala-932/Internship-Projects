import { useCallback } from "react";
import toast from "react-hot-toast";

const loadRazorpayScript = () => {
  return new Promise((resolve) => {
    const script = document.createElement("script");
    script.src = "https://checkout.razorpay.com/v1/checkout.js";
    script.onload = () => resolve(true);
    script.onerror = () => resolve(false);
    document.body.appendChild(script);
  });
};

export const useRazorpay = () => {
  
  const openRazorpayModal = useCallback(async ({ orderDetails, userDetails, onSuccess }) => {
    const res = await loadRazorpayScript();

    if (!res) {
      toast.error("Razorpay SDK failed to load. Are you online?");
      return;
    }

    // Usually, the key is passed from the backend or env. 
    // In test mode, razorpay handles test credentials internally if the order was created with test keys.
    // For safety, we use the env variable or fallback to the specific test key
    const keyId = import.meta.env.VITE_RAZORPAY_KEY_ID || "rzp_test_THlZEKgGvMk8uJ";

    const options = {
      key: keyId, 
      amount: orderDetails.amount, 
      currency: orderDetails.currency,
      name: "MedCore Hospital",
      description: "Hospital Bill Payment",
      image: "https://example.com/your_logo", // Optional
      order_id: orderDetails.id, 
      handler: function (response) {
        // This is called when payment succeeds
        onSuccess({
          razorpayPaymentId: response.razorpay_payment_id,
          razorpayOrderId: response.razorpay_order_id,
          razorpaySignature: response.razorpay_signature,
        });
      },
      prefill: {
        name: userDetails?.name || "Patient",
        email: userDetails?.email || "",
        contact: userDetails?.phone || "9999999999",
      },
      theme: {
        color: "#2563eb", // blue-600
      },
    };

    const paymentObject = new window.Razorpay(options);
    
    paymentObject.on("payment.failed", function (response) {
      toast.error(response.error.description || "Payment failed");
    });

    paymentObject.open();
  }, []);

  return { openRazorpayModal };
};
