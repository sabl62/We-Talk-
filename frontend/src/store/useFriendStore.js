// src/store/useFriendStore.js
import { create } from "zustand";
import toast from "react-hot-toast";
import { axiosInstance } from "../lib/axios";

export const useFriendStore = create((set, get) => ({
    friends: [],
    requests: [],
    isLoading: false,

    getFriends: async () => {
        set({ isLoading: true });
        try {
            const res = await axiosInstance.get("/friends");
            set({ friends: res.data });
        } catch (error) {
            toast.error(error.response?.data?.message || "Failed to load friends");
        } finally {
            set({ isLoading: false });
        }
    },

    sendRequest: async (userId) => {
        try {
            const res = await axiosInstance.post(`/friends/send/${userId}`);
            toast.success(res.data.message);
        } catch (error) {
            toast.error(error.response?.data?.message || "Failed to send request");
        }
    },

    acceptRequest: async (userId) => {
        try {
            const res = await axiosInstance.post(`/friends/accept/${userId}`);
            toast.success(res.data.message);
            get().getFriends(); // refresh friends list
            get().getRequests(); // refresh requests list
        } catch (error) {
            toast.error(error.response?.data?.message || "Failed to accept request");
        }
    },

    getRequests: async () => {
        set({ isLoading: true });
        try {
            const res = await axiosInstance.get("/friends/requests");
            set({ requests: res.data });
        } catch (error) {
            toast.error(error.response?.data?.message || "Failed to load requests");
        } finally {
            set({ isLoading: false });
        }
    },
}));
