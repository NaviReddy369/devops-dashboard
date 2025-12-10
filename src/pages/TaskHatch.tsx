import React, { useMemo, useState } from 'react';
import { addDoc, collection, serverTimestamp, doc, getDoc } from 'firebase/firestore';
import { BrainCircuit, ClipboardList, Rocket, Shield, Target, Timer, Loader } from 'lucide-react';
import { db } from '../firebase';
import { useAuth } from '../contexts/AuthContext';
import { getAIAnalysisService } from '../services/ai/aiAnalysisService';
import AIAnalysisDisplay from '../components/AIAnalysisDisplay';
import { AIAnalysis, Task } from '../types';

type Priority = 'low' | 'medium' | 'high' | 'critical';
type Urgency = 'immediate' | '24h' | 'this-week' | 'flexible';
type Risk = 'low' | 'moderate' | 'high';
type Environment = 'development' | 'staging' | 'production' | 'sandbox';

interface TaskHatchForm {
  title: string;
  summary: string;
  requirements: string;
  acceptanceCriteria: string;
  priority: Priority;
  urgency: Urgency;
  category: string;
  impact: string;
  riskLevel: Risk;
  environment: Environment;
  repoUrl: string;
  dueDate: string;
  estimatedHours: string;
  dependencies: string;
  communicationChannel: string;
  dataSensitivity: 'public' | 'internal' | 'restricted';
  securityReview: boolean;
  blocked: boolean;
  tags: string;
}

const initialForm: TaskHatchForm = {
  title: '',
  summary: '',
  requirements: '',
  acceptanceCriteria: '',
  priority: 'medium',
  urgency: 'this-week',
  category: '',
  impact: 'team',
  riskLevel: 'moderate',
  environment: 'development',
  repoUrl: '',
  dueDate: '',
  estimatedHours: '',
  dependencies: '',
  communicationChannel: '',
  dataSensitivity: 'internal',
  securityReview: true,
  blocked: false,
  tags: ''
};

