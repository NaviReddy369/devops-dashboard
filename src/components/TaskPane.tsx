import React, { useState, useRef, useEffect } from 'react';
import { NavLink, useNavigate } from 'react-router-dom';
import { useAuth } from '../contexts/AuthContext';
import {
  Home,
  Zap,
  Network,
  LayoutDashboard,
  Info,
  Mail,
  LogIn,
  LogOut,
  User,
  ChevronRight,
  UserCircle2,
} from 'lucide-react';

interface MenuItem {
  path: string;
  label: string;
  icon: React.ReactNode;
  end?: boolean;
}

const TaskPane = () => {
  const [isOpen, setIsOpen] = useState(false);
  const [isHovered, setIsHovered] = useState(false);
  const { currentUser, logout } = useAuth();
  const navigate = useNavigate();
  const menuRef = useRef<HTMLDivElement>(null);
  const profilePath = '/tasker-profile';

  const menuItems: MenuItem[] = [
    { path: '/', label: 'Home', icon: <Home className="w-5 h-5" />, end: true },
    { path: '/task-hatch', label: 'TaskHatch', icon: <Zap className="w-5 h-5" /> },
    { path: '/neural-task-gateway', label: 'Neural Gateway', icon: <Network className="w-5 h-5" /> },
    { path: '/task-dashboard', label: 'Task Dashboard', icon: <LayoutDashboard className="w-5 h-5" /> },
    ...(currentUser
      ? [
          {
            path: profilePath,
            label: 'Tasker Profile',
            icon: <UserCircle2 className="w-5 h-5" />,
          },
        ]
      : []),
    { path: '/about', label: 'About', icon: <Info className="w-5 h-5" /> },
    { path: '/contact', label: 'Contact', icon: <Mail className="w-5 h-5" /> },
  ];

  const handleLogout = async () => {
    try {
      await logout();
      setIsOpen(false);
      navigate('/');
    } catch (error) {
      console.error('Failed to log out:', error);
    }
  };

  const handleItemClick = () => {
    setIsOpen(false);
    setIsHovered(false);
  };

  const handleProfileNavigate = () => {
    navigate(profilePath);
    setIsOpen(false);
    setIsHovered(false);
  };

  // Close menu when clicking outside
  useEffect(() => {
    const handleClickOutside = (event: MouseEvent) => {
      if (menuRef.current && !menuRef.current.contains(event.target as Node)) {
        setIsOpen(false);
        setIsHovered(false);
      }
    };

    if (isOpen || isHovered) {
      document.addEventListener('mousedown', handleClickOutside);
    }

    return () => {
      document.removeEventListener('mousedown', handleClickOutside);
    };
  }, [isOpen, isHovered]);

  // Prevent body scroll when menu is open on mobile
  useEffect(() => {
    if (isOpen) {
      document.body.style.overflow = 'hidden';
    } else {
      document.body.style.overflow = 'unset';
    }
    return () => {
      document.body.style.overflow = 'unset';
    };
  }, [isOpen]);

  const navLinkClasses = ({ isActive }: { isActive: boolean }) =>
    `group flex items-center gap-3 px-4 py-3 rounded-lg text-sm font-medium transition-all duration-200 ${
      isActive
        ? 'bg-gradient-to-r from-purple-500/20 to-indigo-500/20 text-white border-l-4 border-purple-400 shadow-lg shadow-purple-500/20'
        : 'text-purple-100 hover:bg-white/10 hover:text-white hover:translate-x-1'
    }`;

  return (
    <div 
      ref={menuRef}
      className="fixed top-4 right-4 z-50 md:top-6 md:right-6"
      onMouseEnter={() => setIsHovered(true)}
      onMouseLeave={() => setIsHovered(false)}
    >
      {/* Task Pane Button */}
      <button
        onClick={() => setIsOpen(!isOpen)}
        className={`
          relative flex items-center justify-center w-12 h-12
          bg-gradient-to-r from-purple-600/90 via-indigo-600/90 to-purple-600/90
          backdrop-blur-xl border border-purple-400/30
          rounded-xl shadow-2xl shadow-purple-500/30
          text-white
          transition-all duration-300 ease-out
          hover:scale-105 hover:shadow-purple-500/50
          active:scale-95
          ${isOpen || isHovered ? 'ring-2 ring-purple-400/50 ring-offset-2 ring-offset-slate-900' : ''}
        `}
        aria-label="Task Pane"
        aria-expanded={isOpen}
      >
        <div className="relative w-5 h-5 flex items-center justify-center">
          <span
            className={`
              absolute w-5 h-0.5 bg-white rounded-full
              transition-all duration-300 ease-out
              ${isOpen ? 'rotate-45 translate-y-0' : '-translate-y-1.5'}
            `}
          />
          <span
            className={`
              absolute w-5 h-0.5 bg-white rounded-full
              transition-all duration-300 ease-out
              ${isOpen ? 'opacity-0' : 'opacity-100'}
            `}
          />
          <span
            className={`
              absolute w-5 h-0.5 bg-white rounded-full
              transition-all duration-300 ease-out
              ${isOpen ? '-rotate-45 translate-y-0' : 'translate-y-1.5'}
            `}
          />
        </div>
      </button>

      {/* Menu Dropdown */}
      {(isOpen || isHovered) && (
        <div
          className={`
            absolute top-full right-0 mt-3
            w-72 md:w-80
            bg-gradient-to-br from-slate-900/95 via-indigo-900/95 to-purple-900/95
            backdrop-blur-2xl border border-purple-400/20
            rounded-2xl shadow-2xl shadow-purple-900/50
            overflow-hidden
            transition-all duration-300 ease-out
            ${isOpen || isHovered ? 'opacity-100 translate-y-0 scale-100 task-pane-menu' : 'opacity-0 -translate-y-2 scale-95'}
          `}
        >
          {/* Decorative gradient overlay */}
          <div className="absolute inset-0 bg-gradient-to-br from-purple-500/10 via-transparent to-indigo-500/10 pointer-events-none" />
          
          {/* Animated border glow */}
          <div className="absolute inset-0 rounded-2xl bg-gradient-to-r from-purple-500/20 via-indigo-500/20 to-purple-500/20 opacity-0 hover:opacity-100 transition-opacity duration-500 blur-xl" />

          <div className="relative p-2 max-h-[85vh] overflow-y-auto custom-scrollbar">
            {/* Header */}
            <div className="px-4 py-3 mb-2 border-b border-purple-400/20">
              <h3 className="text-lg font-bold bg-gradient-to-r from-purple-300 to-indigo-300 bg-clip-text text-transparent">
                Navigation Menu
              </h3>
              <p className="text-xs text-purple-200/70 mt-1">Quick access to all features</p>
            </div>

            {/* Menu Items */}
            <nav className="space-y-1">
              {menuItems.map((item) => (
                <NavLink
                  key={item.path}
                  to={item.path}
                  end={item.end}
                  className={navLinkClasses}
                  onClick={handleItemClick}
                >
                  <span className="flex-shrink-0">{item.icon}</span>
                  <span className="flex-1">{item.label}</span>
                  <ChevronRight className="w-4 h-4 opacity-0 group-hover:opacity-100 transition-opacity" />
                </NavLink>
              ))}
            </nav>

            {/* Divider */}
            <div className="my-3 border-t border-purple-400/20" />

            {/* User Section */}
            {currentUser ? (
              <div className="space-y-1">
                <div className="px-4 py-3 rounded-lg bg-white/5 border border-purple-400/10">
                  <div className="flex items-center gap-3">
                    <button
                      onClick={handleProfileNavigate}
                      className="w-10 h-10 rounded-full bg-gradient-to-br from-purple-400 to-indigo-400 flex items-center justify-center shadow-lg flex-shrink-0 focus:outline-none focus:ring-2 focus:ring-purple-300/60"
                      aria-label="View profile"
                    >
                      <User className="w-5 h-5 text-white" />
                    </button>
                    <div className="flex-1 min-w-0">
                      <p className="text-sm font-medium text-white truncate">
                        {currentUser.displayName || currentUser.email?.split('@')[0] || 'User'}
                      </p>
                      {currentUser.email && (
                        <p className="text-xs text-purple-200/70 truncate">
                          {currentUser.email}
                        </p>
                      )}
                    </div>
                    <button
                      onClick={handleProfileNavigate}
                      className="text-xs text-purple-100 hover:text-white underline underline-offset-4 transition"
                    >
                      View
                    </button>
                  </div>
                </div>
                <button
                  onClick={handleLogout}
                  className="w-full flex items-center justify-center gap-3 px-4 py-3 rounded-lg text-sm font-medium text-purple-100 hover:bg-red-500/20 hover:text-red-300 transition-all duration-200"
                >
                  <LogOut className="w-5 h-5" />
                  <span>Logout</span>
                </button>
              </div>
            ) : (
              <NavLink
                to="/login"
                className={navLinkClasses}
                onClick={handleItemClick}
              >
                <LogIn className="w-5 h-5" />
                <span>Login</span>
                <ChevronRight className="w-4 h-4 opacity-0 group-hover:opacity-100 transition-opacity" />
              </NavLink>
            )}
          </div>

          {/* Bottom gradient fade */}
          <div className="absolute bottom-0 left-0 right-0 h-8 bg-gradient-to-t from-slate-900/95 to-transparent pointer-events-none" />
        </div>
      )}
    </div>
  );
};

export default TaskPane;

