import {Router} from "express";
import {resendOtp, verifyOtp} from "../controllers/otp.controller.mjs";
import { login, register, getMe } from "../controllers/user.controller.mjs";
import { getAccessToken, logout } from "../controllers/token.controller.mjs";
import authentication from "../middleware/authMiddleware.mjs";

const router = Router();

router.get("/", (req, res) => {
    res.send({message: "API is running"});
});

router.post("/register",register);
router.post("/login", login);
router.post("/verify-otp", verifyOtp);
router.post("/resend-otp", resendOtp);

router.post("/refresh", getAccessToken);
router.post("/logout", logout);

// Protected routes
router.get("/me", authentication, getMe);

export default router;
