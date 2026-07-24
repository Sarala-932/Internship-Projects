import Appointment from "../models/appointment.model.mjs";
import Doctor from "../models/doctor.model.mjs";
import Patient from "../models/patient.model.mjs";

export const bookAppointmentService = async (hospitalId, bookedByUserId, data) => {
    const { patientId, doctorId, departmentId, scheduledAt, durationMin = 15, type = "opd", reason } = data;

    // 1. Verify Patient exists
    const patient = await Patient.findById(patientId);
    if (!patient) {
        const error = new Error("Patient not found");
        error.statusCode = 404;
        throw error;
    }

    // 2. Verify Doctor exists (doctorId is User ID of doctor)
    const doctorProfile = await Doctor.findOne({
        $or: [{ userId: doctorId }, { _id: doctorId }]
    });

    if (!doctorProfile) {
        const error = new Error("Doctor profile not found");
        error.statusCode = 404;
        throw error;
    }

    if (!doctorProfile.isAcceptingAppointments) {
        const error = new Error("Doctor is currently not accepting appointments");
        error.statusCode = 400;
        throw error;
    }

    const actualDoctorUserId = doctorProfile.userId;

    // 3. Conflict Detection
    const slotStart = new Date(scheduledAt);
    if (isNaN(slotStart.getTime())) {
        const error = new Error("Invalid scheduledAt date format");
        error.statusCode = 400;
        throw error;
    }

    const slotEnd = new Date(slotStart.getTime() + durationMin * 60 * 1000);

    // Query for any existing active appointment for this doctor that overlaps
    // Overlap condition: existing.scheduledAt < slotEnd AND existingEnd > slotStart
    const activeAppointments = await Appointment.find({
        doctorId: actualDoctorUserId,
        status: { $nin: ["cancelled", "no_show"] }
    });

    const hasConflict = activeAppointments.some(app => {
        const appStart = new Date(app.scheduledAt).getTime();
        const appEnd = appStart + (app.durationMin || 15) * 60 * 1000;
        return appStart < slotEnd.getTime() && slotStart.getTime() < appEnd;
    });

    if (hasConflict) {
        const error = new Error("Conflict detected: Doctor already has an appointment booked for this time slot");
        error.statusCode = 409;
        throw error;
    }

    // 4. Create Appointment
    const appointment = await Appointment.create({
        hospitalId,
        patientId,
        doctorId: actualDoctorUserId,
        departmentId: departmentId || doctorProfile.departmentId,
        scheduledAt: slotStart,
        durationMin,
        type,
        reason,
        bookedBy: bookedByUserId,
        status: "scheduled"
    });

    return appointment.populate([
        { path: "patientId", select: "firstName lastName mrn phone" },
        { path: "doctorId", select: "firstName lastName email" },
        { path: "departmentId", select: "name code" }
    ]);
};

export const getAppointmentByIdService = async (appointmentId) => {
    const appointment = await Appointment.findById(appointmentId).populate([
        { path: "patientId", select: "firstName lastName mrn phone dob gender bloodGroup" },
        { path: "doctorId", select: "firstName lastName email phone" },
        { path: "departmentId", select: "name code" },
        { path: "bookedBy", select: "firstName lastName role" },
        { path: "encounterId" }
    ]);

    if (!appointment) {
        const error = new Error("Appointment not found");
        error.statusCode = 404;
        throw error;
    }

    return appointment;
};

export const getAppointmentsService = async (hospitalId, filters = {}) => {
    const query = { hospitalId };

    if (filters.doctorId) query.doctorId = filters.doctorId;
    if (filters.patientId) query.patientId = filters.patientId;
    if (filters.departmentId) query.departmentId = filters.departmentId;
    if (filters.status) query.status = filters.status;

    if (filters.date) {
        const dayStart = new Date(filters.date);
        dayStart.setUTCHours(0, 0, 0, 0);

        const dayEnd = new Date(filters.date);
        dayEnd.setUTCHours(23, 59, 59, 999);

        query.scheduledAt = { $gte: dayStart, $lte: dayEnd };
    }

    return Appointment.find(query)
        .populate("patientId", "firstName lastName mrn phone")
        .populate("doctorId", "firstName lastName email")
        .populate("departmentId", "name code")
        .sort({ scheduledAt: 1 });
};

export const updateAppointmentStatusService = async (appointmentId, newStatus) => {
    const validStatuses = ["scheduled", "checked_in", "in_consultation", "completed", "cancelled", "no_show"];
    if (!validStatuses.includes(newStatus)) {
        const error = new Error(`Invalid status: ${newStatus}. Valid statuses are ${validStatuses.join(", ")}`);
        error.statusCode = 400;
        throw error;
    }

    const appointment = await Appointment.findById(appointmentId);
    if (!appointment) {
        const error = new Error("Appointment not found");
        error.statusCode = 404;
        throw error;
    }

    appointment.status = newStatus;
    await appointment.save();

    return appointment;
};

export const cancelAppointmentService = async (appointmentId, cancelReason) => {
    const appointment = await Appointment.findById(appointmentId);
    if (!appointment) {
        const error = new Error("Appointment not found");
        error.statusCode = 404;
        throw error;
    }

    if (appointment.status === "completed") {
        const error = new Error("Completed appointments cannot be cancelled");
        error.statusCode = 400;
        throw error;
    }

    appointment.status = "cancelled";
    appointment.cancelledAt = new Date();
    appointment.cancelReason = cancelReason || "Cancelled by user";
    await appointment.save();

    return appointment;
};
