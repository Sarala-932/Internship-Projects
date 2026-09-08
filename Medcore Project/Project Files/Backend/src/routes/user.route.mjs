import { Router } from "express";
import authentication, { authorize } from "../middleware/authMiddleware.mjs";
import { createStaffUser, updateProfile, changePassword, getUsers, toggleUserStatus } from "../controllers/user.controller.mjs";

const router = Router();

router.use(authentication);

router.patch("/profile", updateProfile);

router.patch("/password", changePassword);

router.post("/staff", authorize("admin", "super_admin"), createStaffUser);

router.get("/", authorize("admin", "super_admin"), getUsers);

router.patch("/:id/status", authorize("admin", "super_admin"), toggleUserStatus);

export default router;
