import { useEffect, useState } from 'react';
import { motion } from 'framer-motion';
import {
  Users,
  Mail,
  Activity,
} from 'lucide-react';
import { adminAPI } from '../../lib/api';
import { StatChart } from '../../components/admin/StatChart';
import { toast } from 'sonner';

const StatCard = ({ icon: Icon, label, value, sublabel, delay = 0 }) => (
  <motion.div
    initial={{ opacity: 0, y: 20 }}
    animate={{ opacity: 1, y: 0 }}
    transition={{ delay }}
    className="bg-surface-card border border-border rounded-2xl p-6 hover:border-accent/50 transition-colors"
  >
    <div className="flex items-start justify-between">
      <div>
        <p className="text-sm text-text-muted font-medium">{label}</p>
        <p className="text-3xl font-bold text-text-primary mt-2">{value}</p>
        {sublabel && (
          <p className="text-xs text-text-muted mt-1">{sublabel}</p>
        )}
      </div>
      <div className="w-12 h-12 rounded-xl bg-accent/10 flex items-center justify-center">
        <Icon className="w-6 h-6 text-accent" />
      </div>
    </div>
  </motion.div>
);

export const AdminDashboardPage = () => {
  const [stats, setStats] = useState(null);
  const [emailStats, setEmailStats] = useState([]);
  const [loading, setLoading] = useState(true);

  useEffect(() => {
    const fetchDashboardData = async () => {
      try {
        const [statsRes, emailRes] = await Promise.all([
          adminAPI.stats.overview(),
          adminAPI.stats.emails({ days: 14 }),
        ]);
        setStats(statsRes.data);
        setEmailStats(emailRes.data);
      } catch (error) {
        toast.error('Failed to load dashboard data');
      } finally {
        setLoading(false);
      }
    };

    fetchDashboardData();
  }, []);

  if (loading) {
    return (
      <div className="space-y-6">
        <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-6">
          {[1, 2, 3].map((i) => (
            <div key={i} className="bg-surface-card border border-border rounded-2xl p-6 animate-pulse">
              <div className="h-4 w-24 bg-surface-elevated rounded mb-4" />
              <div className="h-8 w-16 bg-surface-elevated rounded" />
            </div>
          ))}
        </div>
        <div className="grid grid-cols-1 lg:grid-cols-2 gap-6">
          <div className="bg-surface-card border border-border rounded-2xl p-6 h-80 animate-pulse" />
          <div className="bg-surface-card border border-border rounded-2xl p-6 h-80 animate-pulse" />
        </div>
      </div>
    );
  }

  return (
    <div className="space-y-8">
      {/* Header */}
      <div>
        <h1 className="text-2xl font-bold text-text-primary">Dashboard</h1>
        <p className="text-text-muted mt-1">Overview of system activity</p>
      </div>

      {/* Stats Cards */}
      <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-6">
        <StatCard
          icon={Users}
          label="Total Users"
          value={stats?.total_users || 0}
          sublabel={`${stats?.active_users || 0} active`}
          delay={0}
        />
        <StatCard
          icon={Mail}
          label="Emails Sent Today"
          value={stats?.today_emails || 0}
          sublabel="Last 24 hours"
          delay={0.1}
        />
        <StatCard
          icon={Activity}
          label="System Status"
          value="Healthy"
          sublabel="All systems operational"
          delay={0.2}
        />
      </div>

      {/* Charts */}
      <div className="grid grid-cols-1 lg:grid-cols-2 gap-6">
        <StatChart
          type="line"
          data={emailStats.map((d) => ({
            date: d.date,
            value: (d.success_count || 0) + (d.failure_count || 0),
          }))}
          dataKey="value"
          title="Email Volume (Last 14 Days)"
        />
        <StatChart
          type="line"
          data={emailStats.map((d) => {
            const total = (d.success_count || 0) + (d.failure_count || 0);
            return {
              date: d.date,
              value: total > 0 ? ((d.success_count || 0) / total) * 100 : 0,
            };
          })}
          dataKey="value"
          title="Success Rate (%)"
        />
      </div>
    </div>
  );
};

export default AdminDashboardPage;