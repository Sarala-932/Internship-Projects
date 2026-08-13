import mongoose from "mongoose";

const admissionRequestSchema = new mongoose.Schema(
    {
        patientId: {
            type: mongoose.Schema.Types.ObjectId,
            ref: "Patient",
            required: true,
        },
        requestingDoctorId: {
            type: mongoose.Schema.Types.ObjectId,
            ref: "User",
            required: true,
        },
        hospitalId: {
            type: mongoose.Schema.Types.ObjectId,
            ref: "Hospital",
            required: true,
        },
        wardTypeRequested: {
            type: String,
            enum: ["General", "ICU", "Maternity", "Pediatric", "Emergency", "Private"],
            required: true,
        },
        reasonForAdmission: {
            type: String,
            required: true,
            trim: true,
        },
        priority: {
            type: String,
            enum: ["Normal", "High", "Critical"],
            default: "Normal",
        },
        status: {
            type: String,
            enum: ["pending", "approved", "rejected", "cancelled"],
            default: "pending",
        },
        admittedToBedId: {
            type: mongoose.Schema.Types.ObjectId,
            ref: "Bed",
            default: null,
        }
    },
    { timestamps: true }
);

// Indexes for faster querying
admissionRequestSchema.index({ hospitalId: 1, status: 1 });
admissionRequestSchema.index({ patientId: 1, status: 1 });

const AdmissionRequest = mongoose.model("AdmissionRequest", admissionRequestSchema);
export default AdmissionRequest;
