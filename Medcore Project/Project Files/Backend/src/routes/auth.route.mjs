import {Router} from "express";
import {resendOtp, verifyOtp} from "../controllers/otp.controller.mjs";
import { login, register, getMe, forgotPassword, resetPassword } from "../controllers/user.controller.mjs";
import { getAccessToken, logout } from "../controllers/token.controller.mjs";
import authentication from "../middleware/authMiddleware.mjs";

const router = Router();

router.get("/", (req, res) => {
    res.send({message: "API is running"});
});

/**
 * @swagger
 * /api/auth/register:
 *   post:
 *     summary: Register a new user
 *     tags: [Auth]
 *     requestBody:
 *       required: true
 *       content:
 *         application/json:
 *           schema:
 *             type: object
 *             required:
 *               - email
 *               - password
 *               - firstName
 *               - lastName
 *             properties:
 *               email:
 *                 type: string
 *               password:
 *                 type: string
 *               firstName:
 *                 type: string
 *               lastName:
 *                 type: string
 *               phone:
 *                 type: string
 *               role:
 *                 type: string
 *               hospitalId:
 *                 type: string
 *     responses:
 *       201:
 *         description: Account created successfully.
 *       400:
 *         description: Validation error
 *       409:
 *         description: Email already registered
 */
router.post("/register",register);

/**
 * @swagger
 * /api/auth/login:
 *   post:
 *     summary: Login user
 *     tags: [Auth]
 *     requestBody:
 *       required: true
 *       content:
 *         application/json:
 *           schema:
 *             type: object
 *             required:
 *               - email
 *               - password
 *             properties:
 *               email:
 *                 type: string
 *               password:
 *                 type: string
 *     responses:
 *       200:
 *         description: Login successful
 *       401:
 *         description: Invalid credentials
 *       403:
 *         description: Email not verified
 */
router.post("/login", login);

/**
 * @swagger
 * /api/auth/verify-otp:
 *   post:
 *     summary: Verify OTP
 *     tags: [Auth]
 *     requestBody:
 *       required: true
 *       content:
 *         application/json:
 *           schema:
 *             type: object
 *             required:
 *               - email
 *               - code
 *             properties:
 *               email:
 *                 type: string
 *               code:
 *                 type: string
 *               purpose:
 *                 type: string
 *     responses:
 *       200:
 *         description: Email verified and logged in
 *       400:
 *         description: Invalid code
 */
router.post("/verify-otp", verifyOtp);
router.post("/resend-otp", resendOtp);
router.post("/forgot-password", forgotPassword);
router.post("/reset-password", resetPassword);

router.post("/refresh", getAccessToken);
router.post("/logout", logout);

// Protected routes
router.get("/me", authentication, getMe);

export default router;
