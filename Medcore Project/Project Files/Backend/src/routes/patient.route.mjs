import express from "express";
import authentication, { authorize } from "../middleware/authMiddleware.mjs";
import {
    registerPatient,
    getPatientById,
    getPatients,
    updatePatient
} from "../controllers/patient.controller.mjs";

const router = express.Router();

router.use(authentication);

router.post("/", authorize("receptionist", "admin", "nurse", "super_admin"), registerPatient);
router.get("/", authorize("doctor", "nurse", "receptionist", "admin", "super_admin"), getPatients);
router.get("/:id", authorize("doctor", "nurse", "receptionist", "admin", "super_admin", "patient"), getPatientById);
router.patch("/:id", authorize("receptionist", "admin", "nurse", "super_admin"), updatePatient);

export default router;
