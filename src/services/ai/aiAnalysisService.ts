/**
 * AI Analysis Service
 * Orchestrates AI analysis for tasks
 */

import { Task, AIAnalysis } from '../../types';
import { OpenAIProvider } from './providers/openai';
import { db } from '../../firebase';
import { collection, addDoc, serverTimestamp, doc, updateDoc } from 'firebase/firestore';

export class AIAnalysisService {
  private openAIProvider: OpenAIProvider;

  constructor() {
    this.openAIProvider = new OpenAIProvider();
  }

  /**
   * Analyze a task and save results to Firestore
   */
  async analyzeAndSave(task: Task): Promise<AIAnalysis> {
    try {
      // Update task status to analyzing
      await updateDoc(doc(db, 'taskHatchSubmissions', task.id), {
        status: 'analyzing',
        updatedAt: serverTimestamp(),
      });

      // Perform AI analysis
      const analysis = await this.openAIProvider.analyzeTask(task);

      // Save analysis to Firestore
      const analysisRef = await addDoc(collection(db, 'aiAnalyses'), {
        ...analysis,
        createdAt: serverTimestamp(),
        completedAt: serverTimestamp(),
      });

      // Update task with analysis reference and status
      await updateDoc(doc(db, 'taskHatchSubmissions', task.id), {
        status: 'ai-processing',
        aiAnalysisId: analysisRef.id,
        updatedAt: serverTimestamp(),
      });

      return { ...analysis, id: analysisRef.id };
    } catch (error) {
      console.error('AI analysis error:', error);
      
      // Update task status to failed
      await updateDoc(doc(db, 'taskHatchSubmissions', task.id), {
        status: 'intake',
        updatedAt: serverTimestamp(),
      });

      throw error;
    }
  }

  /**
   * Get analysis for a task
   */
  async getAnalysis(taskId: string): Promise<AIAnalysis | null> {
    // This would query Firestore for the analysis
    // For now, return null - implement based on your Firestore structure
    return null;
  }
}

// Singleton instance
let aiAnalysisServiceInstance: AIAnalysisService | null = null;

export function getAIAnalysisService(): AIAnalysisService {
  if (!aiAnalysisServiceInstance) {
    aiAnalysisServiceInstance = new AIAnalysisService();
  }
  return aiAnalysisServiceInstance;
}

