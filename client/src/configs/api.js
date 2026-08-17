import axios from "axios";
import { auth } from "../config/firebase";
import { onAuthStateChanged } from "firebase/auth";

let cachedToken = null;
let authReady = new Promise((resolve) => {
  onAuthStateChanged(auth, async (user) => {
    if (user) {
      cachedToken = await user.getIdToken();
    }
    resolve();
  });
});

export const setCachedToken = (token) => {
  cachedToken = token;
};

export const waitForAuth = () => authReady;

const api = axios.create({
    baseURL: import.meta.env.VITE_BASE_URL
});

api.interceptors.request.use(async (config) => {
    await authReady;
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
