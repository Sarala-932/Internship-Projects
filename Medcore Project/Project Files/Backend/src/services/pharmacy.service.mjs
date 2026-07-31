import PharmacyInventory from "../models/pharmacy-inventory.model.mjs";
import PharmacyDispense from "../models/pharmacy-dispense.model.mjs";
import Notification from "../models/notification.model.mjs";
import Prescription from "../models/prescription.model.mjs";
import { generateBillService } from "./billing.service.mjs";
import { emitToRole, emitToUser } from "./socket.service.mjs";
import mongoose from "mongoose";

export const addInventoryService = async (hospitalId, data) => {
    // Upsert logic: if batchNumber exists for hospital, update quantity, else create
    const { batchNumber, quantity } = data;
    
    let item = await PharmacyInventory.findOne({ hospitalId, batchNumber });
    
    if (item) {
        item.quantity += quantity;
        Object.assign(item, data); // Update other fields if provided
        await item.save();
    } else {
        item = await PharmacyInventory.create({ ...data, hospitalId });
    }
    return item;
};

export const updateInventoryService = async (hospitalId, inventoryId, data) => {
    const item = await PharmacyInventory.findOneAndUpdate(
        { _id: inventoryId, hospitalId },
        data,
        { new: true, runValidators: true }
    );
    if (!item) {
        const error = new Error("Inventory item not found");
        error.statusCode = 404;
        throw error;
    }
    return item;
};

export const getInventoryService = async (hospitalId, queryParams) => {
    const query = { hospitalId, isActive: true };
    
    if (queryParams.lowStock === 'true') {
        query.$expr = { $lte: ["$quantity", "$reorderLevel"] };
    }
    
    if (queryParams.search) {
        query.medicineName = { $regex: queryParams.search, $options: "i" };
    }

    return PharmacyInventory.find(query).sort({ expiryDate: 1 });
};

export const dispenseMedicineService = async (hospitalId, pharmacistUserId, data) => {
    const { prescriptionId, patientId, items, notes } = data;

    if (!prescriptionId || !patientId || !items || items.length === 0) {
        const error = new Error("Prescription ID, Patient ID, and items are required");
        error.statusCode = 400;
        throw error;
    }

    const prescription = await Prescription.findById(prescriptionId);
    if (!prescription) {
        const error = new Error("Prescription not found");
        error.statusCode = 404;
        throw error;
    }
    if (prescription.status === "dispensed") {
        const error = new Error("This prescription has already been dispensed");
        error.statusCode = 400;
        throw error;
    }

    try {
        let totalAmount = 0;
        const processedItems = [];

        for (const item of items) {
            const inventory = await PharmacyInventory.findOne({ 
                _id: item.inventoryId, 
                hospitalId 
            });

            if (!inventory) {
                throw new Error(`Inventory item not found: ${item.inventoryId}`);
            }

            if (inventory.quantity < item.quantity) {
                throw new Error(`Insufficient stock for ${inventory.medicineName}. Available: ${inventory.quantity}`);
            }

            // Deduct stock
            inventory.quantity -= item.quantity;
            await inventory.save();

            // --- AUTOMATION: Low Stock Alert ---
            if (inventory.quantity <= inventory.reorderLevel) {
                const adminMessage = `Low Stock Alert: ${inventory.medicineName} is running low (Only ${inventory.quantity} left).`;
                emitToRole(hospitalId, "admin", "notification", {
                    title: "Low Inventory Alert",
                    message: adminMessage,
                    type: "SYSTEM",
                    link: "/admin/pharmacy"
                });
            }

            const totalPrice = inventory.unitPrice * item.quantity;
            totalAmount += totalPrice;

            processedItems.push({
                inventoryId: inventory._id,
                medicineName: inventory.medicineName,
                batchNumber: inventory.batchNumber,
                quantity: item.quantity,
                unitPrice: inventory.unitPrice,
                totalPrice
            });
        }

        const dispenseRecord = await PharmacyDispense.create({
            hospitalId,
            prescriptionId,
            patientId,
            dispensedBy: pharmacistUserId,
            items: processedItems,
            totalAmount,
            notes,
            paymentStatus: "pending"
        });

        // --- AUTOMATION: Generate Bill ---
        const billItems = processedItems.map(item => ({
            description: `Pharmacy: ${item.medicineName} (Qty: ${item.quantity})`,
            type: "medicine",
            quantity: item.quantity,
            unitPrice: item.unitPrice,
            totalPrice: item.totalPrice,
            referenceId: dispenseRecord._id
        }));

        await generateBillService(hospitalId, pharmacistUserId, {
            patientId,
            items: billItems,
            discount: 0,
            tax: 0
        });

        // --- AUTOMATION: Update Prescription Status ---
        await Prescription.findByIdAndUpdate(prescriptionId, { status: "dispensed" });

        // Notify Patient
        const patientUser = await mongoose.model("Patient").findById(patientId);
        if (patientUser && patientUser.userId) {
            emitToUser(patientUser.userId, "notification", {
                title: "Pharmacy Bill Generated",
                message: "Your medicines have been dispensed and a new bill has been added to your account.",
                type: "BILLING",
                link: "/patient/bills"
            });
        }

        return dispenseRecord;
    } catch (error) {
        error.statusCode = error.statusCode || 400;
        throw error;
    }
};
