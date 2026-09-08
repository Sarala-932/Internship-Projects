import express from "express";
import authentication, { authorize } from "../middleware/authMiddleware.mjs";
import {
    addInventory,
    getInventory,
    updateInventory,
    dispenseMedicine
} from "../controllers/pharmacy.controller.mjs";

const router = express.Router();

router.use(authentication);

router.get("/inventory", authorize("pharmacist", "admin", "super_admin", "doctor"), getInventory);

router.post("/inventory", authorize("pharmacist", "admin", "super_admin"), addInventory);

router.patch("/inventory/:id", authorize("pharmacist", "admin", "super_admin"), updateInventory);

router.post("/dispense", authorize("pharmacist", "admin", "super_admin"), dispenseMedicine);

export default router;
