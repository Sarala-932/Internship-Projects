import express from "express";
import {
    getWardsWithBeds,
    createWard,
    admitPatient,
    dischargePatient,
    getMyAdmissions
} from "../controllers/ipd.controller.mjs";
import { isAuthenticated, isHospitalStaff } from "../middlewares/auth.middleware.mjs";

const router = express.Router();

router.use(isAuthenticated);

// Patient routes
router.get("/my-admissions", getMyAdmissions);

// Staff routes
router.use(isHospitalStaff);
router.get("/wards", getWardsWithBeds);
router.post("/wards", createWard);
router.post("/admit", admitPatient);
router.post("/discharge/:id", dischargePatient);

export default router;
