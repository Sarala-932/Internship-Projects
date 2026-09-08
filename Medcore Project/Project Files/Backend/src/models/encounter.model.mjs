import mongoose from "mongoose";

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
        recordedBy: {type: mongoose.Schema.Types.ObjectId, ref: "User"},
        recordedAt: {type: Date},
    },
    {_id: false},
);

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
        historyOfPresentIllness: {type: String},
        examination: {type: String},
        diagnosis: {type: String},
        clinicalNotes: {type: String},
        advice: {type: String},
        followUpDate: {type: Date},
        attachments: [attachmentSchema],
        status: {
            type: String,
            enum: ["draft", "signed", "amended"],
            default: "draft",
        },
        signedAt: {type: Date},
    },
    {timestamps: true},
);

encounterSchema.index({hospitalId: 1, patientId: 1, encounterDate: -1});
encounterSchema.index({appointmentId: 1}, {unique: true});
encounterSchema.index({doctorId: 1, encounterDate: -1});

const Encounter = mongoose.model("Encounter", encounterSchema);

export default Encounter;
