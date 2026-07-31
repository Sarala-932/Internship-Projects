import Bill from "../models/bill.model.mjs";
import PharmacyDispense from "../models/pharmacy-dispense.model.mjs";
import { createRazorpayOrder } from "../utils/razorpay.mjs";

const generateBillNumber = async () => {
    const year = new Date().getFullYear();
    const count = await Bill.countDocuments();
    return `INV-${year}-${String(count + 1).padStart(4, "0")}`;
};

export const generateBillService = async (hospitalId, staffUserId, data) => {
    const { patientId, encounterId, items, discount = 0, tax = 0 } = data;

    if (!patientId || !items || items.length === 0) {
        const error = new Error("Patient ID and items are required");
        error.statusCode = 400;
        throw error;
    }

    const subtotal = items.reduce((acc, item) => acc + item.totalPrice, 0);
    const totalAmount = subtotal - discount + tax;

    const billNumber = await generateBillNumber();

    const bill = await Bill.create({
        hospitalId,
        billNumber,
        patientId,
        encounterId,
        items,
        subtotal,
        totalDiscount: discount,
        totalTax: tax,
        totalAmount,
        dueAmount: totalAmount,
        status: "issued",
        generatedBy: staffUserId,
        issuedAt: new Date()
    });

    return bill.populate("patientId", "firstName lastName mrn userId");
};

export const getBillsService = async (hospitalId, queryParams) => {
    const query = {};
    if (hospitalId) {
        query.hospitalId = hospitalId;
    }
    
    if (queryParams.search) {
        query.billNumber = { $regex: queryParams.search, $options: "i" };
        // Could expand to search by patient name using aggregate or populate
    }

    if (queryParams.patientId) {
        query.patientId = queryParams.patientId;
    }

    return Bill.find(query)
        .populate("patientId", "firstName lastName mrn")
        .sort({ createdAt: -1 });
};

export const initializePaymentService = async (billId, hospitalId) => {
    const query = { _id: billId };
    if (hospitalId) {
        query.hospitalId = hospitalId;
    }
    const bill = await Bill.findOne(query);
    if (!bill) {
        const error = new Error("Bill not found");
        error.statusCode = 404;
        throw error;
    }

    if (bill.status === "paid") {
        const error = new Error("Bill is already paid");
        error.statusCode = 400;
        throw error;
    }

    const amountToPay = bill.dueAmount;
    
    // Create Razorpay Order
    const razorpayOrder = await createRazorpayOrder(amountToPay, bill.billNumber);

    return {
        bill,
        razorpayOrder
    };
};

export const verifyPaymentService = async (billId, paymentData) => {
    const { method = "netbanking", transactionId } = paymentData;
    
    const bill = await Bill.findById(billId);
    if (!bill) throw new Error("Bill not found");

    if (bill.status === "paid") {
        throw new Error("Bill is already fully paid");
    }

    bill.paidAmount = bill.totalAmount;
    bill.dueAmount = 0;
    bill.status = "paid";
    
    bill.payments.push({
        amount: bill.paidAmount,
        method: method, 
        transactionId: transactionId || "TXN_" + Date.now(),
        paidAt: new Date()
    });

    await bill.save();

    // --- AUTOMATION: Mark ONLY the specific Pharmacy Dispenses as paid ---
    const dispenseIds = bill.items
        .filter(item => item.type === "medicine" && item.referenceId)
        .map(item => item.referenceId);

    if (dispenseIds.length > 0) {
        await PharmacyDispense.updateMany(
            { _id: { $in: dispenseIds }, paymentStatus: "pending" },
            { paymentStatus: "paid" }
        );
    }

    return bill.populate("patientId", "firstName lastName mrn userId");
};
