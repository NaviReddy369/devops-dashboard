/**
 * OpenAI Provider Implementation
 * Handles task analysis using OpenAI API
 */

import { Task, AIAnalysis, Solution, IntegrationStep, RiskAssessment, AutomationOpportunity } from '../../../types';

interface OpenAIResponse {
  breakdown: string;
  automationOpportunities: Array<{
    area: string;
    description: string;
    automationType: string;
    potentialSavings: string;
    complexity: string;
    tools: string[];
  }>;
  businessIntegration: string;
  aiWorkflows: Array<{
    name: string;
    description: string;
    steps: string[];
  }>;
  implementationPlan: Array<{
    step: number;
    title: string;
    description: string;
    estimatedTime: string;
    dependencies: string[];
  }>;
  riskAssessment: {
    overallRisk: 'low' | 'moderate' | 'high';
    risks: Array<{
      description: string;
      severity: string;
      likelihood: string;
      impact: string;
    }>;
    mitigations: Array<{
      risk: string;
      strategy: string;
      steps: string[];
    }>;
  };
}

export class OpenAIProvider {
  private apiKey: string;
  private baseURL = 'https://api.openai.com/v1';

  constructor(apiKey?: string) {
    this.apiKey = apiKey || process.env.REACT_APP_OPENAI_API_KEY || '';
    if (!this.apiKey) {
      console.warn('OpenAI API key not found. AI analysis will not work.');
    }
  }

  /**
   * Analyze a task and generate comprehensive AI analysis
   */
  async analyzeTask(task: Task): Promise<AIAnalysis> {
    if (!this.apiKey) {
      throw new Error('OpenAI API key is not configured');
    }

    const startTime = Date.now();
    const prompt = this.buildPrompt(task);

    try {
      const response = await fetch(`${this.baseURL}/chat/completions`, {
        method: 'POST',
        headers: {
          'Content-Type': 'application/json',
          'Authorization': `Bearer ${this.apiKey}`,
        },
        body: JSON.stringify({
          model: 'gpt-4-turbo-preview',
          messages: [
            {
              role: 'system',
              content: 'You are an expert AI consultant specializing in business automation, AI integration, and workflow optimization. Provide detailed, actionable analysis in JSON format.',
            },
            {
              role: 'user',
              content: prompt,
            },
          ],
          response_format: { type: 'json_object' },
          temperature: 0.7,
          max_tokens: 4000,
        }),
      });

      if (!response.ok) {
        const error = await response.json();
        throw new Error(error.error?.message || 'OpenAI API request failed');
      }

      const data = await response.json();
      const content = JSON.parse(data.choices[0].message.content);
      const processingTime = Date.now() - startTime;

      return this.parseResponse(content, task.id, processingTime, data.usage);
    } catch (error) {
      console.error('OpenAI analysis error:', error);
      throw error;
    }
  }

  /**
   * Build the prompt for task analysis
   */
  private buildPrompt(task: Task): string {
    return `Analyze the following task and provide a comprehensive breakdown:

TASK DETAILS:
Title: ${task.title}
Summary: ${task.summary}
Requirements: ${task.requirements}
Acceptance Criteria: ${task.acceptanceCriteria}
Category: ${task.category}
Priority: ${task.priority}
Urgency: ${task.urgency}
Risk Level: ${task.riskLevel}
Environment: ${task.environment}
${task.dependencies ? `Dependencies: ${task.dependencies}` : ''}
${task.repoUrl ? `Repository: ${task.repoUrl}` : ''}

Please provide a JSON response with the following structure:
{
  "breakdown": "A comprehensive breakdown of the task, its objectives, and key components",
  "automationOpportunities": [
    {
      "area": "Area name (e.g., data-processing, notifications, reporting)",
      "description": "Detailed description of the automation opportunity",
      "automationType": "script|workflow|api-integration|ml-model",
      "potentialSavings": "Estimated time/cost savings",
      "complexity": "low|medium|high",
      "tools": ["tool1", "tool2"]
    }
  ],
  "businessIntegration": "How this task integrates with existing business models, processes, and systems",
  "aiWorkflows": [
    {
      "name": "Workflow name",
      "description": "Description of the AI workflow",
      "steps": ["step1", "step2", "step3"]
    }
  ],
  "implementationPlan": [
    {
      "step": 1,
      "title": "Step title",
      "description": "Detailed description",
      "estimatedTime": "e.g., 2-4 hours",
      "dependencies": ["dependency1", "dependency2"]
    }
  ],
  "riskAssessment": {
    "overallRisk": "low|moderate|high",
    "risks": [
      {
        "description": "Risk description",
        "severity": "low|medium|high",
        "likelihood": "low|medium|high",
        "impact": "Impact description"
      }
    ],
    "mitigations": [
      {
        "risk": "Risk description",
        "strategy": "Mitigation strategy",
        "steps": ["step1", "step2"]
      }
    ]
  }
}`;
  }

