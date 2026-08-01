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
/**
 * @swagger
 * /api/pharmacy/inventory:
 *   get:
 *     summary: List all pharmacy inventory
 *     tags: [Pharmacy]
 *     security:
 *       - cookieAuth: []
 *     responses:
 *       200:
 *         description: List of inventory items
 */
router.get("/inventory", authorize("pharmacist", "admin", "super_admin", "doctor"), getInventory);

/**
 * @swagger
 * /api/pharmacy/inventory:
 *   post:
 *     summary: Add new item to inventory
 *     tags: [Pharmacy]
 *     security:
 *       - cookieAuth: []
 *     requestBody:
 *       required: true
 *       content:
 *         application/json:
 *           schema:
 *             type: object
 *             required:
 *               - medicineName
 *               - quantity
 *               - unitPrice
 *               - expiryDate
 *             properties:
 *               medicineName:
 *                 type: string
 *               quantity:
 *                 type: number
 *               unitPrice:
 *                 type: number
 *               expiryDate:
 *                 type: string
 *                 format: date
 *     responses:
 *       201:
 *         description: Inventory item added
 */

// Only Admins and Pharmacists can add/update inventory
router.post("/inventory", authorize("pharmacist", "admin", "super_admin"), addInventory);
/**
 * @swagger
 * /api/pharmacy/inventory/{id}:
 *   patch:
 *     summary: Update inventory item
 *     tags: [Pharmacy]
 *     security:
 *       - cookieAuth: []
 *     parameters:
 *       - in: path
 *         name: id
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
 *               quantity:
 *                 type: number
 *               unitPrice:
 *                 type: number
 *               expiryDate:
 *                 type: string
 *                 format: date
 *     responses:
 *       200:
 *         description: Inventory item updated
 */
router.patch("/inventory/:id", authorize("pharmacist", "admin", "super_admin"), updateInventory);

// Only Pharmacists and Admins can dispense medicine
/**
 * @swagger
 * /api/pharmacy/dispense:
 *   post:
 *     summary: Dispense medicine
 *     tags: [Pharmacy]
 *     security:
 *       - cookieAuth: []
 *     requestBody:
 *       required: true
 *       content:
 *         application/json:
 *           schema:
 *             type: object
 *             properties:
 *               prescriptionId:
 *                 type: string
 *               medicines:
 *                 type: array
 *                 items:
 *                   type: object
 *                   properties:
 *                     medicineId:
 *                       type: string
 *                     quantity:
 *                       type: number
 *     responses:
 *       200:
 *         description: Medicine dispensed successfully
 */
router.post("/dispense", authorize("pharmacist", "admin", "super_admin"), dispenseMedicine);

export default router;
