import Encounter from "../models/encounter.model.mjs";
import Appointment from "../models/appointment.model.mjs";

export const createEncounterService = async (appointmentId, doctorUserId, hospitalId, data = {}) => {
    const appointment = await Appointment.findById(appointmentId);
    if (!appointment) {
        const error = new Error("Appointment not found");
        error.statusCode = 404;
        throw error;
    }

    // Check if encounter already exists for this appointment
    let encounter = await Encounter.findOne({ appointmentId });
    if (encounter) {
        return encounter;
    }

    encounter = await Encounter.create({
        hospitalId: hospitalId || appointment.hospitalId,
        appointmentId,
        patientId: appointment.patientId,
        doctorId: doctorUserId || appointment.doctorId,
        encounterDate: new Date(),
        status: "draft",
        ...data
    });

    // Link encounter back to appointment & set status to in_consultation
    appointment.encounterId = encounter._id;
    appointment.status = "in_consultation";
    await appointment.save();

    return encounter;
};

export const updateEncounterService = async (encounterId, doctorUserId, data) => {
    const encounter = await Encounter.findById(encounterId);
    if (!encounter) {
        const error = new Error("Encounter not found");
        error.statusCode = 404;
        throw error;
    }

    if (encounter.status === "signed") {
        const error = new Error("Cannot modify a signed (locked) encounter");
        error.statusCode = 403;
        throw error;
    }

    const allowedUpdates = [
        "chiefComplaint",
        "historyOfPresentIllness",
        "examination",
        "diagnosis",
        "clinicalNotes",
        "advice",
        "followUpDate",
        "attachments"
    ];

    allowedUpdates.forEach(field => {
        if (data[field] !== undefined) {
            encounter[field] = data[field];
        }
    });

    await encounter.save();
    return encounter;
};

export const addVitalsService = async (encounterId, recordedByUserId, vitalsData) => {
    const encounter = await Encounter.findById(encounterId);
    if (!encounter) {
        const error = new Error("Encounter not found");
        error.statusCode = 404;
        throw error;
    }

    if (encounter.status === "signed") {
        const error = new Error("Cannot update vitals on a signed encounter");
        error.statusCode = 403;
        throw error;
    }

    // Auto-compute BMI if height and weight are provided
    let bmi = vitalsData.bmi;
    if (!bmi && vitalsData.heightCm && vitalsData.weightKg) {
        const heightM = vitalsData.heightCm / 100;
        bmi = parseFloat((vitalsData.weightKg / (heightM * heightM)).toFixed(2));
    }

    encounter.vitals = {
        ...vitalsData,
        bmi,
        recordedBy: recordedByUserId,
        recordedAt: new Date()
    };

    await encounter.save();
    return encounter;
};

export const signEncounterService = async (encounterId, doctorUserId) => {
    const encounter = await Encounter.findById(encounterId);
    if (!encounter) {
        const error = new Error("Encounter not found");
        error.statusCode = 404;
        throw error;
    }

    if (encounter.doctorId.toString() !== doctorUserId.toString()) {
        const error = new Error("Only the attending doctor can sign this encounter");
        error.statusCode = 403;
        throw error;
    }

    encounter.status = "signed";
    encounter.signedAt = new Date();
    await encounter.save();

    // Mark corresponding appointment as completed
    if (encounter.appointmentId) {
        await Appointment.findByIdAndUpdate(encounter.appointmentId, {
            status: "completed"
        });
    }

    return encounter;
};

export const getEncounterByIdService = async (encounterId) => {
    const encounter = await Encounter.findById(encounterId).populate([
        { path: "patientId", select: "firstName lastName mrn dob gender bloodGroup allergies chronicConditions" },
        { path: "doctorId", select: "firstName lastName email" },
        { path: "hospitalId", select: "name code" },
        { path: "appointmentId", select: "scheduledAt type reason" },
        { path: "vitals.recordedBy", select: "firstName lastName role" }
    ]);

    if (!encounter) {
        const error = new Error("Encounter not found");
        error.statusCode = 404;
        throw error;
    }

    return encounter;
};

export const getPatientEncountersService = async (patientId, hospitalId) => {
    const query = { patientId };
    if (hospitalId) query.hospitalId = hospitalId;

    return Encounter.find(query)
        .populate("doctorId", "firstName lastName")
        .sort({ encounterDate: -1 });
};