  /**
   * Parse OpenAI response into AIAnalysis format
   */
  private parseResponse(
    content: OpenAIResponse,
    taskId: string,
    processingTime: number,
    usage: { prompt_tokens: number; completion_tokens: number; total_tokens: number }
  ): AIAnalysis {
    // Generate IDs for solutions
    const solutions: Solution[] = [
      {
        id: `sol-${Date.now()}-1`,
        title: 'Primary Solution',
        description: content.breakdown,
        approach: content.businessIntegration,
        pros: ['Comprehensive analysis', 'Business-aligned approach'],
        cons: [],
        estimatedEffort: 'medium' as const,
        estimatedHours: null,
        recommended: true,
        dependencies: [],
      },
    ];

    // Parse integration steps
    const integrationSteps: IntegrationStep[] = content.implementationPlan.map((plan, index) => ({
      id: `step-${Date.now()}-${index}`,
      order: plan.step,
      title: plan.title,
      description: plan.description,
      tools: [],
      estimatedTime: plan.estimatedTime,
      prerequisites: plan.dependencies,
    }));

    // Parse automation opportunities
    const automationOpportunities: AutomationOpportunity[] = content.automationOpportunities.map((opp, index) => ({
      id: `auto-${Date.now()}-${index}`,
      area: opp.area,
      description: opp.description,
      automationType: opp.automationType as AutomationOpportunity['automationType'],
      potentialSavings: opp.potentialSavings,
      complexity: opp.complexity as AutomationOpportunity['complexity'],
      tools: opp.tools,
    }));

    // Parse risk assessment
    const riskAssessment: RiskAssessment = {
      overallRisk: content.riskAssessment.overallRisk,
      risks: content.riskAssessment.risks.map((risk, index) => ({
        id: `risk-${Date.now()}-${index}`,
        description: risk.description,
        severity: risk.severity as 'low' | 'medium' | 'high',
        likelihood: risk.likelihood as 'low' | 'medium' | 'high',
        impact: risk.impact,
      })),
      mitigations: content.riskAssessment.mitigations.map((mit, index) => ({
        id: `mit-${Date.now()}-${index}`,
        riskId: `risk-${Date.now()}-${index}`,
        strategy: mit.strategy,
        steps: mit.steps,
      })),
    };

    // Calculate cost estimate (rough estimate: $0.01 per 1K tokens for GPT-4)
    const cost = (usage.total_tokens / 1000) * 0.01;

    return {
      id: `analysis-${Date.now()}`,
      taskId,
      summary: content.breakdown,
      proposedSolutions: solutions,
      integrationSteps,
      riskAssessment,
      automationOpportunities,
      aiProvider: 'openai',
      model: 'gpt-4-turbo-preview',
      analysisVersion: 1,
      confidence: 85,
      processingTime,
      tokensUsed: usage.total_tokens,
      cost,
      status: 'completed',
      createdAt: new Date() as any,
      completedAt: new Date() as any,
    };
  }
}

