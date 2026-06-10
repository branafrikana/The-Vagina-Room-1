import { initializeApp, getApps, getApp } from 'firebase/app';
import { getAuth } from 'firebase/auth';
import { getFirestore } from 'firebase/firestore';
import firebaseConfig from '../../firebase-applet-config.json';

// Initialize App
const app = getApps().length === 0 ? initializeApp(firebaseConfig) : getApp();

export const auth = getAuth(app);
// Use the specified Firestore database ID if provided in the config
let firestore;
try {
  const dbId = (firebaseConfig as any).firestoreDatabaseId;
  // If no ID or ID is default, use standard initialization
  if (!dbId || dbId === "(default)") {
    firestore = getFirestore(app);
  } else {
    firestore = getFirestore(app, dbId);
  }
} catch (e) {
  console.warn("Firestore named database init failed, falling back to default:", e);
  firestore = getFirestore(app);
}

export const db = firestore;

