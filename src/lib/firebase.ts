import { initializeApp, getApps, getApp } from 'firebase/app';
import { getAuth } from 'firebase/auth';
import { initializeFirestore } from 'firebase/firestore';
import firebaseConfig from '../../firebase-applet-config.json';

// Initialize App
const app = getApps().length === 0 ? initializeApp(firebaseConfig) : getApp();

export const auth = getAuth(app);

// Enable experimentalForceLongPolling for iframe/sandbox environments
const firestoreSettings = {
  experimentalForceLongPolling: true,
};

// Use the specified Firestore database ID if provided in the config
let firestore;
try {
  const dbId = (firebaseConfig as any).firestoreDatabaseId;
  // If no ID or ID is default, use standard initialization
  if (!dbId || dbId === "(default)") {
    firestore = initializeFirestore(app, firestoreSettings);
  } else {
    firestore = initializeFirestore(app, firestoreSettings, dbId);
  }
} catch (e) {
  console.warn("Firestore named database init failed, falling back to default:", e);
  firestore = initializeFirestore(app, firestoreSettings);
}

export const db = firestore;

