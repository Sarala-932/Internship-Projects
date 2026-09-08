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

router.post("/", authorize("doctor", "admin", "super_admin"), createLabOrder);

router.get("/", authorize("doctor", "admin", "super_admin", "lab_tech", "nurse", "patient"), getLabOrders);

router.patch("/:orderId/results", authorize("lab_tech", "admin", "super_admin"), updateTestResult);

router.delete("/:orderId", authorize("admin", "super_admin"), deleteLabOrder);

export default router;
