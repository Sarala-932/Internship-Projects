import Hospital from "../models/hospital.model.mjs";

const createError = (message, status = 400) => {
    const err = new Error(message);
    err.status = status;
    return err;
};

// Super Admin creates a new hospital (status: "pending")
export const createHospitalService = async (data) => {
    const { name, email, phone, address, code } = data;

    if (!name || !email) {
        throw createError("Hospital name and email are required", 400);
    }

    const existing = await Hospital.findOne({
        $or: [
            { email: email.toLowerCase() },
            ...(code ? [{ code: code.toUpperCase() }] : []),
        ],
    });

    if (existing) {
        throw createError("Hospital with this email or code already exists", 409);
    }

    const hospital = await Hospital.create({
        name,
        email: email.toLowerCase(),
        phone,
        address,
        code: code ? code.toUpperCase() : undefined,
        status: "pending",
    });

    return hospital;
};

// Super Admin verifies (approves) a pending hospital
export const verifyHospitalService = async (hospitalId, verifiedByUserId) => {
    const hospital = await Hospital.findById(hospitalId);

    if (!hospital) throw createError("Hospital not found", 404);
    if (hospital.status === "active") throw createError("Hospital already verified", 400);

    hospital.status = "active";
    hospital.verifiedAt = new Date();
    hospital.verifiedBy = verifiedByUserId;
    await hospital.save();

    return hospital;
};

// Get all hospitals (with optional status filter)
export const getHospitalsService = async (query = {}) => {
    const filter = {};
    if (query.status) filter.status = query.status;

    const hospitals = await Hospital.find(filter)
        .sort({ createdAt: -1 })
        .select("-__v");

    return hospitals;
};

// Get a single hospital by ID
export const getHospitalByIdService = async (hospitalId) => {
    const hospital = await Hospital.findById(hospitalId).select("-__v");
    if (!hospital) throw createError("Hospital not found", 404);
    return hospital;
};
