import {
    createDepartmentService,
    getDepartmentsService,
    getDepartmentByIdService,
} from "../services/department.service.mjs";

// POST /api/departments — Admin/Super Admin creates department
export async function createDepartment(req, res) {
    try {
        // Admin can only create departments for their own hospital
        const hospitalId = req.user.role === "super_admin"
            ? req.body.hospitalId
            : req.user.hospitalId;

        if (!hospitalId) {
            return res.status(400).json({ message: "hospitalId is required" });
        }

        const department = await createDepartmentService({
            ...req.body,
            hospitalId,
        });

        return res.status(201).json({
            message: "Department created",
            department,
        });
    } catch (err) {
        console.error("createDepartment error:", err);
        return res.status(err.status || 500).json({ message: err.message || "Failed to create department" });
    }
}

// GET /api/departments?hospitalId=xxx — Get departments for a hospital
export async function getDepartments(req, res) {
    try {
        // Admin sees only their hospital's departments
        const hospitalId = req.user.role === "super_admin"
            ? req.query.hospitalId
            : req.user.hospitalId;

        if (!hospitalId) {
            return res.status(400).json({ message: "hospitalId is required" });
        }

        const departments = await getDepartmentsService(hospitalId);

        return res.json({ departments });
    } catch (err) {
        console.error("getDepartments error:", err);
        return res.status(err.status || 500).json({ message: err.message || "Failed to fetch departments" });
    }
}

// GET /api/departments/:id — Get single department
export async function getDepartmentById(req, res) {
    try {
        const department = await getDepartmentByIdService(req.params.id);

        return res.json({ department });
    } catch (err) {
        console.error("getDepartmentById error:", err);
        return res.status(err.status || 500).json({ message: err.message || "Failed to fetch department" });
    }
}
