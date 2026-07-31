import { Router } from "express";
import authentication, { authorize } from "../middleware/authMiddleware.mjs";
import { 
    getPlatformAnalytics, 
    getAuditLogs, 
    getHospitalAnalytics, 
    getDoctorAnalytics 
} from "../controllers/analytics.controller.mjs";

const router = Router();

// Only Super Admin can view platform analytics
router.use(authentication);

// GET /api/analytics/platform — Super Admin Dashboard
router.get("/platform", authorize("super_admin"), getPlatformAnalytics);

// GET /api/analytics/audit-logs — Super Admin Audit Logs
router.get("/audit-logs", authorize("super_admin"), getAuditLogs);

// GET /api/analytics/hospital
router.get("/hospital", authorize("admin", "super_admin", "doctor"), getHospitalAnalytics);

// GET /api/analytics/doctor
router.get("/doctor", authorize("doctor"), getDoctorAnalytics);

export default router;
