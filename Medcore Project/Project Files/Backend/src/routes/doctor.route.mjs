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

/**
 * @swagger
 * /api/doctors/profile:
 *   post:
 *     summary: Upsert doctor profile
 *     tags: [Doctors]
 *     security:
 *       - bearerAuth: []
 *     requestBody:
 *       required: true
 *       content:
 *         application/json:
 *           schema:
 *             type: object
 *             properties:
 *               specialization:
 *                 type: string
 *               experience:
 *                 type: number
 *               qualifications:
 *                 type: array
 *                 items:
 *                   type: string
 *     responses:
 *       200:
 *         description: Profile upserted successfully
 *       401:
 *         description: Unauthorized
 *       403:
 *         description: Forbidden
 */
router.post("/profile", authorize("doctor", "admin", "super_admin"), upsertDoctorProfile);
/**
 * @swagger
 * /api/doctors/profile/me:
 *   get:
 *     summary: Get current doctor's profile
 *     tags: [Doctors]
 *     security:
 *       - bearerAuth: []
 *     responses:
 *       200:
 *         description: Doctor profile details
 *       401:
 *         description: Unauthorized
 *       404:
 *         description: Profile not found
 */
router.get("/profile/me", getDoctorProfile);
/**
 * @swagger
 * /api/doctors/profile/{id}:
 *   get:
 *     summary: Get doctor profile by user ID
 *     tags: [Doctors]
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
 *         description: Doctor profile details
 *       401:
 *         description: Unauthorized
 *       404:
 *         description: Profile not found
 */
router.get("/profile/:id", getDoctorProfile);
/**
 * @swagger
 * /api/doctors/hospital/{hospitalId}:
 *   get:
 *     summary: Get doctors by hospital
 *     tags: [Doctors]
 *     security:
 *       - bearerAuth: []
 *     parameters:
 *       - in: path
 *         name: hospitalId
 *         required: true
 *         schema:
 *           type: string
 *     responses:
 *       200:
 *         description: List of doctors
 *       401:
 *         description: Unauthorized
 */
router.get("/hospital/:hospitalId", getDoctorsByHospital);
/**
 * @swagger
 * /api/doctors/{id}/slots:
 *   get:
 *     summary: Get available slots for a doctor
 *     tags: [Doctors]
 *     security:
 *       - bearerAuth: []
 *     parameters:
 *       - in: path
 *         name: id
 *         required: true
 *         schema:
 *           type: string
 *       - in: query
 *         name: date
 *         schema:
 *           type: string
 *           format: date
 *     responses:
 *       200:
 *         description: List of available slots
 *       401:
 *         description: Unauthorized
 */
router.get("/:id/slots", getAvailableSlots);

export default router;
