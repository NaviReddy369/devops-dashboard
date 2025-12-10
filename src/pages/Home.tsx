import React from 'react';
import { Link } from 'react-router-dom';
import { Rocket } from 'lucide-react';
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
        
        <div className="flex items-center justify-center gap-4 flex-wrap pt-4">
          <Link
            to="/task-hatch"
            className="px-8 py-4 bg-gradient-to-r from-purple-600 to-indigo-600 rounded-xl text-white font-semibold hover:from-purple-700 hover:to-indigo-700 transition-all duration-300 flex items-center gap-2 shadow-lg shadow-purple-500/30 hover:shadow-purple-500/50 hover:scale-105"
          >
            <Rocket className="w-5 h-5" />
            Get Started
          </Link>
          <Link
            to="/services"
            className="px-8 py-4 border-2 border-purple-400/50 rounded-xl text-purple-100 font-semibold hover:border-purple-300 hover:text-white hover:bg-purple-500/10 transition-all duration-300"
          >
            Explore Services
          </Link>
        </div>
      </div>
    </div>
  );
};

export default Home;
