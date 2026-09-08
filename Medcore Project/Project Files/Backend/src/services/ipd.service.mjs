import Ward from "../models/ward.model.mjs";
import Bed from "../models/bed.model.mjs";
import Admission from "../models/admission.model.mjs";
import AdmissionRequest from "../models/admission-request.model.mjs";
import Notification from "../models/notification.model.mjs";
import Bill from "../models/bill.model.mjs";
import { emitToUser, broadcastDataUpdate } from "./socket.service.mjs";

export const getWardsWithBedsService = async (hospitalId) => {

    const wards = await Ward.find({ hospitalId }).lean();

    const wardsWithBeds = await Promise.all(
        wards.map(async (ward) => {
            const beds = await Bed.find({ wardId: ward._id })
                .populate({
                    path: "currentAdmissionId",
                    populate: {
                        path: "patientId",
                        select: "firstName lastName mrn"
                    }
                })
                .lean();
            return { ...ward, beds };
        })
    );

    return wardsWithBeds;
};

export const createWardService = async (hospitalId, data) => {
    const { name, type, capacity, baseChargePerDay } = data;

    const ward = await Ward.create({
        hospitalId,
        name,
        type,
        capacity,
        baseChargePerDay: baseChargePerDay || 1000
    });

    const bedsToCreate = [];
    for (let i = 1; i <= capacity; i++) {
        bedsToCreate.push({
            wardId: ward._id,
            bedNumber: `${ward.name.charAt(0).toUpperCase()}-${String(i).padStart(2, '0')}`,
            status: "available"
        });
    }

    await Bed.insertMany(bedsToCreate);

    return ward;
};

export const createAdmissionRequestService = async (hospitalId, doctorId, data) => {
    const { patientId, wardTypeRequested, reasonForAdmission, priority } = data;

    const request = await AdmissionRequest.create({
        hospitalId,
        patientId,
        requestingDoctorId: doctorId,
        wardTypeRequested,
        reasonForAdmission,
        priority: priority || "Normal"
    });

    const populatedReq = await AdmissionRequest.findById(request._id)
        .populate("patientId", "firstName lastName mrn")
        .populate("requestingDoctorId", "firstName lastName");

    broadcastDataUpdate(hospitalId, "ipd_requests");

    return populatedReq;
};

export const getPendingRequestsService = async (hospitalId) => {
    return AdmissionRequest.find({ hospitalId, status: "pending" })
        .populate("patientId", "firstName lastName mrn userId")
        .populate("requestingDoctorId", "firstName lastName")
        .sort({ createdAt: -1 });
};

export const admitPatientService = async (hospitalId, doctorId, data) => {
    const { patientId, wardId, bedId, reasonForAdmission, requestId } = data;

    const bed = await Bed.findById(bedId);
    if (!bed || bed.status !== "available" || bed.wardId.toString() !== wardId) {
        const error = new Error("Selected bed is not available");
        error.statusCode = 400;
        throw error;
    }

    const admission = await Admission.create({
        patientId,
        attendingDoctorId: doctorId,
        wardId,
        bedId,
        reasonForAdmission,
        status: "admitted"
    });

    bed.status = "occupied";
    bed.currentAdmissionId = admission._id;
    await bed.save();

    if (requestId) {
        await AdmissionRequest.findByIdAndUpdate(requestId, {
            status: "approved",
            admittedToBedId: bed._id
        });

        broadcastDataUpdate(hospitalId, "ipd_requests");
    }

    try {
        const populatedAdmission = await Admission.findById(admission._id)
            .populate('patientId')
            .populate('wardId')
            .populate('bedId');

        const patientUserId = populatedAdmission.patientId?.userId;
        if (patientUserId) {
            const notif = await Notification.create({
                userId: patientUserId,
                title: "Bed Assigned",
                message: `You have been admitted to ${populatedAdmission.wardId?.name} (Bed: ${populatedAdmission.bedId?.bedNumber}).`,
                type: "SYSTEM",
                link: "/patient/dashboard"
            });
            emitToUser(patientUserId, "notification", notif);

            emitToUser(patientUserId, "data_updated", { resource: "admissions" });
        }

        broadcastDataUpdate(hospitalId, "wards");
    } catch (err) {
        console.error("Failed to send admission notification:", err.message);
    }

    return admission;
};

export const dischargePatientService = async (admissionId, dischargeSummary, generatedBy) => {
    const admission = await Admission.findById(admissionId)
        .populate('wardId')
        .populate('patientId');

    if (!admission || admission.status === "discharged") {
        const error = new Error("Admission not found or already discharged");
        error.statusCode = 400;
        throw error;
    }

    const msInDay = 1000 * 60 * 60 * 24;
    const admissionDate = new Date(admission.admissionDate);
    const dischargeDate = new Date();

    const diffTime = Math.abs(dischargeDate - admissionDate);
    let diffDays = Math.ceil(diffTime / msInDay);
    if (diffDays === 0) diffDays = 1;

    const baseCharge = admission.wardId.baseChargePerDay || 1000;
    const totalBilledAmount = diffDays * baseCharge;

    const billNumber = `INV-${new Date().getFullYear()}-${Math.floor(1000 + Math.random() * 9000)}`;

    const newBill = await Bill.create({
        hospitalId: admission.wardId.hospitalId,
        billNumber,
        patientId: admission.patientId._id,
        items: [{
            type: "room",
            description: `IPD Room Charge (${admission.wardId.name}) - ${diffDays} Day(s)`,
            quantity: diffDays,
            unitPrice: baseCharge,
            totalPrice: totalBilledAmount
        }],
        subtotal: totalBilledAmount,
        totalAmount: totalBilledAmount,
        dueAmount: totalBilledAmount,
        status: "draft",
        generatedBy: generatedBy
    });

    admission.status = "discharged";
    admission.dischargeDate = dischargeDate;
    admission.dischargeSummary = dischargeSummary || "Patient discharged successfully.";
    admission.totalBilledAmount = totalBilledAmount;
    await admission.save();

    const bed = await Bed.findById(admission.bedId);
    if (bed) {
        bed.status = "available";
        bed.currentAdmissionId = null;
        await bed.save();
    }

    try {
        const patientUserId = admission.patientId?.userId;
        if (patientUserId) {
            const notif = await Notification.create({
                userId: patientUserId,
                title: "Discharged from Ward",
                message: `You have been discharged. A draft bill of ₹${totalBilledAmount} has been generated.`,
                type: "SYSTEM",
                link: "/patient/dashboard"
            });
            emitToUser(patientUserId, "notification", notif);

            emitToUser(patientUserId, "data_updated", { resource: "admissions" });
        }

        broadcastDataUpdate(admission.wardId?.hospitalId, "wards");
    } catch (err) {
        console.error("Failed to send discharge notification:", err.message);
    }

    return { admission, bill: newBill };
};

export const getPatientAdmissionHistoryService = async (patientId) => {
    return Admission.find({ patientId })
        .populate("wardId", "name type")
        .populate("bedId", "bedNumber")
        .populate("attendingDoctorId", "firstName lastName")
        .sort({ createdAt: -1 });
};
