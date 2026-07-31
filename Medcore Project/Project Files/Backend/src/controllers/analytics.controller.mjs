import Hospital from "../models/hospital.model.mjs";
import User from "../models/user.model.mjs";
import AuditLog from "../models/audit-logs.model.mjs";
import Department from "../models/department.model.mjs";
import Patient from "../models/patient.model.mjs";
import Appointment from "../models/appointment.model.mjs";
import Bill from "../models/bill.model.mjs";

export async function getPlatformAnalytics(req, res) {
    try {
        // Fetch KPIs
        const totalHospitals = await Hospital.countDocuments();
        const activeHospitals = await Hospital.countDocuments({ status: "active" });
        const pendingHospitals = await Hospital.countDocuments({ status: "pending" });

        // Fetch Recent Global Activity Logs
        // We look for actions related to platform management (hospital, subscription, etc.)
        const recentLogs = await AuditLog.find({
            resource: { $in: ["hospital"] }
        })
        .sort({ createdAt: -1 })
        .limit(10)
        .populate("userId", "firstName lastName email")
        .select("-__v");

        return res.json({
            kpis: {
                totalHospitals,
                activeHospitals,
                pendingHospitals,
                platformStatus: "Live"
            },
            activityLogs: recentLogs
        });
    } catch (err) {
        console.error("Dashboard Analytics Error:", err);
        return res.status(500).json({ message: "Failed to load dashboard analytics" });
    }
}

// GET /api/analytics/audit-logs — Super Admin only, paginated audit logs
export async function getAuditLogs(req, res) {
    try {
        const page = parseInt(req.query.page) || 1;
        const limit = parseInt(req.query.limit) || 20;
        const skip = (page - 1) * limit;
        
        const filter = {};
        
        // Optional filters
        if (req.query.action) {
            filter.action = req.query.action;
        }
        
        const logs = await AuditLog.find(filter)
            .sort({ createdAt: -1 })
            .skip(skip)
            .limit(limit)
            .populate("userId", "firstName lastName email role")
            .populate("hospitalId", "name");

        const total = await AuditLog.countDocuments(filter);

        return res.json({
            success: true,
            logs,
            meta: {
                page,
                limit,
                total,
                totalPages: Math.ceil(total / limit)
            }
        });
    } catch (err) {
        console.error("Audit Logs Error:", err);
        return res.status(500).json({ message: "Failed to load audit logs" });
    }
}

// GET /api/analytics/hospital — Admin Dashboard
export async function getHospitalAnalytics(req, res) {
    try {
        const hospitalId = req.user.hospitalId;

        // Total Staff (excluding super_admin and patient)
        const totalStaff = await User.countDocuments({
            hospitalId,
            role: { $nin: ["super_admin", "patient"] }
        });

        const activeDepartments = await Department.countDocuments({
            hospitalId,
            isActive: true
        });

        // Real stats for patients and revenue
        const totalPatients = await Patient.countDocuments({ hospitalId });
        
        // Appointments today
        const startOfDay = new Date();
        startOfDay.setHours(0, 0, 0, 0);
        const endOfDay = new Date();
        endOfDay.setHours(23, 59, 59, 999);
        
        const appointmentsToday = await Appointment.countDocuments({
            hospitalId,
            scheduledAt: { $gte: startOfDay, $lte: endOfDay }
        });

        // MTD Revenue
        const startOfMonth = new Date();
        startOfMonth.setDate(1);
        startOfMonth.setHours(0, 0, 0, 0);

        const mtdBills = await Bill.find({
            hospitalId,
            createdAt: { $gte: startOfMonth },
            status: "paid"
        });
        const revenueMTD = mtdBills.reduce((sum, bill) => sum + bill.paidAmount, 0);

        const recentStaff = await User.find({
            hospitalId,
            role: { $nin: ["super_admin", "patient"] }
        })
        .select("firstName lastName email role isActive departmentId")
        .populate("departmentId", "name")
        .sort({ createdAt: -1 })
        .limit(5);

        return res.json({
            success: true,
            stats: {
                totalStaff,
                activeDepartments,
                totalPatients,
                appointmentsToday,
                revenueMTD
            },
            recentStaff
        });
    } catch (err) {
        console.error("Hospital Analytics Error:", err);
        return res.status(500).json({ message: "Failed to fetch hospital analytics" });
    }
}

// GET /api/analytics/doctor — Doctor Dashboard
export async function getDoctorAnalytics(req, res) {
    try {
        const hospitalId = req.user.hospitalId;
        const doctorId = req.user._id;

        // Appointments today
        const startOfDay = new Date();
        startOfDay.setHours(0, 0, 0, 0);
        const endOfDay = new Date();
        endOfDay.setHours(23, 59, 59, 999);
        
        const appointmentsToday = await Appointment.countDocuments({
            hospitalId,
            doctorId,
            scheduledAt: { $gte: startOfDay, $lte: endOfDay }
        });

        // Total unique patients seen by this doctor
        const uniquePatients = await Appointment.distinct("patientId", {
            hospitalId,
            doctorId,
            status: { $in: ["completed", "in_consultation"] }
        });
        
        const totalPatients = uniquePatients.length;

        // Recent Appointments
        const recentAppointments = await Appointment.find({
            hospitalId,
            doctorId,
            scheduledAt: { $gte: startOfDay, $lte: endOfDay }
        })
        .populate("patientId", "firstName lastName mrn")
        .sort({ scheduledAt: 1 })
        .limit(10);

        return res.json({
            success: true,
            stats: {
                appointmentsToday,
                totalPatients,
            },
            recentAppointments
        });
    } catch (err) {
        console.error("Doctor Analytics Error:", err);
        return res.status(500).json({ message: "Failed to fetch doctor analytics" });
    }
}
