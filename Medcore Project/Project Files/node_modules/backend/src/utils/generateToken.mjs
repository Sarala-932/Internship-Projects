import jwt from "jsonwebtoken";
import bcrypt from "bcrypt";
import {jwtSecret, jwtRefreshSecret, accessTokenExpiry, refreshTokenExpiry} from "../../config.mjs";

export const generateAccessToken = (user) =>
    jwt.sign({id: user._id, hospitalId: user.hospitalId, role: user.role}, jwtSecret, {
        expiresIn: accessTokenExpiry || "15m",
    });

export const generateRefreshToken = (user) =>
    jwt.sign({id: user._id, hospitalId: user.hospitalId, role: user.role}, jwtRefreshSecret, {
        expiresIn: refreshTokenExpiry || "7d",
    });

export const hashRefreshToken = async (token) => bcrypt.hash(token, 10);

export const compareRefreshToken = async (token, hashed) => bcrypt.compare(token, hashed);
