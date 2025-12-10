import React from 'react';
import { Link } from 'react-router-dom';
import { Settings, Zap } from 'lucide-react';
import TaskPane from '../components/TaskPane';
import FuturisticAnimation from '../components/FuturisticAnimation';

const Home = () => {
  return (
    <div className="min-h-screen bg-gradient-to-br from-slate-900 via-indigo-900 to-purple-900 text-white flex flex-col items-center justify-center px-4 relative overflow-hidden">
      {/* Task Pane Component */}
      <TaskPane />
      
      {/* Futuristic Animation - Center */}
      <div className="absolute inset-0 flex items-center justify-center z-0">
        <div className="w-full max-w-2xl h-[500px] md:h-[600px]">
          <FuturisticAnimation />
        </div>
      </div>

      {/* Content Overlay */}
      <div className="relative z-10 max-w-4xl text-center space-y-8 mt-20">
        <div className="space-y-4">
          <h1 className="text-5xl md:text-6xl font-bold bg-gradient-to-r from-purple-300 via-pink-300 to-indigo-300 bg-clip-text text-transparent">
            GNK Continuum
          </h1>
          <p className="text-xl md:text-2xl text-purple-100/90 font-light">
            Intelligent task automation powered by AI
          </p>
          <p className="text-base md:text-lg text-purple-200/70 max-w-2xl mx-auto">
            Transform your business workflows with advanced AI analysis, automation insights, and human-AI collaboration
          </p>
        </div>
        
        <div className="flex items-center justify-center pt-6">
          <Link
            to="/task-hatch"
            className="group relative inline-flex items-center gap-3 px-8 py-4 bg-white/5 backdrop-blur-xl border border-white/10 rounded-full text-white font-medium text-base hover:bg-white/10 hover:border-white/20 transition-all duration-500 ease-out hover:shadow-[0_8px_30px_rgb(168,85,247,0.3)]"
          >
            <div className="flex items-center justify-center w-9 h-9 rounded-full bg-gradient-to-br from-purple-500/20 to-indigo-500/20 border border-white/10 group-hover:from-purple-500/30 group-hover:to-indigo-500/30 transition-all duration-500">
              <Settings className="w-4 h-4 text-purple-300 group-hover:text-purple-200 transition-colors" />
            </div>
            <span className="relative">Setup Your Task Environment</span>
            <Zap className="w-4 h-4 text-purple-300 opacity-0 group-hover:opacity-100 group-hover:translate-x-1 transition-all duration-500" />
          </Link>
        </div>
      </div>
    </div>
  );
};

export default Home;
