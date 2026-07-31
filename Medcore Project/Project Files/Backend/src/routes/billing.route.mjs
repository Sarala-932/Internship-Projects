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

// List all bills for the hospital
router.get("/", authorize("admin", "super_admin", "receptionist", "patient"), getBills);

// Only admin/super_admin can generate bills
router.post("/", authorize("admin", "super_admin"), generateBill);

// Patient or admin can initiate payment
router.post("/:billId/checkout", authorize("patient", "admin", "super_admin"), initializePayment);

// Verify webhook / payment success
router.post("/:billId/verify", authorize("patient", "admin", "super_admin"), verifyPayment);

export default router;
