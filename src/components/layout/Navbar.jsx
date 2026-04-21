import { Link, useLocation } from 'react-router-dom';
import { motion } from 'framer-motion';
import { useAuth } from '../../hooks/useAuth';
import { Menu, X, Mail, User, LogOut, Settings, History } from 'lucide-react';
import { useState } from 'react';

export const Navbar = () => {
  const { user, isAuthenticated, logout } = useAuth();
  const location = useLocation();
  const [mobileMenuOpen, setMobileMenuOpen] = useState(false);

  const navLinks = isAuthenticated
    ? [
        { to: '/home', label: 'Home', icon: Mail },
        { to: '/history', label: 'History', icon: History },
        { to: '/settings', label: 'Settings', icon: Settings },
      ]
    : [];

  const isActive = (path) => location.pathname === path;

  return (
    <nav className="bg-surface-elevated border-b border-border sticky top-0 z-50">
      <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8">
        <div className="flex justify-between items-center h-16">
          {/* Logo */}
          <Link to={isAuthenticated ? "/home" : "/features"} className="flex items-center gap-3">
            <div className="w-10 h-10 bg-accent flex items-center justify-center">
              <Mail className="w-5 h-5 text-surface" />
            </div>
            <span className="font-semibold text-xl text-text-primary">
              Email Crafter
            </span>
          </Link>

          {/* Desktop Navigation */}
          <div className="hidden md:flex items-center gap-2">
            {navLinks.map((link) => {
              const Icon = link.icon;
              return (
                <Link
                  key={link.to}
                  to={link.to}
                  className={`
                    flex items-center gap-2 px-4 py-2 transition-all duration-200
                    ${isActive(link.to)
                      ? 'bg-surface text-accent font-medium'
                      : 'text-text-secondary hover:text-text-primary hover:bg-surface-elevated'
                    }
                  `}
                >
                  <Icon size={18} />
                  <span>{link.label}</span>
                </Link>
              );
            })}

            {isAuthenticated ? (
              <div className="flex items-center gap-4 ml-4 pl-4 border-l border-border">
                <div className="flex items-center gap-2 text-text-secondary">
                  <User size={18} />
                  <span className="text-sm">{user?.email}</span>
                </div>
                <button
                  onClick={logout}
                  className="flex items-center gap-2 text-text-secondary hover:text-error transition-colors"
                >
                  <LogOut size={18} />
                  <span className="text-sm">Logout</span>
                </button>
              </div>
            ) : (
              <div className="flex items-center gap-3">
                <Link
                  to="/login"
                  className="btn-ghost text-sm"
                >
                  Sign In
                </Link>
                <Link
                  to="/register"
                  className="btn-primary text-sm"
                >
                  Get Started
                </Link>
              </div>
            )}
          </div>

          {/* Mobile Menu Button */}
          <button
            onClick={() => setMobileMenuOpen(!mobileMenuOpen)}
            className="md:hidden p-2 text-text-secondary hover:text-text-primary"
          >
            {mobileMenuOpen ? <X size={24} /> : <Menu size={24} />}
          </button>
        </div>
      </div>

      {/* Mobile Menu */}
      {mobileMenuOpen && (
        <motion.div
          initial={{ opacity: 0, height: 0 }}
          animate={{ opacity: 1, height: 'auto' }}
          exit={{ opacity: 0, height: 0 }}
          className="md:hidden bg-surface-elevated border-t border-border"
        >
          <div className="px-4 py-4 space-y-2">
            {navLinks.map((link) => {
              const Icon = link.icon;
              return (
                <Link
                  key={link.to}
                  to={link.to}
                  onClick={() => setMobileMenuOpen(false)}
                  className={`
                    flex items-center gap-3 px-4 py-3 transition-all
                    ${isActive(link.to)
                      ? 'bg-surface text-accent font-medium'
                      : 'text-text-secondary hover:text-text-primary'
                    }
                  `}
                >
                  <Icon size={20} />
                  <span>{link.label}</span>
                </Link>
              );
            })}

            {isAuthenticated && (
              <>
                <div className="flex items-center gap-2 px-4 py-3 text-text-secondary">
                  <User size={20} className="flex-shrink-0" />
                  <span className="text-sm truncate">{user?.email}</span>
                </div>
                <button
                  onClick={() => {
                    logout();
                    setMobileMenuOpen(false);
                  }}
                  className="flex items-center gap-3 w-full px-4 py-3 text-error hover:bg-error-muted transition-all"
                >
                  <LogOut size={20} />
                  <span>Logout</span>
                </button>
              </>
            )}
          </div>
        </motion.div>
      )}
    </nav>
  );
};

export default Navbar;