import {issueOtp} from "./otp.controller.mjs";
import {accessCookieOpts, refreshCookieOpts} from "./token.controller.mjs";
import {registerUserService, loginUserService, getUserByIdService, createStaffUserService} from "../services/user.service.mjs";

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
