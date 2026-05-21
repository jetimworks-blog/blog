import { useState, useEffect, useCallback } from 'react';
import { motion } from 'framer-motion';
import { FileText, Trash2, Filter } from 'lucide-react';
import { adminAPI } from '../../lib/api';
import { AdminTable } from '../../components/admin/AdminTable';
import { AdminPagination } from '../../components/admin/AdminPagination';
import { ConfirmDialog } from '../../components/admin/ConfirmDialog';
import { EmptyState } from '../../components/admin/EmptyState';
import { toast } from 'sonner';

const methodColors = {
  GET: 'bg-green-500/10 text-green-400',
  POST: 'bg-blue-500/10 text-blue-400',
  PUT: 'bg-amber-500/10 text-amber-400',
  DELETE: 'bg-red-500/10 text-red-400',
  PATCH: 'bg-purple-500/10 text-purple-400',
};

export const AdminRequestLogsPage = () => {
  const [requests, setRequests] = useState([]);
  const [loading, setLoading] = useState(true);
  const [pagination, setPagination] = useState({ page: 1, per_page: 25, total: 0 });
  const [filter, setFilter] = useState({ method: '', success: '' });
  const [sortField, setSortField] = useState('created_at');
  const [sortDir, setSortDir] = useState('desc');

  // Cleanup dialog state
  const [cleanupDays, setCleanupDays] = useState(30);
  const [showCleanupDialog, setShowCleanupDialog] = useState(false);
  const [cleanupLoading, setCleanupLoading] = useState(false);
  const [cleanupResult, setCleanupResult] = useState(null);

  // Fetch requests
  const fetchRequests = useCallback(async () => {
    try {
      setLoading(true);
      const params = {
        page: pagination.page,
        per_page: pagination.per_page,
        ...(filter.method && { method: filter.method }),
        ...(filter.success !== '' && { success: filter.success }),
      };

      const res = await adminAPI.requests.list(params);
      setRequests(res.data.data || []);
      setPagination((prev) => ({
        ...prev,
        total: res.data.pagination?.total || 0,
      }));
    } catch (error) {
      toast.error('Failed to load request logs');
    } finally {
      setLoading(false);
    }
  }, [pagination.page, pagination.per_page, filter]);

  useEffect(() => {
    fetchRequests();
  }, [fetchRequests]);

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

  const handleCleanup = async () => {
    try {
      setCleanupLoading(true);
      const res = await adminAPI.requests.cleanup({ days: cleanupDays });
      setCleanupResult(res.data);
      toast.success(`Cleaned up ${res.data.deleted_count} request logs`);
      fetchRequests();
    } catch (error) {
      toast.error('Failed to cleanup request logs');
      setShowCleanupDialog(false);
      setCleanupResult(null);
    } finally {
      setCleanupLoading(false);
    }
  };

  const columns = [
    {
      key: 'method',
      label: 'Method',
      render: (val) => (
        <span
          className={`inline-flex items-center px-2.5 py-1 rounded-full text-xs font-medium ${methodColors[val] || 'bg-zinc-500/10 text-zinc-400'}`}
        >
          {val}
        </span>
      ),
    },
    {
      key: 'path',
      label: 'Path',
      render: (val) => (
        <span className="font-mono text-sm text-text-secondary">{val}</span>
      ),
    },
    {
      key: 'status_code',
      label: 'Status',
      render: (val) => (
        <span
          className={`inline-flex items-center px-2.5 py-1 rounded-full text-xs font-medium ${
            val >= 200 && val < 300
              ? 'bg-green-500/10 text-green-400'
              : val >= 400 && val < 500
              ? 'bg-amber-500/10 text-amber-400'
              : val >= 500
              ? 'bg-red-500/10 text-red-400'
              : 'bg-zinc-500/10 text-zinc-400'
          }`}
        >
          {val}
        </span>
      ),
    },
    {
      key: 'success',
      label: 'Result',
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
        <span className="text-text-secondary">{val ? `${val}ms` : '-'}</span>
      ),
    },
    {
      key: 'user_id',
      label: 'User ID',
      render: (val) => (
        <span className="text-text-muted text-xs truncate max-w-[100px] block">
          {val || '-'}
        </span>
      ),
    },
    {
      key: 'created_at',
      label: 'Timestamp',
      sortable: true,
      render: (val) => new Date(val).toLocaleString('en-US', {
        month: 'short',
        day: 'numeric',
        hour: '2-digit',
        minute: '2-digit',
        second: '2-digit',
      }),
    },
  ];

  return (
    <div className="space-y-6">
      {/* Header */}
      <div className="flex items-center justify-between">
        <div>
          <h1 className="text-2xl font-bold text-text-primary">Request Logs</h1>
          <p className="text-text-muted mt-1">API request history and monitoring</p>
        </div>
        <button
          onClick={() => {
            setCleanupResult(null);
            setShowCleanupDialog(true);
          }}
          className="flex items-center gap-2 px-4 py-2.5 bg-red-500/10 text-red-400 hover:bg-red-500/20 rounded-xl transition-colors"
        >
          <Trash2 className="w-4 h-4" />
          <span className="font-medium">Cleanup Old Logs</span>
        </button>
      </div>

      {/* Filters */}
      <div className="flex flex-wrap items-center gap-4">
        <select
          value={filter.method}
          onChange={(e) => setFilter((f) => ({ ...f, method: e.target.value }))}
          className="px-3 py-2.5 bg-surface-card border border-border rounded-xl text-text-primary focus:outline-none focus:border-accent transition-colors"
        >
          <option value="">All Methods</option>
          <option value="GET">GET</option>
          <option value="POST">POST</option>
          <option value="PUT">PUT</option>
          <option value="DELETE">DELETE</option>
          <option value="PATCH">PATCH</option>
        </select>

        <select
          value={filter.success}
          onChange={(e) => setFilter((f) => ({ ...f, success: e.target.value }))}
          className="px-3 py-2.5 bg-surface-card border border-border rounded-xl text-text-primary focus:outline-none focus:border-accent transition-colors"
        >
          <option value="">All Results</option>
          <option value="true">Success</option>
          <option value="false">Failed</option>
        </select>
      </div>

      {/* Table */}
      <div className="bg-surface-card border border-border rounded-2xl overflow-hidden">
        {requests.length === 0 && !loading ? (
          <EmptyState
            icon={FileText}
            title="No request logs found"
            description="API requests will appear here."
          />
        ) : (
          <AdminTable
            columns={columns}
            data={requests}
            loading={loading}
            onSort={handleSort}
            sortField={sortField}
            sortDir={sortDir}
            emptyMessage="No requests match your filters"
          />
        )}
        {!loading && requests.length > 0 && (
          <AdminPagination
            total={pagination.total}
            limit={pagination.per_page}
            offset={(pagination.page - 1) * pagination.per_page}
            onPageChange={handlePageChange}
          />
        )}
      </div>

      {/* Cleanup Dialog */}
      {showCleanupDialog && (
        <CleanupDialog
          days={cleanupDays}
          result={cleanupResult}
          loading={cleanupLoading}
          onConfirm={handleCleanup}
          onClose={() => {
            setShowCleanupDialog(false);
            setCleanupResult(null);
          }}
          onDaysChange={setCleanupDays}
        />
      )}
    </div>
  );
};

