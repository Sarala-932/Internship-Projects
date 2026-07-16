import {getAccessTokenService, logoutService} from "../services/auth.service.mjs";

const isProd = process.env.NODE_ENV === "production";

const accessCookieOpts = {
    httpOnly: true,
    secure: isProd,
    sameSite: isProd ? "strict" : "lax",
    maxAge: 15 * 60 * 1000, // 15 min
    path: "/",
};

const refreshCookieOpts = {
    httpOnly: true,
    secure: isProd,
    sameSite: isProd ? "strict" : "lax",
    maxAge: 7 * 24 * 60 * 60 * 1000, // 7 days
    path: "/api/auth", // sirf auth endpoints pe bhejna — CSRF safety
};

// POST /api/auth/refresh
export const getAccessToken = async (req, res) => {
    try {
        const refreshToken = req.cookies?.refreshToken;
        if (!refreshToken) {
            return res.status(401).json({message: "No refresh token"});
        }

        const {accessToken, refreshToken: newRefresh} = await getAccessTokenService(refreshToken);

        res.cookie("accessToken", accessToken, accessCookieOpts);
        res.cookie("refreshToken", newRefresh, refreshCookieOpts);

        return res.status(200).json({message: "Tokens refreshed"});
    } catch (error) {
        return res.status(error.status || 500).json({message: error.message || "Refresh failed"});
    }
};

// POST /api/auth/logout
export const logout = async (req, res) => {
    try {
        await logoutService(req.cookies?.refreshToken);
        res.clearCookie("accessToken", {path: "/"});
        res.clearCookie("refreshToken", {path: "/api/auth"});
        return res.status(200).json({message: "Logged out"});
    } catch {
        return res.status(500).json({message: "Logout failed"});
    }
};

export {accessCookieOpts, refreshCookieOpts};
