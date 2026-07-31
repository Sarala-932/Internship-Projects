import {
    createLabOrderService,
    getLabOrdersService,
    updateTestResultService,
    deleteLabOrderService
} from "../services/lab.service.mjs";

export const createLabOrder = async (req, res) => {
    try {
        const order = await createLabOrderService(
            req.hospitalId,
            req.userId,
            req.body
        );
        return res.status(201).json({
            message: "Lab order created successfully",
            order
        });
    } catch (error) {
        return res.status(error.statusCode || 500).json({
            message: error.message || "Failed to create lab order"
        });
    }
};

export const getLabOrders = async (req, res) => {
    try {
        const orders = await getLabOrdersService(req.hospitalId, req.query);
        return res.status(200).json({ orders });
    } catch (error) {
        return res.status(error.statusCode || 500).json({
            message: error.message || "Failed to get lab orders"
        });
    }
};

export const updateTestResult = async (req, res) => {
    try {
        const { orderId } = req.params;
        const { testName, resultData } = req.body;

        if (!testName || !resultData) {
            return res.status(400).json({ message: "testName and resultData are required" });
        }

        const order = await updateTestResultService(
            orderId,
            testName,
            req.userId,
            resultData
        );

        return res.status(200).json({
            message: "Test result updated successfully",
            order
        });
    } catch (error) {
        return res.status(error.statusCode || 500).json({
            message: error.message || "Failed to update test result"
        });
    }
};

export const deleteLabOrder = async (req, res) => {
    try {
        const { orderId } = req.params;
        await deleteLabOrderService(orderId);
        
        return res.status(200).json({
            message: "Lab order deleted successfully"
        });
    } catch (error) {
        return res.status(error.statusCode || 500).json({
            message: error.message || "Failed to delete lab order"
        });
    }
};
