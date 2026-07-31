import {issueOtp} from "./otp.controller.mjs";
import {accessCookieOpts, refreshCookieOpts} from "./token.controller.mjs";
import {registerUserService, loginUserService, getUserByIdService, createStaffUserService, updateProfileService, changePasswordService} from "../services/user.service.mjs";
import User from "../models/user.model.mjs";
import AuditLog from "../models/audit-logs.model.mjs";

// POST /api/auth/register
export async function register(req, res) {
    try {
        const user = await registerUserService(req.body);

        await issueOtp(user.email, user.firstName);

        return res.status(201).json({
            message: "Account created. Check your email for the OTP.",
            userId: user._id,
            firstName: user.firstName,
            lastName: user.lastName,
            email: user.email,
            role: user.role,
            phone: user.phone,
        });
    } catch (err) {
        console.error("Register error:", err);
        return res.status(err.status || 500).json({message: err.message || "Registration failed"});
    }
}

// POST /api/auth/login
export async function login(req, res) {
    try {
        const {email, password} = req.body;

        const {user, accessToken, refreshToken} = await loginUserService(email, password);

        // Set secure cookies
        res.cookie("accessToken", accessToken, accessCookieOpts);
        res.cookie("refreshToken", refreshToken, refreshCookieOpts);

        return res.json({
            message: "Login successful",
            accessToken,
            user: {
                id: user._id,
                email: user.email,
                firstName: user.firstName,
                lastName: user.lastName,
                role: user.role,
                hospitalId: user.hospitalId,
                isEmailVerified: user.isEmailVerified,
            },
        });
    } catch (err) {
        console.error("Login error:", err);
        return res.status(err.status || 500).json({message: err.message || "Login failed"});
    }
}

// POST /api/auth/forgot-password
export async function forgotPassword(req, res) {
    try {
        const { email } = req.body;
        if (!email) return res.status(400).json({ message: "Email is required" });

        const user = await User.findOne({ email: email.toLowerCase() });
        // Always return success to prevent email enumeration
        if (!user) return res.json({ message: "If this email exists, a reset code has been sent." });

        await issueOtp(user.email, user.firstName, "password_reset");
        return res.json({ message: "If this email exists, a reset code has been sent." });
    } catch (err) {
        console.error("forgotPassword error:", err);
        return res.status(500).json({ message: "Server error" });
    }
}

// POST /api/auth/reset-password
export async function resetPassword(req, res) {
    try {
        const { email, code, newPassword } = req.body;
        if (!email || !code || !newPassword) {
            return res.status(400).json({ message: "Email, code, and new password are required" });
        }
        if (newPassword.length < 8) {
            return res.status(400).json({ message: "Password must be at least 8 characters" });
        }

        // Verify OTP
        const Otp = (await import("../models/otp.model.mjs")).default;
        const { compareOtp } = await import("../utils/otp.mjs");
        const bcrypt = (await import("bcrypt")).default;

        const otp = await Otp.findOne({
            email: email.toLowerCase(),
            purpose: "password_reset",
            consumedAt: null,
        }).sort({ createdAt: -1 });

        if (!otp) return res.status(400).json({ message: "No pending reset request" });
        if (otp.expiresAt < new Date()) return res.status(400).json({ message: "Code expired" });
        if (otp.attempts >= 5) return res.status(429).json({ message: "Too many attempts" });

        const ok = await compareOtp(String(code), otp.codeHash);
        otp.attempts += 1;
        if (!ok) {
            await otp.save();
            return res.status(400).json({ message: "Invalid code" });
        }

        otp.consumedAt = new Date();
        await otp.save();

        const passwordHash = await bcrypt.hash(newPassword, 12);
        await User.updateOne({ email: email.toLowerCase() }, { passwordHash });

        return res.json({ message: "Password reset successful. You can now login." });
    } catch (err) {
        console.error("resetPassword error:", err);
        return res.status(500).json({ message: "Server error" });
    }
}

// GET /api/auth/me (protected route)
export async function getMe(req, res) {
    try {
        const user = await getUserByIdService(req.user._id);

        return res.json({user});
    } catch (err) {
        console.error("getMe error:", err);
        return res.status(err.status || 500).json({message: err.message || "Failed to fetch user"});
    }
}

