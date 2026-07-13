import mongoose from "mongoose";

const refreshTokenSchema = new mongoose.Schema(
    {
        userId: {
            type: mongoose.Schema.Types.ObjectId,
            ref: "User",
            required: true,
            index: true,
        },

        tokenHash: {
            type: String,
            required: true,
            unique: true,
        },

        deviceInfo: {
            type: String,
        },

        ipAddress: {
            type: String,
        },

        expiresAt: {
            type: Date,
            required: true,
        },

        revokedAt: {
            type: Date,
        },

        replacedBy: {
            type: String,
        },
    },
    {timestamps: true},
);

refreshTokenSchema.index({expiresAt: 1}, {expireAfterSeconds: 0});

const RefreshToken = mongoose.model("RefreshToken", refreshTokenSchema);

export default RefreshToken;
