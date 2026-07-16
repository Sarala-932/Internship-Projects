import bcrypt from "bcrypt";
import User from "../models/user.model.mjs";
import { issueTokenPair } from "./auth.service.mjs";

const VALID_ROLES = User.schema.path("role").enumValues;

// Helper function to throw custom errors with status code
const createError = (message, status = 400) => {
    const err = new Error(message);
    err.status = status;
    return err;
};

export const registerUserService = async (userData) => {
    const { email, password, firstName, lastName, phone, role } = userData;

    if (!email || !password || !firstName || !lastName) {
        throw createError("email, password, firstName, lastName required", 400);
    }

    if (password.length < 8) {
        throw createError("Password must be at least 8 characters", 400);
    }

    const requestedRole = role || "patient";

    if (!VALID_ROLES.includes(requestedRole)) {
        throw createError("Invalid role", 400);
    }

    if (["super_admin", "admin"].includes(requestedRole)) {
        throw createError("Cannot self-assign admin roles", 403);
    }

    const existing = await User.findOne({ email: email.toLowerCase() });
    if (existing) {
        throw createError("Email already registered", 409);
    }

    const passwordHash = await bcrypt.hash(password, 12);

    const user = await User.create({
        email: email.toLowerCase(),
        passwordHash,
        firstName,
        lastName,
        phone,
        role: requestedRole,
    });

    return user;
};

export const loginUserService = async (email, password) => {
    if (!email || !password) {
        throw createError("email and password required", 400);
    }

    const user = await User.findOne({ email: email.toLowerCase() });
    
    if (!user) {
        throw createError("Invalid credentials", 401);
    }

    if (!user.isActive) {
        throw createError("Account suspended", 403);
    }

    const isMatch = await bcrypt.compare(password, user.passwordHash);
    if (!isMatch) {
        throw createError("Invalid credentials", 401);
    }

    if (!user.isEmailVerified) {
        throw createError("Email not verified. Verify OTP first.", 403);
    }

    // Generate tokens via authServices
    const { accessToken, refreshToken } = await issueTokenPair(user);

    // Update last login
    user.lastLoginAt = new Date();
    await user.save();

    return { user, accessToken, refreshToken };
};

export const getUserByIdService = async (userId) => {
    const user = await User.findById(userId).select(
        "email firstName lastName phone role hospitalId isEmailVerified isActive avatarUrl createdAt"
    );
    
    if (!user) {
        throw createError("User not found", 404);
    }
    
    return user;
};
