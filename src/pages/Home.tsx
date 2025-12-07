import React from 'react';
import { Link } from 'react-router-dom';
import { Sparkles, Rocket } from 'lucide-react';

const Home = () => {
  return (
    <div className="min-h-screen bg-gradient-to-br from-slate-900 via-indigo-900 to-purple-900 text-white flex items-center justify-center px-4">
      <div className="max-w-3xl text-center space-y-6">
        <div className="flex justify-center">
          <Sparkles className="w-12 h-12 text-purple-300 animate-pulse" />
        </div>
        <h1 className="text-4xl font-bold">Welcome to the DevOps Dashboard</h1>
        <p className="text-lg text-purple-100">
          Explore automation, observability, and delivery insights with a cohesive view into your platform.
        </p>
        <div className="flex items-center justify-center gap-4 flex-wrap">
          <Link
            to="/services/devops-dashboard"
            className="px-6 py-3 bg-gradient-to-r from-purple-500 to-pink-500 rounded-xl font-semibold text-white shadow-lg shadow-purple-500/40 hover:from-purple-600 hover:to-pink-600 transition"
          >
            Launch Dashboard
          </Link>
          <Link
            to="/services"
            className="px-6 py-3 border border-white/20 rounded-xl text-purple-100 hover:border-purple-300/60 hover:text-white transition flex items-center gap-2"
          >
            <Rocket className="w-5 h-5" />
            View Services
          </Link>
        </div>
      </div>
    </div>
  );
};

export default Home;
