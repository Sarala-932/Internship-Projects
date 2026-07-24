import Department from "../models/department.model.mjs";

const createError = (message, status = 400) => {
    const err = new Error(message);
    err.status = status;
    return err;
};

// Admin/Super Admin creates a department for their hospital
export const createDepartmentService = async (data) => {
    const { hospitalId, name, code, headDoctorId, description } = data;

    if (!hospitalId || !name || !code) {
        throw createError("hospitalId, name, and code are required", 400);
    }

    // Check duplicate code within same hospital
    const existing = await Department.findOne({
        hospitalId,
        code: code.toUpperCase(),
    });

    if (existing) {
        throw createError("Department with this code already exists in this hospital", 409);
    }

    const department = await Department.create({
        hospitalId,
        name,
        code: code.toUpperCase(),
        headDoctorId: headDoctorId || undefined,
        description,
    });

    return department;
};

// Get all departments for a hospital
export const getDepartmentsService = async (hospitalId) => {
    if (!hospitalId) throw createError("hospitalId is required", 400);

    const departments = await Department.find({ hospitalId, isActive: true })
        .populate("headDoctorId", "firstName lastName email")
        .sort({ name: 1 })
        .select("-__v");

    return departments;
};

// Get single department by ID
export const getDepartmentByIdService = async (departmentId) => {
    const department = await Department.findById(departmentId)
        .populate("headDoctorId", "firstName lastName email")
        .select("-__v");

    if (!department) throw createError("Department not found", 404);
    return department;
};
