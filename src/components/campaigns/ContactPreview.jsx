import { useState } from 'react';
import { clsx } from 'clsx';
import { ChevronLeft, ChevronRight, ChevronsLeft, ChevronsRight } from 'lucide-react';
import { Button } from '../ui/Button';

export const ContactPreview = ({
  contacts = [],
  total = 0,
  limit = 20,
  offset = 0,
  onPageChange,
  isLoading = false,
}) => {
  const [sortField, setSortField] = useState('email');
  const [sortDir, setSortDir] = useState('asc');

  const totalPages = Math.ceil(total / limit);
  const currentPage = Math.floor(offset / limit) + 1;

  const handleSort = (field) => {
    if (sortField === field) {
      setSortDir(sortDir === 'asc' ? 'desc' : 'asc');
    } else {
      setSortField(field);
      setSortDir('asc');
    }
  };

  const sortedContacts = [...contacts].sort((a, b) => {
    const aVal = a[sortField] || '';
    const bVal = b[sortField] || '';
    return sortDir === 'asc'
      ? aVal.localeCompare(bVal)
      : bVal.localeCompare(aVal);
  });

  const headers = contacts.length > 0
    ? Object.keys(contacts[0]).filter(k => k !== 'row' && k !== 'id' && k !== 'campaign_id')
    : ['email'];

  return (
    <div className="border border-border rounded-lg overflow-hidden">
      {/* Table */}
      <div className="overflow-auto max-h-96">
        <table className="w-full text-sm">
          <thead className="bg-surface-elevated text-text-muted sticky top-0">
            <tr>
              <th className="text-left px-4 py-3 font-medium w-12">#</th>
              {headers.map(header => (
                <th
                  key={header}
                  onClick={() => handleSort(header)}
                  className="text-left px-4 py-3 font-medium cursor-pointer hover:text-text-primary transition-colors"
                >
                  <div className="flex items-center gap-1 capitalize">
                    {header.replace('_', ' ')}
                    {sortField === header && (
                      <span className="text-accent">{sortDir === 'asc' ? '↑' : '↓'}</span>
                    )}
                  </div>
                </th>
              ))}
            </tr>
          </thead>
          <tbody>
            {sortedContacts.length === 0 ? (
              <tr>
                <td colSpan={headers.length + 1} className="px-4 py-8 text-center text-text-muted">
                  No contacts imported yet
                </td>
              </tr>
            ) : (
              sortedContacts.map((contact, idx) => (
                <tr key={idx} className="border-t border-border hover:bg-surface-elevated transition-colors">
                  <td className="px-4 py-3 text-text-muted">{offset + idx + 1}</td>
                  {headers.map(header => (
                    <td key={header} className="px-4 py-3 text-text-primary">
                      {contact[header] || '—'}
                    </td>
                  ))}
                </tr>
              ))
            )}
          </tbody>
        </table>
      </div>

      {/* Pagination */}
      {totalPages > 1 && (
        <div className="flex items-center justify-between px-4 py-3 bg-surface-elevated border-t border-border">
          <p className="text-sm text-text-muted">
            Showing {offset + 1}-{Math.min(offset + limit, total)} of {total}
          </p>
          <div className="flex items-center gap-2">
            <Button
              variant="ghost"
              size="sm"
              onClick={() => onPageChange?.(0)}
              disabled={offset === 0}
            >
              <ChevronsLeft className="w-4 h-4" />
            </Button>
            <Button
              variant="ghost"
              size="sm"
              onClick={() => onPageChange?.(offset - limit)}
              disabled={offset === 0}
            >
              <ChevronLeft className="w-4 h-4" />
            </Button>
            <span className="text-sm text-text-muted px-2">
              Page {currentPage} of {totalPages}
            </span>
            <Button
              variant="ghost"
              size="sm"
              onClick={() => onPageChange?.(offset + limit)}
              disabled={offset + limit >= total}
            >
              <ChevronRight className="w-4 h-4" />
            </Button>
            <Button
              variant="ghost"
              size="sm"
              onClick={() => onPageChange?.((totalPages - 1) * limit)}
              disabled={offset + limit >= total}
            >
              <ChevronsRight className="w-4 h-4" />
            </Button>
          </div>
        </div>
      )}
    </div>
  );
};

export default ContactPreview;
