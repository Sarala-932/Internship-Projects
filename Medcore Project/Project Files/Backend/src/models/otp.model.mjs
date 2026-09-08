import mongoose from "mongoose";

const otpSchema = new mongoose.Schema(
    {
        email: { type: String, required: true, lowercase: true, trim: true },
        codeHash: { type: String, required: true },
        purpose: {
            type: String,
            required: true,
            enum: ["signup", "password_reset", "login_2fa"]
        },
        attempts: { type: Number, default: 0 },
        expiresAt: { type: Date, required: true },
        consumedAt: { type: Date, default: null }
    },
    {
        timestamps: { createdAt: true, updatedAt: false }
    }
);

otpSchema.index({ expiresAt: 1 }, { expireAfterSeconds: 0 });

otpSchema.index({ email: 1, purpose: 1 });

export default mongoose.model("Otp", otpSchema);
