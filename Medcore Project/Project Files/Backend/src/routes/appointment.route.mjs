import express from "express";
import authentication, { authorize } from "../middleware/authMiddleware.mjs";
import {
    bookAppointment,
    bookAppointmentDesk,
    getAppointmentById,
    getAppointments,
    updateAppointmentStatus,
    cancelAppointment,
    getActiveSocketsTest,
} from "../controllers/appointment.controller.mjs";

const router = express.Router();

// Debug
/**
 * @swagger
 * /api/appointments/debug/sockets:
 *   get:
 *     summary: Debug active sockets
 *     tags: [Appointments]
 *     responses:
 *       200:
 *         description: Active sockets list
 */
router.get("/debug/sockets", getActiveSocketsTest);

router.use(authentication);

/**
 * @swagger
 * /api/appointments:
 *   post:
 *     summary: Book a new appointment
 *     tags: [Appointments]
 *     security:
 *       - cookieAuth: []
 *     requestBody:
 *       required: true
 *       content:
 *         application/json:
 *           schema:
 *             type: object
 *             required:
 *               - doctorId
 *               - departmentId
 *               - appointmentDate
 *               - timeSlot
 *             properties:
 *               patientId:
 *                 type: string
 *               doctorId:
 *                 type: string
 *               departmentId:
 *                 type: string
 *               appointmentDate:
 *                 type: string
 *                 format: date
 *               timeSlot:
 *                 type: string
 *               reason:
 *                 type: string
 *     responses:
 *       201:
 *         description: Appointment booked successfully
 */
router.post("/", authorize("receptionist", "admin", "patient", "super_admin"), bookAppointment);

/**
 * @swagger
 * /api/appointments/desk:
 *   post:
 *     summary: Book an appointment from desk
 *     tags: [Appointments]
 *     security:
 *       - cookieAuth: []
 *     requestBody:
 *       required: true
 *       content:
 *         application/json:
 *           schema:
 *             type: object
 *             required:
 *               - doctorId
 *               - departmentId
 *               - appointmentDate
 *               - timeSlot
 *               - patientId
 *             properties:
 *               patientId:
 *                 type: string
 *               doctorId:
 *                 type: string
 *               departmentId:
 *                 type: string
 *               appointmentDate:
 *                 type: string
 *                 format: date
 *               timeSlot:
 *                 type: string
 *               reason:
 *                 type: string
 *     responses:
 *       201:
 *         description: Appointment booked successfully
 */
router.post("/desk", authorize("receptionist", "admin", "super_admin"), bookAppointmentDesk);

/**
 * @swagger
 * /api/appointments:
 *   get:
 *     summary: Get all appointments
 *     tags: [Appointments]
 *     security:
 *       - cookieAuth: []
 *     responses:
 *       200:
 *         description: List of appointments
 */
router.get("/", authorize("doctor", "nurse", "receptionist", "admin", "super_admin", "patient"), getAppointments);

/**
 * @swagger
 * /api/appointments/{id}:
 *   get:
 *     summary: Get appointment by ID
 *     tags: [Appointments]
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
 *         description: Appointment details
 */
router.get("/:id", getAppointmentById);

/**
 * @swagger
 * /api/appointments/{id}/status:
 *   patch:
 *     summary: Update appointment status
 *     tags: [Appointments]
 *     security:
 *       - cookieAuth: []
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
 *             required:
 *               - status
 *             properties:
 *               status:
 *                 type: string
 *     responses:
 *       200:
 *         description: Status updated successfully
 */
router.patch("/:id/status", authorize("doctor", "receptionist", "admin", "nurse", "super_admin"), updateAppointmentStatus);

/**
 * @swagger
 * /api/appointments/{id}/cancel:
 *   patch:
 *     summary: Cancel an appointment
 *     tags: [Appointments]
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
 *         description: Appointment cancelled successfully
 */
router.patch("/:id/cancel", authorize("doctor", "receptionist", "admin", "patient", "super_admin"), cancelAppointment);

export default router;
