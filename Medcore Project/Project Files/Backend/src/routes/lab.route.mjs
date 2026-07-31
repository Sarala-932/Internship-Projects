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

// Doctor or Admin can create lab orders
router.post("/", authorize("doctor", "admin", "super_admin"), createLabOrder);

// Everyone (including patients) can view lab orders in the hospital
router.get("/", authorize("doctor", "admin", "super_admin", "lab_tech", "nurse", "patient"), getLabOrders);

// Only lab technicians can update results
router.patch("/:orderId/results", authorize("lab_tech", "admin", "super_admin"), updateTestResult);

// Admins can delete lab orders
router.delete("/:orderId", authorize("admin", "super_admin"), deleteLabOrder);

export default router;
