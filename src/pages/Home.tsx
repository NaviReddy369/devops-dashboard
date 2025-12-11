import React, { useState, useEffect } from 'react';
import { Link, useNavigate } from 'react-router-dom';
import { Settings, Zap, UserCircle, ArrowRight, Target, Users, Brain, Sparkles, TrendingUp, CheckCircle2, Link2 } from 'lucide-react';
import FuturisticAnimation from '../components/FuturisticAnimation';
import { useAuth } from '../contexts/AuthContext';
import { getTaskerProfileByUserId } from '../api/taskerProfiles';
import { TaskerProfile } from '../types';

const Home = () => {
  const { currentUser } = useAuth();
  const navigate = useNavigate();
  const [profile, setProfile] = useState<TaskerProfile | null>(null);
  const [loadingProfile, setLoadingProfile] = useState(false);

  useEffect(() => {
    const loadProfile = async () => {
      if (currentUser) {
        try {
          setLoadingProfile(true);
          const data = await getTaskerProfileByUserId(currentUser.uid);
          setProfile(data);
        } catch (error) {
          console.error('Error loading profile:', error);
        } finally {
          setLoadingProfile(false);
        }
      }
    };

    loadProfile();
  }, [currentUser]);

  const completionPercentage = profile?.completionPercentage || 0;
  const hasProfile = !!profile;

  return (
    <div className="min-h-screen bg-gradient-to-br from-slate-950 via-indigo-950 to-purple-950 text-white relative overflow-hidden">
      {/* Animated background */}
      <div className="fixed inset-0 opacity-20 pointer-events-none">
        <div className="absolute top-0 left-0 w-96 h-96 bg-purple-500 rounded-full blur-3xl animate-pulse" />
        <div className="absolute bottom-0 right-0 w-96 h-96 bg-indigo-500 rounded-full blur-3xl animate-pulse" style={{ animationDelay: '1s' }} />
        <div className="absolute top-1/2 left-1/2 w-96 h-96 bg-pink-500 rounded-full blur-3xl animate-pulse" style={{ animationDelay: '2s' }} />
      </div>

      <div className="relative z-10 max-w-7xl mx-auto px-4 py-12 md:py-20">
        {/* Hero Section */}
        <div className="text-center mb-8 md:mb-10">
          <div className="flex items-center justify-center gap-4 mb-6">
            <Sparkles className="w-10 h-10 md:w-12 md:h-12 text-purple-400 animate-pulse" />
            <h1 className="text-5xl md:text-6xl lg:text-7xl font-bold bg-gradient-to-r from-purple-300 via-pink-300 to-indigo-300 bg-clip-text text-transparent">
              GNK Continuum
            </h1>
            <Sparkles className="w-10 h-10 md:w-12 md:h-12 text-pink-400 animate-pulse" />
          </div>
          <p className="text-xl md:text-2xl text-purple-100/90 font-light mb-4">
            Intelligent Task Automation Powered by AI
          </p>
          <p className="text-base md:text-lg text-purple-200/70 max-w-3xl mx-auto">
            Connect with skilled professionals, automate workflows, and transform your business through intelligent task management
          </p>
        </div>

        {/* How It Works Section */}
        <div className="mb-8 md:mb-12">
          <h2 className="text-3xl md:text-4xl font-bold text-center mb-8 md:mb-10 bg-gradient-to-r from-purple-300 to-pink-300 bg-clip-text text-transparent">
            How It Works
          </h2>
          
          {/* Central Animation - Below "How It Works" heading */}
          <div className="flex items-center justify-center mb-8 md:mb-12">
            <div className="w-full max-w-2xl h-[250px] md:h-[350px]">
              <FuturisticAnimation />
            </div>
          </div>
          <div className="grid md:grid-cols-3 gap-6 md:gap-8">
            {/* Step 1: Create Profile */}
            <div className="group relative bg-gradient-to-br from-purple-900/30 via-indigo-900/30 to-purple-900/30 backdrop-blur-xl border border-purple-500/20 rounded-2xl p-6 md:p-8 hover:border-purple-400/40 transition-all duration-500 hover:shadow-[0_8px_40px_rgb(168,85,247,0.3)]">
              <div className="absolute -top-4 -right-4 w-12 h-12 rounded-full bg-gradient-to-br from-purple-500 to-indigo-500 flex items-center justify-center text-2xl font-bold shadow-lg">
                1
              </div>
              <div className="mb-4">
                <UserCircle className="w-12 h-12 text-purple-400 mb-4" />
                <h3 className="text-xl font-semibold mb-2">Create Your Profile</h3>
                <p className="text-purple-200/70 text-sm md:text-base leading-relaxed">
                  Build your Tasker profile using <strong className="text-purple-300">TaskerMeta</strong>. Showcase your skills, experience, and specialties. The more complete your profile, the better you'll be matched with relevant tasks.
                </p>
              </div>
              <div className="flex items-center text-purple-300 text-sm font-medium group-hover:text-purple-200 transition-colors">
                <Link2 className="w-4 h-4 mr-2" />
                <span>Get Discovered</span>
              </div>
            </div>

            {/* Step 2: Submit Tasks */}
            <div className="group relative bg-gradient-to-br from-indigo-900/30 via-purple-900/30 to-pink-900/30 backdrop-blur-xl border border-indigo-500/20 rounded-2xl p-6 md:p-8 hover:border-indigo-400/40 transition-all duration-500 hover:shadow-[0_8px_40px_rgb(139,92,246,0.3)]">
              <div className="absolute -top-4 -right-4 w-12 h-12 rounded-full bg-gradient-to-br from-indigo-500 to-pink-500 flex items-center justify-center text-2xl font-bold shadow-lg">
                2
              </div>
              <div className="mb-4">
                <Target className="w-12 h-12 text-indigo-400 mb-4" />
                <h3 className="text-xl font-semibold mb-2">Submit Tasks</h3>
                <p className="text-purple-200/70 text-sm md:text-base leading-relaxed">
                  Use <strong className="text-indigo-300">TaskHatch</strong> to submit your tasks publicly. Describe what you need, and our AI will analyze and categorize your requirements.
                </p>
              </div>
              <div className="flex items-center text-indigo-300 text-sm font-medium group-hover:text-indigo-200 transition-colors">
                <Link2 className="w-4 h-4 mr-2" />
                <span>All Tasks Are Public</span>
              </div>
            </div>

            {/* Step 3: Match & Connect */}
            <div className="group relative bg-gradient-to-br from-pink-900/30 via-purple-900/30 to-indigo-900/30 backdrop-blur-xl border border-pink-500/20 rounded-2xl p-6 md:p-8 hover:border-pink-400/40 transition-all duration-500 hover:shadow-[0_8px_40px_rgb(236,72,153,0.3)]">
              <div className="absolute -top-4 -right-4 w-12 h-12 rounded-full bg-gradient-to-br from-pink-500 to-purple-500 flex items-center justify-center text-2xl font-bold shadow-lg">
                3
              </div>
              <div className="mb-4">
                <Brain className="w-12 h-12 text-pink-400 mb-4" />
                <h3 className="text-xl font-semibold mb-2">Match & Connect</h3>
                <p className="text-purple-200/70 text-sm md:text-base leading-relaxed">
                  In the <strong className="text-pink-300">Neural Gateway</strong>, view tasks and see matched Taskers based on skills and expertise. View profiles and send connection requests to collaborate.
                </p>
              </div>
              <div className="flex items-center text-pink-300 text-sm font-medium group-hover:text-pink-200 transition-colors">
                <Link2 className="w-4 h-4 mr-2" />
                <span>Smart Matching</span>
              </div>
            </div>
          </div>
        </div>

        {/* Why Create Profile Section */}
        <div className="mb-16 md:mb-20 bg-gradient-to-r from-purple-900/40 via-indigo-900/40 to-purple-900/40 backdrop-blur-xl border border-purple-500/30 rounded-3xl p-8 md:p-12">
          <div className="flex items-start gap-4 mb-6">
            <div className="w-12 h-12 rounded-xl bg-gradient-to-br from-purple-500 to-indigo-500 flex items-center justify-center flex-shrink-0">
              <TrendingUp className="w-6 h-6 text-white" />
            </div>
            <div>
              <h3 className="text-2xl md:text-3xl font-bold mb-3 bg-gradient-to-r from-purple-300 to-pink-300 bg-clip-text text-transparent">
                Why Create Your Tasker Profile?
              </h3>
              <p className="text-purple-200/80 text-base md:text-lg mb-6">
                Your Tasker profile is your gateway to connecting with task creators and building your professional network.
              </p>
              <ul className="space-y-3">
                <li className="flex items-start gap-3">
                  <CheckCircle2 className="w-5 h-5 text-green-400 flex-shrink-0 mt-0.5" />
                  <span className="text-purple-200/90">
                    <strong className="text-purple-300">Get Matched:</strong> Tasks from TaskHatch are matched with Taskers based on skills, category, and expertise
                  </span>
                </li>
                <li className="flex items-start gap-3">
                  <CheckCircle2 className="w-5 h-5 text-green-400 flex-shrink-0 mt-0.5" />
                  <span className="text-purple-200/90">
                    <strong className="text-purple-300">Visibility:</strong> Your profile appears in Neural Gateway when your skills match submitted tasks
                  </span>
                </li>
                <li className="flex items-start gap-3">
                  <CheckCircle2 className="w-5 h-5 text-green-400 flex-shrink-0 mt-0.5" />
                  <span className="text-purple-200/90">
                    <strong className="text-purple-300">Connect:</strong> Task creators can view your profile and send connection requests to collaborate
                  </span>
                </li>
                <li className="flex items-start gap-3">
                  <CheckCircle2 className="w-5 h-5 text-green-400 flex-shrink-0 mt-0.5" />
                  <span className="text-purple-200/90">
                    <strong className="text-purple-300">Build Portfolio:</strong> Showcase your work, achievements, and skills to potential collaborators
                  </span>
                </li>
              </ul>
            </div>
          </div>
        </div>

        {/* Action Buttons */}
        <div className="flex flex-col items-center gap-4">
          {/* Profile Completion Button (shown if user is logged in and has profile) */}
          {currentUser && !loadingProfile && hasProfile && (
            <button
              onClick={() => navigate('/tasker-meta')}
              className="group relative inline-flex items-center gap-4 px-8 py-5 bg-gradient-to-r from-purple-600/20 via-indigo-600/20 to-pink-600/20 backdrop-blur-xl border-2 border-purple-500/30 rounded-2xl text-white font-medium text-base hover:from-purple-600/30 hover:via-indigo-600/30 hover:to-pink-600/30 hover:border-purple-400/50 transition-all duration-500 ease-out hover:shadow-[0_8px_40px_rgb(168,85,247,0.4)] hover:scale-[1.02] min-w-[320px] max-w-md w-full md:w-auto"
            >
              {/* Circular Progress Indicator */}
              <div className="relative flex-shrink-0">
                <svg className="w-16 h-16 transform -rotate-90" viewBox="0 0 64 64">
                  <circle
                    cx="32"
                    cy="32"
                    r="28"
                    fill="none"
                    stroke="rgba(255,255,255,0.1)"
                    strokeWidth="4"
                  />
                  <circle
                    cx="32"
                    cy="32"
                    r="28"
                    fill="none"
                    stroke="url(#gradient)"
                    strokeWidth="4"
                    strokeLinecap="round"
                    strokeDasharray={`${2 * Math.PI * 28}`}
                    strokeDashoffset={`${2 * Math.PI * 28 * (1 - completionPercentage / 100)}`}
                    className="transition-all duration-1000 ease-out"
                  />
                  <defs>
                    <linearGradient id="gradient" x1="0%" y1="0%" x2="100%" y2="100%">
                      <stop offset="0%" stopColor="#a855f7" />
                      <stop offset="50%" stopColor="#8b5cf6" />
                      <stop offset="100%" stopColor="#ec4899" />
                    </linearGradient>
                  </defs>
                </svg>
                <div className="absolute inset-0 flex items-center justify-center">
                  <span className="text-xl font-bold bg-gradient-to-r from-purple-300 to-pink-300 bg-clip-text text-transparent">
                    {completionPercentage}%
                  </span>
                </div>
              </div>

              <div className="flex-1 text-left">
                <div className="flex items-center gap-2 mb-1">
                  <UserCircle className="w-5 h-5 text-purple-300" />
                  <span className="text-lg font-semibold">Profile Status</span>
                </div>
                <p className="text-sm text-purple-200/70">
                  {completionPercentage < 100 
                    ? `${100 - completionPercentage}% remaining to complete`
                    : 'Profile completed!'
                  }
                </p>
              </div>

              <ArrowRight className="w-5 h-5 text-purple-300 opacity-0 group-hover:opacity-100 group-hover:translate-x-1 transition-all duration-500 flex-shrink-0" />
            </button>
          )}

          {/* Create Profile Button (shown if user is logged in but no profile) */}
          {currentUser && !loadingProfile && !hasProfile && (
            <button
              onClick={() => navigate('/tasker-meta')}
              className="group relative inline-flex items-center gap-3 px-8 py-4 bg-gradient-to-r from-purple-600/20 to-indigo-600/20 backdrop-blur-xl border-2 border-purple-500/30 rounded-2xl text-white font-medium text-base hover:from-purple-600/30 hover:to-indigo-600/30 hover:border-purple-400/50 transition-all duration-500 ease-out hover:shadow-[0_8px_40px_rgb(168,85,247,0.4)] hover:scale-[1.02]"
            >
              <div className="flex items-center justify-center w-10 h-10 rounded-full bg-gradient-to-br from-purple-500/30 to-indigo-500/30 border border-white/10 group-hover:from-purple-500/40 group-hover:to-indigo-500/40 transition-all duration-500">
                <UserCircle className="w-5 h-5 text-purple-300" />
              </div>
              <span className="relative">Create Your Tasker Profile</span>
              <ArrowRight className="w-4 h-4 text-purple-300 opacity-0 group-hover:opacity-100 group-hover:translate-x-1 transition-all duration-500" />
            </button>
          )}

          {/* Task Environment Button */}
          <Link
            to="/task-hatch"
            className="group relative inline-flex items-center gap-3 px-8 py-4 bg-white/5 backdrop-blur-xl border border-white/10 rounded-full text-white font-medium text-base hover:bg-white/10 hover:border-white/20 transition-all duration-500 ease-out hover:shadow-[0_8px_30px_rgb(168,85,247,0.3)]"
          >
            <div className="flex items-center justify-center w-9 h-9 rounded-full bg-gradient-to-br from-purple-500/20 to-indigo-500/20 border border-white/10 group-hover:from-purple-500/30 group-hover:to-indigo-500/30 transition-all duration-500">
              <Settings className="w-4 h-4 text-purple-300 group-hover:text-purple-200 transition-colors" />
            </div>
            <span className="relative">Submit a Task with TaskHatch</span>
            <Zap className="w-4 h-4 text-purple-300 opacity-0 group-hover:opacity-100 group-hover:translate-x-1 transition-all duration-500" />
          </Link>
        </div>
      </div>
    </div>
  );
};

export default Home;
