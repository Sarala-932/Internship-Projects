import mongoose from "mongoose";

// Individual test result parameter — e.g. CBC mein WBC, RBC, HGB sab alag
const resultValueSchema = new mongoose.Schema(
    {
        parameter: {type: String}, // "WBC", "HGB", "Platelets"
        value: {type: String}, // "11.2"
        unit: {type: String}, // "g/dL"
        refRange: {type: String}, // "12.0 - 16.0"
        flag: {type: String}, // "L" (Low), "H" (High), "N" (Normal)
    },
    {_id: false},
);

// Result of a single test
const resultSchema = new mongoose.Schema(
    {
        values: [resultValueSchema],
        notes: {type: String},
        reportUrl: {type: String}, // PDF report
        completedAt: {type: Date},
        completedBy: {type: mongoose.Schema.Types.ObjectId, ref: "User"}, // lab_tech
    },
    {_id: false},
);

// Individual test inside an order
const testSchema = new mongoose.Schema(
    {
        name: {type: String, required: true}, // "CBC", "LFT", "Blood Sugar"
        code: {type: String}, // LOINC code — international standard
        sampleType: {type: String}, // "Blood", "Urine", "Stool"
        status: {
            type: String,
            enum: ["ordered", "collected", "processing", "completed", "cancelled"],
            default: "ordered",
        },
        result: {type: resultSchema},
    },
    {_id: false},
);

const labOrderSchema = new mongoose.Schema(
    {
        hospitalId: {type: mongoose.Schema.Types.ObjectId, ref: "Hospital", required: true},
        encounterId: {type: mongoose.Schema.Types.ObjectId, ref: "Encounter"},
        patientId: {type: mongoose.Schema.Types.ObjectId, ref: "Patient", required: true},
        orderedByDoctorId: {type: mongoose.Schema.Types.ObjectId, ref: "User", required: true},
        orderNumber: {type: String, unique: true, trim: true}, // "LAB-2026-000045" — auto-generated
        tests: [testSchema],
        priority: {
            type: String,
            enum: ["routine", "urgent", "stat"], // stat = emergency, do ASAP
            default: "routine",
        },
        overallStatus: {
            type: String,
            enum: ["pending", "partial", "completed"], // partial = some tests done
            default: "pending",
        },
    },
    {timestamps: true},
);

// Indexes
labOrderSchema.index({hospitalId: 1, patientId: 1, createdAt: -1}); // patient's lab history
labOrderSchema.index({orderNumber: 1}, {unique: true}); // unique order lookup
labOrderSchema.index({hospitalId: 1, overallStatus: 1}); // lab dashboard — pending orders

const LabOrder = mongoose.model("LabOrder", labOrderSchema);

export default LabOrder;
