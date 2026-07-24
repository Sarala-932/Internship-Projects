import {
    bookAppointmentService,
    getAppointmentByIdService,
    getAppointmentsService,
    updateAppointmentStatusService,
    cancelAppointmentService
} from "../services/appointment.service.mjs";

export const bookAppointment = async (req, res) => {
    try {
        const hospitalId = req.body.hospitalId || req.hospitalId;
        if (!hospitalId) {
            return res.status(400).json({ message: "Hospital ID is required" });
        }
        const appointment = await bookAppointmentService(hospitalId, req.userId, req.body);
        return res.status(201).json({
            message: "Appointment booked successfully",
            appointment
        });
    } catch (error) {
        return res.status(error.statusCode || 500).json({
            message: error.message || "Failed to book appointment"
        });
    }
};

export const getAppointmentById = async (req, res) => {
    try {
        const appointment = await getAppointmentByIdService(req.params.id);
        return res.status(200).json({ appointment });
    } catch (error) {
        return res.status(error.statusCode || 500).json({
            message: error.message || "Failed to get appointment"
        });
    }
};

export const getAppointments = async (req, res) => {
    try {
        const hospitalId = req.query.hospitalId || req.hospitalId;
        if (!hospitalId) {
            return res.status(400).json({ message: "Hospital ID is required" });
        }
        const appointments = await getAppointmentsService(hospitalId, req.query);
        return res.status(200).json({ appointments });
    } catch (error) {
        return res.status(error.statusCode || 500).json({
            message: error.message || "Failed to get appointments"
        });
    }
};

export const updateAppointmentStatus = async (req, res) => {
    try {
        const { status } = req.body;
        if (!status) {
            return res.status(400).json({ message: "Status is required" });
        }
        const appointment = await updateAppointmentStatusService(req.params.id, status);
        return res.status(200).json({
            message: `Appointment status updated to '${status}'`,
            appointment
        });
    } catch (error) {
        return res.status(error.statusCode || 500).json({
            message: error.message || "Failed to update appointment status"
        });
    }
};

export const cancelAppointment = async (req, res) => {
    try {
        const { reason } = req.body;
        const appointment = await cancelAppointmentService(req.params.id, reason);
        return res.status(200).json({
            message: "Appointment cancelled successfully",
            appointment
        });
    } catch (error) {
        return res.status(error.statusCode || 500).json({
            message: error.message || "Failed to cancel appointment"
        });
    }
};
