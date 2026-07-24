import {
    createEncounterService,
    updateEncounterService,
    addVitalsService,
    signEncounterService,
    getEncounterByIdService,
    getPatientEncountersService
} from "../services/encounter.service.mjs";

export const createEncounter = async (req, res) => {
    try {
        const { appointmentId } = req.body;
        if (!appointmentId) {
            return res.status(400).json({ message: "Appointment ID is required" });
        }
        const encounter = await createEncounterService(
            appointmentId,
            req.userId,
            req.hospitalId,
            req.body
        );
        return res.status(201).json({
            message: "Encounter created successfully",
            encounter
        });
    } catch (error) {
        return res.status(error.statusCode || 500).json({
            message: error.message || "Failed to create encounter"
        });
    }
};

export const updateEncounter = async (req, res) => {
    try {
        const encounter = await updateEncounterService(req.params.id, req.userId, req.body);
        return res.status(200).json({
            message: "Encounter updated successfully",
            encounter
        });
    } catch (error) {
        return res.status(error.statusCode || 500).json({
            message: error.message || "Failed to update encounter"
        });
    }
};

export const addVitals = async (req, res) => {
    try {
        const encounter = await addVitalsService(req.params.id, req.userId, req.body);
        return res.status(200).json({
            message: "Vitals recorded successfully",
            vitals: encounter.vitals
        });
    } catch (error) {
        return res.status(error.statusCode || 500).json({
            message: error.message || "Failed to record vitals"
        });
    }
};

export const signEncounter = async (req, res) => {
    try {
        const encounter = await signEncounterService(req.params.id, req.userId);
        return res.status(200).json({
            message: "Encounter signed and locked successfully",
            encounter
        });
    } catch (error) {
        return res.status(error.statusCode || 500).json({
            message: error.message || "Failed to sign encounter"
        });
    }
};

export const getEncounterById = async (req, res) => {
    try {
        const encounter = await getEncounterByIdService(req.params.id);
        return res.status(200).json({ encounter });
    } catch (error) {
        return res.status(error.statusCode || 500).json({
            message: error.message || "Failed to get encounter"
        });
    }
};

export const getPatientEncounters = async (req, res) => {
    try {
        const encounters = await getPatientEncountersService(
            req.params.patientId,
            req.hospitalId
        );
        return res.status(200).json({ encounters });
    } catch (error) {
        return res.status(error.statusCode || 500).json({
            message: error.message || "Failed to get patient encounters"
        });
    }
};
