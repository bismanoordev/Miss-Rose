import { initializeApp, getApps, getApp } from "firebase/app";
import { getFirestore } from "firebase/firestore";
import { getAuth } from "firebase/auth";

// 🔐 Firebase config with env vars (provide defaults to prevent crashes)
const firebaseConfig = {
  apiKey: process.env.NEXT_PUBLIC_FIREBASE_API_KEY || "",
  authDomain: process.env.NEXT_PUBLIC_FIREBASE_AUTH_DOMAIN || "",
  projectId: process.env.NEXT_PUBLIC_FIREBASE_PROJECT_ID || "",
  storageBucket: process.env.NEXT_PUBLIC_FIREBASE_STORAGE_BUCKET || "",
  messagingSenderId: process.env.NEXT_PUBLIC_FIREBASE_MESSAGING_SENDER_ID || "",
  appId: process.env.NEXT_PUBLIC_FIREBASE_APP_ID || "",
};

// Check if all required config values are present
const hasValidConfig = Object.values(firebaseConfig).every((val) => val !== "");

// 🛑 Only initialize Firebase on client-side with valid config
let app = null;
if (typeof window !== "undefined" && hasValidConfig) {
  app = !getApps().length ? initializeApp(firebaseConfig) : getApp();
}

// ✅ Auth & Firestore (client only)
export const auth = app ? getAuth(app) : null;
export const db = app ? getFirestore(app) : null;

export default app;
