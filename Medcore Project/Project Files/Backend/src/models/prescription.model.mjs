import mongoose from "mongoose";

const medicineSchema = new mongoose.Schema(
    {
        name: {type: String, required: true},
        genericName: {type: String},
        dosage: {type: String},
        frequency: {type: String},
        route: {
            type: String,
            enum: ["oral", "iv", "im", "topical", "inhalation"],
        },
        durationDays: {type: Number},
        instructions: {type: String},
        quantity: {type: Number},
    },
    {_id: false},
);

const prescriptionSchema = new mongoose.Schema(
    {
        hospitalId: {type: mongoose.Schema.Types.ObjectId, ref: "Hospital", required: true},
        encounterId: {type: mongoose.Schema.Types.ObjectId, ref: "Encounter"},
        patientId: {type: mongoose.Schema.Types.ObjectId, ref: "Patient", required: true},
        doctorId: {type: mongoose.Schema.Types.ObjectId, ref: "User", required: true},
        rxNumber: {type: String, unique: true, trim: true},
        medicines: [medicineSchema],
        generalInstructions: {type: String},
        pdfUrl: {type: String},
        dispensedAt: {type: Date},
        dispensedBy: {type: mongoose.Schema.Types.ObjectId, ref: "User"},
        status: {
            type: String,
            enum: ["issued", "dispensed", "cancelled"],
            default: "issued",
        },
    },
    {
        timestamps: {createdAt: true, updatedAt: false},
    },
);

prescriptionSchema.index({hospitalId: 1, patientId: 1, createdAt: -1});
prescriptionSchema.index({encounterId: 1});

const Prescription = mongoose.model("Prescription", prescriptionSchema);

export default Prescription;
