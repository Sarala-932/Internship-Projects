import mongoose from "mongoose";

// Vitals — nurse enters at check-in
const vitalsSchema = new mongoose.Schema(
    {
        heightCm: {type: Number},
        weightKg: {type: Number},
        bmi: {type: Number},
        tempC: {type: Number},
        pulseBpm: {type: Number},
        bpSystolic: {type: Number},
        bpDiastolic: {type: Number},
        spo2: {type: Number},
        respiratoryRate: {type: Number},
        recordedBy: {type: mongoose.Schema.Types.ObjectId, ref: "User"}, // nurse
        recordedAt: {type: Date},
    },
    {_id: false},
);

// ICD-10 Diagnosis
const diagnosisSchema = new mongoose.Schema(
    {
        icd10Code: {type: String}, // "I10"
        description: {type: String}, // "Essential hypertension"
        type: {type: String, enum: ["primary", "secondary"]},
    },
    {_id: false},
);

// Attachments — lab reports, X-rays, scans
const attachmentSchema = new mongoose.Schema(
    {
        url: {type: String},
        name: {type: String},
        uploadedAt: {type: Date, default: Date.now},
    },
    {_id: false},
);

const encounterSchema = new mongoose.Schema(
    {
        hospitalId: {type: mongoose.Schema.Types.ObjectId, ref: "Hospital", required: true},
        appointmentId: {type: mongoose.Schema.Types.ObjectId, ref: "Appointment"},
        patientId: {type: mongoose.Schema.Types.ObjectId, ref: "Patient", required: true},
        doctorId: {type: mongoose.Schema.Types.ObjectId, ref: "User", required: true},
        encounterDate: {type: Date, required: true},
        vitals: {type: vitalsSchema},
        chiefComplaint: {type: String},
        historyOfPresentIllness: {type: String}, // HPI — SOAP: Subjective
        examination: {type: String}, // SOAP: Objective
        diagnosis: [diagnosisSchema], // SOAP: Assessment — ICD-10
        clinicalNotes: {type: String},
        advice: {type: String}, // SOAP: Plan
        followUpDate: {type: Date},
        attachments: [attachmentSchema],
        status: {
            type: String,
            enum: ["draft", "signed", "amended"],
            default: "draft", // doctor signs = medical-legal lock
        },
        signedAt: {type: Date},
    },
    {timestamps: true},
);

// Indexes
encounterSchema.index({hospitalId: 1, patientId: 1, encounterDate: -1}); // patient history
encounterSchema.index({appointmentId: 1}, {unique: true}); // 1 appointment = 1 encounter
encounterSchema.index({doctorId: 1, encounterDate: -1}); // doctor's encounter history

const Encounter = mongoose.model("Encounter", encounterSchema);

export default Encounter;
