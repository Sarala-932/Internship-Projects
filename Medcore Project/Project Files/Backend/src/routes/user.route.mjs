import { Router } from "express";
import authentication, { authorize } from "../middleware/authMiddleware.mjs";
import { createStaffUser, updateProfile, changePassword, getUsers, toggleUserStatus } from "../controllers/user.controller.mjs";

const router = Router();

router.use(authentication);

/**
 * @swagger
 * /api/users/profile:
 *   patch:
 *     summary: Update current user's profile
 *     tags: [Users]
 *     security:
 *       - cookieAuth: []
 *     requestBody:
 *       required: true
 *       content:
 *         application/json:
 *           schema:
 *             type: object
 *             properties:
 *               firstName:
 *                 type: string
 *               lastName:
 *                 type: string
 *               phone:
 *                 type: string
 *     responses:
 *       200:
 *         description: Profile updated
 */
router.patch("/profile", updateProfile);

/**
 * @swagger
 * /api/users/password:
 *   patch:
 *     summary: Change current user's password
 *     tags: [Users]
 *     security:
 *       - cookieAuth: []
 *     requestBody:
 *       required: true
 *       content:
 *         application/json:
 *           schema:
 *             type: object
 *             required:
 *               - oldPassword
 *               - newPassword
 *             properties:
 *               oldPassword:
 *                 type: string
 *               newPassword:
 *                 type: string
 *     responses:
 *       200:
 *         description: Password changed successfully
 */
router.patch("/password", changePassword);

// POST /api/users/staff — Admin/Super Admin creates staff (doctor, nurse, etc.)
/**
 * @swagger
 * /api/users/staff:
 *   post:
 *     summary: Create a new staff user
 *     tags: [Users]
 *     security:
 *       - cookieAuth: []
 *     requestBody:
 *       required: true
 *       content:
 *         application/json:
 *           schema:
 *             type: object
 *             required:
 *               - email
 *               - password
 *               - role
 *             properties:
 *               email:
 *                 type: string
 *               password:
 *                 type: string
 *               role:
 *                 type: string
 *               firstName:
 *                 type: string
 *               lastName:
 *                 type: string
 *     responses:
 *       201:
 *         description: Staff user created
 */
router.post("/staff", authorize("admin", "super_admin"), createStaffUser);

// GET /api/users — List users (directory)
/**
 * @swagger
 * /api/users:
 *   get:
 *     summary: List all users
 *     tags: [Users]
 *     security:
 *       - cookieAuth: []
 *     responses:
 *       200:
 *         description: List of users
 */
router.get("/", authorize("admin", "super_admin"), getUsers);

// PATCH /api/users/:id/status — Suspend/Activate user
/**
 * @swagger
 * /api/users/{id}/status:
 *   patch:
 *     summary: Suspend or activate a user
 *     tags: [Users]
 *     security:
 *       - cookieAuth: []
 *     parameters:
 *       - in: path
 *         name: id
 *         required: true
 *         schema:
 *           type: string
 *     requestBody:
 *       required: true
 *       content:
 *         application/json:
 *           schema:
 *             type: object
 *             required:
 *               - isActive
 *             properties:
 *               isActive:
 *                 type: boolean
 *     responses:
 *       200:
 *         description: User status updated
 */
router.patch("/:id/status", authorize("admin", "super_admin"), toggleUserStatus);

export default router;
