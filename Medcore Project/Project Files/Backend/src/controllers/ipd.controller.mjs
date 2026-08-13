import {
    getWardsWithBedsService,
    createWardService,
    admitPatientService,
    dischargePatientService,
    getPatientAdmissionHistoryService
} from "../services/ipd.service.mjs";
import Patient from "../models/patient.model.mjs";

export const getWardsWithBeds = async (req, res) => {
    try {
        const hospitalId = req.user.hospitalId;
        const wards = await getWardsWithBedsService(hospitalId);
        return res.json({ wards });
    } catch (err) {
        console.error("getWardsWithBeds error:", err);
        return res.status(500).json({ message: "Failed to fetch wards and beds" });
    }
};

export const createWard = async (req, res) => {
    try {
        const hospitalId = req.user.hospitalId;
        const ward = await createWardService(hospitalId, req.body);
        return res.status(201).json({ message: "Ward and beds created successfully", ward });
    } catch (err) {
        console.error("createWard error:", err);
        return res.status(400).json({ message: err.message || "Failed to create ward" });
    }
};

export const admitPatient = async (req, res) => {
    try {
        const hospitalId = req.user.hospitalId;
        const doctorId = req.user._id; // Assuming the logged in doctor/admin is admitting
        const admission = await admitPatientService(hospitalId, doctorId, req.body);
        return res.status(201).json({ message: "Patient admitted successfully", admission });
    } catch (err) {
        console.error("admitPatient error:", err);
        return res.status(400).json({ message: err.message || "Failed to admit patient" });
    }
};

export const dischargePatient = async (req, res) => {
    try {
        const { id } = req.params;
        const { dischargeSummary } = req.body;
        const admission = await dischargePatientService(id, dischargeSummary);
        return res.json({ message: "Patient discharged successfully", admission });
    } catch (err) {
        console.error("dischargePatient error:", err);
        return res.status(400).json({ message: err.message || "Failed to discharge patient" });
    }
};

export const getMyAdmissions = async (req, res) => {
    try {
        // Only for patients
        if (req.user.role !== "patient") {
            return res.status(403).json({ message: "Access denied" });
        }
        // Actually we need the Patient record ID, not the user ID. 
        // We can find patient by userId.
        // Wait, req.user._id is the User ID. Let's find patient ID first.
        const patient = await Patient.findOne({ userId: req.user._id });
        if (!patient) return res.status(404).json({ message: "Patient profile not found" });

        const admissions = await getPatientAdmissionHistoryService(patient._id);
        return res.json({ admissions });
    } catch (err) {
        console.error("getMyAdmissions error:", err);
        return res.status(500).json({ message: "Failed to fetch admission history" });
    }
};
