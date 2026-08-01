import express from "express";
import authentication, { authorize } from "../middleware/authMiddleware.mjs";
import {
    createLabOrder,
    getLabOrders,
    updateTestResult,
    deleteLabOrder
} from "../controllers/lab.controller.mjs";

const router = express.Router();

router.use(authentication);

/**
 * @swagger
 * /lab:
 *   post:
 *     summary: Create a new lab order
 *     tags: [Lab]
 *     security:
 *       - bearerAuth: []
 *     requestBody:
 *       required: true
 *       content:
 *         application/json:
 *           schema:
 *             type: object
 *             properties:
 *               patientId:
 *                 type: string
 *               doctorId:
 *                 type: string
 *               tests:
 *                 type: array
 *                 items:
 *                   type: string
 *     responses:
 *       201:
 *         description: Lab order created
 */
// Doctor or Admin can create lab orders
router.post("/", authorize("doctor", "admin", "super_admin"), createLabOrder);

/**
 * @swagger
 * /lab:
 *   get:
 *     summary: Get all lab orders
 *     tags: [Lab]
 *     security:
 *       - bearerAuth: []
 *     responses:
 *       200:
 *         description: List of lab orders
 */
// Everyone (including patients) can view lab orders in the hospital
router.get("/", authorize("doctor", "admin", "super_admin", "lab_tech", "nurse", "patient"), getLabOrders);

/**
 * @swagger
 * /lab/{orderId}/results:
 *   patch:
 *     summary: Update lab test results
 *     tags: [Lab]
 *     security:
 *       - bearerAuth: []
 *     parameters:
 *       - in: path
 *         name: orderId
 *         required: true
 *         schema:
 *           type: string
 *     requestBody:
 *       required: true
 *       content:
 *         application/json:
 *           schema:
 *             type: object
 *             properties:
 *               results:
 *                 type: string
 *               status:
 *                 type: string
 *     responses:
 *       200:
 *         description: Lab test results updated
 */
// Only lab technicians can update results
router.patch("/:orderId/results", authorize("lab_tech", "admin", "super_admin"), updateTestResult);

/**
 * @swagger
 * /lab/{orderId}:
 *   delete:
 *     summary: Delete a lab order
 *     tags: [Lab]
 *     security:
 *       - bearerAuth: []
 *     parameters:
 *       - in: path
 *         name: orderId
 *         required: true
 *         schema:
 *           type: string
 *     responses:
 *       200:
 *         description: Lab order deleted
 */
// Admins can delete lab orders
router.delete("/:orderId", authorize("admin", "super_admin"), deleteLabOrder);

export default router;
