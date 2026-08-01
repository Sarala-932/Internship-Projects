import { Router } from "express";
import authentication, { authorize } from "../middleware/authMiddleware.mjs";
import {
    createDepartment,
    getDepartments,
    getDepartmentById,
} from "../controllers/department.controller.mjs";

const router = Router();

// All department routes need authentication
router.use(authentication);

/**
 * @swagger
 * /api/departments:
 *   post:
 *     summary: Create a new department
 *     tags: [Departments]
 *     security:
 *       - bearerAuth: []
 *     requestBody:
 *       required: true
 *       content:
 *         application/json:
 *           schema:
 *             type: object
 *             properties:
 *               name:
 *                 type: string
 *               description:
 *                 type: string
 *               hospitalId:
 *                 type: string
 *     responses:
 *       201:
 *         description: Department created successfully
 *       401:
 *         description: Unauthorized
 *       403:
 *         description: Forbidden
 */
// Create department — only admin or super_admin
router.post("/", authorize("admin", "super_admin"), createDepartment);

/**
 * @swagger
 * /api/departments:
 *   get:
 *     summary: Get all departments
 *     tags: [Departments]
 *     security:
 *       - bearerAuth: []
 *     responses:
 *       200:
 *         description: List of departments
 *       401:
 *         description: Unauthorized
 *       403:
 *         description: Forbidden
 */
// Get departments — admin, super_admin, doctor, nurse, receptionist, patient can view
router.get("/", authorize("admin", "super_admin", "doctor", "nurse", "receptionist", "patient"), getDepartments);
/**
 * @swagger
 * /api/departments/{id}:
 *   get:
 *     summary: Get department by ID
 *     tags: [Departments]
 *     security:
 *       - bearerAuth: []
 *     parameters:
 *       - in: path
 *         name: id
 *         required: true
 *         schema:
 *           type: string
 *         description: Department ID
 *     responses:
 *       200:
 *         description: Department details
 *       401:
 *         description: Unauthorized
 *       403:
 *         description: Forbidden
 *       404:
 *         description: Department not found
 */
router.get("/:id", authorize("admin", "super_admin", "doctor", "nurse", "receptionist", "patient"), getDepartmentById);

export default router;
