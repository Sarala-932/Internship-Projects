import {
    bookAppointmentService,
    getAppointmentByIdService,
    getAppointmentsService,
    updateAppointmentStatusService,
    cancelAppointmentService,
    deskBookingService,
} from "../services/appointment.service.mjs";
import {emitToUser, emitToRole, getConnectedSockets, broadcastDataUpdate} from "../services/socket.service.mjs";
import Notification from "../models/notification.model.mjs";

export const getActiveSocketsTest = async (req, res) => {
    return res.status(200).json({ sockets: getConnectedSockets() });
};

// Helper: Notify all admins of a hospital
const notifyAdmins = async (hospitalId, title, message, type, link) => {
    try {
        emitToRole(hospitalId, "admin", "notification", { title, message, type, link });
    } catch (err) {
        console.error("Admin notification error:", err.message);
    }
};

export const bookAppointment = async (req, res) => {
    try {
        const hospitalId = req.body.hospitalId || req.hospitalId;
        if (!hospitalId) {
            return res.status(400).json({message: "Hospital ID is required"});
        }
        const appointment = await bookAppointmentService(hospitalId, req.userId, req.body);

        const patientName = `${appointment.patientId?.firstName || ""} ${appointment.patientId?.lastName || ""}`.trim();
        const scheduleTime = new Date(appointment.scheduledAt).toLocaleString('en-US', { timeZone: 'Asia/Kolkata', dateStyle: 'medium', timeStyle: 'short' });

        // 1. Notify the Doctor
        const doctorUserId = appointment.doctorId?._id || appointment.doctorId;
        if (doctorUserId) {
            const docNotif = await Notification.create({
                userId: doctorUserId,
                title: "New Appointment Booked",
                message: `${patientName} has booked an appointment for ${scheduleTime}`,
                type: "APPOINTMENT",
                link: "/doctor/appointments",
            });
            emitToUser(doctorUserId, "notification", docNotif);
        }

        // 2. Notify the Patient
        const patientUserId = appointment.patientId?.userId;
        if (patientUserId) {
            const patNotif = await Notification.create({
                userId: patientUserId,
                title: "Appointment Confirmed",
                message: `Your appointment is confirmed for ${scheduleTime}`,
                type: "APPOINTMENT",
                link: "/patient/appointments",
            });
            emitToUser(patientUserId, "notification", patNotif);
        }

        // 3. Notify Admins
        await notifyAdmins(
            hospitalId,
            "New Appointment Booked",
            `${patientName} booked an appointment with Dr. ${appointment.doctorId?.lastName || ""} for ${scheduleTime}`,
            "APPOINTMENT",
            "/admin/appointments"
        );

        // 4. Broadcast data update
        broadcastDataUpdate(hospitalId, "appointment");

        return res.status(201).json({
            message: "Appointment booked successfully",
            appointment,
        });
    } catch (error) {
        return res.status(error.statusCode || 500).json({
            message: error.message || "Failed to book appointment",
        });
    }
};

export const bookAppointmentDesk = async (req, res) => {
    try {
        const hospitalId = req.body.hospitalId || req.hospitalId;
        if (!hospitalId) {
            return res.status(400).json({message: "Hospital ID is required"});
        }
        const appointment = await deskBookingService(hospitalId, req.userId, req.body);

        const patientName = `${appointment.patientId?.firstName || ""} ${appointment.patientId?.lastName || ""}`.trim();
        const scheduleTime = new Date(appointment.scheduledAt).toLocaleString('en-US', { timeZone: 'Asia/Kolkata', dateStyle: 'medium', timeStyle: 'short' });

        // 1. Notify the Doctor
        const doctorUserId = appointment.doctorId?._id || appointment.doctorId;
        if (doctorUserId) {
            const docNotif = await Notification.create({
                userId: doctorUserId,
                title: "New Appointment Booked",
                message: `${patientName} has booked an appointment for ${scheduleTime}`,
                type: "APPOINTMENT",
                link: "/doctor/appointments",
            });
            emitToUser(doctorUserId, "notification", docNotif);
        }

        // 2. Notify the Patient
        const patientUserId = appointment.patientId?.userId;
        if (patientUserId) {
            const patNotif = await Notification.create({
                userId: patientUserId,
                title: "Appointment Confirmed",
                message: `Your appointment is confirmed for ${scheduleTime}`,
                type: "APPOINTMENT",
                link: "/patient/appointments",
            });
            emitToUser(patientUserId, "notification", patNotif);
        }

        // 3. Notify Admins
        await notifyAdmins(
            hospitalId,
            "Desk Appointment Booked",
            `${patientName} booked (desk) with Dr. ${appointment.doctorId?.lastName || ""} for ${scheduleTime}`,
            "APPOINTMENT",
            "/admin/appointments"
        );

        // 4. Broadcast data update
        broadcastDataUpdate(hospitalId, "appointment");

        return res.status(201).json({
            message: "Appointment booked successfully",
            appointment,
        });
    } catch (error) {
        return res.status(error.statusCode || 500).json({
            message: error.message || "Failed to book appointment from desk",
        });
    }
};

