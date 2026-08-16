import axios from "axios";
import { auth } from "../config/firebase";

let cachedToken = null;

export const setCachedToken = (token) => {
  cachedToken = token;
};

const api = axios.create({
    baseURL: import.meta.env.VITE_BASE_URL
});

api.interceptors.request.use(async (config) => {
    const user = auth.currentUser;
    if (user) {
        const token = await user.getIdToken();
        config.headers.Authorization = `Bearer ${token}`;
        cachedToken = token;
    } else if (cachedToken) {
        config.headers.Authorization = `Bearer ${cachedToken}`;
    }
    return config;
});

export default api;
