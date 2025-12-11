/**
 * Firestore Helper Functions
 * Centralized Firestore operations and type-safe queries
 */

import {
  collection,
  doc,
  getDoc,
  getDocs,
  setDoc,
  updateDoc,
  deleteDoc,
  query,
  where,
  orderBy,
  limit,
  Timestamp,
  QueryConstraint,
  DocumentData,
  FirestoreError,
} from 'firebase/firestore';
import { db } from '../firebase';

// ============================================================================
// COLLECTION NAMES
// ============================================================================

export const COLLECTIONS = {
  USERS: 'users',
  TASKS: 'tasks',
  TASK_HATCH_SUBMISSIONS: 'taskHatchSubmissions',
  AI_ANALYSES: 'aiAnalyses',
  NEURAL_REQUESTS: 'neuralRequests',
  NEURAL_TASKS: 'neuralTasks',
  ASSIGNMENTS: 'assignments',
  TASKER_PROFILES: 'taskerProfiles',
} as const;

// ============================================================================
// GENERIC FIRESTORE HELPERS
// ============================================================================

/**
 * Generic function to get a document by ID
 */
export async function getDocument<T>(
  collectionName: string,
  docId: string
): Promise<T | null> {
  try {
    const docRef = doc(db, collectionName, docId);
    const docSnap = await getDoc(docRef);
    
    if (docSnap.exists()) {
      return { id: docSnap.id, ...docSnap.data() } as T;
    }
    return null;
  } catch (error) {
    console.error(`Error getting document ${docId} from ${collectionName}:`, error);
    throw error;
  }
}

/**
 * Generic function to get documents with query constraints
 */
export async function getDocuments<T>(
  collectionName: string,
  constraints: QueryConstraint[] = []
): Promise<T[]> {
  try {
    const collectionRef = collection(db, collectionName);
    const q = query(collectionRef, ...constraints);
    const querySnapshot = await getDocs(q);
    
    return querySnapshot.docs.map((doc) => ({
      id: doc.id,
      ...doc.data(),
    })) as T[];
  } catch (error) {
    console.error(`Error getting documents from ${collectionName}:`, error);
    throw error;
  }
}

/**
 * Generic function to create a document
 */
export async function createDocument<T extends { id?: string }>(
  collectionName: string,
  data: Omit<T, 'id'>,
  docId?: string
): Promise<string> {
  try {
    const collectionRef = collection(db, collectionName);
    
    if (docId) {
      const docRef = doc(collectionRef, docId);
      await setDoc(docRef, {
        ...data,
        createdAt: Timestamp.now(),
        updatedAt: Timestamp.now(),
      });
      return docId;
    } else {
      const docRef = doc(collectionRef);
      await setDoc(docRef, {
        ...data,
        createdAt: Timestamp.now(),
        updatedAt: Timestamp.now(),
      });
      return docRef.id;
    }
  } catch (error) {
    console.error(`Error creating document in ${collectionName}:`, error);
    throw error;
  }
}

/**
 * Generic function to update a document
 */
export async function updateDocument<T>(
  collectionName: string,
  docId: string,
  data: Partial<T>
): Promise<void> {
  try {
    const docRef = doc(db, collectionName, docId);
    await updateDoc(docRef, {
      ...data,
      updatedAt: Timestamp.now(),
    });
  } catch (error) {
    console.error(`Error updating document ${docId} in ${collectionName}:`, error);
    throw error;
  }
}

/**
 * Generic function to delete a document
 */
export async function deleteDocument(
  collectionName: string,
  docId: string
): Promise<void> {
  try {
    const docRef = doc(db, collectionName, docId);
    await deleteDoc(docRef);
  } catch (error) {
    console.error(`Error deleting document ${docId} from ${collectionName}:`, error);
    throw error;
  }
}

// ============================================================================
// QUERY BUILDERS
// ============================================================================

/**
 * Build a query for documents by user ID
 */
export function queryByUserId(userId: string) {
  return where('userId', '==', userId);
}

/**
 * Build a query for documents by status
 */
export function queryByStatus(status: string) {
  return where('status', '==', status);
}

/**
 * Build a query ordered by creation date (newest first)
 */
export function orderByCreatedDesc() {
  return orderBy('createdAt', 'desc');
}

/**
 * Build a query ordered by creation date (oldest first)
 */
export function orderByCreatedAsc() {
  return orderBy('createdAt', 'asc');
}

/**
 * Build a query with limit
 */
export function limitResults(count: number) {
  return limit(count);
}

// ============================================================================
// ERROR HANDLING
// ============================================================================

export function handleFirestoreError(error: unknown): string {
  if (error instanceof Error) {
    const firestoreError = error as FirestoreError;
    
    switch (firestoreError.code) {
      case 'permission-denied':
        return 'You do not have permission to perform this action.';
      case 'not-found':
        return 'The requested document was not found.';
      case 'unavailable':
        return 'The service is currently unavailable. Please try again later.';
      case 'deadline-exceeded':
        return 'The operation timed out. Please try again.';
      default:
        return firestoreError.message || 'An unexpected error occurred.';
    }
  }
  
  return 'An unexpected error occurred.';
}

// ============================================================================
// TYPE HELPERS
// ============================================================================

export type FirestoreTimestamp = Timestamp;
export type FirestoreDocument<T> = T & { id: string };

