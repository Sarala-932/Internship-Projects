import {
    upsertDoctorProfileService,
    getDoctorProfileService,
    getDoctorsByHospitalService,
    getAvailableSlotsService
} from "../services/doctor.service.mjs";

export const upsertDoctorProfile = async (req, res) => {
    try {
        const hospitalId = req.body.hospitalId || req.hospitalId || req.user?.hospitalId;
        if (!hospitalId) {
            return res.status(400).json({
                message: "Hospital ID is required. Please include 'hospitalId' in request body or ensure the user is assigned to a hospital."
            });
        }

        const doctor = await upsertDoctorProfileService(
            req.userId,
            hospitalId,
            req.body
        );
        return res.status(200).json({
            message: "Doctor profile updated successfully",
            doctor
        });
    } catch (error) {
        return res.status(error.statusCode || 500).json({
            message: error.message || "Failed to update doctor profile"
        });
    }
};

export const getDoctorProfile = async (req, res) => {
    try {
        const identifier = req.params.id || req.userId;
        const doctor = await getDoctorProfileService(identifier);
        return res.status(200).json({ doctor });
    } catch (error) {
        return res.status(error.statusCode || 500).json({
            message: error.message || "Failed to get doctor profile"
        });
    }
};

export const getDoctorsByHospital = async (req, res) => {
    try {
        const hospitalId = req.params.hospitalId || req.hospitalId;
        const departmentId = req.query.departmentId;
        const doctors = await getDoctorsByHospitalService(hospitalId, departmentId);
        return res.status(200).json({ doctors });
    } catch (error) {
        return res.status(error.statusCode || 500).json({
            message: error.message || "Failed to get doctors"
        });
    }
};

export const getAvailableSlots = async (req, res) => {
    try {
        const doctorId = req.params.id;
        const { date } = req.query;

        if (!date) {
            return res.status(400).json({ message: "Date query parameter is required (YYYY-MM-DD)" });
        }

        const data = await getAvailableSlotsService(doctorId, date);
        return res.status(200).json(data);
    } catch (error) {
        return res.status(error.statusCode || 500).json({
            message: error.message || "Failed to get available slots"
        });
    }
};
