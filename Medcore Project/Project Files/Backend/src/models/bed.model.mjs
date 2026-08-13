import mongoose from "mongoose";

const bedSchema = new mongoose.Schema(
    {
        wardId: {
            type: mongoose.Schema.Types.ObjectId,
            ref: "Ward",
            required: true,
        },
        bedNumber: {
            type: String,
            required: true,
            trim: true,
        },
        status: {
            type: String,
            enum: ["available", "occupied", "maintenance"],
            default: "available",
            required: true,
        },
        currentAdmissionId: {
            type: mongoose.Schema.Types.ObjectId,
            ref: "Admission",
            default: null,
        }
    },
    {timestamps: true}
);

// Prevent duplicate bed numbers within the same ward
bedSchema.index({ wardId: 1, bedNumber: 1 }, { unique: true });

const Bed = mongoose.model("Bed", bedSchema);
export default Bed;
