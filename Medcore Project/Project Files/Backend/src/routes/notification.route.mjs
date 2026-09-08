import express from "express";
import authentication from "../middleware/authMiddleware.mjs";
import { getMyNotifications, markAsRead } from "../controllers/notification.controller.mjs";

const router = express.Router();

router.use(authentication);

router.get("/", getMyNotifications);

router.patch("/:id/read", markAsRead);

export default router;
