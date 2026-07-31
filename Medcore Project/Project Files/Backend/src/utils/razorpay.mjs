import Razorpay from "razorpay";
import { config } from "../config/config.mjs";

let razorpayInstance = null;

try {
    razorpayInstance = new Razorpay({
        key_id: config.razorpayKeyId || "rzp_test_dummykey12345",
        key_secret: config.razorpayKeySecret || "dummysecret1234567890",
    });
} catch (error) {
    console.warn("[WARNING] Razorpay initialization failed. Payments won't work correctly.", error.message);
}

export const createRazorpayOrder = async (amountInINR, receiptId) => {
    if (!razorpayInstance) throw new Error("Razorpay not configured");
    
    const options = {
        amount: Math.round(amountInINR * 100), // amount in the smallest currency unit (paise)
        currency: "INR",
        receipt: receiptId,
    };
    
    return razorpayInstance.orders.create(options);
};
