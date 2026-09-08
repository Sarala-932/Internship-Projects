import mongoose from "mongoose";

const resultValueSchema = new mongoose.Schema(
    {
        parameter: {type: String},
        value: {type: String},
        unit: {type: String},
        refRange: {type: String},
        flag: {type: String},
    },
    {_id: false},
);

const resultSchema = new mongoose.Schema(
    {
        values: [resultValueSchema],
        notes: {type: String},
        reportUrl: {type: String},
        completedAt: {type: Date},
        completedBy: {type: mongoose.Schema.Types.ObjectId, ref: "User"},
    },
    {_id: false},
);

const testSchema = new mongoose.Schema(
    {
        name: {type: String, required: true},
        code: {type: String},
        sampleType: {type: String},
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
        orderNumber: {type: String, unique: true, trim: true},
        tests: [testSchema],
        priority: {
            type: String,
            enum: ["routine", "urgent", "stat"],
            default: "routine",
        },
        overallStatus: {
            type: String,
            enum: ["pending", "partial", "completed"],
            default: "pending",
        },
    },
    {timestamps: true},
);

labOrderSchema.index({hospitalId: 1, patientId: 1, createdAt: -1});
labOrderSchema.index({hospitalId: 1, overallStatus: 1});

const LabOrder = mongoose.model("LabOrder", labOrderSchema);

export default LabOrder;
