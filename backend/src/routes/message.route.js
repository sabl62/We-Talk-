import express from "express";
import { protectRoute } from "../middleware/auth.middleware.js";

import {
    getUsersForSideBar,
    getMessages,
    sendMessage,
    deleteMessage,
    editMessage
} from "../controllers/message.controller.js";

const router = express.Router();

// Existing
router.get("/users", protectRoute, getUsersForSideBar);
router.get("/:id", protectRoute, getMessages);
router.post("/send/:id", protectRoute, sendMessage);

// FIXED DELETE ROUTE
router.delete("/:messageId", protectRoute, deleteMessage);

// EDIT ROUTE
router.put("/edit/:messageId", protectRoute, editMessage);

export default router;
