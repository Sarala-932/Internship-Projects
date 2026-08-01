import {
    addInventoryService,
    getInventoryService,
    updateInventoryService,
    dispenseMedicineService
} from "../services/pharmacy.service.mjs";
import { broadcastDataUpdate } from "../services/socket.service.mjs";

export const addInventory = async (req, res) => {
    try {
        const item = await addInventoryService(req.hospitalId, req.body);
        broadcastDataUpdate(req.hospitalId, "pharmacy");
        return res.status(201).json({
            message: "Inventory updated successfully",
            item
        });
    } catch (error) {
        return res.status(error.statusCode || 500).json({
            message: error.message || "Failed to update inventory"
        });
    }
};

export const updateInventory = async (req, res) => {
    try {
        const item = await updateInventoryService(req.hospitalId, req.params.id, req.body);
        broadcastDataUpdate(req.hospitalId, "pharmacy");
        return res.status(200).json({
            message: "Inventory updated successfully",
            item
        });
    } catch (error) {
        return res.status(error.statusCode || 500).json({
            message: error.message || "Failed to update inventory"
        });
    }
};

export const getInventory = async (req, res) => {
    try {
        const result = await getInventoryService(req.hospitalId, req.query);
        return res.status(200).json(result);
    } catch (error) {
        return res.status(error.statusCode || 500).json({
            message: error.message || "Failed to fetch inventory"
        });
    }
};

export const dispenseMedicine = async (req, res) => {
    try {
        const dispenseRecord = await dispenseMedicineService(
            req.hospitalId,
            req.userId,
            req.body
        );
        broadcastDataUpdate(req.hospitalId, "pharmacy");
        broadcastDataUpdate(req.hospitalId, "billing");
        return res.status(201).json({
            message: "Medicine dispensed successfully",
            dispenseRecord
        });
    } catch (error) {
        return res.status(error.statusCode || 500).json({
            message: error.message || "Failed to dispense medicine"
        });
    }
};
