import { Router } from "express";
import authentication, { authorize } from "../middleware/authMiddleware.mjs";
import {
    createDepartment,
    getDepartments,
    getDepartmentById,
} from "../controllers/department.controller.mjs";

const router = Router();

// All department routes need authentication
router.use(authentication);

// Create department — only admin or super_admin
router.post("/", authorize("admin", "super_admin"), createDepartment);

// Get departments — admin, super_admin, doctor, nurse, receptionist, patient can view
router.get("/", authorize("admin", "super_admin", "doctor", "nurse", "receptionist", "patient"), getDepartments);
router.get("/:id", authorize("admin", "super_admin", "doctor", "nurse", "receptionist", "patient"), getDepartmentById);

export default router;
