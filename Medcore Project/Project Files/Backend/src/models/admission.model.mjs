import mongoose from "mongoose";

const admissionSchema = new mongoose.Schema(
    {
        patientId: {
            type: mongoose.Schema.Types.ObjectId,
            ref: "Patient",
            required: true,
        },
        attendingDoctorId: {
            type: mongoose.Schema.Types.ObjectId,
            ref: "User",
            required: true,
        },
        wardId: {
            type: mongoose.Schema.Types.ObjectId,
            ref: "Ward",
            required: true,
        },
        bedId: {
            type: mongoose.Schema.Types.ObjectId,
            ref: "Bed",
            required: true,
        },
        admissionDate: {
            type: Date,
            required: true,
            default: Date.now,
        },
        dischargeDate: {
            type: Date,
            default: null,
        },
        status: {
            type: String,
            enum: ["admitted", "discharged"],
            default: "admitted",
            required: true,
        },
        reasonForAdmission: {
            type: String,
            required: true,
            trim: true,
        },
        dischargeSummary: {
            type: String,
            default: "",
        },
        totalBilledAmount: {
            type: Number,
            default: 0,
        }
    },
    {timestamps: true}
);

const Admission = mongoose.model("Admission", admissionSchema);
export default Admission;
