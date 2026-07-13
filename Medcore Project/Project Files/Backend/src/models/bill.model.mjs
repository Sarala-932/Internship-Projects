import mongoose from "mongoose";

const billItemSchema = new mongoose.Schema(
    {
        type: {
            type: String,
            enum: ["consultation", "medicine", "lab", "procedure", "room", "other"],
            required: true,
        },
        description: {type: String, required: true},
        quantity: {type: Number, default: 1, min: 1},
        unitPrice: {type: Number, required: true, min: 0},
        discount: {type: Number, default: 0, min: 0},
        tax: {type: Number, default: 0, min: 0},
        totalPrice: {type: Number, required: true, min: 0},
        referenceId: {type: mongoose.Schema.Types.ObjectId}, // links to appointment/prescription/labOrder
    },
    {_id: false},
);

const paymentSchema = new mongoose.Schema(
    {
        amount: {type: Number, required: true, min: 0},
        method: {type: String, enum: ["cash", "card", "upi", "insurance", "netbanking"], required: true},
        transactionId: {type: String},
        paidAt: {type: Date, default: Date.now},
        receivedBy: {type: mongoose.Schema.Types.ObjectId, ref: "User"},
    },
    {_id: false},
);

const billSchema = new mongoose.Schema(
    {
        hospitalId: {type: mongoose.Schema.Types.ObjectId, ref: "Hospital", required: true, index: true},
        billNumber: {type: String, required: true}, // auto-generated: INV-2026-0001
        patientId: {type: mongoose.Schema.Types.ObjectId, ref: "Patient", required: true},
        encounterId: {type: mongoose.Schema.Types.ObjectId, ref: "Encounter"},
        items: [billItemSchema],
        subtotal: {type: Number, required: true, min: 0},
        totalDiscount: {type: Number, default: 0, min: 0},
        totalTax: {type: Number, default: 0, min: 0},
        totalAmount: {type: Number, required: true, min: 0},
        paidAmount: {type: Number, default: 0, min: 0},
        dueAmount: {type: Number, default: 0, min: 0},
        status: {
            type: String,
            enum: ["draft", "issued", "partial", "paid", "cancelled", "refunded"],
            default: "draft",
        },
        payments: [paymentSchema],
        pdfUrl: {type: String},
        generatedBy: {type: mongoose.Schema.Types.ObjectId, ref: "User", required: true},
        issuedAt: {type: Date},
        dueDate: {type: Date},
    },
    {timestamps: true},
);

// Indexes
billSchema.index({hospitalId: 1, billNumber: 1}, {unique: true});
billSchema.index({hospitalId: 1, patientId: 1, createdAt: -1});
billSchema.index({hospitalId: 1, status: 1});
billSchema.index({hospitalId: 1, issuedAt: -1});

const Bill = mongoose.model("Bill", billSchema);

export default Bill;
