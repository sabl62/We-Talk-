import express from "express";
import {
    sendFriendRequest,
    acceptFriendRequest,
    getFriends,
    getPendingRequests,
} from "../controllers/friend.controller.js";
import { protectRoute } from "../middleware/auth.middleware.js";

const router = express.Router();

// 🧠 Get all friends for sidebar
router.get("/", protectRoute, getFriends);

// 📨 Send a friend request
router.post("/send/:toUserId", protectRoute, sendFriendRequest);

// ✅ Accept a friend request
router.post("/accept/:fromUserId", protectRoute, acceptFriendRequest);

// 🔔 Get pending friend requests (requests *received*)
router.get("/requests/pending", protectRoute, getPendingRequests);

router.get("/requests", protectRoute, getPendingRequests);

export default router;
