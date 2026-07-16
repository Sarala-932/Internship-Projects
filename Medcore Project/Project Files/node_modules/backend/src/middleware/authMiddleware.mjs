import jwt from "jsonwebtoken";
import userModel from "../models/user.model.mjs";
import {jwtSecret} from "../../config.mjs";

const authentication = async (req, res, next) => {
    try {
        const accessToken = req.cookies?.accessToken;
        if (!accessToken) {
            return res.status(401).json({message: "Unauthorized — no token"});
        }

        let decode;
        try {
            decode = jwt.verify(accessToken, jwtSecret);
        } catch (err) {
            // Frontend "TokenExpiredError" dekh ke /refresh call karega
            const msg = err.name === "TokenExpiredError" ? "Access token expired" : "Invalid access token";
            return res.status(401).json({message: msg, code: err.name});
        }

        const user = await userModel.findById(decode.id).select("-password");
        if (!user) {
            return res.status(401).json({message: "User not found"});
        }
        if (!user.isVerified) {
            return res.status(403).json({message: "Please verify your email first"});
        }

        req.user = user;
        req.userId = user._id;
        req.hospitalId = user.hospitalId; // 🔑 multi-tenant filter
        req.role = user.role;

        next();
    } catch (error) {
        return res.status(500).json({message: "Auth check failed"});
    }
};

// Role check middleware
// Usage: router.get("/admin", authentication, authorize("admin"), handler)
export const authorize =
    (...allowedRoles) =>
    (req, res, next) => {
        if (!req.user) return res.status(401).json({message: "Unauthorized"});
        if (!allowedRoles.includes(req.user.role)) {
            return res.status(403).json({message: "Forbidden — insufficient permissions"});
        }
        next();
    };

export default authentication;
