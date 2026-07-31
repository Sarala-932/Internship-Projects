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
    const { email, password, firstName, lastName, phone, role, hospitalId, dob, bloodGroup } = userData;

    if (!email || !password || !firstName || !lastName) {
        throw createError("email, password, firstName, lastName required", 400);
    }

    if (password.length < 8) {
        throw createError("Password must be at least 8 characters", 400);
    }

    const requestedRole = role || "patient";

    if (requestedRole === "patient" && !hospitalId) {
        throw createError("hospitalId is required when registering as a patient", 400);
    }

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

    if (requestedRole === "patient") {
        const { registerPatientService } = await import("./patient.service.mjs");
        await registerPatientService(hospitalId, {
            userId: user._id,
            firstName,
            lastName,
            phone,
            dob,
            bloodGroup,
            email: email.toLowerCase()
        });
    }

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
        "email firstName lastName phone role hospitalId departmentId isEmailVerified isActive avatarUrl createdAt"
    );
    
    if (!user) {
        throw createError("User not found", 404);
    }
    
    return user;
};

// Super Admin / Admin creates staff users (doctor, nurse, etc.)
// These accounts are pre-verified (no OTP needed since admin is creating them)
export const createStaffUserService = async (data, creatorRole) => {
    const { email, password, firstName, lastName, phone, role, hospitalId, departmentId } = data;

    if (!email || !password || !firstName || !lastName || !role) {
        throw createError("email, password, firstName, lastName, role required", 400);
    }

    if (password.length < 8) {
        throw createError("Password must be at least 8 characters", 400);
    }

    if (!VALID_ROLES.includes(role)) {
        throw createError("Invalid role", 400);
    }

    // Admin cannot create super_admin or other admin accounts
    if (creatorRole === "admin" && ["super_admin", "admin"].includes(role)) {
        throw createError("Admin cannot create admin/super_admin accounts", 403);
    }

    // Staff users need a hospitalId
    if (!hospitalId) {
        throw createError("hospitalId is required for staff users", 400);
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
        role,
        hospitalId,
        departmentId: departmentId || undefined,
        isEmailVerified: true, // Admin ne banaya hai, toh verified hai
    });

    return user;
};

// Update user profile
export const updateProfileService = async (userId, data) => {
    const { firstName, lastName, phone } = data;
    
    if (!firstName || !lastName) {
        throw createError("First name and last name are required", 400);
    }

    const user = await User.findById(userId);
    if (!user) {
        throw createError("User not found", 404);
    }

    user.firstName = firstName;
    user.lastName = lastName;
    user.phone = phone || user.phone;

    await user.save();
    return user;
};

// Change password
export const changePasswordService = async (userId, oldPassword, newPassword) => {
    if (!oldPassword || !newPassword) {
        throw createError("Old password and new password are required", 400);
    }
    if (newPassword.length < 8) {
        throw createError("New password must be at least 8 characters", 400);
    }

    const user = await User.findById(userId);
    if (!user) {
        throw createError("User not found", 404);
    }

    const isMatch = await bcrypt.compare(oldPassword, user.passwordHash);
    if (!isMatch) {
        throw createError("Incorrect current password", 401);
    }

    user.passwordHash = await bcrypt.hash(newPassword, 12);
    await user.save();

    return user;
};
