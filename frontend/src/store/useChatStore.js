import { create } from "zustand";
import toast from "react-hot-toast";
import { axiosInstance } from "../lib/axios";
import { useAuthStore } from "./useAuthStore";

export const useChatStore = create((set, get) => ({
    messages: [],
    users: [],
    selectedUser: null,

    replyMessage: null,     
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
        const { selectedUser, messages, replyMessage } = get();


        if (!messageData.text && !messageData.image) return;

        try {
            const res = await axiosInstance.post(
                `/messages/send/${selectedUser._id}`,
                {
                    ...messageData,
                    replyTo: replyMessage ? replyMessage._id : null,
                }
            );

            const newMessage = res.data;


            if (replyMessage && newMessage.replyTo) {
                newMessage.replyTo = replyMessage;
            }


            set({
                messages: [...messages, newMessage],  
                replyMessage: null,                   
            });

        } catch (error) {
            toast.error(error?.response?.data?.message || "Something went wrong");
        }
    },



    setReplyMessage: (msg) => set({ replyMessage: msg }),
    clearReplyMessage: () => set({ replyMessage: null }),


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

    setSelectedUser: (selectedUser) => set({ selectedUser }),
}));
