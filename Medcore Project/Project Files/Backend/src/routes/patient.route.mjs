import express from "express";
import authentication, { authorize } from "../middleware/authMiddleware.mjs";
import {
    registerPatient,
    getPatientById,
    getPatients,
    updatePatient,
    getMyProfile
} from "../controllers/patient.controller.mjs";

const router = express.Router();

router.use(authentication);

/**
 * @swagger
 * /patients/me:
 *   get:
 *     summary: Get own profile
 *     tags: [Patients]
 *     security:
 *       - bearerAuth: []
 *     responses:
 *       200:
 *         description: Patient profile data
 */
// Patient: get own profile
router.get("/me", authorize("patient"), getMyProfile);

/**
 * @swagger
 * /patients:
 *   post:
 *     summary: Register a new patient
 *     tags: [Patients]
 *     security:
 *       - bearerAuth: []
 *     requestBody:
 *       required: true
 *       content:
 *         application/json:
 *           schema:
 *             type: object
 *             properties:
 *               name:
 *                 type: string
 *               age:
 *                 type: number
 *               contact:
 *                 type: string
 *     responses:
 *       201:
 *         description: Patient registered
 */
router.post("/", authorize("receptionist", "admin", "nurse", "super_admin"), registerPatient);
/**
 * @swagger
 * /patients:
 *   get:
 *     summary: Get list of all patients
 *     tags: [Patients]
 *     security:
 *       - bearerAuth: []
 *     responses:
 *       200:
 *         description: List of patients
 */
router.get("/", authorize("doctor", "nurse", "receptionist", "admin", "super_admin"), getPatients);
/**
 * @swagger
 * /patients/{id}:
 *   get:
 *     summary: Get patient by ID
 *     tags: [Patients]
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
 *         description: Patient data
 */
router.get("/:id", authorize("doctor", "nurse", "receptionist", "admin", "super_admin", "patient"), getPatientById);
/**
 * @swagger
 * /patients/{id}:
 *   patch:
 *     summary: Update patient data
 *     tags: [Patients]
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
 *               name:
 *                 type: string
 *               contact:
 *                 type: string
 *     responses:
 *       200:
 *         description: Patient updated
 */
router.patch("/:id", authorize("receptionist", "admin", "nurse", "super_admin", "patient"), updatePatient);

export default router;
