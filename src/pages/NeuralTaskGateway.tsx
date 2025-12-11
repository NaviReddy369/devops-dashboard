import React, { useState } from 'react';
import { useAuth } from '../contexts/AuthContext';
import { collection, addDoc, serverTimestamp } from 'firebase/firestore';
import { db } from '../firebase';
import { Brain, Send, AlertCircle, CheckCircle, Sparkles } from 'lucide-react';

interface TaskFormData {
  title: string;
  description: string;
  priority: 'low' | 'medium' | 'high' | 'critical';
  category: string;
  estimatedHours: string;
}

const NeuralTaskGateway = () => {
  const { currentUser } = useAuth();
  const [formData, setFormData] = useState<TaskFormData>({
    title: '',
    description: '',
    priority: 'medium',
    category: '',
    estimatedHours: ''
  });
  const [loading, setLoading] = useState(false);
  const [error, setError] = useState('');
  const [success, setSuccess] = useState(false);

  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault();
    
    if (!currentUser) {
      setError('You must be logged in to submit tasks');
      return;
    }

    if (!formData.title || !formData.description) {
      setError('Please fill in all required fields');
      return;
    }

    try {
      setError('');
      setLoading(true);
      setSuccess(false);

      await addDoc(collection(db, 'neuralTasks'), {
        title: formData.title,
        description: formData.description,
        priority: formData.priority,
        category: formData.category || 'general',
        estimatedHours: formData.estimatedHours ? parseInt(formData.estimatedHours) : null,
        requesterId: currentUser.uid,
        requesterEmail: currentUser.email,
        requesterName: currentUser.displayName || 'Anonymous',
        assignedAssistantId: null,
        assignmentMethod: null,
        assignmentReason: null,
        status: 'pending',
        rejectionReason: null,
        messages: [],
        lastActivityAt: serverTimestamp(),
        taskId: null,
        createdAt: serverTimestamp(),
        updatedAt: serverTimestamp()
      });

      setSuccess(true);
      setFormData({
        title: '',
        description: '',
        priority: 'medium',
        category: '',
        estimatedHours: ''
      });

      setTimeout(() => setSuccess(false), 5000);
    } catch (err: any) {
      setError(err.message || 'Failed to submit task. Please try again.');
    } finally {
      setLoading(false);
    }
  };

  return (
    <div className="min-h-screen bg-gradient-to-br from-slate-950 via-indigo-950 to-purple-950 text-white relative overflow-hidden">
      {/* Animated background */}
      <div className="fixed inset-0 opacity-20 pointer-events-none">
        <div className="absolute top-0 left-0 w-96 h-96 bg-purple-500 rounded-full blur-3xl animate-pulse" />
        <div className="absolute bottom-0 right-0 w-96 h-96 bg-indigo-500 rounded-full blur-3xl animate-pulse" style={{ animationDelay: '1s' }} />
        <div className="absolute top-1/2 left-1/2 w-96 h-96 bg-pink-500 rounded-full blur-3xl animate-pulse" style={{ animationDelay: '2s' }} />
      </div>

      <div className="relative z-10 max-w-4xl mx-auto px-4 py-12 md:py-16">
        {/* Header */}
        <div className="text-center mb-12">
          <div className="flex items-center justify-center gap-4 mb-6">
            <Brain className="w-12 h-12 text-purple-400 animate-pulse" />
            <h1 className="text-4xl md:text-5xl lg:text-6xl font-bold bg-gradient-to-r from-purple-300 via-pink-300 to-indigo-300 bg-clip-text text-transparent">
              Neural Task Gateway
            </h1>
            <Sparkles className="w-12 h-12 text-pink-400 animate-pulse" />
          </div>
          <p className="text-lg md:text-xl text-purple-200/80 max-w-2xl mx-auto">
            Submit intelligent task requests to our AI-powered workflow orchestrator
          </p>
        </div>

        {/* Form Card */}
        <div className="bg-gradient-to-br from-purple-900/30 via-indigo-900/30 to-purple-900/30 backdrop-blur-xl border border-purple-500/30 rounded-3xl p-8 md:p-10 shadow-2xl">
          {error && (
            <div className="mb-6 p-4 bg-red-500/20 border border-red-500/50 rounded-xl flex items-center gap-3 text-red-200">
              <AlertCircle className="w-5 h-5 flex-shrink-0" />
              <span>{error}</span>
            </div>
          )}

          {success && (
            <div className="mb-6 p-4 bg-green-500/20 border border-green-500/50 rounded-xl flex items-center gap-3 text-green-200">
              <CheckCircle className="w-5 h-5 flex-shrink-0" />
              <span>Task submitted successfully! Your request has been queued for processing.</span>
            </div>
          )}

          <form onSubmit={handleSubmit} className="space-y-6">
            {/* Task Title */}
            <div>
              <label className="block text-purple-200 mb-2 font-semibold">
                Task Title <span className="text-red-400">*</span>
              </label>
              <input
                type="text"
                value={formData.title}
                onChange={(e) => setFormData({ ...formData, title: e.target.value })}
                required
                className="w-full px-4 py-3 rounded-xl bg-white/5 border border-purple-300/30 focus:border-purple-400 focus:outline-none focus:ring-2 focus:ring-purple-500/50 text-white placeholder-purple-300/50 transition-all"
                placeholder="Enter a clear, descriptive task title"
              />
            </div>

            {/* Description */}
            <div>
              <label className="block text-purple-200 mb-2 font-semibold">
                Task Description <span className="text-red-400">*</span>
              </label>
              <textarea
                value={formData.description}
                onChange={(e) => setFormData({ ...formData, description: e.target.value })}
                required
                rows={6}
                className="w-full px-4 py-3 rounded-xl bg-white/5 border border-purple-300/30 focus:border-purple-400 focus:outline-none focus:ring-2 focus:ring-purple-500/50 text-white placeholder-purple-300/50 resize-none transition-all"
                placeholder="Provide detailed information about the task, requirements, and expected outcomes..."
              />
            </div>

            {/* Priority and Category Row */}
            <div className="grid grid-cols-1 md:grid-cols-2 gap-6">
              {/* Priority */}
              <div>
                <label className="block text-purple-200 mb-2 font-semibold">Priority Level</label>
                <select
                  value={formData.priority}
                  onChange={(e) => setFormData({ ...formData, priority: e.target.value as TaskFormData['priority'] })}
                  className="w-full px-4 py-3 rounded-xl bg-white/5 border border-purple-300/30 focus:border-purple-400 focus:outline-none focus:ring-2 focus:ring-purple-500/50 text-white transition-all"
                >
                  <option value="low" className="bg-slate-900">Low</option>
                  <option value="medium" className="bg-slate-900">Medium</option>
                  <option value="high" className="bg-slate-900">High</option>
                  <option value="critical" className="bg-slate-900">Critical</option>
                </select>
              </div>

              {/* Category */}
              <div>
                <label className="block text-purple-200 mb-2 font-semibold">Category</label>
                <input
                  type="text"
                  value={formData.category}
                  onChange={(e) => setFormData({ ...formData, category: e.target.value })}
                  className="w-full px-4 py-3 rounded-xl bg-white/5 border border-purple-300/30 focus:border-purple-400 focus:outline-none focus:ring-2 focus:ring-purple-500/50 text-white placeholder-purple-300/50 transition-all"
                  placeholder="e.g., Development, Design, Analysis"
                />
              </div>
            </div>

            {/* Estimated Hours */}
            <div>
              <label className="block text-purple-200 mb-2 font-semibold">Estimated Hours (Optional)</label>
              <input
                type="number"
                min="1"
                value={formData.estimatedHours}
                onChange={(e) => setFormData({ ...formData, estimatedHours: e.target.value })}
                className="w-full px-4 py-3 rounded-xl bg-white/5 border border-purple-300/30 focus:border-purple-400 focus:outline-none focus:ring-2 focus:ring-purple-500/50 text-white placeholder-purple-300/50 transition-all"
                placeholder="Estimated time to complete (hours)"
              />
            </div>

            {/* Submit Button */}
            <button
              type="submit"
              disabled={loading || !currentUser}
              className="w-full py-4 bg-gradient-to-r from-purple-500 to-pink-500 rounded-xl font-semibold text-lg hover:from-purple-600 hover:to-pink-600 transition-all shadow-lg shadow-purple-500/50 disabled:opacity-50 disabled:cursor-not-allowed flex items-center justify-center gap-2 hover:scale-[1.02]"
            >
              {loading ? (
                <>
                  <div className="w-5 h-5 border-2 border-white border-t-transparent rounded-full animate-spin"></div>
                  <span>Submitting...</span>
                </>
              ) : (
                <>
                  <Send className="w-5 h-5" />
                  <span>Submit to Neural Gateway</span>
                </>
              )}
            </button>

            {!currentUser && (
              <p className="text-center text-purple-300 text-sm">
                Please <a href="/login" className="text-purple-200 hover:text-white underline">log in</a> to submit tasks
              </p>
            )}
          </form>
        </div>

        {/* Info Section */}
        <div className="mt-8 bg-gradient-to-br from-indigo-900/30 via-purple-900/30 to-indigo-900/30 backdrop-blur-xl border border-indigo-500/30 rounded-2xl p-6 md:p-8">
          <h3 className="text-xl md:text-2xl font-semibold mb-4 text-purple-200">How it works</h3>
          <ul className="space-y-3 text-purple-200/90 text-sm md:text-base">
            <li className="flex items-start gap-3">
              <CheckCircle className="w-5 h-5 text-green-400 flex-shrink-0 mt-0.5" />
              <span>Your task is automatically queued in our AI-powered workflow system</span>
            </li>
            <li className="flex items-start gap-3">
              <CheckCircle className="w-5 h-5 text-green-400 flex-shrink-0 mt-0.5" />
              <span>Tasks are prioritized and assigned based on urgency and resource availability</span>
            </li>
            <li className="flex items-start gap-3">
              <CheckCircle className="w-5 h-5 text-green-400 flex-shrink-0 mt-0.5" />
              <span>You'll receive updates as your task progresses through the neural processing pipeline</span>
            </li>
          </ul>
        </div>
      </div>
    </div>
  );
};

export default NeuralTaskGateway;
