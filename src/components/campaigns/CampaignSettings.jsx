import { Input } from '../ui/Input';

export const CampaignSettings = ({
  track_opens = true,
  track_clicks = true,
  rate_limit = 60,
  schedule_type = 'one_time',
  scheduled_at = '',
  cron_expression = '',
  onChange,
  errors = {},
}) => {
  const handleChange = (field, value) => {
    onChange?.({ [field]: value });
  };

  return (
    <div className="space-y-6">
      {/* Tracking options */}
      <div className="space-y-4">
        <h4 className="text-sm font-medium text-text-primary">Tracking</h4>
        <div className="space-y-3">
          <label className="flex items-center gap-3 cursor-pointer">
            <input
              type="checkbox"
              checked={track_opens}
              onChange={(e) => handleChange('track_opens', e.target.checked)}
              className="w-4 h-4 rounded border-border text-accent focus:ring-accent"
            />
            <div>
              <p className="text-sm text-text-primary">Track opens</p>
              <p className="text-xs text-text-muted">
                Insert a 1x1 pixel to track when recipients open your email
              </p>
            </div>
          </label>
          <label className="flex items-center gap-3 cursor-pointer">
            <input
              type="checkbox"
              checked={track_clicks}
              onChange={(e) => handleChange('track_clicks', e.target.checked)}
              className="w-4 h-4 rounded border-border text-accent focus:ring-accent"
            />
            <div>
              <p className="text-sm text-text-primary">Track clicks</p>
              <p className="text-xs text-text-muted">
                Rewrite links to track when recipients click
              </p>
            </div>
          </label>
        </div>
      </div>

      {/* Rate limit */}
      <div className="space-y-4">
        <h4 className="text-sm font-medium text-text-primary">Sending Rate</h4>
        <div className="max-w-xs">
          <Input
            type="number"
            label="Emails per minute"
            value={rate_limit}
            onChange={(e) => handleChange('rate_limit', parseInt(e.target.value) || 60)}
            min={1}
            max={1000}
            error={errors.rate_limit}
            placeholder="60"
          />
          <p className="text-xs text-text-muted mt-1">
            Higher rates send faster but may trigger spam filters. Default: 60
          </p>
        </div>
      </div>

      {/* Schedule type */}
      <div className="space-y-4">
        <h4 className="text-sm font-medium text-text-primary">Schedule</h4>
        <div className="flex gap-4">
          <label className="flex items-center gap-2 cursor-pointer">
            <input
              type="radio"
              name="schedule_type"
              value="one_time"
              checked={schedule_type === 'one_time'}
              onChange={(e) => handleChange('schedule_type', e.target.value)}
              className="w-4 h-4 border-border text-accent focus:ring-accent"
            />
            <span className="text-sm text-text-primary">One-time</span>
          </label>
          <label className="flex items-center gap-2 cursor-pointer">
            <input
              type="radio"
              name="schedule_type"
              value="recurring"
              checked={schedule_type === 'recurring'}
              onChange={(e) => handleChange('schedule_type', e.target.value)}
              className="w-4 h-4 border-border text-accent focus:ring-accent"
            />
            <span className="text-sm text-text-primary">Recurring</span>
          </label>
        </div>

        {/* Schedule fields */}
        {schedule_type === 'one_time' && (
          <div className="max-w-xs">
            <Input
              type="datetime-local"
              label="Send date & time"
              value={scheduled_at}
              onChange={(e) => handleChange('scheduled_at', e.target.value)}
              error={errors.scheduled_at}
            />
            <p className="text-xs text-text-muted mt-1">
              ISO 8601 format: 2026-06-01T09:00
            </p>
          </div>
        )}

        {schedule_type === 'recurring' && (
          <div className="max-w-xs">
            <Input
              type="text"
              label="Cron expression"
              value={cron_expression}
              onChange={(e) => handleChange('cron_expression', e.target.value)}
              placeholder="0 9 * * 1-5"
              error={errors.cron_expression}
            />
            <p className="text-xs text-text-muted mt-1">
              Format: minute hour day-of-month month day-of-week
            </p>
            <div className="mt-2 text-xs text-text-muted">
              <p>Examples:</p>
              <p>• 0 9 * * 1-5 — 9am weekdays</p>
              <p>• 0 18 * * * — 6pm daily</p>
              <p>• 0 9 1 * * — 9am on the 1st of each month</p>
            </div>
          </div>
        )}
      </div>
    </div>
  );
};

export default CampaignSettings;
