import {Router} from "express";
import {resendOtp, verifyOtp} from "../features/auth/auth.controller.mjs";

const router = Router();

router.get("/", (req, res) => {
    res.send({message: "API is running"});
});

// router.post("/register");
// router.post("/login");
router.post("/verify-otp", verifyOtp);
router.post("/resend-otp", resendOtp);

export default router;