export const getAppointmentById = async (req, res) => {
    try {
        const appointment = await getAppointmentByIdService(req.params.id);
        return res.status(200).json({appointment});
    } catch (error) {
        return res.status(error.statusCode || 500).json({
            message: error.message || "Failed to get appointment",
        });
    }
};

export const getAppointments = async (req, res) => {
    try {
        const filters = {...req.query};
        let hospitalId = req.query.hospitalId || req.hospitalId;

        if (req.role === "patient") {
            if (!filters.patientId) {
                return res
                    .status(400)
                    .json({message: "patientId is required for patients to view appointments"});
            }
        } else {
            if (!hospitalId) {
                return res.status(400).json({message: "Hospital ID is required"});
            }
        }

        const appointments = await getAppointmentsService(hospitalId, filters, req.role);
        return res.status(200).json({appointments});
    } catch (error) {
        return res.status(error.statusCode || 500).json({
            message: error.message || "Failed to get appointments",
        });
    }
};

export const updateAppointmentStatus = async (req, res) => {
    try {
        const {status} = req.body;
        if (!status) {
            return res.status(400).json({message: "Status is required"});
        }
        const appointment = await updateAppointmentStatusService(req.params.id, status);

        const patientName = `${appointment.patientId?.firstName || ""} ${appointment.patientId?.lastName || ""}`.trim();

        // 1. Notify the Patient about status change
        const patientUserId = appointment.patientId?.userId;
        if (patientUserId) {
            const statusMessage =
                status === "completed"
                    ? "has been completed."
                    : status === "cancelled"
                      ? "has been cancelled."
                      : `status has been updated to '${status}'.`;

            const patNotif = await Notification.create({
                userId: patientUserId,
                title: `Appointment ${status.charAt(0).toUpperCase() + status.slice(1)}`,
                message: `Your appointment with Dr. ${appointment.doctorId?.lastName || ""} ${statusMessage}`,
                type: "APPOINTMENT",
                link: "/patient/appointments",
            });
            emitToUser(patientUserId, "notification", patNotif);
        }

        // 2. Notify Admins
        const hospitalId = appointment.hospitalId;
        if (hospitalId) {
            await notifyAdmins(
                hospitalId,
                `Appointment ${status.charAt(0).toUpperCase() + status.slice(1)}`,
                `${patientName}'s appointment status updated to '${status}'`,
                "APPOINTMENT",
                "/admin/appointments"
            );
        }

        // 3. Broadcast data update
        if (hospitalId) {
            broadcastDataUpdate(hospitalId, "appointment");
        }

        return res.status(200).json({
            message: `Appointment status updated to '${status}'`,
            appointment,
        });
    } catch (error) {
        return res.status(error.statusCode || 500).json({
            message: error.message || "Failed to update appointment status",
        });
    }
};

export const cancelAppointment = async (req, res) => {
    try {
        const {reason} = req.body;
        const appointment = await cancelAppointmentService(req.params.id, reason);

        const patientName = `${appointment.patientId?.firstName || ""} ${appointment.patientId?.lastName || ""}`.trim();
        const scheduleTime = new Date(appointment.scheduledAt).toLocaleString('en-US', { timeZone: 'Asia/Kolkata', dateStyle: 'medium', timeStyle: 'short' });

        // 1. Notify the Doctor
        const doctorUserId = appointment.doctorId?._id || appointment.doctorId;
        if (doctorUserId) {
            const docNotif = await Notification.create({
                userId: doctorUserId,
                title: "Appointment Cancelled",
                message: `${patientName} has cancelled their appointment for ${scheduleTime}`,
                type: "APPOINTMENT",
                link: "/doctor/appointments",
            });
            emitToUser(doctorUserId, "notification", docNotif);
        }

        // 2. Notify the Patient
        const patientUserId = appointment.patientId?.userId;
        if (patientUserId) {
            const patNotif = await Notification.create({
                userId: patientUserId,
                title: "Appointment Cancelled",
                message: `Your appointment with Dr. ${appointment.doctorId?.lastName || ""} has been successfully cancelled.`,
                type: "APPOINTMENT",
                link: "/patient/appointments",
            });
            emitToUser(patientUserId, "notification", patNotif);
        }

        // 3. Notify Admins
        const hospitalId = appointment.hospitalId;
        if (hospitalId) {
            await notifyAdmins(
                hospitalId,
                "Appointment Cancelled",
                `${patientName} cancelled appointment with Dr. ${appointment.doctorId?.lastName || ""} (${scheduleTime}). Reason: ${reason || "Not specified"}`,
                "APPOINTMENT",
                "/admin/appointments"
            );
        }

        // 4. Broadcast data update
        if (hospitalId) {
            broadcastDataUpdate(hospitalId, "appointment");
        }

        return res.status(200).json({
            message: "Appointment cancelled successfully",
            appointment,
        });
    } catch (error) {
        return res.status(error.statusCode || 500).json({
            message: error.message || "Failed to cancel appointment",
        });
    }
};

