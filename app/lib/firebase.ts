import { initializeApp, getApps, getApp } from "firebase/app";
import { getFirestore } from "firebase/firestore";
import { getAuth } from "firebase/auth";

const firebaseConfig = {
  apiKey: process.env.NEXT_PUBLIC_FIREBASE_API_KEY || "",
  authDomain: process.env.NEXT_PUBLIC_FIREBASE_AUTH_DOMAIN || "",
  projectId: process.env.NEXT_PUBLIC_FIREBASE_PROJECT_ID || "",
  storageBucket: process.env.NEXT_PUBLIC_FIREBASE_STORAGE_BUCKET || "",
  messagingSenderId: process.env.NEXT_PUBLIC_FIREBASE_MESSAGING_SENDER_ID || "",
  appId: process.env.NEXT_PUBLIC_FIREBASE_APP_ID || "",
};



// DEBUG: Log config and check if env vars are loaded
if (typeof window !== 'undefined') {
  // Only log on client to avoid leaking secrets on server logs
  // (apiKey is public for Firebase web apps)
  // Remove this after debugging!
  // eslint-disable-next-line no-console
  console.log("FIREBASE CONFIG:", firebaseConfig);
}

const hasValidConfig = Object.values(firebaseConfig).every((val) => val !== "");



let app;
if (hasValidConfig) {
  app = !getApps().length ? initializeApp(firebaseConfig) : getApp();
} else {
  app = undefined;
}

export const auth = app ? getAuth(app) : undefined;
export const db = app ? getFirestore(app) : undefined;

export default app;
