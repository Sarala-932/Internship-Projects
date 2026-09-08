import { Router } from "express";
import authentication, { authorize } from "../middleware/authMiddleware.mjs";
import {
    getMasterSpecialities,
    createMasterSpeciality,
    toggleSpecialityStatus
} from "../controllers/master.controller.mjs";

const router = Router();

router.use(authentication);

router.get("/specialities", getMasterSpecialities);

router.post("/specialities", authorize("super_admin"), createMasterSpeciality);

router.patch("/specialities/:id/status", authorize("super_admin"), toggleSpecialityStatus);

export default router;
