import { Router } from "express";
import authentication, { authorize } from "../middleware/authMiddleware.mjs";
import { 
    getMasterSpecialities, 
    createMasterSpeciality, 
    toggleSpecialityStatus 
} from "../controllers/master.controller.mjs";

const router = Router();

router.use(authentication);

/**
 * @swagger
 * /master/specialities:
 *   get:
 *     summary: Get all master specialities
 *     tags: [Master]
 *     security:
 *       - bearerAuth: []
 *     responses:
 *       200:
 *         description: List of specialities
 */
// Anyone authenticated can fetch the list (for creating hospital departments)
router.get("/specialities", getMasterSpecialities);

/**
 * @swagger
 * /master/specialities:
 *   post:
 *     summary: Create a new master speciality
 *     tags: [Master]
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
 *     responses:
 *       201:
 *         description: Speciality created
 */
// Only Super Admin can manage the master list
router.post("/specialities", authorize("super_admin"), createMasterSpeciality);
/**
 * @swagger
 * /master/specialities/{id}/status:
 *   patch:
 *     summary: Toggle speciality status
 *     tags: [Master]
 *     security:
 *       - bearerAuth: []
 *     parameters:
 *       - in: path
 *         name: id
 *         required: true
 *         schema:
 *           type: string
 *     responses:
 *       200:
 *         description: Speciality status updated
 */
router.patch("/specialities/:id/status", authorize("super_admin"), toggleSpecialityStatus);

export default router;
