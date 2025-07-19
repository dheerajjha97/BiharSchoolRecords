
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

  const allVarsPresent = Object.values(firebaseConfig).every(val => val && typeof val === 'string' && val.length > 0);

  if (allVarsPresent) {
    app = getApps().length ? getApp() : initializeApp(firebaseConfig);
    dbInstance = getFirestore(app);
    authInstance = getAuth(app);
  } else {
    // This is a more specific error for developers.
    const missingVars = Object.entries(firebaseConfig).filter(([, val]) => !val).map(([key]) => key);
    throw new Error(`The following Firebase environment variables are missing or empty: ${missingVars.join(', ')}. Please check your .env.local file.`);
  }

} catch (e: any) {
  console.error("Firebase initialization failed:", e.message);
  // This user-friendly error will be shown in the UI.
  firebaseError = `There is an issue with your Firebase configuration. Please check your environment variables. The server must be restarted after any changes.`;
}

export const db = dbInstance;
export const auth = authInstance;
export { firebaseError };
