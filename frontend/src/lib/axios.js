import axios from "axios"

export const axiosInstance = axios.create({
    baseURL: import.meta.env.MODE === "development" ? "https://we-talk-1.onrender.com/api" : "/api",
    withCredentials: true,
})
