import express from "express";
import authentication, { authorize } from "../middleware/authMiddleware.mjs";
import {
    upsertDoctorProfile,
    getDoctorProfile,
    getDoctorsByHospital,
    getAvailableSlots
} from "../controllers/doctor.controller.mjs";

const router = express.Router();

router.use(authentication);

router.post("/profile", authorize("doctor", "admin", "super_admin"), upsertDoctorProfile);
router.get("/profile/me", getDoctorProfile);
router.get("/profile/:id", getDoctorProfile);
router.get("/hospital/:hospitalId", getDoctorsByHospital);
router.get("/:id/slots", getAvailableSlots);

export default router;
