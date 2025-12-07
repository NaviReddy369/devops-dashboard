import React from 'react';
import { NavLink, Outlet } from 'react-router-dom';

const Layout = () => {
  const navLinkClasses = ({ isActive }: { isActive: boolean }) =>
    `px-3 py-2 rounded-md text-sm font-medium transition ${isActive ? 'bg-white/20 text-white' : 'text-purple-100 hover:text-white hover:bg-white/10'}`;

  return (
    <div className="min-h-screen bg-slate-950 text-white flex flex-col">
      <header className="border-b border-white/10 bg-black/30 backdrop-blur">
        <div className="max-w-6xl mx-auto px-4 py-4 flex items-center justify-between">
          <NavLink to="/" className="text-lg font-semibold text-purple-100 hover:text-white">
            DevOps Dashboard
          </NavLink>
          <nav className="flex items-center gap-2">
            <NavLink to="/" className={navLinkClasses} end>
              Home
            </NavLink>
            <NavLink to="/services" className={navLinkClasses}>
              Services
            </NavLink>
            <NavLink to="/about" className={navLinkClasses}>
              About
            </NavLink>
            <NavLink to="/contact" className={navLinkClasses}>
              Contact
            </NavLink>
          </nav>
        </div>
      </header>

      <main className="flex-1">
        <Outlet />
      </main>

      <footer className="border-t border-white/10 bg-black/30 backdrop-blur">
        <div className="max-w-6xl mx-auto px-4 py-4 text-sm text-purple-200">
          © {new Date().getFullYear()} DevOps Dashboard
        </div>
      </footer>
    </div>
  );
};

export default Layout;