// POST /api/users/staff — Admin/Super Admin creates staff accounts
export async function createStaffUser(req, res) {
    try {
        const user = await createStaffUserService(req.body, req.user.role);

        return res.status(201).json({
            message: "Staff account created",
            user: {
                id: user._id,
                email: user.email,
                firstName: user.firstName,
                lastName: user.lastName,
                role: user.role,
                hospitalId: user.hospitalId,
                departmentId: user.departmentId,
            },
        });
    } catch (err) {
        console.error("createStaffUser error:", err);
        return res.status(err.status || 500).json({ message: err.message || "Failed to create staff user" });
    }
}

// PATCH /api/users/profile — User updates their own profile
export async function updateProfile(req, res) {
    try {
        const user = await updateProfileService(req.user._id, req.body);
        return res.json({
            message: "Profile updated successfully",
            user: {
                id: user._id,
                email: user.email,
                firstName: user.firstName,
                lastName: user.lastName,
                phone: user.phone,
                role: user.role,
                hospitalId: user.hospitalId,
            }
        });
    } catch (err) {
        console.error("updateProfile error:", err);
        return res.status(err.status || 500).json({ message: err.message || "Failed to update profile" });
    }
}

// PATCH /api/users/password — User changes their password
export async function changePassword(req, res) {
    try {
        const { oldPassword, newPassword } = req.body;
        await changePasswordService(req.user._id, oldPassword, newPassword);
        return res.json({ message: "Password changed successfully" });
    } catch (err) {
        console.error("changePassword error:", err);
        return res.status(err.status || 500).json({ message: err.message || "Failed to change password" });
    }
}

// GET /api/users — List all users (excluding patients for super_admin)
export async function getUsers(req, res) {
    try {
        const filter = {};
        
        // Super admin shouldn't see patients by default
        if (req.user.role === "super_admin") {
            filter.role = { $ne: "patient" };
        } else if (req.user.role === "admin") {
            // Hospital admin only sees their own hospital's staff
            filter.hospitalId = req.user.hospitalId;
            filter.role = { $ne: "super_admin" };
        }

        const users = await User.find(filter)
            .select("-passwordHash")
            .populate("hospitalId", "name")
            .populate("departmentId", "name")
            .sort({ createdAt: -1 });

        return res.json({ users });
    } catch (err) {
        console.error("getUsers error:", err);
        return res.status(500).json({ message: "Failed to fetch users" });
    }
}

// PATCH /api/users/:id/status — Block/Unblock a user
export async function toggleUserStatus(req, res) {
    try {
        const userToUpdate = await User.findById(req.params.id);
        if (!userToUpdate) {
            return res.status(404).json({ message: "User not found" });
        }

        // Prevent suspending another super_admin
        if (userToUpdate.role === "super_admin" && req.user._id.toString() !== userToUpdate._id.toString()) {
            return res.status(403).json({ message: "Cannot modify other super admins" });
        }

        // Hospital admin can only modify their own hospital's users
        if (req.user.role === "admin" && userToUpdate.hospitalId?.toString() !== req.user.hospitalId?.toString()) {
            return res.status(403).json({ message: "Not authorized to modify this user" });
        }

        userToUpdate.isActive = !userToUpdate.isActive;
        await userToUpdate.save();

        await AuditLog.create({
            action: "update",
            resource: "user",
            resourceId: userToUpdate._id,
            userId: req.user._id,
            userRole: req.user.role,
            hospitalId: req.user.hospitalId || userToUpdate.hospitalId,
            metadata: { 
                action_detail: userToUpdate.isActive ? "activate_user" : "suspend_user",
                targetUserEmail: userToUpdate.email 
            }
        });

        return res.json({ 
            message: `User account ${userToUpdate.isActive ? 'activated' : 'suspended'} successfully`,
            isActive: userToUpdate.isActive
        });
    } catch (err) {
        console.error("toggleUserStatus error:", err);
        return res.status(500).json({ message: "Failed to update user status" });
    }
}
