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

// Pharmacy staff and Admins can view inventory
router.get("/inventory", authorize("pharmacist", "admin", "super_admin", "doctor"), getInventory);

// Only Admins and Pharmacists can add/update inventory
router.post("/inventory", authorize("pharmacist", "admin", "super_admin"), addInventory);
router.patch("/inventory/:id", authorize("pharmacist", "admin", "super_admin"), updateInventory);

// Only Pharmacists and Admins can dispense medicine
router.post("/dispense", authorize("pharmacist", "admin", "super_admin"), dispenseMedicine);

export default router;
