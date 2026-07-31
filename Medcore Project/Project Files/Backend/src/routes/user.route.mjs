import { Router } from "express";
import authentication, { authorize } from "../middleware/authMiddleware.mjs";
import { createStaffUser, updateProfile, changePassword, getUsers, toggleUserStatus } from "../controllers/user.controller.mjs";

const router = Router();

router.use(authentication);

router.patch("/profile", updateProfile);
router.patch("/password", changePassword);

// POST /api/users/staff — Admin/Super Admin creates staff (doctor, nurse, etc.)
router.post("/staff", authorize("admin", "super_admin"), createStaffUser);

// GET /api/users — List users (directory)
router.get("/", authorize("admin", "super_admin"), getUsers);

// PATCH /api/users/:id/status — Suspend/Activate user
router.patch("/:id/status", authorize("admin", "super_admin"), toggleUserStatus);

export default router;
