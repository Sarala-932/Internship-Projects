import LabOrder from "../models/laborder.model.mjs";
import Hospital from "../models/hospital.model.mjs";
import Patient from "../models/patient.model.mjs";
import Notification from "../models/notification.model.mjs";
import { generateLabReportPdfBuffer } from "../utils/labPdf.mjs";
import { uploadPdfBufferToCloudinary } from "../utils/cloudinary.mjs";
import { emitToUser } from "../services/socket.service.mjs";

const generateOrderNumber = async () => {
    const year = new Date().getFullYear();
    const count = await LabOrder.countDocuments();
    return `LAB-${year}-${String(count + 1).padStart(6, "0")}`;
};

export const createLabOrderService = async (hospitalId, doctorUserId, data) => {
    const { patientId, encounterId, tests, priority } = data;

    if (!patientId || !tests || tests.length === 0) {
        const error = new Error("Patient ID and at least one test are required");
        error.statusCode = 400;
        throw error;
    }

    const orderNumber = await generateOrderNumber();

    const labOrder = await LabOrder.create({
        hospitalId,
        orderedByDoctorId: doctorUserId,
        patientId,
        encounterId,
        orderNumber,
        tests: tests.map(test => ({
            name: test.name,
            code: test.code,
            sampleType: test.sampleType,
            status: "ordered"
        })),
        priority: priority || "routine",
        overallStatus: "pending"
    });

    return labOrder;
};

export const getLabOrdersService = async (hospitalId, queryParams) => {
    const query = {};
    if (hospitalId) query.hospitalId = hospitalId;
    
    if (queryParams.patientId) query.patientId = queryParams.patientId;
    if (queryParams.status) query.overallStatus = queryParams.status;
    if (queryParams.priority) query.priority = queryParams.priority;

    return LabOrder.find(query)
        .populate("patientId", "firstName lastName mrn dob gender")
        .populate("orderedByDoctorId", "firstName lastName")
        .sort({ createdAt: -1 });
};

export const updateTestResultService = async (orderId, testName, labTechUserId, resultData) => {
    const labOrder = await LabOrder.findById(orderId);
    
    if (!labOrder) {
        const error = new Error("Lab order not found");
        error.statusCode = 404;
        throw error;
    }

    const testIndex = labOrder.tests.findIndex(t => t.name === testName);
    if (testIndex === -1) {
        const error = new Error(`Test '${testName}' not found in this order`);
        error.statusCode = 404;
        throw error;
    }

    // Update the specific test result
    labOrder.tests[testIndex].result = {
        values: resultData.values || [],
        notes: resultData.notes || "",
        reportUrl: resultData.reportUrl || "",
        completedAt: new Date(),
        completedBy: labTechUserId
    };
    labOrder.tests[testIndex].status = "completed";

    // Check if overall status should be updated
    const allCompleted = labOrder.tests.every(t => t.status === "completed");
    const anyCompleted = labOrder.tests.some(t => t.status === "completed");

    if (allCompleted) {
        labOrder.overallStatus = "completed";
    } else if (anyCompleted) {
        labOrder.overallStatus = "partial";
    }

    await labOrder.save();

    // --- AUTOMATION: Generate PDF if fully completed ---
    if (allCompleted) {
        try {
            // We need full details for the PDF
            const populatedOrder = await LabOrder.findById(orderId).populate("patientId");
            const hospital = await Hospital.findById(populatedOrder.hospitalId);
            const patient = populatedOrder.patientId;

            // Generate PDF Buffer
            const pdfBuffer = await generateLabReportPdfBuffer(populatedOrder, patient, hospital);
            
            // Upload to Cloudinary (Cloudinary auto adds .pdf for pdfs when resource_type is auto)
            const filename = `LAB_${populatedOrder.orderNumber}_${Date.now()}`;
            const uploadResult = await uploadPdfBufferToCloudinary(pdfBuffer, filename);
            const pdfUrl = uploadResult.secure_url;

            // Save PDF URL to all tests so they all show the "View PDF" button
            labOrder.tests.forEach(t => {
                if (t.result) {
                    t.result.reportUrl = pdfUrl;
                }
            });
            await labOrder.save();

            // Send Notification to Patient
            const patientUserId = patient.userId;
            if (patientUserId) {
                const notif = await Notification.create({
                    userId: patientUserId,
                    title: "Lab Report Ready",
                    message: `Your lab results for Order ${labOrder.orderNumber} are ready to view.`,
                    type: "SYSTEM",
                    link: "/patient/records"
                });
                emitToUser(patientUserId, "notification", notif);
            }

            // Send Notification to Doctor
            const doctorUserId = populatedOrder.orderedByDoctorId;
            if (doctorUserId) {
                const docNotif = await Notification.create({
                    userId: doctorUserId,
                    title: "Lab Report Ready",
                    message: `Lab results for patient ${patient.firstName} ${patient.lastName} are ready.`,
                    type: "SYSTEM",
                    link: `/doctor/appointments`
                });
                emitToUser(doctorUserId.toString(), "notification", docNotif);
            }
        } catch (automationError) {
            console.error("[Lab Automation Error]:", automationError);
            // We don't throw the error because the test result itself was saved successfully.
        }
    }

    return labOrder;
};

export const deleteLabOrderService = async (orderId) => {
    const labOrder = await LabOrder.findById(orderId);
    if (!labOrder) {
        const error = new Error("Lab order not found");
        error.statusCode = 404;
        throw error;
    }
    
    await LabOrder.findByIdAndDelete(orderId);
    return true;
};
