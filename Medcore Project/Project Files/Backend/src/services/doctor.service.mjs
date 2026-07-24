import Doctor from "../models/doctor.model.mjs";
import User from "../models/user.model.mjs";
import Appointment from "../models/appointment.model.mjs";

export const upsertDoctorProfileService = async (userId, hospitalId, data) => {
    let doctor = await Doctor.findOne({ userId });

    if (doctor) {
        Object.assign(doctor, data);
        await doctor.save();
    } else {
        doctor = await Doctor.create({
            userId,
            hospitalId,
            ...data,
        });
    }

    return doctor.populate([
        { path: "userId", select: "firstName lastName email phone avatarUrl" },
        { path: "departmentId", select: "name code" },
        { path: "hospitalId", select: "name code" }
    ]);
};

export const getDoctorProfileService = async (identifier) => {
    let doctor = await Doctor.findOne({
        $or: [{ _id: identifier }, { userId: identifier }]
    }).populate([
        { path: "userId", select: "firstName lastName email phone avatarUrl" },
        { path: "departmentId", select: "name code" },
        { path: "hospitalId", select: "name code" }
    ]);

    if (!doctor) {
        const error = new Error("Doctor profile not found");
        error.statusCode = 404;
        throw error;
    }

    return doctor;
};

export const getDoctorsByHospitalService = async (hospitalId, departmentId) => {
    const query = { hospitalId };
    if (departmentId) {
        query.departmentId = departmentId;
    }

    return Doctor.find(query).populate([
        { path: "userId", select: "firstName lastName email phone avatarUrl" },
        { path: "departmentId", select: "name code" }
    ]);
};

export const getAvailableSlotsService = async (doctorIdStr, dateStr) => {
    let doctor = await Doctor.findOne({
        $or: [{ _id: doctorIdStr }, { userId: doctorIdStr }]
    });

    if (!doctor) {
        const error = new Error("Doctor profile not found");
        error.statusCode = 404;
        throw error;
    }

    if (!doctor.isAcceptingAppointments) {
        return [];
    }

    const targetDate = new Date(dateStr);
    if (isNaN(targetDate.getTime())) {
        const error = new Error("Invalid date format. Use YYYY-MM-DD");
        error.statusCode = 400;
        throw error;
    }

    const dayOfWeek = targetDate.getUTCDay();

    const daySchedule = doctor.availability.find(a => a.dayOfWeek === dayOfWeek);
    if (!daySchedule) {
        return {
            date: dateStr,
            dayOfWeek,
            availableSlots: []
        };
    }

    const { startTime, endTime, slotDurationMin = 15 } = daySchedule;
    const slots = [];

    const [startHour, startMin] = startTime.split(":").map(Number);
    const [endHour, endMin] = endTime.split(":").map(Number);

    let currentMinutes = startHour * 60 + startMin;
    const endMinutes = endHour * 60 + endMin;

    while (currentMinutes + slotDurationMin <= endMinutes) {
        const h = Math.floor(currentMinutes / 60).toString().padStart(2, "0");
        const m = (currentMinutes % 60).toString().padStart(2, "0");
        slots.push(`${h}:${m}`);
        currentMinutes += slotDurationMin;
    }

    const dayStart = new Date(targetDate);
    dayStart.setUTCHours(0, 0, 0, 0);

    const dayEnd = new Date(targetDate);
    dayEnd.setUTCHours(23, 59, 59, 999);

    const existingAppointments = await Appointment.find({
        doctorId: doctor.userId,
        scheduledAt: { $gte: dayStart, $lte: dayEnd },
        status: { $nin: ["cancelled", "no_show"] }
    });

    const bookedTimeStrings = existingAppointments.map(app => {
        const d = new Date(app.scheduledAt);
        const h = d.getUTCHours().toString().padStart(2, "0");
        const m = d.getUTCMinutes().toString().padStart(2, "0");
        return `${h}:${m}`;
    });

    const availableSlots = slots.filter(slot => !bookedTimeStrings.includes(slot));

    return {
        date: dateStr,
        dayOfWeek,
        slotDurationMin,
        totalSlots: slots.length,
        availableSlots
    };
};
