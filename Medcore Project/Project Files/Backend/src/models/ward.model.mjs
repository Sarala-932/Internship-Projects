import mongoose from "mongoose";

const wardSchema = new mongoose.Schema(
    {
        hospitalId: {
            type: mongoose.Schema.Types.ObjectId,
            ref: "Hospital",
            required: true,
        },
        name: {
            type: String,
            required: true,
            trim: true,
        },
        type: {
            type: String,
            enum: ["General", "ICU", "Maternity", "Pediatric", "Emergency", "Private"],
            required: true,
        },
        capacity: {
            type: Number,
            required: true,
            default: 10,
        },
        baseChargePerDay: {
            type: Number,
            required: true,
            default: 1000,
        }
    },
    {timestamps: true}
);

// Prevent duplicate ward names per hospital
wardSchema.index({ hospitalId: 1, name: 1 }, { unique: true });

const Ward = mongoose.model("Ward", wardSchema);
export default Ward;