const TaskHatch = () => {
  const { currentUser } = useAuth();
  const [formData, setFormData] = useState<TaskHatchForm>(initialForm);
  const [loading, setLoading] = useState(false);
  const [analyzing, setAnalyzing] = useState(false);
  const [error, setError] = useState('');
  const [success, setSuccess] = useState(false);
  const [submittedTaskId, setSubmittedTaskId] = useState<string | null>(null);
  const [aiAnalysis, setAiAnalysis] = useState<AIAnalysis | null>(null);

  const readinessScore = useMemo(() => {
    const requiredFields = [
      formData.title,
      formData.summary,
      formData.requirements,
      formData.acceptanceCriteria,
      formData.category,
      formData.impact
    ];
    const baseScore = (requiredFields.filter(Boolean).length / requiredFields.length) * 80;
    const extras = [
      formData.repoUrl,
      formData.dependencies,
      formData.communicationChannel,
      formData.tags
    ].filter(Boolean).length * 5;
    return Math.min(100, Math.round(baseScore + extras));
  }, [formData]);

  const parsedTags = useMemo(
    () => formData.tags.split(',').map((tag) => tag.trim()).filter(Boolean),
    [formData.tags]
  );

  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault();
    if (!currentUser) {
      setError('Please log in to submit tasks.');
      return;
    }

    if (!formData.title || !formData.summary || !formData.requirements || !formData.acceptanceCriteria) {
      setError('Fill in all required fields marked with *.');
      return;
    }

    try {
      setError('');
      setSuccess(false);
      setLoading(true);
      setAiAnalysis(null);

      // Save task to Firestore
      const taskRef = await addDoc(collection(db, 'taskHatchSubmissions'), {
        title: formData.title,
        summary: formData.summary,
        requirements: formData.requirements,
        acceptanceCriteria: formData.acceptanceCriteria,
        priority: formData.priority,
        urgency: formData.urgency,
        category: formData.category || 'general',
        impact: formData.impact,
        riskLevel: formData.riskLevel,
        environment: formData.environment,
        repoUrl: formData.repoUrl,
        dueDate: formData.dueDate ? new Date(formData.dueDate) : null,
        estimatedHours: formData.estimatedHours ? Number(formData.estimatedHours) : null,
        dependencies: formData.dependencies,
        communicationChannel: formData.communicationChannel,
        dataSensitivity: formData.dataSensitivity,
        securityReview: formData.securityReview,
        blocked: formData.blocked,
        tags: parsedTags,
        readinessScore,
        status: 'intake',
        userId: currentUser.uid,
        userEmail: currentUser.email,
        userName: currentUser.displayName || 'Anonymous',
        createdAt: serverTimestamp(),
        updatedAt: serverTimestamp()
      });

      setSubmittedTaskId(taskRef.id);
      setSuccess(true);

      // Trigger AI Analysis
      setAnalyzing(true);
      try {
        const taskDoc = await getDoc(taskRef);
        const taskData = { id: taskRef.id, ...taskDoc.data() } as Task;
        
        const aiService = getAIAnalysisService();
        const analysis = await aiService.analyzeAndSave(taskData);
        
        setAiAnalysis(analysis);
      } catch (analysisError: any) {
        console.error('AI Analysis error:', analysisError);
        setError('Task saved but AI analysis failed: ' + (analysisError.message || 'Unknown error'));
      } finally {
        setAnalyzing(false);
      }

      setFormData(initialForm);
    } catch (err: any) {
      setError(err.message || 'Unable to submit task. Try again.');
    } finally {
      setLoading(false);
    }
  };

  const renderInput = (
    label: string,
    value: string,
    onChange: (val: string) => void,
    options?: { type?: string; required?: boolean; placeholder?: string }
  ) => (
    <div>
      <label className="block text-purple-100 mb-2 text-sm font-semibold">
        {label} {options?.required && <span className="text-red-400">*</span>}
      </label>
      <input
        type={options?.type || 'text'}
        value={value}
        onChange={(e) => onChange(e.target.value)}
        required={options?.required}
        placeholder={options?.placeholder}
        className="w-full px-4 py-3 rounded-xl bg-white/5 border border-purple-300/30 focus:border-purple-400 focus:outline-none text-white placeholder-purple-300/50"
      />
    </div>
  );

  if (!currentUser) {
    return (
      <div className="min-h-screen bg-gradient-to-br from-slate-900 via-indigo-900 to-purple-900 text-white flex items-center justify-center px-4">
        <div className="max-w-xl bg-white/10 p-8 rounded-2xl border border-purple-300/30 text-center">
          <Shield className="w-12 h-12 text-purple-300 mx-auto mb-4" />
          <h1 className="text-2xl font-bold mb-2">TaskHatch requires login</h1>
          <p className="text-purple-200 mb-4">
            Sign in to capture structured task submissions and track them in your dashboard.
          </p>
          <a
            href="/login"
            className="inline-block px-5 py-3 bg-purple-600 hover:bg-purple-700 rounded-lg font-semibold transition"
          >
            Go to Login
          </a>
        </div>
      </div>
    );
  }

  return (
    <div className="min-h-screen bg-gradient-to-br from-slate-950 via-purple-950 to-slate-900 text-white px-4 py-10">
      <div className="max-w-6xl mx-auto space-y-8">
        <header className="flex flex-col gap-3 md:flex-row md:items-center md:justify-between">
          <div className="flex items-center gap-3">
            <div className="p-3 bg-purple-500/20 rounded-2xl border border-purple-400/30">
              <BrainCircuit className="w-8 h-8 text-purple-200" />
            </div>
            <div>
              <h1 className="text-3xl font-bold">TaskHatch</h1>
              <p className="text-purple-200 text-sm">
                High-fidelity task intake that captures context, risk, and delivery signals.
              </p>
            </div>
          </div>
          <div className="flex items-center gap-3 bg-white/5 rounded-xl px-4 py-3 border border-purple-300/20">
            <Target className="w-5 h-5 text-green-300" />
            <div>
              <p className="text-xs text-purple-200 uppercase tracking-wide">Readiness</p>
              <p className="text-lg font-semibold text-green-200">{readinessScore}%</p>
            </div>
            <div className="flex-1 h-2 bg-white/10 rounded-full overflow-hidden w-32">
              <div
                className="h-full bg-gradient-to-r from-emerald-400 to-purple-500"
                style={{ width: `${readinessScore}%` }}
              />
            </div>
          </div>
        </header>

        <div className="grid lg:grid-cols-3 gap-6">
          <div className="lg:col-span-2 space-y-6">
            <form onSubmit={handleSubmit} className="space-y-6">
              <section className="bg-white/5 border border-purple-300/20 rounded-2xl p-6 space-y-6">
                <div className="flex items-center gap-2">
                  <ClipboardList className="w-5 h-5 text-purple-200" />
                  <h2 className="text-lg font-semibold">Task DNA</h2>
                </div>
                {renderInput('Title', formData.title, (val) => setFormData({ ...formData, title: val }), {
                  required: true,
                  placeholder: 'Launch customer onboarding automation'
                })}
                {renderInput('One-line summary', formData.summary, (val) => setFormData({ ...formData, summary: val }), {
                  required: true,
                  placeholder: 'Automate welcome email + workspace provisioning'
                })}
                <div>
                  <label className="block text-purple-100 mb-2 text-sm font-semibold">
                    Core requirements <span className="text-red-400">*</span>
                  </label>
                  <textarea
                    value={formData.requirements}
                    onChange={(e) => setFormData({ ...formData, requirements: e.target.value })}
                    required
                    rows={4}
                    className="w-full px-4 py-3 rounded-xl bg-white/5 border border-purple-300/30 focus:border-purple-400 focus:outline-none text-white placeholder-purple-300/50 resize-none"
                    placeholder="What needs to be built, edge cases, data sources, artifacts..."
                  />
                </div>
                <div>
                  <label className="block text-purple-100 mb-2 text-sm font-semibold">
                    Acceptance criteria <span className="text-red-400">*</span>
                  </label>
                  <textarea
                    value={formData.acceptanceCriteria}
                    onChange={(e) => setFormData({ ...formData, acceptanceCriteria: e.target.value })}
                    required
                    rows={3}
                    className="w-full px-4 py-3 rounded-xl bg-white/5 border border-purple-300/30 focus:border-purple-400 focus:outline-none text-white placeholder-purple-300/50 resize-none"
                    placeholder="Define done: tests, approvals, performance thresholds, rollout steps."
                  />
                </div>

                <div className="grid md:grid-cols-2 gap-4">
                  <div>
                    <label className="block text-purple-100 mb-2 text-sm font-semibold">Priority</label>
                    <select
                      value={formData.priority}
                      onChange={(e) =>
                        setFormData({ ...formData, priority: e.target.value as Priority })
                      }
                      className="w-full px-4 py-3 rounded-xl bg-white/5 border border-purple-300/30 focus:border-purple-400 focus:outline-none text-white"
                    >
                      <option value="low" className="bg-slate-900">Low</option>
                      <option value="medium" className="bg-slate-900">Medium</option>
                      <option value="high" className="bg-slate-900">High</option>
                      <option value="critical" className="bg-slate-900">Critical</option>
                    </select>
                  </div>
                  <div>
                    <label className="block text-purple-100 mb-2 text-sm font-semibold">Urgency</label>
                    <select
                      value={formData.urgency}
                      onChange={(e) =>
                        setFormData({ ...formData, urgency: e.target.value as Urgency })
                      }
                      className="w-full px-4 py-3 rounded-xl bg-white/5 border border-purple-300/30 focus:border-purple-400 focus:outline-none text-white"
                    >
                      <option value="immediate" className="bg-slate-900">Immediate</option>
                      <option value="24h" className="bg-slate-900">Next 24 hours</option>
                      <option value="this-week" className="bg-slate-900">This week</option>
                      <option value="flexible" className="bg-slate-900">Flexible</option>
                    </select>
                  </div>
                </div>

                <div className="grid md:grid-cols-3 gap-4">
                  {renderInput('Category', formData.category, (val) => setFormData({ ...formData, category: val }), {
                    placeholder: 'Feature, bug, ops, research',
                    required: true
                  })}
                  {renderInput('Impact surface', formData.impact, (val) => setFormData({ ...formData, impact: val }), {
                    placeholder: 'Customer, internal, compliance',
                    required: true
                  })}
                  <div>
                    <label className="block text-purple-100 mb-2 text-sm font-semibold">Environment</label>
                    <select
                      value={formData.environment}
                      onChange={(e) =>
                        setFormData({ ...formData, environment: e.target.value as Environment })
                      }
                      className="w-full px-4 py-3 rounded-xl bg-white/5 border border-purple-300/30 focus:border-purple-400 focus:outline-none text-white"
                    >
                      <option value="development" className="bg-slate-900">Development</option>
                      <option value="staging" className="bg-slate-900">Staging</option>
                      <option value="production" className="bg-slate-900">Production</option>
                      <option value="sandbox" className="bg-slate-900">Sandbox</option>
                    </select>
                  </div>
                </div>
              </section>

              <section className="bg-white/5 border border-purple-300/20 rounded-2xl p-6 space-y-6">
                <div className="flex items-center gap-2">
                  <Rocket className="w-5 h-5 text-purple-200" />
                  <h2 className="text-lg font-semibold">Execution signals</h2>
                </div>

                <div className="grid md:grid-cols-2 gap-4">
                  {renderInput('Due date', formData.dueDate, (val) => setFormData({ ...formData, dueDate: val }), {
                    type: 'date'
                  })}
                  {renderInput(
                    'Effort estimate (hrs)',
                    formData.estimatedHours,
                    (val) => setFormData({ ...formData, estimatedHours: val }),
                    { type: 'number', placeholder: 'e.g., 16' }
                  )}
                </div>

                <div className="grid md:grid-cols-2 gap-4">
                  {renderInput('Repository / spec URL', formData.repoUrl, (val) => setFormData({ ...formData, repoUrl: val }), {
                    placeholder: 'https://github.com/org/repo...'
                  })}
                  {renderInput('Comms channel', formData.communicationChannel, (val) => setFormData({ ...formData, communicationChannel: val }), {
                    placeholder: 'Slack channel, email, standup link'
                  })}
                </div>

                <div className="grid md:grid-cols-2 gap-4">
                  <div>
                    <label className="block text-purple-100 mb-2 text-sm font-semibold">Risk level</label>
                    <div className="grid grid-cols-3 gap-2">
                      {(['low', 'moderate', 'high'] as Risk[]).map((risk) => (
                        <button
                          key={risk}
                          type="button"
                          onClick={() => setFormData({ ...formData, riskLevel: risk })}
                          className={`px-3 py-2 rounded-lg border text-sm font-semibold transition ${
                            formData.riskLevel === risk
                              ? 'bg-purple-500/20 border-purple-300/60 text-purple-100'
                              : risk === 'high'
                              ? 'bg-red-500/10 border-red-400/40 text-red-200'
                              : risk === 'moderate'
                              ? 'bg-amber-500/10 border-amber-400/40 text-amber-100'
                              : 'bg-emerald-500/10 border-emerald-400/40 text-emerald-100'
                          }`}
                        >
                          {risk.charAt(0).toUpperCase() + risk.slice(1)}
                        </button>
                      ))}
                    </div>
                  </div>
                  <div>
                    <label className="block text-purple-100 mb-2 text-sm font-semibold">Data sensitivity</label>
                    <select
                      value={formData.dataSensitivity}
                      onChange={(e) =>
                        setFormData({
                          ...formData,
                          dataSensitivity: e.target.value as TaskHatchForm['dataSensitivity']
                        })
                      }
                      className="w-full px-4 py-3 rounded-xl bg-white/5 border border-purple-300/30 focus:border-purple-400 focus:outline-none text-white"
                    >
                      <option value="public" className="bg-slate-900">Public</option>
                      <option value="internal" className="bg-slate-900">Internal</option>
                      <option value="restricted" className="bg-slate-900">Restricted</option>
                    </select>
                  </div>
                </div>

                <div className="grid md:grid-cols-2 gap-4">
                  <div className="flex items-center gap-3 bg-white/5 border border-purple-300/20 rounded-xl p-4">
                    <Shield className="w-5 h-5 text-purple-200" />
                    <div className="flex-1">
                      <p className="text-sm font-semibold">Security review</p>
                      <p className="text-xs text-purple-200/80">Flag if security/privacy review is required.</p>
                    </div>
                    <label className="relative inline-flex items-center cursor-pointer">
                      <input
                        type="checkbox"
                        checked={formData.securityReview}
                        onChange={(e) => setFormData({ ...formData, securityReview: e.target.checked })}
                        className="sr-only peer"
                      />
                      <div className="w-11 h-6 bg-white/10 rounded-full peer peer-checked:bg-purple-500 transition-all"></div>
                      <span className="absolute left-1 top-1 w-4 h-4 bg-white rounded-full transition-all peer-checked:translate-x-5"></span>
                    </label>
                  </div>
                  <div className="flex items-center gap-3 bg-white/5 border border-purple-300/20 rounded-xl p-4">
                    <Timer className="w-5 h-5 text-purple-200" />
                    <div className="flex-1">
                      <p className="text-sm font-semibold">Blocked on external factors?</p>
                      <p className="text-xs text-purple-200/80">Dependencies, approvals, vendor SLAs.</p>
                    </div>
                    <label className="relative inline-flex items-center cursor-pointer">
                      <input
                        type="checkbox"
                        checked={formData.blocked}
                        onChange={(e) => setFormData({ ...formData, blocked: e.target.checked })}
                        className="sr-only peer"
                      />
                      <div className="w-11 h-6 bg-white/10 rounded-full peer peer-checked:bg-purple-500 transition-all"></div>
                      <span className="absolute left-1 top-1 w-4 h-4 bg-white rounded-full transition-all peer-checked:translate-x-5"></span>
                    </label>
                  </div>
                </div>

                <div>
                  <label className="block text-purple-100 mb-2 text-sm font-semibold">Dependencies and known risks</label>
                  <textarea
                    value={formData.dependencies}
                    onChange={(e) => setFormData({ ...formData, dependencies: e.target.value })}
                    rows={3}
                    className="w-full px-4 py-3 rounded-xl bg-white/5 border border-purple-300/30 focus:border-purple-400 focus:outline-none text-white placeholder-purple-300/50 resize-none"
                    placeholder="Systems impacted, upstream/downstream owners, migration concerns..."
                  />
                </div>

                <div>
                  <label className="block text-purple-100 mb-2 text-sm font-semibold">Tags</label>
                  <input
                    type="text"
                    value={formData.tags}
                    onChange={(e) => setFormData({ ...formData, tags: e.target.value })}
                    className="w-full px-4 py-3 rounded-xl bg-white/5 border border-purple-300/30 focus:border-purple-400 focus:outline-none text-white placeholder-purple-300/50"
                    placeholder="Comma separated: onboarding, api, infra"
                  />
                  {parsedTags.length > 0 && (
                    <div className="flex flex-wrap gap-2 mt-3">
                      {parsedTags.map((tag) => (
                        <span
                          key={tag}
                          className="px-3 py-1 rounded-full bg-purple-500/20 border border-purple-300/40 text-purple-100 text-xs"
                        >
                          {tag}
                        </span>
                      ))}
                    </div>
                  )}
                </div>

                <button
                  type="submit"
                  disabled={loading}
                  className="w-full py-4 rounded-xl bg-gradient-to-r from-purple-500 to-pink-500 font-semibold text-lg hover:from-purple-600 hover:to-pink-600 transition shadow-lg shadow-purple-500/30 disabled:opacity-60 flex items-center justify-center gap-2"
                >
                  {loading ? 'Submitting...' : 'Submit to TaskHatch'}
                </button>
              </section>
            </form>
          </div>

          <aside className="space-y-4">
            {error && (
              <div className="p-4 bg-red-500/20 border border-red-400/40 rounded-xl text-red-100 text-sm">
                {error}
              </div>
            )}
            {success && !analyzing && !aiAnalysis && (
              <div className="p-4 bg-green-500/20 border border-green-400/40 rounded-xl text-green-100 text-sm">
                Task captured. AI analysis is processing...
              </div>
            )}
            {analyzing && (
              <div className="p-4 bg-blue-500/20 border border-blue-400/40 rounded-xl text-blue-100 text-sm flex items-center gap-2">
                <Loader className="w-4 h-4 animate-spin" />
                <span>AI is analyzing your task. This may take a moment...</span>
              </div>
            )}

            <div className="bg-white/5 border border-purple-300/20 rounded-2xl p-5 space-y-3">
              <h3 className="font-semibold text-purple-100">Intake checklist</h3>
              <ul className="space-y-2 text-sm text-purple-200">
                <li>Clear objective and acceptance criteria defined.</li>
                <li>Links to repo/specs and owners included.</li>
                <li>Risks and dependencies acknowledged.</li>
                <li>Environment and data sensitivity declared.</li>
              </ul>
            </div>

            <div className="bg-white/5 border border-purple-300/20 rounded-2xl p-5 space-y-3">
              <h3 className="font-semibold text-purple-100">Fast-lane tips</h3>
              <div className="space-y-2 text-sm text-purple-200">
                <p>- Add rollout/rollback notes inside acceptance criteria.</p>
                <p>- Provide Slack/Teams channel for live coordination.</p>
                <p>- Note any required reviewers to unblock earlier.</p>
              </div>
            </div>
          </aside>
        </div>

        {/* AI Analysis Results */}
        {aiAnalysis && (
          <div className="mt-8">
            <div className="bg-white/5 border border-purple-300/20 rounded-2xl p-6">
              <div className="flex items-center gap-3 mb-6">
                <BrainCircuit className="w-8 h-8 text-purple-300" />
                <h2 className="text-2xl font-bold text-purple-100">AI Analysis Complete</h2>
              </div>
              <AIAnalysisDisplay analysis={aiAnalysis} />
            </div>
          </div>
        )}
      </div>
    </div>
  );
};

export default TaskHatch;
