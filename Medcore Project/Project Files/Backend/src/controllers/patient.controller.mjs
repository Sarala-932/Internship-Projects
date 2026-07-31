import {
    registerPatientService,
    getPatientByIdService,
    getPatientsByHospitalService,
    updatePatientService
} from "../services/patient.service.mjs";
import Patient from "../models/patient.model.mjs";

// GET /patients/me — returns patient profile linked to the logged-in user
export const getMyProfile = async (req, res) => {
    try {
        const patient = await Patient.findOne({ userId: req.user._id })
            .populate("hospitalId", "name email phone address")
            .select("-__v");
        if (!patient) {
            return res.status(404).json({ message: "Patient profile not found" });
        }
        return res.status(200).json({ patient });
    } catch (error) {
        return res.status(500).json({ message: error.message || "Failed to fetch profile" });
    }
};

export const registerPatient = async (req, res) => {
    try {
        const hospitalId = req.body.hospitalId || req.hospitalId;
        if (!hospitalId) {
            return res.status(400).json({ message: "Hospital ID is required" });
        }
        const patient = await registerPatientService(hospitalId, req.body);
        return res.status(201).json({
            message: "Patient registered successfully",
            patient
        });
    } catch (error) {
        return res.status(error.statusCode || 500).json({
            message: error.message || "Failed to register patient"
        });
    }
};

export const getPatientById = async (req, res) => {
    try {
        const patient = await getPatientByIdService(req.params.id);
        return res.status(200).json({ patient });
    } catch (error) {
        return res.status(error.statusCode || 500).json({
            message: error.message || "Failed to get patient"
        });
    }
};

export const getPatients = async (req, res) => {
    try {
        const hospitalId = req.query.hospitalId || req.hospitalId;
        if (!hospitalId) {
            return res.status(400).json({ message: "Hospital ID is required" });
        }
        const patients = await getPatientsByHospitalService(hospitalId, req.query.search);
        return res.status(200).json({ patients });
    } catch (error) {
        return res.status(error.statusCode || 500).json({
            message: error.message || "Failed to get patients"
        });
    }
};

export const updatePatient = async (req, res) => {
    try {
        if (req.user.role === "patient") {
            const patientToUpdate = await Patient.findById(req.params.id);
            if (!patientToUpdate) {
                return res.status(404).json({ message: "Patient not found" });
            }
            if (patientToUpdate.userId.toString() !== req.user._id.toString()) {
                return res.status(403).json({ message: "Forbidden - you can only update your own profile" });
            }
        }
        
        const patient = await updatePatientService(req.params.id, req.body);
        return res.status(200).json({
            message: "Patient updated successfully",
            patient
        });
    } catch (error) {
        return res.status(error.statusCode || 500).json({
            message: error.message || "Failed to update patient"
        });
    }
};
