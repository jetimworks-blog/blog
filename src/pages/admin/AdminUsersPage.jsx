import { useState, useEffect, useCallback } from 'react';
import { motion } from 'framer-motion';
import { Search, Filter, UserPlus } from 'lucide-react';
import { adminAPI } from '../../lib/api';
import { AdminTable } from '../../components/admin/AdminTable';
import { AdminPagination } from '../../components/admin/AdminPagination';
import { ConfirmDialog } from '../../components/admin/ConfirmDialog';
import { EmptyState } from '../../components/admin/EmptyState';
import { toast } from 'sonner';

export const AdminUsersPage = () => {
  const [users, setUsers] = useState([]);
  const [loading, setLoading] = useState(true);
  const [pagination, setPagination] = useState({ page: 1, per_page: 25, total: 0 });
  const [search, setSearch] = useState('');
  const [debouncedSearch, setDebouncedSearch] = useState('');
  const [filter, setFilter] = useState({ is_staff: '', is_active: '' });
  const [sortField, setSortField] = useState('created_at');
  const [sortDir, setSortDir] = useState('desc');

  // Edit modal state
  const [selectedUser, setSelectedUser] = useState(null);
  const [editLoading, setEditLoading] = useState(false);

  // Delete dialog state
  const [deleteUser, setDeleteUser] = useState(null);
  const [deleteLoading, setDeleteLoading] = useState(false);

  // Debounce search
  useEffect(() => {
    const timer = setTimeout(() => setDebouncedSearch(search), 300);
    return () => clearTimeout(timer);
  }, [search]);

  // Fetch users
  const fetchUsers = useCallback(async () => {
    try {
      setLoading(true);
      const params = {
        page: pagination.page,
        per_page: pagination.per_page,
        ...(debouncedSearch && { search: debouncedSearch }),
        ...(filter.is_staff && { is_staff: filter.is_staff }),
        ...(filter.is_active && { is_active: filter.is_active }),
      };

      const res = await adminAPI.users.list(params);
      setUsers(res.data.data || []);
      setPagination((prev) => ({
        ...prev,
        total: res.data.pagination?.total || 0,
      }));
    } catch (error) {
      toast.error('Failed to load users');
    } finally {
      setLoading(false);
    }
  }, [pagination.page, pagination.per_page, debouncedSearch, filter]);

  useEffect(() => {
    fetchUsers();
  }, [fetchUsers]);

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

  const handleEditUser = async (data) => {
    try {
      setEditLoading(true);
      await adminAPI.users.update(selectedUser.id, data);
      toast.success('User updated successfully');
      setSelectedUser(null);
      fetchUsers();
    } catch (error) {
      toast.error('Failed to update user');
    } finally {
      setEditLoading(false);
    }
  };

  const handleDeleteUser = async () => {
    try {
      setDeleteLoading(true);
      await adminAPI.users.delete(deleteUser.id);
      toast.success('User deleted successfully');
      setDeleteUser(null);
      fetchUsers();
    } catch (error) {
      toast.error('Failed to delete user');
    } finally {
      setDeleteLoading(false);
    }
  };

  const columns = [
    {
      key: 'email',
      label: 'Email',
      sortable: true,
      render: (val) => (
        <span className="font-medium text-text-primary">{val}</span>
      ),
    },
    {
      key: 'firstname',
      label: 'First Name',
      render: (val, row) => val || '-',
    },
    {
      key: 'lastname',
      label: 'Last Name',
      render: (val, row) => val || '-',
    },
    {
      key: 'is_staff',
      label: 'Role',
      render: (val) => (
        <span
          className={`inline-flex items-center px-2.5 py-1 rounded-full text-xs font-medium ${
            val
              ? 'bg-purple-500/10 text-purple-400'
              : 'bg-zinc-500/10 text-zinc-400'
          }`}
        >
          {val ? 'Staff' : 'User'}
        </span>
      ),
    },
    {
      key: 'is_active',
      label: 'Status',
      render: (val) => (
        <span
          className={`inline-flex items-center px-2.5 py-1 rounded-full text-xs font-medium ${
            val
              ? 'bg-green-500/10 text-green-400'
              : 'bg-red-500/10 text-red-400'
          }`}
        >
          {val ? 'Active' : 'Inactive'}
        </span>
      ),
    },
    {
      key: 'created_at',
      label: 'Joined',
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
              setSelectedUser(row);
            }}
            className="px-3 py-1.5 text-xs font-medium text-accent hover:bg-accent/10 rounded-lg transition-colors"
          >
            Edit
          </button>
          <button
            onClick={(e) => {
              e.stopPropagation();
              setDeleteUser(row);
            }}
            className="px-3 py-1.5 text-xs font-medium text-red-400 hover:bg-red-500/10 rounded-lg transition-colors"
          >
            Delete
          </button>
        </div>
      ),
    },
  ];

  return (
    <div className="space-y-6">
      {/* Header */}
      <div className="flex items-center justify-between">
        <div>
          <h1 className="text-2xl font-bold text-text-primary">Users</h1>
          <p className="text-text-muted mt-1">Manage registered users</p>
        </div>
      </div>

      {/* Filters */}
      <div className="flex flex-wrap items-center gap-4">
        <div className="relative flex-1 min-w-[200px] max-w-md">
          <Search className="absolute left-3 top-1/2 -translate-y-1/2 w-4 h-4 text-text-muted" />
          <input
            type="text"
            placeholder="Search by email..."
            value={search}
            onChange={(e) => setSearch(e.target.value)}
            className="w-full pl-10 pr-4 py-2.5 bg-surface-card border border-border rounded-xl text-text-primary placeholder:text-text-muted focus:outline-none focus:border-accent transition-colors"
          />
        </div>

        <div className="flex items-center gap-2">
          <select
            value={filter.is_staff}
            onChange={(e) => setFilter((f) => ({ ...f, is_staff: e.target.value }))}
            className="px-3 py-2.5 bg-surface-card border border-border rounded-xl text-text-primary focus:outline-none focus:border-accent transition-colors"
          >
            <option value="">All Roles</option>
            <option value="true">Staff</option>
            <option value="false">Users</option>
          </select>

          <select
            value={filter.is_active}
            onChange={(e) => setFilter((f) => ({ ...f, is_active: e.target.value }))}
            className="px-3 py-2.5 bg-surface-card border border-border rounded-xl text-text-primary focus:outline-none focus:border-accent transition-colors"
          >
            <option value="">All Status</option>
            <option value="true">Active</option>
            <option value="false">Inactive</option>
          </select>
        </div>
      </div>

      {/* Table */}
      <div className="bg-surface-card border border-border rounded-2xl overflow-hidden">
        {users.length === 0 && !loading ? (
          <EmptyState
            icon={UserPlus}
            title="No users found"
            description="Users will appear here once they register."
          />
        ) : (
          <AdminTable
            columns={columns}
            data={users}
            loading={loading}
            onSort={handleSort}
            sortField={sortField}
            sortDir={sortDir}
            emptyMessage="No users match your filters"
          />
        )}
        {!loading && users.length > 0 && (
          <AdminPagination
            total={pagination.total}
            limit={pagination.per_page}
            offset={(pagination.page - 1) * pagination.per_page}
            onPageChange={handlePageChange}
          />
        )}
      </div>

      {/* Edit Modal */}
      {selectedUser && (
        <EditUserModal
          user={selectedUser}
          onClose={() => setSelectedUser(null)}
          onSave={handleEditUser}
          loading={editLoading}
        />
      )}

      {/* Delete Confirmation */}
      <ConfirmDialog
        isOpen={!!deleteUser}
        title="Delete User"
        message={`Are you sure you want to delete ${deleteUser?.email}? This action cannot be undone and will remove all associated data.`}
        confirmLabel="Delete"
        variant="danger"
        onConfirm={handleDeleteUser}
        onCancel={() => setDeleteUser(null)}
        loading={deleteLoading}
      />
    </div>
  );
};

