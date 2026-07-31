import {
    generateBillService,
    getBillsService,
    initializePaymentService,
    verifyPaymentService
} from "../services/billing.service.mjs";
import Notification from "../models/notification.model.mjs";
import { emitToUser, emitToRole, broadcastDataUpdate } from "../services/socket.service.mjs";

export const generateBill = async (req, res) => {
    try {
        const bill = await generateBillService(req.hospitalId, req.userId, req.body);
        // 1. Notify the Patient about new bill
        const patientUserId = bill.patientId?.userId;
        if (patientUserId) {
            const patNotif = await Notification.create({
                userId: patientUserId,
                title: "New Bill Generated",
                message: `A bill of ₹${bill.totalAmount} (Invoice: ${bill.billNumber}) has been generated. Please review and pay.`,
                type: "BILLING",
                link: "/patient/bills"
            });
            emitToUser(patientUserId, "notification", patNotif);
        }

        // 2. Notify Admins about new bill
        emitToRole(req.hospitalId, "admin", "notification", {
            title: "New Bill Generated",
            message: `Bill ${bill.billNumber} generated for ₹${bill.totalAmount}`,
            type: "BILLING",
            link: "/admin/billing"
        });

        // 3. Broadcast data update for billing
        broadcastDataUpdate(req.hospitalId, "billing");

        return res.status(201).json({
            message: "Bill generated successfully",
            bill
        });
    } catch (error) {
        return res.status(error.statusCode || 500).json({
            message: error.message || "Failed to generate bill"
        });
    }
};

import Patient from "../models/patient.model.mjs";

export const getBills = async (req, res) => {
    try {
        let queryParams = { ...req.query };
        if (req.role === "patient") {
            const patient = await Patient.findOne({ userId: req.userId });
            if (!patient) return res.status(404).json({ message: "Patient profile not found" });
            queryParams.patientId = patient._id.toString();
        }
        
        const bills = await getBillsService(req.hospitalId, queryParams);
        return res.status(200).json({ bills });
    } catch (error) {
        return res.status(error.statusCode || 500).json({
            message: error.message || "Failed to get bills"
        });
    }
};

export const initializePayment = async (req, res) => {
    try {
        const { billId } = req.params;
        const result = await initializePaymentService(billId, req.hospitalId);
        
        return res.status(200).json({
            message: "Payment initialized",
            ...result
        });
    } catch (error) {
        return res.status(error.statusCode || 500).json({
            message: error.message || "Failed to initialize payment"
        });
    }
};

export const verifyPayment = async (req, res) => {
    try {
        const { billId } = req.params;
        const bill = await verifyPaymentService(billId, req.body);
        
        // --- SEND NOTIFICATION ---
        const patientUserId = bill.patientId?.userId || (bill.patientId && typeof bill.patientId === 'object' ? bill.patientId.userId : null); 
        
        if (patientUserId) {
            const patNotif = await Notification.create({
                userId: patientUserId,
                title: "Payment Successful",
                message: `Payment of ₹${bill.paidAmount} received for Invoice ${bill.billNumber}.`,
                type: "BILLING",
                link: "/patient/bills"
            });
            emitToUser(patientUserId, "notification", patNotif);
        }
        
        // Notify Admins
        const adminMessage = `Payment of ₹${bill.paidAmount} received for Invoice ${bill.billNumber} from patient.`;
        emitToRole(bill.hospitalId, "admin", "notification", {
            title: "New Payment Received",
            message: adminMessage,
            type: "BILLING",
            link: "/admin/billing"
        });

        // Broadcast data update for billing and pharmacy
        broadcastDataUpdate(bill.hospitalId, "billing");
        broadcastDataUpdate(bill.hospitalId, "pharmacy");

        return res.status(200).json({
            message: "Payment verified successfully",
            bill
        });
    } catch (error) {
        return res.status(error.statusCode || 500).json({
            message: error.message || "Failed to verify payment"
        });
    }
};
