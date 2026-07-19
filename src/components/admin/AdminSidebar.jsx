import { NavLink } from 'react-router-dom';
import { motion } from 'framer-motion';
import {
  LayoutDashboard,
  Users,
  Mail,
  FileText,
  BarChart3,
  Shield,
  ArrowLeft,
} from 'lucide-react';

const adminNavItems = [
  { to: '/admin', label: 'Dashboard', icon: LayoutDashboard, end: true },
  { to: '/admin/users', label: 'Users', icon: Users },
  { to: '/admin/email-history', label: 'Email History', icon: Mail },
  { to: '/admin/requests', label: 'Request Logs', icon: FileText },
  { to: '/admin/stats', label: 'Statistics', icon: BarChart3 },
];

export const AdminSidebar = () => {
  return (
    <aside className="w-64 bg-surface-elevated border-r border-border min-h-screen sticky top-0 flex flex-col">
      {/* Header */}
      <div className="p-6 border-b border-border">
        <div className="flex items-center gap-3">
          <div className="w-10 h-10 rounded-xl bg-accent/10 flex items-center justify-center">
            <Shield className="w-5 h-5 text-accent" />
          </div>
          <div>
            <h2 className="font-semibold text-text-primary">Admin</h2>
            <p className="text-xs text-text-muted">Staff Panel</p>
          </div>
        </div>
      </div>

      {/* Navigation */}
      <nav className="flex-1 p-4 space-y-1">
        {adminNavItems.map((item) => (
          <NavLink
            key={item.to}
            to={item.to}
            end={item.end}
            className={({ isActive }) =>
              `flex items-center gap-3 px-4 py-3 rounded-xl transition-all duration-200 ${
                isActive
                  ? 'bg-accent text-white'
                  : 'text-text-secondary hover:bg-surface-card hover:text-text-primary'
              }`
            }
          >
            {({ isActive }) => (
              <>
                <item.icon className="w-5 h-5" />
                <span className="font-medium">{item.label}</span>
                {isActive && (
                  <motion.div
                    layoutId="admin-nav-indicator"
                    className="ml-auto w-1.5 h-1.5 rounded-full bg-white"
                  />
                )}
              </>
            )}
          </NavLink>
        ))}
      </nav>

      {/* Footer */}
      <div className="p-4 border-t border-border">
        <NavLink
          to="/home"
          className="flex items-center gap-3 px-4 py-3 rounded-xl text-text-secondary hover:bg-surface-card hover:text-text-primary transition-all duration-200"
        >
          <ArrowLeft className="w-5 h-5" />
          <span className="font-medium">Back to App</span>
        </NavLink>
      </div>
    </aside>
  );
};

export default AdminSidebar;