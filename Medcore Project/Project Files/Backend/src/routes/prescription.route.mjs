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

/**
 * @swagger
 * /api/prescriptions:
 *   post:
 *     summary: Create a new prescription
 *     tags: [Prescriptions]
 *     security:
 *       - cookieAuth: []
 *     requestBody:
 *       required: true
 *       content:
 *         application/json:
 *           schema:
 *             type: object
 *             required:
 *               - patientId
 *               - medicines
 *             properties:
 *               patientId:
 *                 type: string
 *               encounterId:
 *                 type: string
 *               medicines:
 *                 type: array
 *                 items:
 *                   type: object
 *                   properties:
 *                     medicineName:
 *                       type: string
 *                     dosage:
 *                       type: string
 *                     frequency:
 *                       type: string
 *                     duration:
 *                       type: string
 *               notes:
 *                 type: string
 *     responses:
 *       201:
 *         description: Prescription created
 */
router.post("/", authorize("doctor"), createPrescription);

/**
 * @swagger
 * /api/prescriptions/search/medicines:
 *   get:
 *     summary: Search medicines in inventory
 *     tags: [Prescriptions]
 *     security:
 *       - cookieAuth: []
 *     parameters:
 *       - in: query
 *         name: q
 *         schema:
 *           type: string
 *         description: Medicine name search query
 *     responses:
 *       200:
 *         description: List of matched medicines
 */
router.get("/search/medicines", searchMedicines);

/**
 * @swagger
 * /api/prescriptions/pending:
 *   get:
 *     summary: Get pending prescriptions to dispense
 *     tags: [Prescriptions]
 *     security:
 *       - cookieAuth: []
 *     responses:
 *       200:
 *         description: List of pending prescriptions
 */
router.get("/pending", authorize("admin", "pharmacist", "super_admin"), getPendingPrescriptions);

/**
 * @swagger
 * /api/prescriptions/patient/{patientId}:
 *   get:
 *     summary: Get prescriptions by patient ID
 *     tags: [Prescriptions]
 *     security:
 *       - cookieAuth: []
 *     parameters:
 *       - in: path
 *         name: patientId
 *         required: true
 *         schema:
 *           type: string
 *     responses:
 *       200:
 *         description: List of patient's prescriptions
 */
router.get("/patient/:patientId", authorize("doctor", "nurse", "receptionist", "admin", "super_admin", "patient"), getPrescriptionsByPatient);

/**
 * @swagger
 * /api/prescriptions/encounter/{encounterId}:
 *   get:
 *     summary: Get prescriptions by encounter ID
 *     tags: [Prescriptions]
 *     security:
 *       - cookieAuth: []
 *     parameters:
 *       - in: path
 *         name: encounterId
 *         required: true
 *         schema:
 *           type: string
 *     responses:
 *       200:
 *         description: List of encounter's prescriptions
 */
router.get("/encounter/:encounterId", getPrescriptionsByEncounter);

/**
 * @swagger
 * /api/prescriptions/{id}:
 *   get:
 *     summary: Get a prescription by ID
 *     tags: [Prescriptions]
 *     security:
 *       - cookieAuth: []
 *     parameters:
 *       - in: path
 *         name: id
 *         required: true
 *         schema:
 *           type: string
 *     responses:
 *       200:
 *         description: Prescription details
 */
router.get("/:id", getPrescriptionById);

/**
 * @swagger
 * /api/prescriptions/{id}/pdf:
 *   get:
 *     summary: Download prescription as PDF
 *     tags: [Prescriptions]
 *     security:
 *       - cookieAuth: []
 *     parameters:
 *       - in: path
 *         name: id
 *         required: true
 *         schema:
 *           type: string
 *     responses:
 *       200:
 *         description: PDF file stream
 *         content:
 *           application/pdf:
 *             schema:
 *               type: string
 *               format: binary
 */
router.get("/:id/pdf", downloadPrescriptionPdf);

/**
 * @swagger
 * /api/prescriptions/{id}/cancel:
 *   patch:
 *     summary: Cancel a prescription
 *     tags: [Prescriptions]
 *     security:
 *       - cookieAuth: []
 *     parameters:
 *       - in: path
 *         name: id
 *         required: true
 *         schema:
 *           type: string
 *     responses:
 *       200:
 *         description: Prescription cancelled successfully
 */
router.patch("/:id/cancel", authorize("doctor"), cancelPrescription);

export default router;
