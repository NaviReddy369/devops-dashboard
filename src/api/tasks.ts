/**
 * Tasks API
 * Task CRUD operations and business logic
 */

import {
  collection,
  query,
  where,
  orderBy,
  onSnapshot,
  Timestamp,
} from 'firebase/firestore';
import { db } from '../firebase';
import {
  getDocument,
  getDocuments,
  createDocument,
  updateDocument,
  deleteDocument,
  COLLECTIONS,
  queryByUserId,
  queryByStatus,
  orderByCreatedDesc,
} from './firestore';
import { Task, TaskStatus, ApiResponse } from '../types';

// ============================================================================
// CREATE OPERATIONS
// ============================================================================

/**
 * Create a new task
 */
export async function createTask(
  taskData: Omit<Task, 'id' | 'createdAt' | 'updatedAt'>
): Promise<ApiResponse<Task>> {
  try {
    const taskId = await createDocument(COLLECTIONS.TASKS, {
      ...taskData,
      status: 'intake' as TaskStatus,
      createdAt: Timestamp.now(),
      updatedAt: Timestamp.now(),
    });

    const task = await getDocument<Task>(COLLECTIONS.TASKS, taskId);
    
    if (!task) {
      throw new Error('Failed to retrieve created task');
    }

    return {
      success: true,
      data: task,
    };
  } catch (error) {
    return {
      success: false,
      error: error instanceof Error ? error.message : 'Failed to create task',
    };
  }
}

// ============================================================================
// READ OPERATIONS
// ============================================================================

/**
 * Get a task by ID
 */
export async function getTask(taskId: string): Promise<ApiResponse<Task>> {
  try {
    const task = await getDocument<Task>(COLLECTIONS.TASKS, taskId);
    
    if (!task) {
      return {
        success: false,
        error: 'Task not found',
      };
    }

    return {
      success: true,
      data: task,
    };
  } catch (error) {
    return {
      success: false,
      error: error instanceof Error ? error.message : 'Failed to get task',
    };
  }
}

/**
 * Get all tasks for a user
 */
export async function getUserTasks(
  userId: string
): Promise<ApiResponse<Task[]>> {
  try {
    const tasks = await getDocuments<Task>(COLLECTIONS.TASKS, [
      queryByUserId(userId),
      orderByCreatedDesc(),
    ]);

    return {
      success: true,
      data: tasks,
    };
  } catch (error) {
    return {
      success: false,
      error: error instanceof Error ? error.message : 'Failed to get tasks',
    };
  }
}

/**
 * Get tasks by status
 */
export async function getTasksByStatus(
  userId: string,
  status: TaskStatus
): Promise<ApiResponse<Task[]>> {
  try {
    const tasks = await getDocuments<Task>(COLLECTIONS.TASKS, [
      queryByUserId(userId),
      queryByStatus(status),
      orderByCreatedDesc(),
    ]);

    return {
      success: true,
      data: tasks,
    };
  } catch (error) {
    return {
      success: false,
      error: error instanceof Error ? error.message : 'Failed to get tasks',
    };
  }
}

// ============================================================================
// UPDATE OPERATIONS
// ============================================================================

/**
 * Update a task
 */
export async function updateTask(
  taskId: string,
  updates: Partial<Task>
): Promise<ApiResponse<Task>> {
  try {
    await updateDocument(COLLECTIONS.TASKS, taskId, {
      ...updates,
      updatedAt: Timestamp.now(),
    });

    const task = await getDocument<Task>(COLLECTIONS.TASKS, taskId);
    
    if (!task) {
      return {
        success: false,
        error: 'Task not found after update',
      };
    }

    return {
      success: true,
      data: task,
    };
  } catch (error) {
    return {
      success: false,
      error: error instanceof Error ? error.message : 'Failed to update task',
    };
  }
}

/**
 * Update task status
 */
export async function updateTaskStatus(
  taskId: string,
  status: TaskStatus
): Promise<ApiResponse<Task>> {
  const updates: Partial<Task> = {
    status,
    updatedAt: Timestamp.now(),
  };

  if (status === 'completed') {
    updates.completedAt = Timestamp.now();
  }

  return updateTask(taskId, updates);
}

// ============================================================================
// DELETE OPERATIONS
// ============================================================================

/**
 * Delete a task
 */
export async function deleteTask(taskId: string): Promise<ApiResponse<void>> {
  try {
    await deleteDocument(COLLECTIONS.TASKS, taskId);
    return {
      success: true,
    };
  } catch (error) {
    return {
      success: false,
      error: error instanceof Error ? error.message : 'Failed to delete task',
    };
  }
}

// ============================================================================
// REAL-TIME OPERATIONS
// ============================================================================

/**
 * Subscribe to user's tasks (real-time)
 */
export function subscribeToUserTasks(
  userId: string,
  callback: (tasks: Task[]) => void,
  onError?: (error: Error) => void
): () => void {
  const q = query(
    collection(db, COLLECTIONS.TASKS),
    where('userId', '==', userId),
    orderBy('createdAt', 'desc')
  );

  return onSnapshot(
    q,
    (snapshot) => {
      const tasks: Task[] = [];
      snapshot.forEach((doc) => {
        tasks.push({ id: doc.id, ...doc.data() } as Task);
      });
      callback(tasks);
    },
    (error) => {
      if (onError) {
        onError(error as Error);
      } else {
        console.error('Error subscribing to tasks:', error);
      }
    }
  );
}

/**
 * Subscribe to tasks by status (real-time)
 */
export function subscribeToTasksByStatus(
  userId: string,
  status: TaskStatus,
  callback: (tasks: Task[]) => void,
  onError?: (error: Error) => void
): () => void {
  const q = query(
    collection(db, COLLECTIONS.TASKS),
    where('userId', '==', userId),
    where('status', '==', status),
    orderBy('createdAt', 'desc')
  );

  return onSnapshot(
    q,
    (snapshot) => {
      const tasks: Task[] = [];
      snapshot.forEach((doc) => {
        tasks.push({ id: doc.id, ...doc.data() } as Task);
      });
      callback(tasks);
    },
    (error) => {
      if (onError) {
        onError(error as Error);
      } else {
        console.error('Error subscribing to tasks:', error);
      }
    }
  );
}

