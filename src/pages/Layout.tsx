import React from 'react';
import { NavLink, Outlet, useNavigate } from 'react-router-dom';
import { useAuth } from '../contexts/AuthContext';
import { LogOut, User } from 'lucide-react';

const Layout = () => {
  const { currentUser, logout } = useAuth();
  const navigate = useNavigate();
  const navLinkClasses = ({ isActive }: { isActive: boolean }) =>
    `px-3 py-2 rounded-md text-sm font-medium transition ${isActive ? 'bg-white/20 text-white' : 'text-purple-100 hover:text-white hover:bg-white/10'}`;

  const handleLogout = async () => {
    try {
      await logout();
      navigate('/');
    } catch (error) {
      console.error('Failed to log out:', error);
    }
  };

  return (
    <div className="min-h-screen bg-slate-950 text-white flex flex-col">
      <header className="border-b border-white/10 bg-black/30 backdrop-blur">
        <div className="max-w-6xl mx-auto px-4 py-4 flex items-center justify-between">
          <NavLink to="/" className="text-lg font-semibold text-purple-100 hover:text-white">
            GNK Continuum
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
            {currentUser ? (
              <>
                <div className="flex items-center gap-2 px-3 py-2 text-purple-100">
                  <User className="w-4 h-4" />
                  <span className="text-sm">{currentUser.displayName || currentUser.email}</span>
                </div>
                <button
                  onClick={handleLogout}
                  className="px-3 py-2 rounded-md text-sm font-medium transition text-purple-100 hover:text-white hover:bg-white/10 flex items-center gap-2"
                >
                  <LogOut className="w-4 h-4" />
                  Logout
                </button>
              </>
            ) : (
              <NavLink to="/login" className={navLinkClasses}>
                Login
              </NavLink>
            )}
          </nav>
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
