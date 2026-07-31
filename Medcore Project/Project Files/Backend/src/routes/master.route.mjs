import { Router } from "express";
import authentication, { authorize } from "../middleware/authMiddleware.mjs";
import { 
    getMasterSpecialities, 
    createMasterSpeciality, 
    toggleSpecialityStatus 
} from "../controllers/master.controller.mjs";

const router = Router();

router.use(authentication);

// Anyone authenticated can fetch the list (for creating hospital departments)
router.get("/specialities", getMasterSpecialities);

// Only Super Admin can manage the master list
router.post("/specialities", authorize("super_admin"), createMasterSpeciality);
router.patch("/specialities/:id/status", authorize("super_admin"), toggleSpecialityStatus);

export default router;
