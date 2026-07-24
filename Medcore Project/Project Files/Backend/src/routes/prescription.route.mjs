import express from "express";
import authentication, { authorize } from "../middleware/authMiddleware.mjs";
import {
    createPrescription,
    getPrescriptionById,
    getPrescriptionsByEncounter,
    getPrescriptionsByPatient,
    cancelPrescription,
    searchMedicines,
    downloadPrescriptionPdf
} from "../controllers/prescription.controller.mjs";

const router = express.Router();

router.use(authentication);

router.post("/", authorize("doctor"), createPrescription);
router.get("/search/medicines", searchMedicines);
router.get("/:id", getPrescriptionById);
router.get("/:id/pdf", downloadPrescriptionPdf);
router.get("/encounter/:encounterId", getPrescriptionsByEncounter);
router.get("/patient/:patientId", getPrescriptionsByPatient);
router.patch("/:id/cancel", authorize("doctor"), cancelPrescription);

export default router;
