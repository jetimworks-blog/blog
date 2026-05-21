import { useState, useEffect, useCallback } from 'react';
import { motion } from 'framer-motion';
import { Send, XCircle, Trash2, Eye } from 'lucide-react';
import { adminAPI } from '../../lib/api';
import { AdminTable } from '../../components/admin/AdminTable';
import { AdminPagination } from '../../components/admin/AdminPagination';
import { ConfirmDialog } from '../../components/admin/ConfirmDialog';
import { EmptyState } from '../../components/admin/EmptyState';
import { toast } from 'sonner';

const statusColors = {
  draft: 'bg-zinc-500/10 text-zinc-400',
  scheduled: 'bg-blue-500/10 text-blue-400',
  sending: 'bg-amber-500/10 text-amber-400',
  completed: 'bg-green-500/10 text-green-400',
  cancelled: 'bg-red-500/10 text-red-400',
};

export const AdminCampaignsPage = () => {
  const [campaigns, setCampaigns] = useState([]);
  const [loading, setLoading] = useState(true);
  const [pagination, setPagination] = useState({ page: 1, per_page: 25, total: 0 });
  const [filter, setFilter] = useState({ status: '' });
  const [sortField, setSortField] = useState('created_at');
  const [sortDir, setSortDir] = useState('desc');

  // Detail modal state
  const [selectedCampaign, setSelectedCampaign] = useState(null);
  const [campaignDetail, setCampaignDetail] = useState(null);
  const [detailLoading, setDetailLoading] = useState(false);

  // Cancel dialog state
  const [cancelCampaign, setCancelCampaign] = useState(null);
  const [cancelLoading, setCancelLoading] = useState(false);

  // Delete dialog state
  const [deleteCampaign, setDeleteCampaign] = useState(null);
  const [deleteLoading, setDeleteLoading] = useState(false);

  // Fetch campaigns
  const fetchCampaigns = useCallback(async () => {
    try {
      setLoading(true);
      const params = {
        page: pagination.page,
        per_page: pagination.per_page,
        ...(filter.status && { status: filter.status }),
      };

      const res = await adminAPI.campaigns.list(params);
      setCampaigns(res.data.data || []);
      setPagination((prev) => ({
        ...prev,
        total: res.data.pagination?.total || 0,
      }));
    } catch (error) {
      toast.error('Failed to load campaigns');
    } finally {
      setLoading(false);
    }
  }, [pagination.page, pagination.per_page, filter.status]);

  useEffect(() => {
    fetchCampaigns();
  }, [fetchCampaigns]);

  // Fetch campaign details
  const fetchCampaignDetail = async (id) => {
    try {
      setDetailLoading(true);
      const res = await adminAPI.campaigns.get(id);
      setCampaignDetail(res.data);
    } catch (error) {
      toast.error('Failed to load campaign details');
    } finally {
      setDetailLoading(false);
    }
  };

  const handleSort = (field) => {
    if (sortField === field) {
      setSortDir(sortDir === 'asc' ? 'desc' : 'asc');
    } else {
      setSortField(field);
      setSortDir('asc');
    }
  };

  const handlePageChange = (offset) => {
    const newPage = Math.floor(offset / pagination.per_page) + 1;
    setPagination((prev) => ({ ...prev, page: newPage }));
  };

  const handleCancelCampaign = async () => {
    try {
      setCancelLoading(true);
      await adminAPI.campaigns.cancel(cancelCampaign.id);
      toast.success('Campaign cancelled successfully');
      setCancelCampaign(null);
      fetchCampaigns();
    } catch (error) {
      toast.error('Failed to cancel campaign');
    } finally {
      setCancelLoading(false);
    }
  };

  const handleDeleteCampaign = async () => {
    try {
      setDeleteLoading(true);
      await adminAPI.campaigns.delete(deleteCampaign.id);
      toast.success('Campaign deleted successfully');
      setDeleteCampaign(null);
      fetchCampaigns();
    } catch (error) {
      toast.error('Failed to delete campaign');
    } finally {
      setDeleteLoading(false);
    }
  };

  const handleViewCampaign = (campaign) => {
    setSelectedCampaign(campaign);
    fetchCampaignDetail(campaign.id);
  };

  const columns = [
    {
      key: 'name',
      label: 'Name',
      sortable: true,
      render: (val) => (
        <span className="font-medium text-text-primary">{val}</span>
      ),
    },
    {
      key: 'subject',
      label: 'Subject',
      render: (val) => (
        <span className="text-text-secondary truncate max-w-[200px] block">{val}</span>
      ),
    },
    {
      key: 'status',
      label: 'Status',
      render: (val) => (
        <span
          className={`inline-flex items-center px-2.5 py-1 rounded-full text-xs font-medium capitalize ${statusColors[val] || 'bg-zinc-500/10 text-zinc-400'}`}
        >
          {val}
        </span>
      ),
    },
    {
      key: 'sent_count',
      label: 'Sent',
      render: (val, row) => (
        <span className="text-text-primary">{val || 0} / {row.csv_row_count || 0}</span>
      ),
    },
    {
      key: 'failed_count',
      label: 'Failed',
      render: (val) => (
        <span className="text-red-400">{val || 0}</span>
      ),
    },
    {
      key: 'created_at',
      label: 'Created',
      sortable: true,
      render: (val) => new Date(val).toLocaleDateString('en-US', {
        year: 'numeric',
        month: 'short',
        day: 'numeric',
      }),
    },
    {
      key: 'actions',
      label: 'Actions',
      render: (_, row) => (
        <div className="flex items-center gap-2">
          <button
            onClick={(e) => {
              e.stopPropagation();
              handleViewCampaign(row);
            }}
            className="p-1.5 text-text-muted hover:text-text-primary hover:bg-surface-card rounded-lg transition-colors"
            title="View details"
          >
            <Eye className="w-4 h-4" />
          </button>
          {row.status === 'scheduled' || row.status === 'sending' ? (
            <button
              onClick={(e) => {
                e.stopPropagation();
                setCancelCampaign(row);
              }}
              className="p-1.5 text-amber-400 hover:bg-amber-500/10 rounded-lg transition-colors"
              title="Cancel campaign"
            >
              <XCircle className="w-4 h-4" />
            </button>
          ) : null}
          <button
            onClick={(e) => {
              e.stopPropagation();
              setDeleteCampaign(row);
            }}
            className="p-1.5 text-red-400 hover:bg-red-500/10 rounded-lg transition-colors"
            title="Delete campaign"
          >
            <Trash2 className="w-4 h-4" />
          </button>
        </div>
      ),
    },
  ];

  return (
    <div className="space-y-6">
      {/* Header */}
      <div>
        <h1 className="text-2xl font-bold text-text-primary">Campaigns</h1>
        <p className="text-text-muted mt-1">Monitor and manage email campaigns</p>
      </div>

      {/* Filters */}
      <div className="flex flex-wrap items-center gap-4">
        <select
          value={filter.status}
          onChange={(e) => setFilter((f) => ({ ...f, status: e.target.value }))}
          className="px-3 py-2.5 bg-surface-card border border-border rounded-xl text-text-primary focus:outline-none focus:border-accent transition-colors"
        >
          <option value="">All Status</option>
          <option value="draft">Draft</option>
          <option value="scheduled">Scheduled</option>
          <option value="sending">Sending</option>
          <option value="completed">Completed</option>
          <option value="cancelled">Cancelled</option>
        </select>
      </div>

      {/* Table */}
      <div className="bg-surface-card border border-border rounded-2xl overflow-hidden">
        {campaigns.length === 0 && !loading ? (
          <EmptyState
            icon={Send}
            title="No campaigns found"
            description="Campaigns will appear here once created."
          />
        ) : (
          <AdminTable
            columns={columns}
            data={campaigns}
            loading={loading}
            onSort={handleSort}
            sortField={sortField}
            sortDir={sortDir}
            emptyMessage="No campaigns match your filters"
          />
        )}
        {!loading && campaigns.length > 0 && (
          <AdminPagination
            total={pagination.total}
            limit={pagination.per_page}
            offset={(pagination.page - 1) * pagination.per_page}
            onPageChange={handlePageChange}
          />
        )}
      </div>

      {/* Campaign Detail Modal */}
      {selectedCampaign && (
        <CampaignDetailModal
          campaign={selectedCampaign}
          detail={campaignDetail}
          loading={detailLoading}
          onClose={() => {
            setSelectedCampaign(null);
            setCampaignDetail(null);
          }}
        />
      )}

      {/* Cancel Confirmation */}
      <ConfirmDialog
        isOpen={!!cancelCampaign}
        title="Cancel Campaign"
        message={`Are you sure you want to cancel "${cancelCampaign?.name}"? This action cannot be undone.`}
        confirmLabel="Cancel Campaign"
        variant="warning"
        onConfirm={handleCancelCampaign}
        onCancel={() => setCancelCampaign(null)}
        loading={cancelLoading}
      />

      {/* Delete Confirmation */}
      <ConfirmDialog
        isOpen={!!deleteCampaign}
        title="Delete Campaign"
        message={`Are you sure you want to delete "${deleteCampaign?.name}"? This will remove all associated recipient data.`}
        confirmLabel="Delete"
        variant="danger"
        onConfirm={handleDeleteCampaign}
        onCancel={() => setDeleteCampaign(null)}
        loading={deleteLoading}
      />
    </div>
  );
};

