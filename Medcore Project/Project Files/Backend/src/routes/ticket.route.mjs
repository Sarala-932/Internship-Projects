import { Router } from "express";
import authentication, { authorize } from "../middleware/authMiddleware.mjs";
import { 
    createTicket, 
    getTickets, 
    updateTicketStatus 
} from "../controllers/ticket.controller.mjs";

const router = Router();

router.use(authentication);

// List tickets (Super Admin / Admin)
router.get("/", authorize("super_admin", "admin"), getTickets);

// Create ticket (Hospital Admin)
router.post("/", authorize("admin"), createTicket);

// Update ticket status (Super Admin)
router.patch("/:id/status", authorize("super_admin"), updateTicketStatus);

export default router;
