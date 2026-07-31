import express from "express";
import authentication, { authorize } from "../middleware/authMiddleware.mjs";
import {
    createPrescription,
    getPrescriptionById,
    getPrescriptionsByEncounter,
    getPrescriptionsByPatient,
    cancelPrescription,
    searchMedicines,
    downloadPrescriptionPdf,
    getPendingPrescriptions
} from "../controllers/prescription.controller.mjs";

const router = express.Router();

router.use(authentication);

router.post("/", authorize("doctor"), createPrescription);
router.get("/search/medicines", searchMedicines);
router.get("/pending", authorize("admin", "pharmacist", "super_admin"), getPendingPrescriptions);
router.get("/patient/:patientId", authorize("doctor", "nurse", "receptionist", "admin", "super_admin", "patient"), getPrescriptionsByPatient);
router.get("/encounter/:encounterId", getPrescriptionsByEncounter);
router.get("/:id", getPrescriptionById);
router.get("/:id/pdf", downloadPrescriptionPdf);
router.patch("/:id/cancel", authorize("doctor"), cancelPrescription);

export default router;