const CampaignDetailModal = ({ campaign, detail, loading, onClose }) => {
  return (
    <motion.div
      initial={{ opacity: 0 }}
      animate={{ opacity: 1 }}
      exit={{ opacity: 0 }}
      className="fixed inset-0 z-50 flex items-center justify-center p-4 bg-black/50 backdrop-blur-sm"
      onClick={onClose}
    >
      <motion.div
        initial={{ scale: 0.95, opacity: 0 }}
        animate={{ scale: 1, opacity: 1 }}
        exit={{ scale: 0.95, opacity: 0 }}
        className="w-full max-w-2xl bg-surface-elevated rounded-2xl border border-border shadow-2xl max-h-[80vh] overflow-hidden flex flex-col"
        onClick={(e) => e.stopPropagation()}
      >
        <div className="p-6 border-b border-border">
          <div className="flex items-start justify-between">
            <div>
              <h3 className="text-lg font-semibold text-text-primary">{campaign.name}</h3>
              <p className="text-sm text-text-muted mt-1">{campaign.subject}</p>
            </div>
            <button
              onClick={onClose}
              className="p-2 text-text-muted hover:text-text-primary hover:bg-surface-card rounded-lg transition-colors"
            >
              <XCircle className="w-5 h-5" />
            </button>
          </div>
        </div>

        <div className="p-6 overflow-y-auto flex-1">
          {loading ? (
            <div className="space-y-4 animate-pulse">
              {[1, 2, 3, 4].map((i) => (
                <div key={i} className="h-4 bg-surface-elevated rounded" />
              ))}
            </div>
          ) : detail ? (
            <div className="space-y-6">
              <div className="grid grid-cols-3 gap-4">
                <div className="bg-surface-card rounded-xl p-4">
                  <p className="text-sm text-text-muted">Status</p>
                  <p className="text-lg font-semibold text-text-primary capitalize mt-1">{campaign.status}</p>
                </div>
                <div className="bg-surface-card rounded-xl p-4">
                  <p className="text-sm text-text-muted">Total Recipients</p>
                  <p className="text-lg font-semibold text-text-primary mt-1">{detail.total || 0}</p>
                </div>
                <div className="bg-surface-card rounded-xl p-4">
                  <p className="text-sm text-text-muted">Sent</p>
                  <p className="text-lg font-semibold text-green-400 mt-1">{campaign.sent_count || 0}</p>
                </div>
              </div>

              <div>
                <h4 className="text-sm font-semibold text-text-primary mb-3">Recent Recipients</h4>
                <div className="space-y-2">
                  {detail.recipients?.slice(0, 10).map((recipient) => (
                    <div
                      key={recipient.id}
                      className="flex items-center justify-between p-3 bg-surface-card rounded-xl"
                    >
                      <span className="text-text-primary">{recipient.email}</span>
                      <div className="flex items-center gap-2">
                        <span
                          className={`text-xs px-2 py-1 rounded-full ${
                            recipient.status === 'sent'
                              ? 'bg-green-500/10 text-green-400'
                              : recipient.status === 'failed'
                              ? 'bg-red-500/10 text-red-400'
                              : 'bg-zinc-500/10 text-zinc-400'
                          }`}
                        >
                          {recipient.status}
                        </span>
                        {recipient.sent_at && (
                          <span className="text-xs text-text-muted">
                            {new Date(recipient.sent_at).toLocaleString()}
                          </span>
                        )}
                      </div>
                    </div>
                  ))}
                </div>
                {detail.recipients?.length > 10 && (
                  <p className="text-sm text-text-muted text-center mt-3">
                    And {detail.recipients.length - 10} more...
                  </p>
                )}
              </div>
            </div>
          ) : (
            <p className="text-text-muted">No details available</p>
          )}
        </div>
      </motion.div>
    </motion.div>
  );
};

export default AdminCampaignsPage;