import React from 'react';
import { NavLink, Outlet, useLocation } from 'react-router-dom';
import TaskPane from '../components/TaskPane';

const Layout = () => {
  const location = useLocation();
  const isHomePage = location.pathname === '/';

  return (
    <div className="min-h-screen bg-slate-950 text-white flex flex-col">
      <header className="border-b border-white/10 bg-black/30 backdrop-blur">
        <div className="max-w-6xl mx-auto px-4 py-4 flex items-center justify-between">
          <NavLink to="/" className="flex items-center gap-3 text-lg font-semibold text-purple-100 hover:text-white transition">
            <img 
              src="/logo192.png" 
              alt="GNK Continuum Logo" 
              className="w-8 h-8 object-contain"
            />
            <span>GNK Continuum</span>
          </NavLink>
          
          {/* Task Pane - Show on all pages except home (home has its own) */}
          {!isHomePage && <TaskPane />}
        </div>
      </header>

      <main className="flex-1">
        <Outlet />
      </main>

      <footer className="border-t border-white/10 bg-black/30 backdrop-blur">
        <div className="max-w-6xl mx-auto px-4 py-4 text-sm text-purple-200">
          © {new Date().getFullYear()} GNK Continuum
        </div>
      </footer>
    </div>
  );
};

export default Layout;
