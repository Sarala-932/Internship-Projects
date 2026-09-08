import jwt from "jsonwebtoken";
import userModel from "../models/user.model.mjs";
import refreshTokenModel from "../models/refresh-token.model.mjs";
import {
    generateAccessToken,
    generateRefreshToken,
    hashRefreshToken,
    compareRefreshToken,
} from "../utils/generateToken.mjs";

import {config} from "../config/config.mjs";
const jwtRefreshSecret = config.jwtRefreshSecret;

const authError = (message, status = 401) => {
    const err = new Error(message);
    err.status = status;
    return err;
};

export const issueTokenPair = async (user) => {
    const accessToken = generateAccessToken(user);
    const refreshToken = generateRefreshToken(user);

    const hashed = await hashRefreshToken(refreshToken);

    await refreshTokenModel.create({
        userId: user._id,
        hospitalId: user.hospitalId || null,
        tokenHash: hashed,
        expiresAt: new Date(Date.now() + 7 * 24 * 60 * 60 * 1000),
    });

    return {accessToken, refreshToken};
};

export const getAccessTokenService = async (refreshToken) => {
    let decode;
    try {
        decode = jwt.verify(refreshToken, jwtRefreshSecret);
    } catch {
        throw authError("Invalid or expired refresh token", 401);
    }

    const user = await userModel.findById(decode.id);
    if (!user) throw authError("User not found", 401);
    if (!user.isEmailVerified) throw authError("Email not verified", 403);

    const candidates = await refreshTokenModel.find({userId: decode.id});
    let matched = null;
    for (const c of candidates) {
        if (await compareRefreshToken(refreshToken, c.tokenHash)) {
            matched = c;
            break;
        }
    }
    if (!matched) throw authError("Refresh token revoked", 401);

    if (matched.expiresAt < new Date()) {
        await refreshTokenModel.deleteOne({_id: matched._id});
        throw authError("Refresh token expired", 401);
    }

    await refreshTokenModel.deleteOne({_id: matched._id});
    return issueTokenPair(user);
};

export const logoutService = async (refreshToken) => {
    if (!refreshToken) return;
    try {
        const decode = jwt.verify(refreshToken, jwtRefreshSecret);
        const candidates = await refreshTokenModel.find({userId: decode.id});
        for (const c of candidates) {
            if (await compareRefreshToken(refreshToken, c.tokenHash)) {
                await refreshTokenModel.deleteOne({_id: c._id});
                break;
            }
        }
    } catch {

    }
};
