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
        userId: currentUser.uid,
        userEmail: currentUser.email,
        userName: currentUser.displayName || 'Anonymous',
        status: 'pending',
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

      // Reset success message after 5 seconds
      setTimeout(() => setSuccess(false), 5000);
    } catch (err: any) {
      setError(err.message || 'Failed to submit task. Please try again.');
    } finally {
      setLoading(false);
    }
  };

  return (
    <div className="min-h-screen bg-gradient-to-br from-slate-900 via-indigo-900 to-purple-900 text-white px-4 py-12">
      <div className="max-w-4xl mx-auto">
        {/* Header */}
        <div className="text-center mb-8">
          <div className="flex items-center justify-center gap-3 mb-4">
            <Brain className="w-12 h-12 text-purple-300 animate-pulse" />
            <h1 className="text-4xl font-bold bg-gradient-to-r from-purple-300 via-pink-300 to-purple-300 bg-clip-text text-transparent">
              Neural Task Gateway
            </h1>
            <Sparkles className="w-12 h-12 text-pink-300 animate-pulse" />
          </div>
          <p className="text-purple-200 text-lg">
            Submit intelligent task requests to our AI-powered workflow orchestrator
          </p>
        </div>

        {/* Form Card */}
        <div className="bg-white/10 backdrop-blur-lg rounded-2xl p-8 border border-purple-300/30 shadow-2xl">
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
              <label className="block text-purple-200 mb-2 font-medium">
                Task Title <span className="text-red-400">*</span>
              </label>
              <input
                type="text"
                value={formData.title}
                onChange={(e) => setFormData({ ...formData, title: e.target.value })}
                required
                className="w-full px-4 py-3 rounded-xl bg-white/5 border border-purple-300/30 focus:border-purple-400 focus:outline-none text-white placeholder-purple-300/50"
                placeholder="Enter a clear, descriptive task title"
              />
            </div>

            {/* Description */}
            <div>
              <label className="block text-purple-200 mb-2 font-medium">
                Task Description <span className="text-red-400">*</span>
              </label>
              <textarea
                value={formData.description}
                onChange={(e) => setFormData({ ...formData, description: e.target.value })}
                required
                rows={6}
                className="w-full px-4 py-3 rounded-xl bg-white/5 border border-purple-300/30 focus:border-purple-400 focus:outline-none text-white placeholder-purple-300/50 resize-none"
                placeholder="Provide detailed information about the task, requirements, and expected outcomes..."
              />
            </div>

            {/* Priority and Category Row */}
            <div className="grid grid-cols-1 md:grid-cols-2 gap-6">
              {/* Priority */}
              <div>
                <label className="block text-purple-200 mb-2 font-medium">Priority Level</label>
                <select
                  value={formData.priority}
                  onChange={(e) => setFormData({ ...formData, priority: e.target.value as TaskFormData['priority'] })}
                  className="w-full px-4 py-3 rounded-xl bg-white/5 border border-purple-300/30 focus:border-purple-400 focus:outline-none text-white"
                >
                  <option value="low" className="bg-slate-800">Low</option>
                  <option value="medium" className="bg-slate-800">Medium</option>
                  <option value="high" className="bg-slate-800">High</option>
                  <option value="critical" className="bg-slate-800">Critical</option>
                </select>
              </div>

              {/* Category */}
              <div>
                <label className="block text-purple-200 mb-2 font-medium">Category</label>
                <input
                  type="text"
                  value={formData.category}
                  onChange={(e) => setFormData({ ...formData, category: e.target.value })}
                  className="w-full px-4 py-3 rounded-xl bg-white/5 border border-purple-300/30 focus:border-purple-400 focus:outline-none text-white placeholder-purple-300/50"
                  placeholder="e.g., Development, Design, Analysis"
                />
              </div>
            </div>

            {/* Estimated Hours */}
            <div>
              <label className="block text-purple-200 mb-2 font-medium">Estimated Hours (Optional)</label>
              <input
                type="number"
                min="1"
                value={formData.estimatedHours}
                onChange={(e) => setFormData({ ...formData, estimatedHours: e.target.value })}
                className="w-full px-4 py-3 rounded-xl bg-white/5 border border-purple-300/30 focus:border-purple-400 focus:outline-none text-white placeholder-purple-300/50"
                placeholder="Estimated time to complete (hours)"
              />
            </div>

            {/* Submit Button */}
            <button
              type="submit"
              disabled={loading || !currentUser}
              className="w-full py-4 bg-gradient-to-r from-purple-500 to-pink-500 rounded-xl font-semibold text-lg hover:from-purple-600 hover:to-pink-600 transition-all shadow-lg shadow-purple-500/50 disabled:opacity-50 disabled:cursor-not-allowed flex items-center justify-center gap-2"
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
        <div className="mt-8 bg-white/5 backdrop-blur-lg rounded-xl p-6 border border-purple-300/20">
          <h3 className="text-xl font-semibold mb-3 text-purple-200">How it works</h3>
          <ul className="space-y-2 text-purple-100 text-sm">
            <li className="flex items-start gap-2">
              <span className="text-purple-300 mt-1">•</span>
              <span>Your task is automatically queued in our AI-powered workflow system</span>
            </li>
            <li className="flex items-start gap-2">
              <span className="text-purple-300 mt-1">•</span>
              <span>Tasks are prioritized and assigned based on urgency and resource availability</span>
            </li>
            <li className="flex items-start gap-2">
              <span className="text-purple-300 mt-1">•</span>
              <span>You'll receive updates as your task progresses through the neural processing pipeline</span>
            </li>
          </ul>
        </div>
      </div>
    </div>
  );
};

export default NeuralTaskGateway;

