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

router.get("/", authorize("admin", "super_admin", "receptionist", "patient"), getBills);

router.post("/", authorize("admin", "super_admin"), generateBill);

router.post("/:billId/checkout", authorize("patient", "admin", "super_admin"), initializePayment);

router.post("/:billId/verify", authorize("patient", "admin", "super_admin"), verifyPayment);

export default router;
