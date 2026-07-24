import express from "express";
import authentication, { authorize } from "../middleware/authMiddleware.mjs";
import {
    createEncounter,
    updateEncounter,
    addVitals,
    signEncounter,
    getEncounterById,
    getPatientEncounters
} from "../controllers/encounter.controller.mjs";

const router = express.Router();

router.use(authentication);

router.post("/", authorize("doctor", "admin", "super_admin"), createEncounter);
router.patch("/:id", authorize("doctor"), updateEncounter);
router.patch("/:id/vitals", authorize("nurse", "doctor"), addVitals);
router.patch("/:id/sign", authorize("doctor"), signEncounter);
router.get("/:id", getEncounterById);
router.get("/patient/:patientId", getPatientEncounters);

export default router;
