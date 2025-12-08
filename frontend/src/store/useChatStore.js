import { create } from "zustand";
import toast from "react-hot-toast";
import { axiosInstance } from "../lib/axios";
import { useAuthStore } from "./useAuthStore";

export const useChatStore = create((set, get) => ({
    messages: [],
    users: [],
    selectedUser: (() => {
        try {
            const stored = localStorage.getItem("selectedUser");
            console.log("Loading selectedUser from localStorage:", stored);
            return stored ? JSON.parse(stored) : null;
        } catch (error) {
            console.error("Error loading selectedUser from localStorage:", error);
            return null;
        }
    })(),

    isUsersLoading: false,
    isMessagesLoading: false,

    getFriends: async () => {
        set({ isUsersLoading: true });
        try {
            const res = await axiosInstance.get("/friends");
            set({ users: res.data });
        } catch (error) {
            toast.error(error.response.data.message);
        } finally {
            set({ isUsersLoading: false });
        }
    },

    getMessages: async (userId) => {
        set({ isMessagesLoading: true });
        try {
            const res = await axiosInstance.get(`/messages/${userId}`);
            set({ messages: res.data });
        } catch (error) {
            toast.error(error.response.data.message);
        } finally {
            set({ isMessagesLoading: false });
        }
    },

    sendMessage: async (messageData) => {
        const { selectedUser, messages } = get();

        if (!messageData.text && !messageData.image) return;

        try {
            const res = await axiosInstance.post(
                `/messages/send/${selectedUser._id}`,
                messageData
            );

            const newMessage = res.data;

            set({
                messages: [...messages, newMessage],
            });

            return newMessage;
        } catch (error) {
            toast.error(error?.response?.data?.message || "Something went wrong");
            throw error;
        }
    },

    deleteMessage: async (messageId) => {
        const { messages } = get();
        try {
            await axiosInstance.delete(`/messages/${messageId}`);

            set({
                messages: messages.filter((m) => m._id !== messageId),
            });

            toast.success("Message deleted");
        } catch (err) {
            toast.error("Failed to delete message");
        }
    },

    subscribeToMessages: () => {
        const { selectedUser } = get();
        if (!selectedUser) return;

        const socket = useAuthStore.getState().socket;
        const currentUser = useAuthStore.getState().authUser;

        socket.on("newMessage", (newMessage) => {
            const isMessageForCurrentChat =
                (newMessage.senderId === selectedUser._id &&
                    newMessage.receiverId === currentUser._id) ||
                (newMessage.senderId === currentUser._id &&
                    newMessage.receiverId === selectedUser._id);

            if (!isMessageForCurrentChat) return;

            set({
                messages: [...get().messages, newMessage],
            });
        });

        socket.on("messageDeleted", (messageId) => {
            set({
                messages: get().messages.filter((msg) => msg._id !== messageId),
            });
        });

        socket.on("messageUpdated", (updatedMsg) => {
            set({
                messages: get().messages.map((msg) =>
                    msg._id === updatedMsg._id ? updatedMsg : msg
                ),
            });
        });
    },

    unsubscribeFromMessages: () => {
        const socket = useAuthStore.getState().socket;
        socket.off("newMessage");
        socket.off("messageDeleted");
        socket.off("messageUpdated");
    },

    setSelectedUser: (selectedUser) => {
        console.log("setSelectedUser called with:", selectedUser);
        set({ selectedUser });
        // Save to localStorage
        try {
            if (selectedUser) {
                const userString = JSON.stringify(selectedUser);
                console.log("Saving to localStorage:", userString);
                localStorage.setItem("selectedUser", userString);
            } else {
                console.log("Removing from localStorage");
                localStorage.removeItem("selectedUser");
            }
        } catch (error) {
            console.error("Error saving to localStorage:", error);
        }
    },
}));