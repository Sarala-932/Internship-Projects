import express from "express";
import authentication, { authorize } from "../middleware/authMiddleware.mjs";
import {
    bookAppointment,
    getAppointmentById,
    getAppointments,
    updateAppointmentStatus,
    cancelAppointment
} from "../controllers/appointment.controller.mjs";

const router = express.Router();

router.use(authentication);

router.post("/", authorize("receptionist", "admin", "patient", "super_admin"), bookAppointment);
router.get("/", authorize("doctor", "nurse", "receptionist", "admin", "super_admin"), getAppointments);
router.get("/:id", getAppointmentById);
router.patch("/:id/status", authorize("doctor", "receptionist", "admin", "nurse", "super_admin"), updateAppointmentStatus);
router.patch("/:id/cancel", authorize("doctor", "receptionist", "admin", "patient", "super_admin"), cancelAppointment);

export default router;
