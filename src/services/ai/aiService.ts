/**
 * AI Service - Main Orchestration Layer
 * Coordinates AI analysis across multiple providers
 */

import { Task, AIAnalysis, Solution, IntegrationStep, RiskAssessment, AutomationOpportunity } from '../../types';
import { AIProvider } from '../../types';

// Provider interfaces
interface AIProviderInterface {
  analyzeTask(task: Task): Promise<AIAnalysis>;
  generateSolutions(task: Task, context: string): Promise<Solution[]>;
  assessRisks(task: Task): Promise<RiskAssessment>;
  identifyAutomation(task: Task): Promise<AutomationOpportunity[]>;
}

// ============================================================================
// AI SERVICE CONFIGURATION
// ============================================================================

export interface AIServiceConfig {
  defaultProvider: AIProvider;
  fallbackProvider?: AIProvider;
  enableMultiProvider: boolean;
  maxRetries: number;
  timeout: number;
}

const defaultConfig: AIServiceConfig = {
  defaultProvider: 'openai',
  fallbackProvider: 'anthropic',
  enableMultiProvider: false,
  maxRetries: 3,
  timeout: 60000, // 60 seconds
};

// ============================================================================
// AI SERVICE CLASS
// ============================================================================

export class AIService {
  private config: AIServiceConfig;
  private providers: Map<AIProvider, AIProviderInterface>;

  constructor(config: Partial<AIServiceConfig> = {}) {
    this.config = { ...defaultConfig, ...config };
    this.providers = new Map();
    this.initializeProviders();
  }

  private initializeProviders() {
    // Lazy load providers to avoid circular dependencies
    // Providers will be registered via registerProvider method
  }

  /**
   * Register an AI provider
   */
  registerProvider(provider: AIProvider, implementation: AIProviderInterface) {
    this.providers.set(provider, implementation);
  }

  /**
   * Main method to analyze a task
   */
  async analyzeTask(task: Task): Promise<AIAnalysis> {
    const startTime = Date.now();
    let lastError: Error | null = null;

    // Try primary provider
    for (let attempt = 0; attempt < this.config.maxRetries; attempt++) {
      try {
        const provider = this.providers.get(this.config.defaultProvider);
        if (!provider) {
          throw new Error(`Provider ${this.config.defaultProvider} not registered`);
        }

        const analysis = await this.executeWithTimeout(
          () => provider.analyzeTask(task),
          this.config.timeout
        );

        const processingTime = Date.now() - startTime;

        return {
          ...analysis,
          processingTime,
          status: 'completed',
          completedAt: new Date() as any, // Convert to Firestore Timestamp in API layer
        };
      } catch (error) {
        lastError = error as Error;
        console.warn(`Attempt ${attempt + 1} failed:`, error);

        // Try fallback provider if available
        if (attempt === this.config.maxRetries - 1 && this.config.fallbackProvider) {
          return this.analyzeTaskWithFallback(task);
        }
      }
    }

    throw new Error(`AI analysis failed after ${this.config.maxRetries} attempts: ${lastError?.message}`);
  }

  /**
   * Analyze task with fallback provider
   */
  private async analyzeTaskWithFallback(task: Task): Promise<AIAnalysis> {
    if (!this.config.fallbackProvider) {
      throw new Error('No fallback provider configured');
    }

    const provider = this.providers.get(this.config.fallbackProvider);
    if (!provider) {
      throw new Error(`Fallback provider ${this.config.fallbackProvider} not registered`);
    }

    const startTime = Date.now();
    const analysis = await provider.analyzeTask(task);
    const processingTime = Date.now() - startTime;

    return {
      ...analysis,
      aiProvider: this.config.fallbackProvider,
      processingTime,
      status: 'completed',
      completedAt: new Date() as any,
    };
  }

  /**
   * Execute function with timeout
   */
  private async executeWithTimeout<T>(
    fn: () => Promise<T>,
    timeoutMs: number
  ): Promise<T> {
    return Promise.race([
      fn(),
      new Promise<T>((_, reject) =>
        setTimeout(() => reject(new Error('Operation timed out')), timeoutMs)
      ),
    ]);
  }

  /**
   * Generate solutions for a task
   */
  async generateSolutions(task: Task, context?: string): Promise<Solution[]> {
    const provider = this.providers.get(this.config.defaultProvider);
    if (!provider) {
      throw new Error(`Provider ${this.config.defaultProvider} not registered`);
    }

    return provider.generateSolutions(task, context || '');
  }

  /**
   * Assess risks for a task
   */
  async assessRisks(task: Task): Promise<RiskAssessment> {
    const provider = this.providers.get(this.config.defaultProvider);
    if (!provider) {
      throw new Error(`Provider ${this.config.defaultProvider} not registered`);
    }

    return provider.assessRisks(task);
  }

  /**
   * Identify automation opportunities
   */
  async identifyAutomation(task: Task): Promise<AutomationOpportunity[]> {
    const provider = this.providers.get(this.config.defaultProvider);
    if (!provider) {
      throw new Error(`Provider ${this.config.defaultProvider} not registered`);
    }

    return provider.identifyAutomation(task);
  }

  /**
   * Multi-provider analysis (combine results from multiple providers)
   */
  async analyzeWithMultipleProviders(task: Task): Promise<AIAnalysis> {
    if (!this.config.enableMultiProvider) {
      return this.analyzeTask(task);
    }

    const providers = Array.from(this.providers.keys());
    const analyses = await Promise.allSettled(
      providers.map((provider) => {
        const impl = this.providers.get(provider);
        return impl?.analyzeTask(task) || Promise.reject(new Error(`Provider ${provider} not found`));
      })
    );

    // Combine results (simplified - in production, use more sophisticated merging)
    const successful = analyses.filter((r) => r.status === 'fulfilled') as PromiseFulfilledResult<AIAnalysis>[];
    
    if (successful.length === 0) {
      throw new Error('All providers failed');
    }

    // Merge analyses (take first successful for now)
    // In production, implement intelligent merging logic
    return successful[0].value;
  }
}

// ============================================================================
// SINGLETON INSTANCE
// ============================================================================

let aiServiceInstance: AIService | null = null;

export function getAIService(config?: Partial<AIServiceConfig>): AIService {
  if (!aiServiceInstance) {
    aiServiceInstance = new AIService(config);
  }
  return aiServiceInstance;
}

