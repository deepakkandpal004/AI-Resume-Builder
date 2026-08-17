import axios from "axios";
import { auth } from "../config/firebase";
import { onAuthStateChanged } from "firebase/auth";

let cachedToken = null;

onAuthStateChanged(auth, async (user) => {
  try {
    cachedToken = user ? await user.getIdToken(true) : null;
  } catch {
    cachedToken = null;
  }
});

export const setCachedToken = (token) => {
  cachedToken = token;
};

const api = axios.create({
    baseURL: import.meta.env.VITE_BASE_URL
});

const waitForUser = async () => {
  let user = auth.currentUser;
  if (user || cachedToken) return user;
  const started = Date.now();
  while (!user && !cachedToken && Date.now() - started < 3000) {
    await new Promise((r) => setTimeout(r, 100));
    user = auth.currentUser;
  }
  return user;
};

api.interceptors.request.use(async (config) => {
    const user = await waitForUser();
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