const EditUserModal = ({ user, onClose, onSave, loading }) => {
  const [formData, setFormData] = useState({
    firstname: user.firstname || '',
    lastname: user.lastname || '',
    is_staff: user.is_staff,
    is_active: user.is_active,
    is_verified: user.is_verified,
  });

  const handleSubmit = (e) => {
    e.preventDefault();
    onSave(formData);
  };

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
        <form onSubmit={handleSubmit}>
          <div className="p-6">
            <h3 className="text-lg font-semibold text-text-primary">Edit User</h3>
            <p className="text-sm text-text-muted mt-1">{user.email}</p>

            <div className="mt-6 space-y-4">
              <div className="grid grid-cols-2 gap-4">
                <div>
                  <label className="block text-sm font-medium text-text-secondary mb-1.5">
                    First Name
                  </label>
                  <input
                    type="text"
                    value={formData.firstname}
                    onChange={(e) => setFormData((f) => ({ ...f, firstname: e.target.value }))}
                    className="w-full px-3 py-2.5 bg-surface-card border border-border rounded-xl text-text-primary focus:outline-none focus:border-accent transition-colors"
                  />
                </div>
                <div>
                  <label className="block text-sm font-medium text-text-secondary mb-1.5">
                    Last Name
                  </label>
                  <input
                    type="text"
                    value={formData.lastname}
                    onChange={(e) => setFormData((f) => ({ ...f, lastname: e.target.value }))}
                    className="w-full px-3 py-2.5 bg-surface-card border border-border rounded-xl text-text-primary focus:outline-none focus:border-accent transition-colors"
                  />
                </div>
              </div>

              <div className="space-y-3">
                <label className="flex items-center gap-3 cursor-pointer">
                  <input
                    type="checkbox"
                    checked={formData.is_staff}
                    onChange={(e) => setFormData((f) => ({ ...f, is_staff: e.target.checked }))}
                    className="w-4 h-4 rounded border-border bg-surface-card text-accent focus:ring-accent"
                  />
                  <span className="text-sm text-text-primary">Staff Member</span>
                </label>

                <label className="flex items-center gap-3 cursor-pointer">
                  <input
                    type="checkbox"
                    checked={formData.is_active}
                    onChange={(e) => setFormData((f) => ({ ...f, is_active: e.target.checked }))}
                    className="w-4 h-4 rounded border-border bg-surface-card text-accent focus:ring-accent"
                  />
                  <span className="text-sm text-text-primary">Active</span>
                </label>

                <label className="flex items-center gap-3 cursor-pointer">
                  <input
                    type="checkbox"
                    checked={formData.is_verified}
                    onChange={(e) => setFormData((f) => ({ ...f, is_verified: e.target.checked }))}
                    className="w-4 h-4 rounded border-border bg-surface-card text-accent focus:ring-accent"
                  />
                  <span className="text-sm text-text-primary">Verified</span>
                </label>
              </div>
            </div>
          </div>

          <div className="flex items-center justify-end gap-3 px-6 py-4 border-t border-border bg-surface-card/50 rounded-b-2xl">
            <button
              type="button"
              onClick={onClose}
              className="px-4 py-2 text-sm font-medium text-text-secondary hover:text-text-primary transition-colors"
            >
              Cancel
            </button>
            <button
              type="submit"
              disabled={loading}
              className="px-4 py-2 text-sm font-medium bg-accent text-white rounded-xl hover:bg-accent/90 transition-colors disabled:opacity-50"
            >
              {loading ? 'Saving...' : 'Save Changes'}
            </button>
          </div>
        </form>
      </motion.div>
    </motion.div>
  );
};

export default AdminUsersPage;