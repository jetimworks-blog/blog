import { useState, useEffect } from 'react';
import { useNavigate } from 'react-router-dom';
import { toast } from 'sonner';
import { Layout } from '../../components/layout/Layout';
import { Button } from '../../components/ui/Button';
import { LoadingSpinner } from '../../components/ui/LoadingSpinner';
import { campaignAPI } from '../../lib/api';
import { CampaignTable } from '../../components/campaigns/CampaignTable';
import { EmptyState } from '../../components/campaigns/EmptyState';
import { Plus, Mail, Clock, CheckCircle } from 'lucide-react';

export const CampaignsPage = () => {
  const navigate = useNavigate();
  const [campaigns, setCampaigns] = useState([]);
  const [isLoading, setIsLoading] = useState(true);
  const [filter, setFilter] = useState('all');
  const [limit] = useState(20);

  const loadCampaigns = async () => {
    setIsLoading(true);
    try {
      const response = await campaignAPI.list(limit, 0);
      setCampaigns(response.data.data || []);
    } catch (error) {
      console.error('Failed to load campaigns:', error);
      toast.error('Failed to load campaigns');
    } finally {
      setIsLoading(false);
    }
  };

  useEffect(() => {
    loadCampaigns();
  }, []);

  const filteredCampaigns = campaigns.filter(campaign => {
    if (filter === 'all') return true;
    return campaign.status === filter;
  });

  const stats = {
    total: campaigns.length,
    active: campaigns.filter(c => c.status === 'sending' || c.status === 'scheduled').length,
    completed: campaigns.filter(c => c.status === 'completed').length,
  };

  const handleRowClick = (campaign) => {
    navigate(`/campaigns/${campaign.id}`);
  };

  const handleEdit = (campaign, e) => {
    e?.stopPropagation();
    navigate(`/campaigns/${campaign.id}/edit`);
  };

  const handleSend = async (campaign, e) => {
    e?.stopPropagation();
    try {
      await campaignAPI.send(campaign.id);
      toast.success('Campaign is being sent');
      loadCampaigns();
    } catch (error) {
      toast.error('Failed to send campaign');
    }
  };

  const handleCancel = async (campaign, e) => {
    e?.stopPropagation();
    try {
      await campaignAPI.cancel(campaign.id);
      toast.success('Campaign cancelled');
      loadCampaigns();
    } catch (error) {
      toast.error('Failed to cancel campaign');
    }
  };

  const handleDelete = async (campaign, e) => {
    e?.stopPropagation();
    if (campaign.status !== 'draft') {
      toast.error('Only draft campaigns can be deleted');
      return;
    }
    if (!confirm(`Delete campaign "${campaign.name}"? This cannot be undone.`)) {
      return;
    }
    try {
      await campaignAPI.delete(campaign.id);
      toast.success('Campaign deleted');
      loadCampaigns();
    } catch (error) {
      toast.error('Failed to delete campaign');
    }
  };

  const filters = [
    { key: 'all', label: 'All' },
    { key: 'draft', label: 'Draft' },
    { key: 'scheduled', label: 'Scheduled' },
    { key: 'sending', label: 'Sending' },
    { key: 'completed', label: 'Completed' },
  ];

  if (isLoading) {
    return (
      <Layout>
        <div className="min-h-[calc(100vh-4rem)] flex items-center justify-center">
          <div className="flex flex-col items-center gap-4">
            <LoadingSpinner size={32} />
            <p className="text-text-muted">Loading campaigns...</p>
          </div>
        </div>
      </Layout>
    );
  }

  return (
    <Layout>
      <div className="max-w-6xl mx-auto px-4 sm:px-6 lg:px-8 py-8">
        {/* Header */}
        <div className="mb-8">
          <div className="flex items-center justify-between flex-wrap gap-4">
            <div className="flex items-center gap-3">
              <div className="w-12 h-12 bg-accent flex items-center justify-center">
                <Mail className="w-6 h-6 text-surface" />
              </div>
              <div>
                <h1 className="text-2xl md:text-3xl text-text-primary">
                  Campaigns
                </h1>
                <p className="text-text-muted">Manage your email campaigns</p>
              </div>
            </div>
            <Button onClick={() => navigate('/campaigns/new')}>
              <Plus className="w-4 h-4 mr-2" />
              Create Campaign
            </Button>
          </div>
        </div>

        {/* Stats bar */}
        <div className="grid grid-cols-3 gap-4 mb-8">
          <div className="bg-surface-elevated border border-border p-4 rounded-lg text-center">
            <p className="text-2xl font-semibold text-text-primary">{stats.total}</p>
            <p className="text-sm text-text-muted">Total Campaigns</p>
          </div>
          <div className="bg-surface-elevated border border-border p-4 rounded-lg text-center">
            <p className="text-2xl font-semibold text-warning flex items-center justify-center gap-2">
              <Clock className="w-5 h-5" />
              {stats.active}
            </p>
            <p className="text-sm text-text-muted">Active</p>
          </div>
          <div className="bg-surface-elevated border border-border p-4 rounded-lg text-center">
            <p className="text-2xl font-semibold text-success flex items-center justify-center gap-2">
              <CheckCircle className="w-5 h-5" />
              {stats.completed}
            </p>
            <p className="text-sm text-text-muted">Completed</p>
          </div>
        </div>

        {/* Filter tabs */}
        <div className="flex gap-2 mb-6 overflow-x-auto pb-2">
          {filters.map(f => (
            <button
              key={f.key}
              onClick={() => setFilter(f.key)}
              className={`
                px-4 py-2 text-sm font-medium rounded-lg whitespace-nowrap transition-colors
                ${filter === f.key
                  ? 'bg-accent text-surface'
                  : 'bg-surface-elevated text-text-muted hover:text-text-primary'
                }
              `}
            >
              {f.label}
            </button>
          ))}
        </div>

        {/* Campaign list */}
        {filteredCampaigns.length === 0 ? (
          <EmptyState
            title="No campaigns yet"
            description="Create your first campaign to start sending beautiful emails to your audience."
            actionLabel="Create Campaign"
            onAction={() => navigate('/campaigns/new')}
            icon={Mail}
          />
        ) : (
          <CampaignTable
            campaigns={filteredCampaigns}
            onRowClick={handleRowClick}
            onEdit={handleEdit}
            onSend={handleSend}
            onCancel={handleCancel}
            onDelete={handleDelete}
          />
        )}
      </div>
    </Layout>
  );
};

export default CampaignsPage;
