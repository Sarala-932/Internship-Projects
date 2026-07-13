const hospitalSchema = new mongoose.Schema(
    {
        name: {type: String, required: true},
        code: {
            type: String,
            unique: true,
            uppercase: true,
            trim: true,
            sparse: true,
        },

        email: {
            type: String,
            required: true,
            unique: true,
            lowercase: true,
            trim: true,
        },

        phone: {type: String},

        address: {
            line1: {type: String},
            city: {type: String},
            state: {type: String},
            pincode: {type: String},
            country: {type: String, default: "India"},
        },
        logoUrl: {type: String},
        status: {
            type: String,
            enum: ["active", "suspended", "pending"],
            default: "pending",
        },
        verifiedAt: {type: Date},
        verifiedBy: {type: mongoose.Schema.Types.ObjectId, ref: "User"},
    },
    {timestamps: true},
);

const Hospital = mongoose.model("Hospital", hospitalSchema);

export default Hospital

