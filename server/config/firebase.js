import { initializeApp, cert, getApps } from "firebase-admin/app";
import { getAuth } from "firebase-admin/auth";

let serviceAccount;

if (process.env.FIREBASE_SERVICE_ACCOUNT) {
  serviceAccount = JSON.parse(process.env.FIREBASE_SERVICE_ACCOUNT);
} else {
  try {
    const { readFileSync } = await import("fs");
    const { fileURLToPath } = await import("url");
    const { dirname, join } = await import("path");
    const __filename = fileURLToPath(import.meta.url);
    const __dirname = dirname(__filename);
    serviceAccount = JSON.parse(
      readFileSync(join(__dirname, "../serviceAccountKey.json"), "utf8")
    );
  } catch {
    throw new Error(
      "Missing FIREBASE_SERVICE_ACCOUNT env var and serviceAccountKey.json not found. " +
      "Set FIREBASE_SERVICE_ACCOUNT to the contents of your serviceAccountKey.json."
    );
  }
}

const admin = getApps().length === 0
  ? initializeApp({
      credential: cert(serviceAccount),
    })
  : getApps()[0];

export const auth = getAuth(admin);
export const verifyIdToken = (token) => auth.verifyIdToken(token);
export default admin;