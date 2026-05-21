import { useState, useEffect } from 'react';
import { motion } from 'framer-motion';
import {
  Users,
  Mail,
  Send,
  Trophy,
  TrendingUp,
} from 'lucide-react';
import { adminAPI } from '../../lib/api';
import { StatChart } from '../../components/admin/StatChart';
import { toast } from 'sonner';

const tabs = [
  { id: 'overview', label: 'Overview', icon: TrendingUp },
  { id: 'users', label: 'Users', icon: Users },
  { id: 'emails', label: 'Emails', icon: Mail },
  { id: 'campaigns', label: 'Campaigns', icon: Send },
  { id: 'leaderboard', label: 'Leaderboard', icon: Trophy },
];

export const AdminStatsPage = () => {
  const [activeTab, setActiveTab] = useState('overview');
  const [loading, setLoading] = useState(true);
  const [stats, setStats] = useState(null);
  const [userStats, setUserStats] = useState([]);
  const [emailStats, setEmailStats] = useState([]);
  const [campaignStats, setCampaignStats] = useState([]);
  const [leaderboard, setLeaderboard] = useState([]);

  useEffect(() => {
    const fetchAllStats = async () => {
      try {
        setLoading(true);
        const [statsRes, userRes, emailRes, campaignRes, leaderRes] = await Promise.all([
          adminAPI.stats.overview(),
          adminAPI.stats.users({ days: 30 }),
          adminAPI.stats.emails({ days: 30 }),
          adminAPI.stats.campaigns({ days: 30 }),
          adminAPI.stats.leaderboard({ limit: 10 }),
        ]);

        setStats(statsRes.data);
        setUserStats(userRes.data);
        setEmailStats(emailRes.data);
        setCampaignStats(campaignRes.data);
        setLeaderboard(leaderRes.data);
      } catch (error) {
        toast.error('Failed to load statistics');
      } finally {
        setLoading(false);
      }
    };

    fetchAllStats();
  }, []);

  const renderOverview = () => (
    <div className="space-y-6">
      <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-4 gap-6">
        <motion.div
          initial={{ opacity: 0, y: 20 }}
          animate={{ opacity: 1, y: 0 }}
          className="bg-surface-card border border-border rounded-2xl p-6"
        >
          <p className="text-sm text-text-muted font-medium">Total Users</p>
          <p className="text-3xl font-bold text-text-primary mt-2">{stats?.total_users || 0}</p>
        </motion.div>
        <motion.div
          initial={{ opacity: 0, y: 20 }}
          animate={{ opacity: 1, y: 0 }}
          transition={{ delay: 0.1 }}
          className="bg-surface-card border border-border rounded-2xl p-6"
        >
          <p className="text-sm text-text-muted font-medium">Active Users</p>
          <p className="text-3xl font-bold text-text-primary mt-2">{stats?.active_users || 0}</p>
        </motion.div>
        <motion.div
          initial={{ opacity: 0, y: 20 }}
          animate={{ opacity: 1, y: 0 }}
          transition={{ delay: 0.2 }}
          className="bg-surface-card border border-border rounded-2xl p-6"
        >
          <p className="text-sm text-text-muted font-medium">Total Campaigns</p>
          <p className="text-3xl font-bold text-text-primary mt-2">{stats?.total_campaigns || 0}</p>
        </motion.div>
        <motion.div
          initial={{ opacity: 0, y: 20 }}
          animate={{ opacity: 1, y: 0 }}
          transition={{ delay: 0.3 }}
          className="bg-surface-card border border-border rounded-2xl p-6"
        >
          <p className="text-sm text-text-muted font-medium">Emails Today</p>
          <p className="text-3xl font-bold text-text-primary mt-2">{stats?.today_emails || 0}</p>
        </motion.div>
      </div>

      <div className="grid grid-cols-1 lg:grid-cols-2 gap-6">
        <StatChart
          type="line"
          data={emailStats}
          title="Email Volume (30 Days)"
          height={280}
        />
        <StatChart
          type="area"
          data={emailStats.map((d) => ({
            date: d.date,
            success: d.success,
          }))}
          title="Email Success Trend"
          height={280}
        />
      </div>
    </div>
  );

  const renderUsers = () => (
    <div className="space-y-6">
      <StatChart
        type="area"
        data={userStats}
        title="User Growth (30 Days)"
      />
      <div className="bg-surface-card border border-border rounded-2xl p-6">
        <h3 className="text-lg font-semibold text-text-primary mb-4">Daily New Users</h3>
        <div className="space-y-3">
          {userStats.slice(-10).reverse().map((day, i) => (
            <div key={i} className="flex items-center justify-between">
              <span className="text-text-secondary text-sm">{day.date}</span>
              <div className="flex items-center gap-3">
                <div className="w-32 h-2 bg-surface-elevated rounded-full overflow-hidden">
                  <div
                    className="h-full bg-accent rounded-full"
                    style={{
                      width: `${Math.min((day.count / Math.max(...userStats.map((d) => d.count), 1)) * 100, 100)}%`,
                    }}
                  />
                </div>
                <span className="text-text-primary font-medium">{day.count}</span>
              </div>
            </div>
          ))}
        </div>
      </div>
    </div>
  );

  const renderEmails = () => (
    <div className="space-y-6">
      <div className="grid grid-cols-1 md:grid-cols-3 gap-6">
        <motion.div
          initial={{ opacity: 0, y: 20 }}
          animate={{ opacity: 1, y: 0 }}
          className="bg-surface-card border border-border rounded-2xl p-6"
        >
          <p className="text-sm text-text-muted font-medium">Total Sent</p>
          <p className="text-3xl font-bold text-text-primary mt-2">
            {emailStats.reduce((acc, d) => acc + d.total, 0)}
          </p>
        </motion.div>
        <motion.div
          initial={{ opacity: 0, y: 20 }}
          animate={{ opacity: 1, y: 0 }}
          transition={{ delay: 0.1 }}
          className="bg-surface-card border border-border rounded-2xl p-6"
        >
          <p className="text-sm text-text-muted font-medium">Successful</p>
          <p className="text-3xl font-bold text-green-400 mt-2">
            {emailStats.reduce((acc, d) => acc + d.success, 0)}
          </p>
        </motion.div>
        <motion.div
          initial={{ opacity: 0, y: 20 }}
          animate={{ opacity: 1, y: 0 }}
          transition={{ delay: 0.2 }}
          className="bg-surface-card border border-border rounded-2xl p-6"
        >
          <p className="text-sm text-text-muted font-medium">Failed</p>
          <p className="text-3xl font-bold text-red-400 mt-2">
            {emailStats.reduce((acc, d) => acc + d.failed, 0)}
          </p>
        </motion.div>
      </div>

      <StatChart
        type="bar"
        data={emailStats.map((d) => ({
          date: d.date,
          success: d.success,
          failed: d.failed,
        }))}
        title="Email Results by Day"
      />

      <StatChart
        type="pie"
        data={[
          { name: 'Successful', value: emailStats.reduce((acc, d) => acc + d.success, 0) },
          { name: 'Failed', value: emailStats.reduce((acc, d) => acc + d.failed, 0) },
        ]}
        title="Success Rate Distribution"
      />
    </div>
  );

  const renderCampaigns = () => (
    <div className="space-y-6">
      <div className="grid grid-cols-1 md:grid-cols-3 gap-6">
        <motion.div
          initial={{ opacity: 0, y: 20 }}
          animate={{ opacity: 1, y: 0 }}
          className="bg-surface-card border border-border rounded-2xl p-6"
        >
          <p className="text-sm text-text-muted font-medium">Total Campaigns</p>
          <p className="text-3xl font-bold text-text-primary mt-2">
            {campaignStats.reduce((acc, d) => acc + d.total, 0)}
          </p>
        </motion.div>
        <motion.div
          initial={{ opacity: 0, y: 20 }}
          animate={{ opacity: 1, y: 0 }}
          transition={{ delay: 0.1 }}
          className="bg-surface-card border border-border rounded-2xl p-6"
        >
          <p className="text-sm text-text-muted font-medium">Total Sent</p>
          <p className="text-3xl font-bold text-green-400 mt-2">
            {campaignStats.reduce((acc, d) => acc + d.sent, 0).toLocaleString()}
          </p>
        </motion.div>
        <motion.div
          initial={{ opacity: 0, y: 20 }}
          animate={{ opacity: 1, y: 0 }}
          transition={{ delay: 0.2 }}
          className="bg-surface-card border border-border rounded-2xl p-6"
        >
          <p className="text-sm text-text-muted font-medium">Total Failed</p>
          <p className="text-3xl font-bold text-red-400 mt-2">
            {campaignStats.reduce((acc, d) => acc + d.failed, 0).toLocaleString()}
          </p>
        </motion.div>
      </div>

      <StatChart
        type="line"
        data={campaignStats.map((d) => ({
          date: d.date,
          total: d.total,
        }))}
        title="Campaigns Created Over Time"
      />

      <StatChart
        type="bar"
        data={campaignStats.map((d) => ({
          date: d.date,
          sent: d.sent,
          failed: d.failed,
        }))}
        title="Email Send Results"
      />
    </div>
  );

  const renderLeaderboard = () => (
    <div className="space-y-6">
      <div className="bg-surface-card border border-border rounded-2xl overflow-hidden">
        <div className="p-6 border-b border-border">
          <h3 className="text-lg font-semibold text-text-primary">Top Users by Email Volume</h3>
        </div>
        <div className="divide-y divide-border">
          {leaderboard.map((user, index) => (
            <motion.div
              key={user.user_id}
              initial={{ opacity: 0, x: -20 }}
              animate={{ opacity: 1, x: 0 }}
              transition={{ delay: index * 0.05 }}
              className="flex items-center justify-between p-6 hover:bg-surface-card/50 transition-colors"
            >
              <div className="flex items-center gap-4">
                <div
                  className={`w-10 h-10 rounded-full flex items-center justify-center font-bold ${
                    index === 0
                      ? 'bg-amber-500/10 text-amber-400'
                      : index === 1
                      ? 'bg-zinc-400/10 text-zinc-300'
                      : index === 2
                      ? 'bg-orange-500/10 text-orange-400'
                      : 'bg-surface-elevated text-text-muted'
                  }`}
                >
                  #{index + 1}
                </div>
                <div>
                  <p className="font-medium text-text-primary">{user.name || user.email}</p>
                  <p className="text-sm text-text-muted">{user.email}</p>
                </div>
              </div>
              <div className="text-right">
                <p className="text-2xl font-bold text-accent">{user.total_sent.toLocaleString()}</p>
                <p className="text-sm text-text-muted">
                  {user.campaign_count} campaign{user.campaign_count !== 1 ? 's' : ''}
                </p>
              </div>
            </motion.div>
          ))}
          {leaderboard.length === 0 && (
            <div className="p-12 text-center text-text-muted">
              No leaderboard data available
            </div>
          )}
        </div>
      </div>
    </div>
  );

  const renderContent = () => {
    switch (activeTab) {
      case 'overview':
        return renderOverview();
      case 'users':
        return renderUsers();
      case 'emails':
        return renderEmails();
      case 'campaigns':
        return renderCampaigns();
      case 'leaderboard':
        return renderLeaderboard();
      default:
        return null;
    }
  };

  return (
    <div className="space-y-6">
      {/* Header */}
      <div>
        <h1 className="text-2xl font-bold text-text-primary">Statistics</h1>
        <p className="text-text-muted mt-1">System analytics and metrics</p>
      </div>

      {/* Tabs */}
      <div className="flex items-center gap-2 border-b border-border pb-4">
        {tabs.map((tab) => (
          <button
            key={tab.id}
            onClick={() => setActiveTab(tab.id)}
            className={`flex items-center gap-2 px-4 py-2.5 rounded-xl text-sm font-medium transition-all ${
              activeTab === tab.id
                ? 'bg-accent text-white'
                : 'text-text-secondary hover:bg-surface-card hover:text-text-primary'
            }`}
          >
            <tab.icon className="w-4 h-4" />
            {tab.label}
          </button>
        ))}
      </div>

      {/* Content */}
      {loading ? (
        <div className="space-y-6 animate-pulse">
          <div className="grid grid-cols-1 md:grid-cols-4 gap-6">
            {[1, 2, 3, 4].map((i) => (
              <div key={i} className="h-32 bg-surface-card rounded-2xl" />
            ))}
          </div>
          <div className="h-80 bg-surface-card rounded-2xl" />
        </div>
      ) : (
        renderContent()
      )}
    </div>
  );
};

export default AdminStatsPage;