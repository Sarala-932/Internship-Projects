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
/**
 * @swagger
 * /api/analytics/platform:
 *   get:
 *     summary: Get platform analytics
 *     tags: [Analytics]
 *     security:
 *       - cookieAuth: []
 *     responses:
 *       200:
 *         description: Platform analytics data
 */
router.get("/platform", authorize("super_admin"), getPlatformAnalytics);

// GET /api/analytics/audit-logs — Super Admin Audit Logs
/**
 * @swagger
 * /api/analytics/audit-logs:
 *   get:
 *     summary: Get audit logs
 *     tags: [Analytics]
 *     security:
 *       - cookieAuth: []
 *     responses:
 *       200:
 *         description: Audit logs data
 */
router.get("/audit-logs", authorize("super_admin"), getAuditLogs);

// GET /api/analytics/hospital
/**
 * @swagger
 * /api/analytics/hospital:
 *   get:
 *     summary: Get hospital analytics
 *     tags: [Analytics]
 *     security:
 *       - cookieAuth: []
 *     responses:
 *       200:
 *         description: Hospital analytics data
 */
router.get("/hospital", authorize("admin", "super_admin", "doctor"), getHospitalAnalytics);

// GET /api/analytics/doctor
/**
 * @swagger
 * /api/analytics/doctor:
 *   get:
 *     summary: Get doctor analytics
 *     tags: [Analytics]
 *     security:
 *       - cookieAuth: []
 *     responses:
 *       200:
 *         description: Doctor analytics data
 */
router.get("/doctor", authorize("doctor"), getDoctorAnalytics);

export default router;
