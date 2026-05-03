import { useState } from 'react';
import { clsx } from 'clsx';
import { MoreVertical, Edit, Send, XCircle, Trash2, ChevronUp, ChevronDown } from 'lucide-react';
import { CampaignStatusBadge } from './CampaignStatusBadge';

export const CampaignTable = ({
  campaigns = [],
  onEdit,
  onSend,
  onCancel,
  onDelete,
  onRowClick,
}) => {
  const [openDropdown, setOpenDropdown] = useState(null);
  const [sortField, setSortField] = useState('created_at');
  const [sortDir, setSortDir] = useState('desc');

  const handleSort = (field) => {
    if (sortField === field) {
      setSortDir(sortDir === 'asc' ? 'desc' : 'asc');
    } else {
      setSortField(field);
      setSortDir('desc');
    }
  };

  const sortedCampaigns = [...campaigns].sort((a, b) => {
    let aVal = a[sortField] || '';
    let bVal = b[sortField] || '';
    if (sortField === 'created_at' || sortField === 'scheduled_at') {
      aVal = new Date(aVal).getTime();
      bVal = new Date(bVal).getTime();
    }
    return sortDir === 'asc' ? aVal - bVal : bVal - aVal;
  });

  const formatDate = (dateString) => {
    if (!dateString) return '—';
    const date = new Date(dateString);
    return date.toLocaleDateString('en-US', {
      month: 'short',
      day: 'numeric',
      year: 'numeric',
    });
  };

  const getActions = (campaign) => {
    const status = campaign.status;
    const actions = [];

    if (status === 'draft') {
      actions.push(
        { label: 'Edit', icon: Edit, onClick: () => onEdit?.(campaign) },
        { label: 'Send', icon: Send, onClick: () => onSend?.(campaign) },
        { label: 'Delete', icon: Trash2, onClick: () => onDelete?.(campaign), danger: true }
      );
    } else if (status === 'scheduled') {
      actions.push(
        { label: 'Send Now', icon: Send, onClick: () => onSend?.(campaign) },
        { label: 'Cancel', icon: XCircle, onClick: () => onCancel?.(campaign) }
      );
    } else if (status === 'sending') {
      actions.push(
        { label: 'Cancel', icon: XCircle, onClick: () => onCancel?.(campaign) }
      );
    } else if (status === 'completed') {
      actions.push(
        { label: 'Delete', icon: Trash2, onClick: () => onDelete?.(campaign), danger: true }
      );
    } else if (status === 'cancelled') {
      actions.push(
        { label: 'Delete', icon: Trash2, onClick: () => onDelete?.(campaign), danger: true }
      );
    }

    return actions;
  };

  return (
    <div className="border border-border rounded-lg overflow-hidden">
      <div className="overflow-auto">
        <table className="w-full">
          <thead className="bg-surface-elevated text-text-muted text-sm">
            <tr>
              <th
                onClick={() => handleSort('name')}
                className="text-left px-4 py-3 font-medium cursor-pointer hover:text-text-primary transition-colors"
              >
                <div className="flex items-center gap-1">
                  Campaign
                  {sortField === 'name' && (sortDir === 'asc' ? <ChevronUp className="w-3 h-3" /> : <ChevronDown className="w-3 h-3" />)}
                </div>
              </th>
              <th
                onClick={() => handleSort('status')}
                className="text-left px-4 py-3 font-medium cursor-pointer hover:text-text-primary transition-colors"
              >
                <div className="flex items-center gap-1">
                  Status
                  {sortField === 'status' && (sortDir === 'asc' ? <ChevronUp className="w-3 h-3" /> : <ChevronDown className="w-3 h-3" />)}
                </div>
              </th>
              <th className="text-left px-4 py-3 font-medium">Audience</th>
              <th
                onClick={() => handleSort('created_at')}
                className="text-left px-4 py-3 font-medium cursor-pointer hover:text-text-primary transition-colors"
              >
                <div className="flex items-center gap-1">
                  Created
                  {sortField === 'created_at' && (sortDir === 'asc' ? <ChevronUp className="w-3 h-3" /> : <ChevronDown className="w-3 h-3" />)}
                </div>
              </th>
              <th className="text-right px-4 py-3 font-medium">Actions</th>
            </tr>
          </thead>
          <tbody>
            {sortedCampaigns.length === 0 ? (
              <tr>
                <td colSpan={5} className="px-4 py-12 text-center text-text-muted">
                  No campaigns yet
                </td>
              </tr>
            ) : (
              sortedCampaigns.map((campaign, index) => (
                <tr
                  key={campaign.id}
                  className="border-t border-border hover:bg-surface-elevated transition-colors cursor-pointer"
                  onClick={() => onRowClick?.(campaign)}
                >
                  <td className="px-4 py-4">
                    <div>
                      <p className="font-medium text-text-primary">{campaign.name}</p>
                      <p className="text-sm text-text-muted truncate max-w-xs">
                        {campaign.subject}
                      </p>
                    </div>
                  </td>
                  <td className="px-4 py-4">
                    <CampaignStatusBadge status={campaign.status} />
                  </td>
                  <td className="px-4 py-4">
                    <span className="text-text-secondary">
                      {campaign.csv_row_count || 0}
                    </span>
                  </td>
                  <td className="px-4 py-4 text-text-muted text-sm">
                    {formatDate(campaign.created_at)}
                  </td>
                  <td className="px-4 py-4 text-right">
                    <div className="relative">
                      <button
                        onClick={(e) => {
                          e.stopPropagation();
                          setOpenDropdown(openDropdown === campaign.id ? null : campaign.id);
                        }}
                        className="p-2 text-text-muted hover:text-text-primary transition-colors"
                      >
                        <MoreVertical className="w-4 h-4" />
                      </button>

                      {/* Dropdown */}
                      {openDropdown === campaign.id && (
                        <>
                          <div
                            className="fixed inset-0 z-10"
                            onClick={(e) => {
                              e.stopPropagation();
                              setOpenDropdown(null);
                            }}
                          />
                          <div
                            className="absolute right-0 top-full mt-1 w-40 bg-surface-elevated border border-border rounded-lg shadow-lg z-20 py-1"
                          >
                            {getActions(campaign).map((action, idx) => (
                              <button
                                key={idx}
                                onClick={(e) => {
                                  e.stopPropagation();
                                  setOpenDropdown(null);
                                  action.onClick();
                                }}
                                className={clsx(
                                  'w-full flex items-center gap-2 px-4 py-2 text-sm text-left transition-colors',
                                  action.danger
                                    ? 'text-error hover:bg-error-muted'
                                    : 'text-text-secondary hover:bg-surface hover:text-text-primary'
                                )}
                              >
                                <action.icon className="w-4 h-4" />
                                {action.label}
                              </button>
                            ))}
                          </div>
                        </>
                      )}
                    </div>
                  </td>
                </tr>
              ))
            )}
          </tbody>
        </table>
      </div>
    </div>
  );
};

export default CampaignTable;
