import { clsx } from 'clsx';

const statusConfig = {
  draft: { label: 'Draft', className: 'border-border text-text-muted' },
  scheduled: { label: 'Scheduled', className: 'border-warning text-warning' },
  sending: { label: 'Sending', className: 'border-accent text-accent animate-pulse' },
  completed: { label: 'Completed', className: 'border-success text-success' },
  cancelled: { label: 'Cancelled', className: 'border-text-muted text-text-muted' },
};

export const CampaignStatusBadge = ({ status }) => {
  const config = statusConfig[status] || statusConfig.draft;

  return (
    <span
      className={clsx(
        'inline-flex items-center px-2.5 py-1 border text-xs font-medium rounded-sm',
        config.className
      )}
    >
      {config.label}
    </span>
  );
};

export default CampaignStatusBadge;
