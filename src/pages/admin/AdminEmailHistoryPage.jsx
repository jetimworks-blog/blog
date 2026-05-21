import { useState, useEffect, useCallback } from 'react';
import { motion } from 'framer-motion';
import { Mail, RefreshCw, Eye } from 'lucide-react';
import { adminAPI } from '../../lib/api';
import { AdminTable } from '../../components/admin/AdminTable';
import { AdminPagination } from '../../components/admin/AdminPagination';
import { ConfirmDialog } from '../../components/admin/ConfirmDialog';
import { EmptyState } from '../../components/admin/EmptyState';
import { toast } from 'sonner';

export const AdminEmailHistoryPage = () => {
  const [history, setHistory] = useState([]);
  const [loading, setLoading] = useState(true);
  const [pagination, setPagination] = useState({ page: 1, per_page: 25, total: 0 });
  const [filter, setFilter] = useState({ success: '', process: '' });
  const [sortField, setSortField] = useState('created_at');
  const [sortDir, setSortDir] = useState('desc');

  // Detail modal state
  const [selectedEmail, setSelectedEmail] = useState(null);
  const [emailDetail, setEmailDetail] = useState(null);
  const [detailLoading, setDetailLoading] = useState(false);

  // Retry dialog state
  const [retryEmail, setRetryEmail] = useState(null);
  const [retryLoading, setRetryLoading] = useState(false);

  // Fetch email history
  const fetchHistory = useCallback(async () => {
    try {
      setLoading(true);
      const params = {
        page: pagination.page,
        per_page: pagination.per_page,
        ...(filter.success !== '' && { success: filter.success }),
        ...(filter.process && { process: filter.process }),
      };

      const res = await adminAPI.emailHistory.list(params);
      setHistory(res.data.data || []);
      setPagination((prev) => ({
        ...prev,
        total: res.data.pagination?.total || 0,
      }));
    } catch (error) {
      toast.error('Failed to load email history');
    } finally {
      setLoading(false);
    }
  }, [pagination.page, pagination.per_page, filter]);

  useEffect(() => {
    fetchHistory();
  }, [fetchHistory]);

  // Fetch email detail
  const fetchEmailDetail = async (id) => {
    try {
      setDetailLoading(true);
      const res = await adminAPI.emailHistory.get(id);
      setEmailDetail(res.data);
    } catch (error) {
      toast.error('Failed to load email details');
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

  const handleRetryEmail = async () => {
    try {
      setRetryLoading(true);
      await adminAPI.emailHistory.retry(retryEmail.id);
      toast.success('Email re-queued for retry');
      setRetryEmail(null);
      fetchHistory();
    } catch (error) {
      toast.error('Failed to retry email');
    } finally {
      setRetryLoading(false);
    }
  };

  const handleViewEmail = (email) => {
    setSelectedEmail(email);
    fetchEmailDetail(email.id);
  };

  const formatDuration = (ms) => {
    if (!ms) return '-';
    if (ms < 1000) return `${ms}ms`;
    return `${(ms / 1000).toFixed(1)}s`;
  };

  const columns = [
    {
      key: 'to',
      label: 'Recipient',
      render: (val, row) => {
        const recipients = val || (row.to_list?.length ? row.to_list : []).join(', ');
        return (
          <span className="font-medium text-text-primary">{recipients || '-'}</span>
        );
      },
    },
    {
      key: 'subject',
      label: 'Subject',
      render: (val) => (
        <span className="text-text-secondary truncate max-w-[200px] block">{val || '-'}</span>
      ),
    },
    {
      key: 'process',
      label: 'Process',
      render: (val) => (
        <span className="inline-flex items-center px-2.5 py-1 rounded-full text-xs font-medium bg-accent/10 text-accent capitalize">
          {val}
        </span>
      ),
    },
    {
      key: 'success',
      label: 'Status',
      render: (val) => (
        <span
          className={`inline-flex items-center px-2.5 py-1 rounded-full text-xs font-medium ${
            val
              ? 'bg-green-500/10 text-green-400'
              : 'bg-red-500/10 text-red-400'
          }`}
        >
          {val ? 'Success' : 'Failed'}
        </span>
      ),
    },
    {
      key: 'duration',
      label: 'Duration',
      render: (val) => (
        <span className="text-text-secondary">{formatDuration(val)}</span>
      ),
    },
    {
      key: 'created_at',
      label: 'Date',
      sortable: true,
      render: (val) => new Date(val).toLocaleString('en-US', {
        month: 'short',
        day: 'numeric',
        hour: '2-digit',
        minute: '2-digit',
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
              handleViewEmail(row);
            }}
            className="p-1.5 text-text-muted hover:text-text-primary hover:bg-surface-card rounded-lg transition-colors"
            title="View details"
          >
            <Eye className="w-4 h-4" />
          </button>
          {!row.success && (
            <button
              onClick={(e) => {
                e.stopPropagation();
                setRetryEmail(row);
              }}
              className="p-1.5 text-accent hover:bg-accent/10 rounded-lg transition-colors"
              title="Retry"
            >
              <RefreshCw className="w-4 h-4" />
            </button>
          )}
        </div>
      ),
    },
  ];

  return (
    <div className="space-y-6">
      {/* Header */}
      <div>
        <h1 className="text-2xl font-bold text-text-primary">Email History</h1>
        <p className="text-text-muted mt-1">View all email activity and retry failed emails</p>
      </div>

      {/* Filters */}
      <div className="flex flex-wrap items-center gap-4">
        <select
          value={filter.success}
          onChange={(e) => setFilter((f) => ({ ...f, success: e.target.value }))}
          className="px-3 py-2.5 bg-surface-card border border-border rounded-xl text-text-primary focus:outline-none focus:border-accent transition-colors"
        >
          <option value="">All Status</option>
          <option value="true">Success</option>
          <option value="false">Failed</option>
        </select>

        <select
          value={filter.process}
          onChange={(e) => setFilter((f) => ({ ...f, process: e.target.value }))}
          className="px-3 py-2.5 bg-surface-card border border-border rounded-xl text-text-primary focus:outline-none focus:border-accent transition-colors"
        >
          <option value="">All Processes</option>
          <option value="email">Email</option>
          <option value="chat">Chat</option>
          <option value="gen">Gen</option>
          <option value="gen-email">Gen Email</option>
        </select>
      </div>

      {/* Table */}
      <div className="bg-surface-card border border-border rounded-2xl overflow-hidden">
        {history.length === 0 && !loading ? (
          <EmptyState
            icon={Mail}
            title="No email history found"
            description="Email activity will appear here."
          />
        ) : (
          <AdminTable
            columns={columns}
            data={history}
            loading={loading}
            onSort={handleSort}
            sortField={sortField}
            sortDir={sortDir}
            emptyMessage="No emails match your filters"
          />
        )}
        {!loading && history.length > 0 && (
          <AdminPagination
            total={pagination.total}
            limit={pagination.per_page}
            offset={(pagination.page - 1) * pagination.per_page}
            onPageChange={handlePageChange}
          />
        )}
      </div>

      {/* Email Detail Modal */}
      {selectedEmail && (
        <EmailDetailModal
          email={selectedEmail}
          detail={emailDetail}
          loading={detailLoading}
          onClose={() => {
            setSelectedEmail(null);
            setEmailDetail(null);
          }}
        />
      )}

      {/* Retry Confirmation */}
      <ConfirmDialog
        isOpen={!!retryEmail}
        title="Retry Email"
        message={`Are you sure you want to re-queue "${retryEmail?.to}" for retry?`}
        confirmLabel="Retry"
        variant="warning"
        onConfirm={handleRetryEmail}
        onCancel={() => setRetryEmail(null)}
        loading={retryLoading}
      />
    </div>
  );
};

const EmailDetailModal = ({ email, detail, loading, onClose }) => {
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
              <h3 className="text-lg font-semibold text-text-primary">Email Details</h3>
              <p className="text-sm text-text-muted mt-1">{email.to || (email.to_list?.length ? email.to_list.join(', ') : '-')}</p>
            </div>
            <button
              onClick={onClose}
              className="p-2 text-text-muted hover:text-text-primary hover:bg-surface-card rounded-lg transition-colors"
            >
              <Eye className="w-5 h-5" />
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
              <div className="grid grid-cols-2 gap-4">
                <div className="bg-surface-card rounded-xl p-4">
                  <p className="text-sm text-text-muted">Status</p>
                  <p className={`text-lg font-semibold mt-1 ${email.success ? 'text-green-400' : 'text-red-400'}`}>
                    {email.success ? 'Success' : 'Failed'}
                  </p>
                </div>
                <div className="bg-surface-card rounded-xl p-4">
                  <p className="text-sm text-text-muted">Process</p>
                  <p className="text-lg font-semibold text-text-primary capitalize mt-1">{email.process}</p>
                </div>
                <div className="bg-surface-card rounded-xl p-4">
                  <p className="text-sm text-text-muted">Subject</p>
                  <p className="text-text-primary mt-1">{email.subject || '-'}</p>
                </div>
                <div className="bg-surface-card rounded-xl p-4">
                  <p className="text-sm text-text-muted">Duration</p>
                  <p className="text-lg font-semibold text-text-primary mt-1">
                    {email.duration ? `${(email.duration / 1000).toFixed(2)}s` : '-'}
                  </p>
                </div>
              </div>

              {detail.prompt && (
                <div>
                  <h4 className="text-sm font-semibold text-text-primary mb-2">Prompt</h4>
                  <div className="bg-surface-card rounded-xl p-4">
                    <p className="text-sm text-text-secondary whitespace-pre-wrap">{detail.prompt}</p>
                  </div>
                </div>
              )}

              {detail.generated_html && (
                <div>
                  <h4 className="text-sm font-semibold text-text-primary mb-2">Generated HTML</h4>
                  <div className="bg-surface-card rounded-xl p-4 max-h-60 overflow-y-auto">
                    <pre className="text-xs text-text-secondary whitespace-pre-wrap">{detail.generated_html}</pre>
                  </div>
                </div>
              )}
            </div>
          ) : (
            <p className="text-text-muted">No details available</p>
          )}
        </div>
      </motion.div>
    </motion.div>
  );
};

export default AdminEmailHistoryPage;