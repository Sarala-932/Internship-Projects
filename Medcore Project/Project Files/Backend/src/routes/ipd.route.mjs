import express from "express";
import {
    getWardsWithBeds,
    createWard,
    admitPatient,
    dischargePatient,
    getMyAdmissions,
    createAdmissionRequest,
    getPendingRequests
} from "../controllers/ipd.controller.mjs";
import authentication, { authorize } from "../middleware/authMiddleware.mjs";

const router = express.Router();

router.use(authentication);

// Patient routes
router.get("/my-admissions", getMyAdmissions);

// Staff routes
router.use(authorize("admin", "doctor", "nurse", "receptionist"));
router.get("/wards", getWardsWithBeds);
router.post("/wards", createWard);
router.post("/admit", admitPatient);
router.post("/discharge/:id", dischargePatient);

// Admission Request routes
router.post("/requests", authorize("doctor", "admin"), createAdmissionRequest);
router.get("/requests/pending", getPendingRequests);

export default router;
