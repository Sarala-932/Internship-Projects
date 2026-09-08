import { Router } from "express";
import authentication, { authorize } from "../middleware/authMiddleware.mjs";
import {
    getPlatformAnalytics,
    getAuditLogs,
    getHospitalAnalytics,
    getDoctorAnalytics
} from "../controllers/analytics.controller.mjs";

const router = Router();

router.use(authentication);

router.get("/platform", authorize("super_admin"), getPlatformAnalytics);

router.get("/audit-logs", authorize("super_admin"), getAuditLogs);

router.get("/hospital", authorize("admin", "super_admin", "doctor"), getHospitalAnalytics);

router.get("/doctor", authorize("doctor"), getDoctorAnalytics);

export default router;
