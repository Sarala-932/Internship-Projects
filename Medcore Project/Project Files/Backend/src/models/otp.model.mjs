import mongoose from "mongoose";

const otpSchema = new mongoose.Schema(
    {
        email: { type: String, required: true, lowercase: true, trim: true },
        codeHash: { type: String, required: true },                            // bcrypt hashed 6-digit OTP
        purpose: {
            type: String,
            required: true,
            enum: ["signup", "password_reset", "login_2fa"]
        },
        attempts: { type: Number, default: 0 },                               // brute force protection — max 5
        expiresAt: { type: Date, required: true },                            // 10 min TTL
        consumedAt: { type: Date, default: null }                             // null = not yet used
    },
    {
        timestamps: { createdAt: true, updatedAt: false }                     // only createdAt needed
    }
);

// TTL Index — MongoDB auto-deletes document when expiresAt passes
otpSchema.index({ expiresAt: 1 }, { expireAfterSeconds: 0 });

// Compound index — same email can have OTPs for different purposes simultaneously
otpSchema.index({ email: 1, purpose: 1 });

export default mongoose.model("Otp", otpSchema);