const CleanupDialog = ({ days, result, loading, onConfirm, onClose, onDaysChange }) => {
  if (result) {
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
          className="w-full max-w-md bg-surface-elevated rounded-2xl border border-border shadow-2xl p-6"
          onClick={(e) => e.stopPropagation()}
        >
          <div className="text-center">
            <div className="w-16 h-16 rounded-full bg-green-500/10 flex items-center justify-center mx-auto mb-4">
              <Trash2 className="w-8 h-8 text-green-400" />
            </div>
            <h3 className="text-lg font-semibold text-text-primary">Cleanup Complete</h3>
            <p className="text-text-secondary mt-2">
              Successfully deleted <span className="font-semibold text-text-primary">{result.deleted_count}</span> old request logs.
            </p>
            <button
              onClick={onClose}
              className="mt-6 px-6 py-2.5 bg-accent text-white rounded-xl font-medium hover:bg-accent/90 transition-colors"
            >
              Done
            </button>
          </div>
        </motion.div>
      </motion.div>
    );
  }

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
        className="w-full max-w-md bg-surface-elevated rounded-2xl border border-border shadow-2xl"
        onClick={(e) => e.stopPropagation()}
      >
        <div className="p-6">
          <h3 className="text-lg font-semibold text-text-primary">Cleanup Request Logs</h3>
          <p className="text-sm text-text-muted mt-1">
            Delete request logs older than the specified number of days.
          </p>

          <div className="mt-6">
            <label className="block text-sm font-medium text-text-secondary mb-1.5">
              Delete logs older than
            </label>
            <div className="flex items-center gap-3">
              <input
                type="number"
                min="1"
                max="365"
                value={days}
                onChange={(e) => onDaysChange(parseInt(e.target.value) || 30)}
                className="w-24 px-3 py-2.5 bg-surface-card border border-border rounded-xl text-text-primary focus:outline-none focus:border-accent transition-colors"
              />
              <span className="text-text-secondary">days</span>
            </div>
          </div>
        </div>

        <div className="flex items-center justify-end gap-3 px-6 py-4 border-t border-border bg-surface-card/50 rounded-b-2xl">
          <button
            onClick={onClose}
            className="px-4 py-2 text-sm font-medium text-text-secondary hover:text-text-primary transition-colors"
          >
            Cancel
          </button>
          <button
            onClick={onConfirm}
            disabled={loading}
            className="px-4 py-2 text-sm font-medium bg-red-500 text-white rounded-xl hover:bg-red-600 transition-colors disabled:opacity-50"
          >
            {loading ? 'Cleaning...' : 'Cleanup'}
          </button>
        </div>
      </motion.div>
    </motion.div>
  );
};

export default AdminRequestLogsPage;