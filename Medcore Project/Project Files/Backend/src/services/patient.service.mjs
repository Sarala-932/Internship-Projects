import Patient from "../models/patient.model.mjs";

export const registerPatientService = async (hospitalId, data) => {
    if (!data.mrn) {
        // Auto-generate MRN: MRN-YYYYMMDD-XXXX
        const today = new Date().toISOString().slice(0, 10).replace(/-/g, "");
        const random4 = Math.floor(1000 + Math.random() * 9000);
        data.mrn = `MRN-${today}-${random4}`;
    }

    // Auto-create User account if not already provided (e.g., from self-registration) and email exists
    if (!data.userId && data.email) {
        const { default: User } = await import("../models/user.model.mjs");
        const bcrypt = await import("bcrypt");
        const defaultPassword = data.phone || "Medcore@123";
        const passwordHash = await bcrypt.hash(defaultPassword, 12);
        
        const existingUser = await User.findOne({ email: data.email.toLowerCase() });
        if (!existingUser) {
            const newUser = await User.create({
                email: data.email.toLowerCase(),
                passwordHash,
                firstName: data.firstName,
                lastName: data.lastName,
                phone: data.phone,
                role: "patient",
                isEmailVerified: true // Admin created
            });
            data.userId = newUser._id;
        } else {
            data.userId = existingUser._id;
        }
    }

    const patient = await Patient.create({
        hospitalId,
        ...data
    });

    return patient;
};

export const getPatientByIdService = async (patientId) => {
    const patient = await Patient.findById(patientId)
        .populate("hospitalId", "name code")
        .populate("userId", "firstName lastName email phone");

    if (!patient) {
        const error = new Error("Patient not found");
        error.statusCode = 404;
        throw error;
    }

    return patient;
};

export const getPatientsByHospitalService = async (hospitalId, search) => {
    const query = { hospitalId };

    if (search) {
        query.$or = [
            { firstName: { $regex: search, $options: "i" } },
            { lastName: { $regex: search, $options: "i" } },
            { mrn: { $regex: search, $options: "i" } },
            { phone: { $regex: search, $options: "i" } }
        ];
    }

    return Patient.find(query).sort({ createdAt: -1 });
};

export const updatePatientService = async (patientId, data) => {
    const patient = await Patient.findByIdAndUpdate(patientId, data, {
        new: true,
        runValidators: true
    });

    if (!patient) {
        const error = new Error("Patient not found");
        error.statusCode = 404;
        throw error;
    }

    return patient;
};
