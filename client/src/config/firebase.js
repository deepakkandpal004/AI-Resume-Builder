import { initializeApp } from "firebase/app";
import { getAuth, GoogleAuthProvider, browserLocalPersistence, setPersistence } from "firebase/auth";

const firebaseConfig = {
  apiKey: "AIzaSyDrVpSR__ihIgJiy6FB7H9o4SPq0s2TbdU",
  authDomain: "resume-builder-saas-ec55a.firebaseapp.com",
  projectId: "resume-builder-saas-ec55a",
  storageBucket: "resume-builder-saas-ec55a.firebasestorage.app",
  messagingSenderId: "140325645403",
  appId: "1:140325645403:web:6fc9c987f9384eeba7237e",
};

const app = initializeApp(firebaseConfig);
const auth = getAuth(app);
setPersistence(auth, browserLocalPersistence).catch(() => {});
export { auth };
export const googleProvider = new GoogleAuthProvider();
export default app;