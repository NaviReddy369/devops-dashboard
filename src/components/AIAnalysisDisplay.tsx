/**
 * AI Analysis Display Component
 * Shows comprehensive AI analysis results
 */

import React from 'react';
import { AIAnalysis } from '../types';
import { 
  Brain, 
  Zap, 
  Network, 
  AlertTriangle, 
  CheckCircle, 
  ArrowRight,
  Clock,
  TrendingUp
} from 'lucide-react';

interface AIAnalysisDisplayProps {
  analysis: AIAnalysis;
}

const AIAnalysisDisplay: React.FC<AIAnalysisDisplayProps> = ({ analysis }) => {
  return (
    <div className="space-y-6">
      {/* Summary */}
      <div className="bg-white/5 border border-purple-300/20 rounded-xl p-6">
        <div className="flex items-center gap-3 mb-4">
          <Brain className="w-6 h-6 text-purple-300" />
          <h3 className="text-xl font-bold text-purple-100">AI Analysis Summary</h3>
        </div>
        <p className="text-purple-200 leading-relaxed">{analysis.summary}</p>
      </div>

      {/* Proposed Solutions */}
      {analysis.proposedSolutions.length > 0 && (
        <div className="bg-white/5 border border-purple-300/20 rounded-xl p-6">
          <h3 className="text-xl font-bold text-purple-100 mb-4 flex items-center gap-2">
            <CheckCircle className="w-5 h-5" />
            Proposed Solutions
          </h3>
          <div className="space-y-4">
            {analysis.proposedSolutions.map((solution) => (
              <div key={solution.id} className="bg-white/5 rounded-lg p-4 border border-purple-400/10">
                <h4 className="font-semibold text-purple-100 mb-2">{solution.title}</h4>
                <p className="text-purple-200 text-sm mb-3">{solution.description}</p>
                <div className="grid md:grid-cols-2 gap-4 text-sm">
                  <div>
                    <p className="text-purple-300 font-medium mb-1">Pros:</p>
                    <ul className="text-purple-200 space-y-1">
                      {solution.pros.map((pro, i) => (
                        <li key={i} className="flex items-start gap-2">
                          <span className="text-green-400 mt-1">✓</span>
                          <span>{pro}</span>
                        </li>
                      ))}
                    </ul>
                  </div>
                  {solution.cons.length > 0 && (
                    <div>
                      <p className="text-purple-300 font-medium mb-1">Cons:</p>
                      <ul className="text-purple-200 space-y-1">
                        {solution.cons.map((con, i) => (
                          <li key={i} className="flex items-start gap-2">
                            <span className="text-red-400 mt-1">✗</span>
                            <span>{con}</span>
                          </li>
                        ))}
                      </ul>
                    </div>
                  )}
                </div>
              </div>
            ))}
          </div>
        </div>
      )}

      {/* Automation Opportunities */}
      {analysis.automationOpportunities.length > 0 && (
        <div className="bg-white/5 border border-purple-300/20 rounded-xl p-6">
          <h3 className="text-xl font-bold text-purple-100 mb-4 flex items-center gap-2">
            <Zap className="w-5 h-5" />
            Automation Opportunities
          </h3>
          <div className="grid md:grid-cols-2 gap-4">
            {analysis.automationOpportunities.map((opp) => (
              <div key={opp.id} className="bg-white/5 rounded-lg p-4 border border-purple-400/10">
                <div className="flex items-start justify-between mb-2">
                  <h4 className="font-semibold text-purple-100">{opp.area}</h4>
                  <span className={`px-2 py-1 rounded text-xs ${
                    opp.complexity === 'low' ? 'bg-green-500/20 text-green-300' :
                    opp.complexity === 'medium' ? 'bg-yellow-500/20 text-yellow-300' :
                    'bg-red-500/20 text-red-300'
                  }`}>
                    {opp.complexity}
                  </span>
                </div>
                <p className="text-purple-200 text-sm mb-2">{opp.description}</p>
                <p className="text-purple-300 text-xs mb-2">
                  <TrendingUp className="w-3 h-3 inline mr-1" />
                  {opp.potentialSavings}
                </p>
                {opp.tools.length > 0 && (
                  <div className="flex flex-wrap gap-1 mt-2">
                    {opp.tools.map((tool, i) => (
                      <span key={i} className="px-2 py-1 bg-purple-500/20 text-purple-200 text-xs rounded">
                        {tool}
                      </span>
                    ))}
                  </div>
                )}
              </div>
            ))}
          </div>
        </div>
      )}

      {/* Implementation Plan */}
      {analysis.integrationSteps.length > 0 && (
        <div className="bg-white/5 border border-purple-300/20 rounded-xl p-6">
          <h3 className="text-xl font-bold text-purple-100 mb-4 flex items-center gap-2">
            <Network className="w-5 h-5" />
            Step-by-Step Implementation Plan
          </h3>
          <div className="space-y-4">
            {analysis.integrationSteps
              .sort((a, b) => a.order - b.order)
              .map((step) => (
                <div key={step.id} className="flex gap-4">
                  <div className="flex-shrink-0 w-10 h-10 rounded-full bg-gradient-to-br from-purple-500 to-indigo-500 flex items-center justify-center font-bold text-white">
                    {step.order}
                  </div>
                  <div className="flex-1 bg-white/5 rounded-lg p-4 border border-purple-400/10">
                    <h4 className="font-semibold text-purple-100 mb-2">{step.title}</h4>
                    <p className="text-purple-200 text-sm mb-2">{step.description}</p>
                    <div className="flex items-center gap-4 text-xs text-purple-300">
                      <span className="flex items-center gap-1">
                        <Clock className="w-3 h-3" />
                        {step.estimatedTime}
                      </span>
                      {step.prerequisites.length > 0 && (
                        <span>Dependencies: {step.prerequisites.join(', ')}</span>
                      )}
                    </div>
                  </div>
                </div>
              ))}
          </div>
        </div>
      )}

      {/* Risk Assessment */}
      {analysis.riskAssessment && (
        <div className="bg-white/5 border border-purple-300/20 rounded-xl p-6">
          <h3 className="text-xl font-bold text-purple-100 mb-4 flex items-center gap-2">
            <AlertTriangle className="w-5 h-5" />
            Risk Assessment
          </h3>
          <div className="mb-4">
            <span className={`px-3 py-1 rounded-full text-sm font-semibold ${
              analysis.riskAssessment.overallRisk === 'low' ? 'bg-green-500/20 text-green-300' :
              analysis.riskAssessment.overallRisk === 'moderate' ? 'bg-yellow-500/20 text-yellow-300' :
              'bg-red-500/20 text-red-300'
            }`}>
              Overall Risk: {analysis.riskAssessment.overallRisk.toUpperCase()}
            </span>
          </div>
          <div className="space-y-3">
            {analysis.riskAssessment.risks.map((risk) => (
              <div key={risk.id} className="bg-white/5 rounded-lg p-4 border border-purple-400/10">
                <div className="flex items-start justify-between mb-2">
                  <p className="text-purple-200 text-sm flex-1">{risk.description}</p>
                  <div className="flex gap-2 ml-4">
                    <span className={`px-2 py-1 rounded text-xs ${
                      risk.severity === 'low' ? 'bg-green-500/20 text-green-300' :
                      risk.severity === 'medium' ? 'bg-yellow-500/20 text-yellow-300' :
                      'bg-red-500/20 text-red-300'
                    }`}>
                      {risk.severity}
                    </span>
                  </div>
                </div>
                <p className="text-purple-300 text-xs">Impact: {risk.impact}</p>
              </div>
            ))}
          </div>
        </div>
      )}

      {/* AI Workflows */}
      {analysis.automationOpportunities.some(opp => opp.automationType === 'workflow') && (
        <div className="bg-white/5 border border-purple-300/20 rounded-xl p-6">
          <h3 className="text-xl font-bold text-purple-100 mb-4">AI Workflows</h3>
          <p className="text-purple-200 text-sm">
            Workflow automation opportunities identified in the automation section above.
          </p>
        </div>
      )}

      {/* Metadata */}
      <div className="bg-white/5 border border-purple-300/20 rounded-xl p-4 text-xs text-purple-300">
        <div className="flex items-center justify-between">
          <span>Analysis by {analysis.aiProvider} ({analysis.model})</span>
          <span>Confidence: {analysis.confidence}%</span>
        </div>
      </div>
    </div>
  );
};

export default AIAnalysisDisplay;

