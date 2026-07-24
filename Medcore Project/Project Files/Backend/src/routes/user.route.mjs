import { Router } from "express";
import authentication, { authorize } from "../middleware/authMiddleware.mjs";
import { createStaffUser } from "../controllers/user.controller.mjs";

const router = Router();

router.use(authentication);

// POST /api/users/staff — Admin/Super Admin creates staff (doctor, nurse, etc.)
router.post("/staff", authorize("admin", "super_admin"), createStaffUser);

export default router;
