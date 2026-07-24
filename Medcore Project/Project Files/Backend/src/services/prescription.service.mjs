import Prescription from "../models/prescription.model.mjs";
import Patient from "../models/patient.model.mjs";
import User from "../models/user.model.mjs";
import Hospital from "../models/hospital.model.mjs";
import PharmacyInventory from "../models/pharmacy-inventory.model.mjs";
import { generatePrescriptionPdfBuffer } from "../utils/prescriptionPdf.mjs";

export const createPrescriptionService = async (hospitalId, doctorUserId, data) => {
    const { patientId, encounterId, medicines = [], generalInstructions } = data;

    // Verify patient
    const patient = await Patient.findById(patientId);
    if (!patient) {
        const error = new Error("Patient not found");
        error.statusCode = 404;
        throw error;
    }

    // Auto-generate rxNumber
    const today = new Date().toISOString().slice(0, 10).replace(/-/g, "");
    const random4 = Math.floor(1000 + Math.random() * 9000);
    const rxNumber = `RX-${today}-${random4}`;

    const prescription = await Prescription.create({
        hospitalId: hospitalId || patient.hospitalId,
        encounterId,
        patientId,
        doctorId: doctorUserId,
        rxNumber,
        medicines,
        generalInstructions,
        status: "issued"
    });

    return prescription.populate([
        { path: "patientId", select: "firstName lastName mrn dob gender bloodGroup" },
        { path: "doctorId", select: "firstName lastName email" },
        { path: "hospitalId", select: "name code" }
    ]);
};

export const getPrescriptionByIdService = async (prescriptionId) => {
    const prescription = await Prescription.findById(prescriptionId).populate([
        { path: "patientId", select: "firstName lastName mrn dob gender bloodGroup phone" },
        { path: "doctorId", select: "firstName lastName email phone" },
        { path: "hospitalId", select: "name code address phone email" },
        { path: "encounterId" }
    ]);

    if (!prescription) {
        const error = new Error("Prescription not found");
        error.statusCode = 404;
        throw error;
    }

    return prescription;
};

export const getPrescriptionsByEncounterService = async (encounterId) => {
    return Prescription.find({ encounterId })
        .populate("doctorId", "firstName lastName")
        .populate("patientId", "firstName lastName mrn");
};

export const getPrescriptionsByPatientService = async (patientId, hospitalId) => {
    const query = { patientId };
    if (hospitalId) query.hospitalId = hospitalId;

    return Prescription.find(query)
        .populate("doctorId", "firstName lastName")
        .sort({ createdAt: -1 });
};

export const cancelPrescriptionService = async (prescriptionId, doctorUserId) => {
    const prescription = await Prescription.findById(prescriptionId);
    if (!prescription) {
        const error = new Error("Prescription not found");
        error.statusCode = 404;
        throw error;
    }

    if (prescription.doctorId.toString() !== doctorUserId.toString()) {
        const error = new Error("Only the prescribing doctor can cancel this prescription");
        error.statusCode = 403;
        throw error;
    }

    prescription.status = "cancelled";
    await prescription.save();
    return prescription;
};

export const searchMedicinesService = async (hospitalId, queryStr) => {
    if (!queryStr || queryStr.trim().length < 2) {
        return [];
    }

    const regex = new RegExp(queryStr, "i");

    // Try finding in pharmacy inventory for this hospital
    let items = [];
    if (hospitalId) {
        items = await PharmacyInventory.find({
            hospitalId,
            $or: [{ medicineName: regex }, { genericName: regex }, { brand: regex }]
        }).limit(20);
    }

    if (items.length > 0) {
        return items.map(item => ({
            name: item.medicineName,
            genericName: item.genericName,
            brand: item.brand,
            category: item.category,
            unitPrice: item.unitPrice
        }));
    }

    // Fallback static standard medicine suggestions if inventory is empty
    const commonMedicines = [
        { name: "Paracetamol 500mg", genericName: "Acetaminophen", category: "tablet" },
        { name: "Amoxicillin 500mg", genericName: "Amoxicillin", category: "capsule" },
        { name: "Ibuprofen 400mg", genericName: "Ibuprofen", category: "tablet" },
        { name: "Azithromycin 500mg", genericName: "Azithromycin", category: "tablet" },
        { name: "Cetirizine 10mg", genericName: "Cetirizine", category: "tablet" },
        { name: "Pantoprazole 40mg", genericName: "Pantoprazole", category: "tablet" },
        { name: "Metformin 500mg", genericName: "Metformin", category: "tablet" },
        { name: "Amlodipine 5mg", genericName: "Amlodipine", category: "tablet" },
        { name: "Cough Syrup 100ml", genericName: "Dextromethorphan", category: "syrup" }
    ];

    return commonMedicines.filter(m =>
        m.name.toLowerCase().includes(queryStr.toLowerCase()) ||
        m.genericName.toLowerCase().includes(queryStr.toLowerCase())
    );
};

export const generatePrescriptionPdfService = async (prescriptionId) => {
    const prescription = await Prescription.findById(prescriptionId).populate("patientId doctorId hospitalId");
    if (!prescription) {
        const error = new Error("Prescription not found");
        error.statusCode = 404;
        throw error;
    }

    const doctor = await User.findById(prescription.doctorId);
    const patient = await Patient.findById(prescription.patientId);
    const hospital = await Hospital.findById(prescription.hospitalId);

    const pdfBuffer = await generatePrescriptionPdfBuffer(prescription, doctor, patient, hospital);
    return {
        filename: `Prescription_${prescription.rxNumber}.pdf`,
        buffer: pdfBuffer
    };
};
