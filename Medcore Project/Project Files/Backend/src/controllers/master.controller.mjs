import MasterSpeciality from "../models/master-speciality.model.mjs";
import AuditLog from "../models/audit-logs.model.mjs";

// GET /api/master/specialities — Public or Admin (used to fetch dropdowns)
export async function getMasterSpecialities(req, res) {
    try {
        const { activeOnly } = req.query;
        const filter = activeOnly === 'true' ? { isActive: true } : {};
        
        const specialities = await MasterSpeciality.find(filter).sort({ name: 1 });
        
        return res.json({ specialities });
    } catch (err) {
        console.error("getMasterSpecialities Error:", err);
        return res.status(500).json({ message: "Failed to load specialities" });
    }
}

// POST /api/master/specialities — Super Admin Only
export async function createMasterSpeciality(req, res) {
    try {
        const { name, description, icon } = req.body;
        
        if (!name) {
            return res.status(400).json({ message: "Speciality name is required" });
        }

        const exists = await MasterSpeciality.findOne({ name: new RegExp(`^${name}$`, 'i') });
        if (exists) {
            return res.status(400).json({ message: "Speciality already exists" });
        }

        const speciality = new MasterSpeciality({
            name,
            description,
            icon: icon || "Activity"
        });

        await speciality.save();

        await AuditLog.create({
            action: "create",
            resource: "speciality",
            resourceId: speciality._id,
            userId: req.user._id,
            userRole: req.user.role,
            hospitalId: req.user.hospitalId,
            metadata: { 
                action_detail: "create_speciality",
                specialityName: name 
            }
        });

        return res.status(201).json({ message: "Speciality created successfully", speciality });
    } catch (err) {
        console.error("createMasterSpeciality Error:", err);
        return res.status(500).json({ message: "Failed to create speciality" });
    }
}

// PATCH /api/master/specialities/:id/status — Super Admin Only
export async function toggleSpecialityStatus(req, res) {
    try {
        const speciality = await MasterSpeciality.findById(req.params.id);
        if (!speciality) return res.status(404).json({ message: "Speciality not found" });

        speciality.isActive = !speciality.isActive;
        await speciality.save();

        await AuditLog.create({
            action: "update",
            resource: "speciality",
            resourceId: speciality._id,
            userId: req.user._id,
            userRole: req.user.role,
            hospitalId: req.user.hospitalId,
            metadata: { 
                action_detail: "update_speciality_status",
                specialityName: speciality.name, 
                isActive: speciality.isActive 
            }
        });

        return res.json({ message: `Speciality ${speciality.isActive ? 'activated' : 'deactivated'}`, speciality });
    } catch (err) {
        console.error("toggleSpecialityStatus Error:", err);
        return res.status(500).json({ message: "Failed to update speciality status" });
    }
}
