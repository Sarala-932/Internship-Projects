import mongoose from "mongoose";

const dispenseItemSchema = new mongoose.Schema(
    {
        inventoryId: {type: mongoose.Schema.Types.ObjectId, ref: "PharmacyInventory", required: true},
        medicineName: {type: String, required: true},
        batchNumber: {type: String, required: true},
        quantity: {type: Number, required: true, min: 1},
        unitPrice: {type: Number, required: true},
        totalPrice: {type: Number, required: true},
    },
    {_id: false},
);

const pharmacyDispenseSchema = new mongoose.Schema(
    {
        hospitalId: {type: mongoose.Schema.Types.ObjectId, ref: "Hospital", required: true, index: true},
        prescriptionId: {type: mongoose.Schema.Types.ObjectId, ref: "Prescription", required: true},
        patientId: {type: mongoose.Schema.Types.ObjectId, ref: "Patient", required: true},
        dispensedBy: {type: mongoose.Schema.Types.ObjectId, ref: "User", required: true}, // pharmacist
        items: [dispenseItemSchema],
        totalAmount: {type: Number, required: true, min: 0},
        paymentStatus: {type: String, enum: ["pending", "paid", "partial"], default: "pending"},
        dispensedAt: {type: Date, default: Date.now},
        notes: {type: String, trim: true},
    },
    {timestamps: true},
);
pharmacyDispenseSchema.index({hospitalId: 1, prescriptionId: 1});
pharmacyDispenseSchema.index({hospitalId: 1, patientId: 1, dispensedAt: -1});
pharmacyDispenseSchema.index({hospitalId: 1, dispensedBy: 1, dispensedAt: -1});

const PharmacyDispense = mongoose.model("PharmacyDispense", pharmacyDispenseSchema);

export default PharmacyDispense;
