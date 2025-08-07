
import { initializeApp, getApps, getApp } from "firebase/app";
import { getFirestore, enableIndexedDbPersistence, Firestore } from "firebase/firestore";
import { getAuth } from "firebase/auth";

let app;
let dbInstance: Firestore | null = null;
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
    // Explicitly pass the authDomain to getAuth to prevent configuration issues.
    authInstance = getAuth(app);
    
    // Enable offline persistence
    enableIndexedDbPersistence(dbInstance).catch((err) => {
        if (err.code == 'failed-precondition') {
            // Multiple tabs open, persistence can only be enabled in one tab at a time.
            console.warn("Firestore persistence failed: multiple tabs open.");
        } else if (err.code == 'unimplemented') {
            // The current browser does not support all of the features required to enable persistence
             console.warn("Firestore persistence failed: browser does not support it.");
        }
    });

  } else {
    const missingVars = Object.entries(firebaseConfig).filter(([, val]) => !val).map(([key]) => key);
    throw new Error(`The following Firebase environment variables are missing or empty: ${missingVars.join(', ')}. Please check your .env.local file.`);
  }

} catch (e: any) {
  console.error("Firebase initialization failed:", e.message);
  firebaseError = `There is an issue with your Firebase configuration. Please check your environment variables. The server must be restarted after any changes.`;
}

export const db = dbInstance;
export const auth = authInstance;
export { firebaseError };
