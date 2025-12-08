import { initializeApp } from 'firebase/app';
import { getAuth } from 'firebase/auth';
import { getFirestore } from 'firebase/firestore';
import { getStorage } from 'firebase/storage';

// Your web app's Firebase configuration
const firebaseConfig = {
  apiKey: process.env.REACT_APP_FIREBASE_API_KEY || "AIzaSyDTLCPoaBedn85_gjGbSo_FpaoaJXKGWEQ",
  authDomain: process.env.REACT_APP_FIREBASE_AUTH_DOMAIN || "gnkcontinuum-d6d58.firebaseapp.com",
  projectId: process.env.REACT_APP_FIREBASE_PROJECT_ID || "gnkcontinuum-d6d58",
  storageBucket: process.env.REACT_APP_FIREBASE_STORAGE_BUCKET || "gnkcontinuum-d6d58.firebasestorage.app",
  messagingSenderId: process.env.REACT_APP_FIREBASE_MESSAGING_SENDER_ID || "829999333658",
  appId: process.env.REACT_APP_FIREBASE_APP_ID || "1:829999333658:web:68d82d744ce4e36477aca3",
  measurementId: process.env.REACT_APP_FIREBASE_MEASUREMENT_ID || "G-M1XPB9PRMD" // Optional for Analytics
};

// Initialize Firebase
const app = initializeApp(firebaseConfig);

// Initialize Firebase services
export const auth = getAuth(app);
export const db = getFirestore(app);
export const storage = getStorage(app);

export default app;

