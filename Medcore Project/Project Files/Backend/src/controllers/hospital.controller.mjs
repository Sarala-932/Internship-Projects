import {
    createHospitalService,
    verifyHospitalService,
    getHospitalsService,
    getHospitalByIdService,
} from "../services/hospital.service.mjs";

export async function createHospital(req, res) {
    try {
        const hospital = await createHospitalService(req.body, req.user?._id);

        return res.status(201).json({
            message: "Hospital created (pending verification)",
            hospital,
        });
    } catch (err) {
        console.error("createHospital error:", err);
        return res.status(err.status || 500).json({ message: err.message || "Failed to create hospital" });
    }
}

export async function verifyHospital(req, res) {
    try {
        const hospital = await verifyHospitalService(req.params.id, req.user._id);

        return res.json({
            message: "Hospital verified successfully",
            hospital,
        });
    } catch (err) {
        console.error("verifyHospital error:", err);
        return res.status(err.status || 500).json({ message: err.message || "Failed to verify hospital" });
    }
}

export async function getHospitals(req, res) {
    try {
        const hospitals = await getHospitalsService(req.query);

        return res.json({ hospitals });
    } catch (err) {
        console.error("getHospitals error:", err);
        return res.status(err.status || 500).json({ message: err.message || "Failed to fetch hospitals" });
    }
}

export async function getHospitalById(req, res) {
    try {
        const hospital = await getHospitalByIdService(req.params.id);

        return res.json({ hospital });
    } catch (err) {
        console.error("getHospitalById error:", err);
        return res.status(err.status || 500).json({ message: err.message || "Failed to fetch hospital" });
    }
}
