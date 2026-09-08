import { Router } from "express";
import authentication, { authorize } from "../middleware/authMiddleware.mjs";
import {
    createTicket,
    getTickets,
    updateTicketStatus
} from "../controllers/ticket.controller.mjs";

const router = Router();

router.use(authentication);

router.get("/", authorize("super_admin", "admin"), getTickets);

router.post("/", authorize("admin"), createTicket);

router.patch("/:id/status", authorize("super_admin"), updateTicketStatus);

export default router;
