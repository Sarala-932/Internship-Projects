import { Router } from "express";
import authentication, { authorize } from "../middleware/authMiddleware.mjs";
import {
    createDepartment,
    getDepartments,
    getDepartmentById,
} from "../controllers/department.controller.mjs";

const router = Router();

router.use(authentication);

router.post("/", authorize("admin", "super_admin"), createDepartment);

router.get("/", authorize("admin", "super_admin", "doctor", "nurse", "receptionist", "patient"), getDepartments);

router.get("/:id", authorize("admin", "super_admin", "doctor", "nurse", "receptionist", "patient"), getDepartmentById);

export default router;
