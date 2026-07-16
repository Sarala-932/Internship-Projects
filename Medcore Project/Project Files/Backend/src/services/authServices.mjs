import jwt from "jsonwebtoken";
import userModel from "../models/user.model.mjs";
import refreshTokenModel from "../models/refresh-token.model.mjs";
import {
    generateAccessToken,
    generateRefreshToken,
    hashRefreshToken,
    compareRefreshToken,
} from "../utils/generateTokens.mjs";

import {jwtRefreshSecret} from "../../config.mjs";

// Helper — custom error with status
const authError = (message, status = 401) => {
    const err = new Error(message);
    err.status = status;
    return err;
};

// Fresh token pair banao — login + refresh dono use karenge

export const issueTokenPair = async (user) => {
    const accessToken = generateAccessToken(user);
    const refreshToken = generateRefreshToken(user);

    // DB me hashed store — leak ho toh useless
    const hashed = await hashRefreshToken(refreshToken);

    await refreshTokenModel.create({
        userId: user._id,
        hospitalId: user.hospitalId,
        token: hashed,
        expiresAt: new Date(Date.now() + 7 * 24 * 60 * 60 * 1000),
    });

    return {accessToken, refreshToken};
};

// Refresh flow with ROTATION
// 1. JWT signature verify
// 2. DB me matching hashed token dhundo
// 3. Purana delete karo
// 4. Naya pair issue karo
export const getAccessTokenService = async (refreshToken) => {
    let decode;
    try {
        decode = jwt.verify(refreshToken, jwtRefreshSecret);
    } catch {
        throw authError("Invalid or expired refresh token", 401);
    }

    const user = await userModel.findById(decode.id);
    if (!user) throw authError("User not found", 401);
    if (!user.isVerified) throw authError("Email not verified", 403);

    // bcrypt hash query nahi kar sakte — user ke sabhi tokens le ke loop
    const candidates = await refreshTokenModel.find({userId: decode.id});
    let matched = null;
    for (const c of candidates) {
        if (await compareRefreshToken(refreshToken, c.token)) {
            matched = c;
            break;
        }
    }
    if (!matched) throw authError("Refresh token revoked", 401);

    if (matched.expiresAt < new Date()) {
        await refreshTokenModel.deleteOne({_id: matched._id});
        throw authError("Refresh token expired", 401);
    }

    // Rotation — purana delete, naya issue
    await refreshTokenModel.deleteOne({_id: matched._id});
    return issueTokenPair(user);
};

// Logout — DB se refresh token nikal do
export const logoutService = async (refreshToken) => {
    if (!refreshToken) return;
    try {
        const decode = jwt.verify(refreshToken, jwtRefreshSecret);
        const candidates = await refreshTokenModel.find({userId: decode.id});
        for (const c of candidates) {
            if (await compareRefreshToken(refreshToken, c.token)) {
                await refreshTokenModel.deleteOne({_id: c._id});
                break;
            }
        }
    } catch {
        // invalid token — kuch delete karne ko nahi, silent pass
    }
};
