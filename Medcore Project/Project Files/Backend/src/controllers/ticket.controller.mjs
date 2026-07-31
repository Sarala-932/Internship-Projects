import Ticket from "../models/ticket.model.mjs";
import AuditLog from "../models/audit-logs.model.mjs";

// POST /api/tickets — Create a new support ticket (Hospital Admin)
export async function createTicket(req, res) {
    try {
        const { title, description, priority } = req.body;
        
        if (!title || !description) {
            return res.status(400).json({ message: "Title and description are required" });
        }

        const ticket = new Ticket({
            title,
            description,
            priority: priority || "medium",
            hospitalId: req.user.hospitalId,
            createdBy: req.user._id,
        });

        await ticket.save();

        await AuditLog.create({
            action: "create",
            resource: "ticket",
            resourceId: ticket._id,
            userId: req.user._id,
            userRole: req.user.role,
            hospitalId: req.user.hospitalId,
            metadata: { 
                action_detail: "create_ticket",
                title 
            }
        });

        return res.status(201).json({ message: "Ticket created successfully", ticket });
    } catch (err) {
        console.error("createTicket Error:", err);
        return res.status(500).json({ message: "Failed to create ticket" });
    }
}

// GET /api/tickets — List tickets (Super Admin sees all, Hospital Admin sees theirs)
export async function getTickets(req, res) {
    try {
        const filter = {};
        
        if (req.user.role === "admin") {
            filter.hospitalId = req.user.hospitalId;
        }

        if (req.query.status) {
            filter.status = req.query.status;
        }

        const tickets = await Ticket.find(filter)
            .populate("hospitalId", "name city")
            .populate("createdBy", "firstName lastName email")
            .populate("resolvedBy", "firstName lastName")
            .sort({ createdAt: -1 });

        return res.json({ tickets });
    } catch (err) {
        console.error("getTickets Error:", err);
        return res.status(500).json({ message: "Failed to fetch tickets" });
    }
}

// PATCH /api/tickets/:id/status — Update ticket status (Super Admin)
export async function updateTicketStatus(req, res) {
    try {
        const { status } = req.body;
        
        if (!["open", "in_progress", "resolved"].includes(status)) {
            return res.status(400).json({ message: "Invalid status" });
        }

        const ticket = await Ticket.findById(req.params.id);
        if (!ticket) return res.status(404).json({ message: "Ticket not found" });

        ticket.status = status;
        
        if (status === "resolved") {
            ticket.resolvedBy = req.user._id;
        }

        await ticket.save();

        await AuditLog.create({
            action: "update",
            resource: "ticket",
            resourceId: ticket._id,
            userId: req.user._id,
            userRole: req.user.role,
            hospitalId: req.user.hospitalId,
            metadata: { 
                action_detail: "update_ticket_status",
                newStatus: status 
            }
        });

        return res.json({ message: "Ticket status updated", ticket });
    } catch (err) {
        console.error("updateTicketStatus Error:", err);
        return res.status(500).json({ message: "Failed to update ticket status" });
    }
}
