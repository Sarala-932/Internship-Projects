import express from "express";
import authentication, { authorize } from "../middleware/authMiddleware.mjs";
import {
    generateBill,
    getBills,
    initializePayment,
    verifyPayment
} from "../controllers/billing.controller.mjs";

const router = express.Router();

router.use(authentication);

/**
 * @swagger
 * /api/billing:
 *   get:
 *     summary: List all bills
 *     tags: [Billing]
 *     security:
 *       - cookieAuth: []
 *     responses:
 *       200:
 *         description: List of bills
 */
router.get("/", authorize("admin", "super_admin", "receptionist", "patient"), getBills);

/**
 * @swagger
 * /api/billing:
 *   post:
 *     summary: Generate a new bill
 *     tags: [Billing]
 *     security:
 *       - cookieAuth: []
 *     requestBody:
 *       required: true
 *       content:
 *         application/json:
 *           schema:
 *             type: object
 *             required:
 *               - patientId
 *               - items
 *             properties:
 *               patientId:
 *                 type: string
 *               items:
 *                 type: array
 *                 items:
 *                   type: object
 *     responses:
 *       201:
 *         description: Bill generated successfully
 */

// Only admin/super_admin can generate bills
router.post("/", authorize("admin", "super_admin"), generateBill);

// Patient or admin can initiate payment
/**
 * @swagger
 * /api/billing/{billId}/checkout:
 *   post:
 *     summary: Initialize payment for a bill
 *     tags: [Billing]
 *     security:
 *       - cookieAuth: []
 *     parameters:
 *       - in: path
 *         name: billId
 *         required: true
 *         schema:
 *           type: string
 *     responses:
 *       200:
 *         description: Payment initialized
 */
router.post("/:billId/checkout", authorize("patient", "admin", "super_admin"), initializePayment);

// Verify webhook / payment success
/**
 * @swagger
 * /api/billing/{billId}/verify:
 *   post:
 *     summary: Verify payment status
 *     tags: [Billing]
 *     security:
 *       - cookieAuth: []
 *     parameters:
 *       - in: path
 *         name: billId
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
 *               razorpay_payment_id:
 *                 type: string
 *               razorpay_order_id:
 *                 type: string
 *               razorpay_signature:
 *                 type: string
 *     responses:
 *       200:
 *         description: Payment verified
 */
router.post("/:billId/verify", authorize("patient", "admin", "super_admin"), verifyPayment);

export default router;
