import { Router } from "express";
import authentication, { authorize } from "../middleware/authMiddleware.mjs";
import {
    createHospital,
    verifyHospital,
    getHospitals,
    getHospitalById,
} from "../controllers/hospital.controller.mjs";

const router = Router();

// All hospital routes need authentication + super_admin role
router.use(authentication);
router.use(authorize("super_admin"));

router.post("/", createHospital);
router.get("/", getHospitals);
router.get("/:id", getHospitalById);
router.patch("/:id/verify", verifyHospital);

export default router;
