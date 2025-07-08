import { initializeApp, getApps, getApp } from "firebase/app";
import { getFirestore } from "firebase/firestore";
import { getAuth } from "firebase/auth";

let app;
let dbInstance = null;
let authInstance = null;
let firebaseError: string | null = null;

try {
  const firebaseConfig = {
    apiKey: process.env.NEXT_PUBLIC_FIREBASE_API_KEY,
    authDomain: process.env.NEXT_PUBLIC_FIREBASE_AUTH_DOMAIN,
    projectId: process.env.NEXT_PUBLIC_FIREBASE_PROJECT_ID,
    storageBucket: process.env.NEXT_PUBLIC_FIREBASE_STORAGE_BUCKET,
    messagingSenderId: process.env.NEXT_PUBLIC_FIREBASE_MESSAGING_SENDER_ID,
    appId: process.env.NEXT_PUBLIC_FIREBASE_APP_ID,
  };

  const allVarsPresent = Object.values(firebaseConfig).every(Boolean);

  if (allVarsPresent) {
    app = getApps().length ? getApp() : initializeApp(firebaseConfig);
    dbInstance = getFirestore(app);
    authInstance = getAuth(app);
  } else {
    throw new Error("One or more Firebase environment variables are missing from .env.local.");
  }

} catch (e: any) {
  console.error("Firebase initialization failed:", e.message);
  firebaseError = `There is an issue with your Firebase configuration. Please check your .env.local file. The server must be restarted after any changes. Error details: ${e.message}`;
}

export const db = dbInstance;
export const auth = authInstance;
export { firebaseError };
