import mongoose from "mongoose";

const masterSpecialitySchema = new mongoose.Schema(
    {
        name: {
            type: String,
            required: true,
            unique: true,
            trim: true,
        },
        description: {
            type: String,
        },
        icon: {
            type: String, // lucide-react icon name e.g. "Heart", "Brain"
            default: "Activity",
        },
        isActive: {
            type: Boolean,
            default: true,
        }
    },
    { timestamps: true }
);

masterSpecialitySchema.index({ isActive: 1 });

const MasterSpeciality = mongoose.model("MasterSpeciality", masterSpecialitySchema);

export default MasterSpeciality;
