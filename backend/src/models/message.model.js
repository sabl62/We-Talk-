import mongoose from "mongoose";

const messageSchema = new mongoose.Schema(
    {
        senderId: {
            type: mongoose.Schema.Types.ObjectId,
            ref: "User",
            required: true,
        },

        receiverId: {
            type: mongoose.Schema.Types.ObjectId,
            ref: "User",
            required: true,
        },

        text: {
            type: String,
        },

        image: {
            type: String,
        },

        // ⭐ Reply feature: store parent message reference
        replyTo: {
            type: mongoose.Schema.Types.ObjectId,
            ref: "Message",
            default: null,
        },

        // ⭐ Soft delete: message stays in DB but is hidden
        isDeleted: {
            type: Boolean,
            default: false,
        },

        // (Optional) For editing messages later
        isEdited: {
            type: Boolean,
            default: false,
        }
    },
    { timestamps: true }
);

const Message = mongoose.model("Message", messageSchema);

export default Message;
