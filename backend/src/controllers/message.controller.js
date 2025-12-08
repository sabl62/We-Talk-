import User from "../models/user.model.js";
import Message from "../models/message.model.js";

import cloudinary from "../lib/cloudinary.js";
import { getReceiverSocketId, io } from "../lib/socket.js";

/* ------------------------- GET USERS LIST ------------------------- */
export const getUsersForSideBar = async (req, res) => {
    try {
        const loggedInUserId = req.user._id;

        const filteredUsers = await User.find({
            _id: { $ne: loggedInUserId }
        }).select("-password");

        res.status(200).json(filteredUsers);
    } catch (error) {
        console.error("Error in getUsersForSidebar:", error.message);
        res.status(500).json({ error: "Internal server error" });
    }
};

/* ------------------------- GET CHAT MESSAGES ------------------------- */
export const getMessages = async (req, res) => {
    try {
        const { id: userToChatId } = req.params;
        const myId = req.user._id;

        const messages = await Message.find({
            $or: [
                { senderId: myId, receiverId: userToChatId },
                { senderId: userToChatId, receiverId: myId },
            ],
        }).populate("replyTo");  // Important: populate replied message

        res.status(200).json(messages);
    } catch (error) {
        console.log("Error in getMessages:", error.message);
        res.status(500).json({ error: "Internal server error" });
    }
};

/* ------------------------- SEND MESSAGE (WITH REPLY SUPPORT) ------------------------- */
export const sendMessage = async (req, res) => {
    try {
        const { text, image, replyTo } = req.body;
        const { id: receiverId } = req.params;
        const senderId = req.user._id;

        console.log("📨 Received message request:");
        console.log("  - text:", text);
        console.log("  - replyTo:", replyTo);
        console.log("  - replyTo type:", typeof replyTo);

        let imageUrl = null;

        if (image) {
            const uploadResponse = await cloudinary.uploader.upload(image);
            imageUrl = uploadResponse.secure_url;
        }

        const newMessage = new Message({
            senderId,
            receiverId,
            text,
            image: imageUrl,
            replyTo: replyTo || null
        });

        await newMessage.save();
        console.log("💾 Message saved, replyTo field:", newMessage.replyTo);

        // Populate the reply message object
        await newMessage.populate("replyTo");
        console.log("✅ After populate, replyTo:", newMessage.replyTo);

        // SOCKET EVENT — send to receiver in real time
        const receiverSocketId = getReceiverSocketId(receiverId);
        if (receiverSocketId) {
            io.to(receiverSocketId).emit("newMessage", newMessage);
        }

        res.status(201).json(newMessage);
    } catch (error) {
        console.log("Error in sendMessage:", error.message);
        res.status(500).json({ error: "Internal server error" });
    }
};

/* ------------------------- DELETE MESSAGE (SOFT DELETE) ------------------------- */
export const deleteMessage = async (req, res) => {
    try {
        const { messageId } = req.params;
        const userId = req.user._id;

        const msg = await Message.findById(messageId);

        if (!msg) {
            return res.status(404).json({ error: "Message not found" });
        }

        if (msg.senderId.toString() !== userId.toString()) {
            return res.status(403).json({ error: "Not authorized" });
        }

        msg.isDeleted = true;
        msg.text = null;     // Optional: clear text
        msg.image = null;    // Optional: clear image

        await msg.save();

        // Notify receiver
        const receiverSocketId = getReceiverSocketId(msg.receiverId);
        if (receiverSocketId) {
            io.to(receiverSocketId).emit("messageDeleted", msg._id);
        }

        res.json({ success: true, messageId: msg._id });
    } catch (error) {
        console.log("Error in deleteMessage:", error.message);
        res.status(500).json({ error: "Internal server error" });
    }
};

/* ------------------------- EDIT MESSAGE (OPTIONAL) ------------------------- */
export const editMessage = async (req, res) => {
    try {
        const { messageId } = req.params;
        const { newText } = req.body;
        const userId = req.user._id;

        const msg = await Message.findById(messageId);

        if (!msg) return res.status(404).json({ error: "Message not found" });
        if (msg.senderId.toString() !== userId.toString()) {
            return res.status(403).json({ error: "Not authorized" });
        }

        msg.text = newText;
        msg.isEdited = true;
        await msg.save();

        // Notify receiver
        const receiverSocketId = getReceiverSocketId(msg.receiverId);
        if (receiverSocketId) {
            io.to(receiverSocketId).emit("messageEdited", msg);
        }

        res.json({ success: true, message: msg });

    } catch (error) {
        console.log("Error in editMessage:", error.message);
        res.status(500).json({ error: "Internal server error" });
    }
};
