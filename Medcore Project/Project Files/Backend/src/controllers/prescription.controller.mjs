import {
    createPrescriptionService,
    getPrescriptionByIdService,
    getPrescriptionsByEncounterService,
    getPrescriptionsByPatientService,
    cancelPrescriptionService,
    searchMedicinesService,
    generatePrescriptionPdfService
} from "../services/prescription.service.mjs";

export const createPrescription = async (req, res) => {
    try {
        const prescription = await createPrescriptionService(
            req.hospitalId,
            req.userId,
            req.body
        );
        return res.status(201).json({
            message: "Prescription created successfully",
            prescription
        });
    } catch (error) {
        return res.status(error.statusCode || 500).json({
            message: error.message || "Failed to create prescription"
        });
    }
};

export const getPrescriptionById = async (req, res) => {
    try {
        const prescription = await getPrescriptionByIdService(req.params.id);
        return res.status(200).json({ prescription });
    } catch (error) {
        return res.status(error.statusCode || 500).json({
            message: error.message || "Failed to get prescription"
        });
    }
};

export const getPrescriptionsByEncounter = async (req, res) => {
    try {
        const prescriptions = await getPrescriptionsByEncounterService(req.params.encounterId);
        return res.status(200).json({ prescriptions });
    } catch (error) {
        return res.status(error.statusCode || 500).json({
            message: error.message || "Failed to get prescriptions for encounter"
        });
    }
};

export const getPrescriptionsByPatient = async (req, res) => {
    try {
        const prescriptions = await getPrescriptionsByPatientService(
            req.params.patientId,
            req.hospitalId
        );
        return res.status(200).json({ prescriptions });
    } catch (error) {
        return res.status(error.statusCode || 500).json({
            message: error.message || "Failed to get patient prescriptions"
        });
    }
};

export const cancelPrescription = async (req, res) => {
    try {
        const prescription = await cancelPrescriptionService(req.params.id, req.userId);
        return res.status(200).json({
            message: "Prescription cancelled successfully",
            prescription
        });
    } catch (error) {
        return res.status(error.statusCode || 500).json({
            message: error.message || "Failed to cancel prescription"
        });
    }
};

export const searchMedicines = async (req, res) => {
    try {
        const queryStr = req.query.q || req.query.search;
        const medicines = await searchMedicinesService(req.hospitalId, queryStr);
        return res.status(200).json({ medicines });
    } catch (error) {
        return res.status(error.statusCode || 500).json({
            message: error.message || "Failed to search medicines"
        });
    }
};

export const downloadPrescriptionPdf = async (req, res) => {
    try {
        const { filename, buffer } = await generatePrescriptionPdfService(req.params.id);

        res.setHeader("Content-Type", "application/pdf");
        res.setHeader("Content-Disposition", `attachment; filename="${filename}"`);
        res.setHeader("Content-Length", buffer.length);

        return res.send(buffer);
    } catch (error) {
        return res.status(error.statusCode || 500).json({
            message: error.message || "Failed to generate prescription PDF"
        });
    }
};
