import { initializeApp } from 'firebase/app';
import { getAuth, GoogleAuthProvider, signInWithPopup, User } from 'firebase/auth';
import { getFirestore } from 'firebase/firestore';
import { getStorage } from 'firebase/storage';
import { getFunctions, httpsCallable } from 'firebase/functions';

// Validate required environment variables
const apiKey = process.env.REACT_APP_FIREBASE_API_KEY;
const authDomain = process.env.REACT_APP_FIREBASE_AUTH_DOMAIN;
const projectId = process.env.REACT_APP_FIREBASE_PROJECT_ID;
const storageBucket = process.env.REACT_APP_FIREBASE_STORAGE_BUCKET;
const messagingSenderId = process.env.REACT_APP_FIREBASE_MESSAGING_SENDER_ID;
const appId = process.env.REACT_APP_FIREBASE_APP_ID;

// Check for missing required environment variables
const missingVars: string[] = [];
if (!apiKey) missingVars.push('REACT_APP_FIREBASE_API_KEY');
if (!authDomain) missingVars.push('REACT_APP_FIREBASE_AUTH_DOMAIN');
if (!projectId) missingVars.push('REACT_APP_FIREBASE_PROJECT_ID');
if (!storageBucket) missingVars.push('REACT_APP_FIREBASE_STORAGE_BUCKET');
if (!messagingSenderId) missingVars.push('REACT_APP_FIREBASE_MESSAGING_SENDER_ID');
if (!appId) missingVars.push('REACT_APP_FIREBASE_APP_ID');

if (missingVars.length > 0) {
  throw new Error(
    `Missing required environment variables: ${missingVars.join(', ')}\n` +
    'Please create a .env file in the root directory with these variables.\n' +
    'See .env.example for a template.'
  );
}

// Your web app's Firebase configuration
const firebaseConfig = {
  apiKey,
  authDomain,
  projectId,
  storageBucket,
  messagingSenderId,
  appId,
  measurementId: process.env.REACT_APP_FIREBASE_MEASUREMENT_ID, // Optional for Analytics
};

// Initialize Firebase
const app = initializeApp(firebaseConfig);

// Initialize Firebase services
export const auth = getAuth(app);
export const db = getFirestore(app);
export const storage = getStorage(app);
export const functions = getFunctions(app);

// Firebase Functions helpers
export const generateDashboardData = httpsCallable(functions, 'generateDashboardData');
export const calculateProfileMetrics = httpsCallable(functions, 'calculateProfileMetrics');

// Google Authentication Provider
export const googleProvider = new GoogleAuthProvider();

// Google Sign-In Helper Function
export const signInWithGoogle = async (): Promise<User> => {
  try {
    const result = await signInWithPopup(auth, googleProvider);
    return result.user;
  } catch (error: any) {
    // Provide a more useful error message
    if (error.code === 'auth/popup-closed-by-user') {
      throw new Error('Sign-in popup was closed. Please try again.');
    } else if (error.code === 'auth/popup-blocked') {
      throw new Error('Popup was blocked by your browser. Please allow popups and try again.');
    } else if (error.code === 'auth/network-request-failed') {
      throw new Error('Network error. Please check your connection and try again.');
    } else {
      throw new Error(error.message || 'Failed to sign in with Google. Please try again.');
    }
  }
};

export default app;

