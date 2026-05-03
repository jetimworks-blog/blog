import { useState, useEffect } from 'react';
import { useParams, useNavigate } from 'react-router-dom';
import { motion, AnimatePresence } from 'framer-motion';
import { toast } from 'sonner';
import { Layout } from '../../components/layout/Layout';
import { Button } from '../../components/ui/Button';
import { Card } from '../../components/ui/Card';
import { LoadingSpinner } from '../../components/ui/LoadingSpinner';
import { campaignAPI } from '../../lib/api';
import { CampaignStatusBadge } from '../../components/campaigns/CampaignStatusBadge';
import { StatsCard } from '../../components/campaigns/StatsCard';
import { ContactPreview } from '../../components/campaigns/ContactPreview';
import { SendConfirmDialog } from '../../components/campaigns/SendConfirmDialog';
import {
  ArrowLeft, Edit, Send, XCircle, Trash2, Mail,
  CheckCircle, MousePointer, Eye
} from 'lucide-react';

export const CampaignDetailPage = () => {
  const { id } = useParams();
  const navigate = useNavigate();
  const [campaign, setCampaign] = useState(null);
  const [stats, setStats] = useState(null);
  const [recipients, setRecipients] = useState([]);
  const [activeTab, setActiveTab] = useState('overview');
  const [isLoading, setIsLoading] = useState(true);
  const [showSendConfirm, setShowSendConfirm] = useState(false);
  const [recipientOffset, setRecipientOffset] = useState(0);

  const loadCampaign = async () => {
    try {
      const [campaignRes, statsRes] = await Promise.all([
        campaignAPI.get(id),
        campaignAPI.stats(id),
      ]);
      setCampaign(campaignRes.data);
      setStats(statsRes.data);
    } catch (error) {
      console.error('Failed to load campaign:', error);
      toast.error('Failed to load campaign');
      navigate('/campaigns');
    }
  };

  const loadRecipients = async (offset = 0) => {
    try {
      const response = await campaignAPI.recipients(id, 20, offset);
      setRecipients(response.data.data || []);
      setRecipientOffset(offset);
    } catch (error) {
      console.error('Failed to load recipients:', error);
    }
  };

  useEffect(() => {
    const init = async () => {
      setIsLoading(true);
      await loadCampaign();
      await loadRecipients();
      setIsLoading(false);
    };
    init();
  }, [id]);

  // Poll for stats when sending
  useEffect(() => {
    if (campaign?.status === 'sending') {
      const interval = setInterval(async () => {
        try {
          const statsRes = await campaignAPI.stats(id);
          setStats(statsRes.data);
          if (statsRes.data.status === 'completed') {
            await loadCampaign();
          }
        } catch (error) {
          // Silently fail polling
        }
      }, 10000);
      return () => clearInterval(interval);
    }
  }, [campaign?.status, id]);

  const handleSend = async () => {
    try {
      await campaignAPI.send(id);
      toast.success('Campaign is being sent');
      await loadCampaign();
    } catch (error) {
      toast.error('Failed to send campaign');
    } finally {
      setShowSendConfirm(false);
    }
  };

  const handleCancel = async () => {
    if (!confirm('Cancel this campaign? This cannot be undone.')) return;
    try {
      await campaignAPI.cancel(id);
      toast.success('Campaign cancelled');
      await loadCampaign();
    } catch (error) {
      toast.error('Failed to cancel campaign');
    }
  };

  const handleDelete = async () => {
    if (campaign?.status !== 'draft') {
      toast.error('Only draft campaigns can be deleted');
      return;
    }
    if (!confirm(`Delete campaign "${campaign?.name}"? This cannot be undone.`)) return;
    try {
      await campaignAPI.delete(id);
      toast.success('Campaign deleted');
      navigate('/campaigns');
    } catch (error) {
      toast.error('Failed to delete campaign');
    }
  };

  const formatDate = (dateString) => {
    if (!dateString) return '—';
    return new Date(dateString).toLocaleDateString('en-US', {
      month: 'long',
      day: 'numeric',
      year: 'numeric',
      hour: '2-digit',
      minute: '2-digit',
    });
  };

  if (isLoading) {
    return (
      <Layout>
        <div className="min-h-[calc(100vh-4rem)] flex items-center justify-center">
          <div className="flex flex-col items-center gap-4">
            <LoadingSpinner size={32} />
            <p className="text-text-muted">Loading campaign...</p>
          </div>
        </div>
      </Layout>
    );
  }

  if (!campaign) return null;

  const tabs = [
    { key: 'overview', label: 'Overview' },
    { key: 'audience', label: 'Audience' },
    { key: 'settings', label: 'Settings' },
  ];

  const openRate = stats && stats.total > 0
    ? Math.round((stats.opened / stats.total) * 100)
    : 0;
  const clickRate = stats && stats.total > 0
    ? Math.round((stats.clicked / stats.total) * 100)
    : 0;

  return (
    <Layout>
      <div className="max-w-5xl mx-auto px-4 sm:px-6 lg:px-8 py-8">
        {/* Back button */}
        <motion.div
          initial={{ opacity: 0, x: -20 }}
          animate={{ opacity: 1, x: 0 }}
          className="mb-6"
        >
          <Button
            variant="ghost"
            onClick={() => navigate('/campaigns')}
          >
            <ArrowLeft className="w-4 h-4 mr-2" />
            Back to Campaigns
          </Button>
        </motion.div>

        {/* Header */}
        <motion.div
          initial={{ opacity: 0, y: 20 }}
          animate={{ opacity: 1, y: 0 }}
          className="mb-8"
        >
          <div className="flex items-start justify-between flex-wrap gap-4">
            <div>
              <div className="flex items-center gap-3 mb-2">
                <h1 className="text-2xl md:text-3xl text-text-primary">
                  {campaign.name}
                </h1>
                <CampaignStatusBadge status={campaign.status} />
              </div>
              <p className="text-text-muted">{campaign.subject}</p>
            </div>

            {/* Action buttons */}
            <div className="flex items-center gap-2">
              {campaign.status === 'draft' && (
                <>
                  <Button variant="secondary" onClick={() => navigate(`/campaigns/${id}/edit`)}>
                    <Edit className="w-4 h-4 mr-2" />
                    Edit
                  </Button>
                  <Button onClick={() => setShowSendConfirm(true)}>
                    <Send className="w-4 h-4 mr-2" />
                    Send
                  </Button>
                  <Button variant="danger" onClick={handleDelete}>
                    <Trash2 className="w-4 h-4 mr-2" />
                    Delete
                  </Button>
                </>
              )}
              {campaign.status === 'scheduled' && (
                <>
                  <Button onClick={() => setShowSendConfirm(true)}>
                    <Send className="w-4 h-4 mr-2" />
                    Send Now
                  </Button>
                  <Button variant="secondary" onClick={handleCancel}>
                    <XCircle className="w-4 h-4 mr-2" />
                    Cancel
                  </Button>
                </>
              )}
              {campaign.status === 'sending' && (
                <Button variant="secondary" onClick={handleCancel}>
                  <XCircle className="w-4 h-4 mr-2" />
                  Cancel
                </Button>
              )}
            </div>
          </div>
        </motion.div>

        {/* Stats cards */}
        <motion.div
          initial={{ opacity: 0, y: 20 }}
          animate={{ opacity: 1, y: 0 }}
          transition={{ delay: 0.1 }}
          className="grid grid-cols-2 md:grid-cols-4 gap-4 mb-8"
        >
          <StatsCard
            title="Total Sent"
            value={stats?.sent || 0}
            subtitle={stats ? `of ${stats.csv_row_count || stats.total}` : ''}
            icon={Mail}
          />
          <StatsCard
            title="Failed"
            value={stats?.failed || 0}
            subtitle={stats?.failed > 0 ? `${Math.round((stats.failed / stats.csv_row_count) * 100)}%` : ''}
            icon={XCircle}
          />
          {campaign.track_opens && (
            <StatsCard
              title="Open Rate"
              value={`${openRate}%`}
              subtitle={stats?.opened > 0 ? `${stats.opened} opens` : ''}
              icon={Eye}
            />
          )}
          {campaign.track_clicks && (
            <StatsCard
              title="Click Rate"
              value={`${clickRate}%`}
              subtitle={stats?.clicked > 0 ? `${stats.clicked} clicks` : ''}
              icon={MousePointer}
            />
          )}
        </motion.div>

        {/* Tabs */}
        <div className="border-b border-border mb-6">
          <div className="flex gap-6">
            {tabs.map(tab => (
              <button
                key={tab.key}
                onClick={() => setActiveTab(tab.key)}
                className={`
                  pb-3 text-sm font-medium transition-colors relative
                  ${activeTab === tab.key
                    ? 'text-accent'
                    : 'text-text-muted hover:text-text-primary'
                  }
                `}
              >
                {tab.label}
                {activeTab === tab.key && (
                  <motion.div
                    layoutId="activeTab"
                    className="absolute bottom-0 left-0 right-0 h-0.5 bg-accent"
                  />
                )}
              </button>
            ))}
          </div>
        </div>

        {/* Tab content */}
        <AnimatePresence mode="wait">
          <motion.div
            key={activeTab}
            initial={{ opacity: 0, y: 10 }}
            animate={{ opacity: 1, y: 0 }}
            transition={{ duration: 0.2 }}
          >
            {/* Overview tab */}
            {activeTab === 'overview' && (
              <div className="space-y-6">
                <Card className="p-6">
                  <h3 className="text-lg font-semibold text-text-primary mb-4">
                    Campaign Details
                  </h3>
                  <div className="grid grid-cols-2 gap-4 text-sm">
                    <div>
                      <p className="text-text-muted mb-1">Created</p>
                      <p className="text-text-primary">{formatDate(campaign.created_at)}</p>
                    </div>
                    <div>
                      <p className="text-text-muted mb-1">Updated</p>
                      <p className="text-text-primary">{formatDate(campaign.updated_at)}</p>
                    </div>
                    {campaign.scheduled_at && (
                      <div>
                        <p className="text-text-muted mb-1">Scheduled</p>
                        <p className="text-text-primary">{formatDate(campaign.scheduled_at)}</p>
                      </div>
                    )}
                    <div>
                      <p className="text-text-muted mb-1">Rate Limit</p>
                      <p className="text-text-primary">{campaign.rate_limit} emails/min</p>
                    </div>
                  </div>
                </Card>
              </div>
            )}

            {/* Audience tab */}
            {activeTab === 'audience' && (
              <Card className="p-6">
                <div className="flex items-center justify-between mb-4">
                  <h3 className="text-lg font-semibold text-text-primary">
                    Contacts ({stats?.csv_row_count || 0})
                  </h3>
                </div>
                <ContactPreview
                  contacts={recipients}
                  total={stats?.csv_row_count || 0}
                  limit={20}
                  offset={recipientOffset}
                  onPageChange={loadRecipients}
                />
              </Card>
            )}

            {/* Settings tab */}
            {activeTab === 'settings' && (
              <Card className="p-6">
                <h3 className="text-lg font-semibold text-text-primary mb-4">
                  Campaign Settings
                </h3>
                <div className="space-y-4 text-sm">
                  <div className="flex items-center justify-between py-2 border-b border-border">
                    <span className="text-text-muted">Track Opens</span>
                    <span className="text-text-primary">
                      {campaign.track_opens ? 'Enabled' : 'Disabled'}
                    </span>
                  </div>
                  <div className="flex items-center justify-between py-2 border-b border-border">
                    <span className="text-text-muted">Track Clicks</span>
                    <span className="text-text-primary">
                      {campaign.track_clicks ? 'Enabled' : 'Disabled'}
                    </span>
                  </div>
                  <div className="flex items-center justify-between py-2 border-b border-border">
                    <span className="text-text-muted">Rate Limit</span>
                    <span className="text-text-primary">{campaign.rate_limit} emails/min</span>
                  </div>
                  <div className="flex items-center justify-between py-2 border-b border-border">
                    <span className="text-text-muted">Schedule Type</span>
                    <span className="text-text-primary capitalize">
                      {campaign.schedule_type?.replace('_', ' ')}
                    </span>
                  </div>
                  {campaign.cron_expression && (
                    <div className="flex items-center justify-between py-2 border-b border-border">
                      <span className="text-text-muted">Cron Expression</span>
                      <span className="text-text-primary font-mono">
                        {campaign.cron_expression}
                      </span>
                    </div>
                  )}
                </div>
              </Card>
            )}
          </motion.div>
        </AnimatePresence>
      </div>

      {/* Send confirmation dialog */}
      <SendConfirmDialog
        isOpen={showSendConfirm}
        campaign={campaign}
        contactCount={stats?.csv_row_count || 0}
        onConfirm={handleSend}
        onCancel={() => setShowSendConfirm(false)}
      />
    </Layout>
  );
};

export default CampaignDetailPage;
