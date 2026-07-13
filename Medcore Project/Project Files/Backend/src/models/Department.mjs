import mongoose from "mongoose";

const departmentSchema = new mongoose.Schema(
    {
        hospitalId: { type: mongoose.Schema.Types.ObjectId, ref: "Hospital", required: true },
        name: { type: String, required: true },       // "Cardiology"
        code: { type: String, required: true, uppercase: true, trim: true }, // "CARD"
        headDoctorId: { type: mongoose.Schema.Types.ObjectId, ref: "User" }, // department head
        description: { type: String },
        isActive: { type: Boolean, default: true }
    },
    { timestamps: true }
);

// Indexes
departmentSchema.index({ hospitalId: 1, code: 1 }, { unique: true }); // same code allowed in different hospitals
departmentSchema.index({ hospitalId: 1, isActive: 1 });

export default mongoose.model("Department", departmentSchema);
