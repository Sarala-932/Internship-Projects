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

/**
 * @swagger
 * /api/encounters:
 *   post:
 *     summary: Create an encounter
 *     tags: [Encounters]
 *     security:
 *       - bearerAuth: []
 *     requestBody:
 *       required: true
 *       content:
 *         application/json:
 *           schema:
 *             type: object
 *             properties:
 *               patientId:
 *                 type: string
 *               doctorId:
 *                 type: string
 *               notes:
 *                 type: string
 *     responses:
 *       201:
 *         description: Encounter created
 *       401:
 *         description: Unauthorized
 *       403:
 *         description: Forbidden
 */
router.post("/", authorize("doctor", "admin", "super_admin"), createEncounter);
/**
 * @swagger
 * /api/encounters/{id}:
 *   patch:
 *     summary: Update an encounter
 *     tags: [Encounters]
 *     security:
 *       - bearerAuth: []
 *     parameters:
 *       - in: path
 *         name: id
 *         required: true
 *         schema:
 *           type: string
 *     requestBody:
 *       required: true
 *       content:
 *         application/json:
 *           schema:
 *             type: object
 *             properties:
 *               notes:
 *                 type: string
 *               status:
 *                 type: string
 *     responses:
 *       200:
 *         description: Encounter updated
 *       401:
 *         description: Unauthorized
 *       403:
 *         description: Forbidden
 */
router.patch("/:id", authorize("doctor"), updateEncounter);
/**
 * @swagger
 * /api/encounters/{id}/vitals:
 *   patch:
 *     summary: Add vitals to an encounter
 *     tags: [Encounters]
 *     security:
 *       - bearerAuth: []
 *     parameters:
 *       - in: path
 *         name: id
 *         required: true
 *         schema:
 *           type: string
 *     requestBody:
 *       required: true
 *       content:
 *         application/json:
 *           schema:
 *             type: object
 *             properties:
 *               bloodPressure:
 *                 type: string
 *               heartRate:
 *                 type: number
 *               temperature:
 *                 type: number
 *     responses:
 *       200:
 *         description: Vitals added
 *       401:
 *         description: Unauthorized
 *       403:
 *         description: Forbidden
 */
router.patch("/:id/vitals", authorize("nurse", "doctor"), addVitals);
/**
 * @swagger
 * /api/encounters/{id}/sign:
 *   patch:
 *     summary: Sign an encounter
 *     tags: [Encounters]
 *     security:
 *       - bearerAuth: []
 *     parameters:
 *       - in: path
 *         name: id
 *         required: true
 *         schema:
 *           type: string
 *     responses:
 *       200:
 *         description: Encounter signed
 *       401:
 *         description: Unauthorized
 *       403:
 *         description: Forbidden
 */
router.patch("/:id/sign", authorize("doctor"), signEncounter);
/**
 * @swagger
 * /api/encounters/{id}:
 *   get:
 *     summary: Get encounter by ID
 *     tags: [Encounters]
 *     security:
 *       - bearerAuth: []
 *     parameters:
 *       - in: path
 *         name: id
 *         required: true
 *         schema:
 *           type: string
 *     responses:
 *       200:
 *         description: Encounter details
 *       401:
 *         description: Unauthorized
 *       404:
 *         description: Encounter not found
 */
router.get("/:id", getEncounterById);
/**
 * @swagger
 * /api/encounters/patient/{patientId}:
 *   get:
 *     summary: Get encounters by patient ID
 *     tags: [Encounters]
 *     security:
 *       - bearerAuth: []
 *     parameters:
 *       - in: path
 *         name: patientId
 *         required: true
 *         schema:
 *           type: string
 *     responses:
 *       200:
 *         description: List of encounters
 *       401:
 *         description: Unauthorized
 */
router.get("/patient/:patientId", getPatientEncounters);

export default router;
