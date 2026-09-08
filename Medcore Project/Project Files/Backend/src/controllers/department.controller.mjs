import {
    createDepartmentService,
    getDepartmentsService,
    getDepartmentByIdService,
} from "../services/department.service.mjs";

export async function createDepartment(req, res) {
    try {

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

export async function getDepartments(req, res) {
    try {

        const hospitalId = (req.user.role === "super_admin" || req.user.role === "patient")
            ? req.query.hospitalId || req.user.hospitalId
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

export async function getDepartmentById(req, res) {
    try {
        const department = await getDepartmentByIdService(req.params.id);

        return res.json({ department });
    } catch (err) {
        console.error("getDepartmentById error:", err);
        return res.status(err.status || 500).json({ message: err.message || "Failed to fetch department" });
    }
}
