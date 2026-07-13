import mongoose from "mongoose";

const medicineSchema = new mongoose.Schema(
    {
        name: {type: String, required: true}, // "Paracetamol 500mg"
        genericName: {type: String}, // for pharmacy substitution
        dosage: {type: String}, // "1 tab"
        frequency: {type: String}, // "TID" (3x/day), "BD", "OD"
        route: {
            type: String,
            enum: ["oral", "iv", "im", "topical", "inhalation"],
        },
        durationDays: {type: Number},
        instructions: {type: String}, // "After food", "Before sleep"
        quantity: {type: Number}, // total tablets to dispense
    },
    {_id: false},
);

const prescriptionSchema = new mongoose.Schema(
    {
        hospitalId: {type: mongoose.Schema.Types.ObjectId, ref: "Hospital", required: true},
        encounterId: {type: mongoose.Schema.Types.ObjectId, ref: "Encounter"},
        patientId: {type: mongoose.Schema.Types.ObjectId, ref: "Patient", required: true},
        doctorId: {type: mongoose.Schema.Types.ObjectId, ref: "User", required: true},
        rxNumber: {type: String, unique: true, trim: true}, // "RX-2026-000123" — auto-generated
        medicines: [medicineSchema],
        generalInstructions: {type: String}, // "Drink plenty of water"
        pdfUrl: {type: String}, // signed Rx PDF (Cloudinary/S3)
        dispensedAt: {type: Date},
        dispensedBy: {type: mongoose.Schema.Types.ObjectId, ref: "User"}, // pharmacist
        status: {
            type: String,
            enum: ["issued", "dispensed", "cancelled"],
            default: "issued",
        },
    },
    {
        timestamps: {createdAt: true, updatedAt: false}, // prescription is largely immutable
    },
);

// Indexes
prescriptionSchema.index({hospitalId: 1, patientId: 1, createdAt: -1}); // patient's Rx history
prescriptionSchema.index({rxNumber: 1}, {unique: true}); // unique Rx lookup
prescriptionSchema.index({encounterId: 1}); // encounter → prescriptions

const Prescription = mongoose.model("Prescription", prescriptionSchema);

export default Prescription;
