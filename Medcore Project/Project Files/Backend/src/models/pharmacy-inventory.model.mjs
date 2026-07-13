import mongoose from "mongoose";

const pharmacyInventorySchema = new mongoose.Schema(
    {
        hospitalId: {type: mongoose.Schema.Types.ObjectId, ref: "Hospital", required: true, index: true},
        medicineName: {type: String, required: true, trim: true},
        genericName: {type: String, trim: true},
        brand: {type: String, trim: true},
        category: {
            type: String,
            enum: ["tablet", "syrup", "injection", "capsule", "ointment", "drops", "other"],
            required: true,
        },
        batchNumber: {type: String, required: true},
        manufacturer: {type: String},
        quantity: {type: Number, required: true, min: 0},
        reorderLevel: {type: Number, default: 10},
        unitPrice: {type: Number, required: true, min: 0},
        mrp: {type: Number, required: true, min: 0},
        expiryDate: {type: Date, required: true},
        manufacturedDate: {type: Date},
        isActive: {type: Boolean, default: true},
    },
    {timestamps: true},
);

// Indexes
pharmacyInventorySchema.index({hospitalId: 1, medicineName: 1});
pharmacyInventorySchema.index({hospitalId: 1, batchNumber: 1}, {unique: true});
pharmacyInventorySchema.index({hospitalId: 1, expiryDate: 1}); // for expiry alerts
pharmacyInventorySchema.index({hospitalId: 1, quantity: 1}); // for low-stock alerts

const PharmacyInventory = mongoose.model("PharmacyInventory", pharmacyInventorySchema);

export default PharmacyInventory;
