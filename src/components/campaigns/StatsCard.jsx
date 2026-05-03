import { clsx } from 'clsx';
import { motion } from 'framer-motion';

export const StatsCard = ({ title, value, subtitle, icon: Icon, trend }) => {
  return (
    <motion.div
      initial={{ opacity: 0, y: 20 }}
      animate={{ opacity: 1, y: 0 }}
      transition={{ type: 'spring', stiffness: 200 }}
      whileHover={{ y: -2, boxShadow: '0 4px 12px rgba(0,0,0,0.15)' }}
      className="bg-surface-elevated border border-border p-6 rounded-lg"
    >
      <div className="flex items-start justify-between">
        <div>
          <p className="text-sm text-text-muted mb-1">{title}</p>
          <p className="text-3xl font-semibold text-text-primary">{value}</p>
          {subtitle && (
            <p className="text-sm text-text-muted mt-1">{subtitle}</p>
          )}
          {trend !== undefined && (
            <p className={clsx(
              'text-sm mt-1',
              trend > 0 ? 'text-success' : trend < 0 ? 'text-error' : 'text-text-muted'
            )}>
              {trend > 0 ? '+' : ''}{trend}%
            </p>
          )}
        </div>
        {Icon && (
          <div className="w-10 h-10 bg-accent/10 flex items-center justify-center">
            <Icon className="w-5 h-5 text-accent" />
          </div>
        )}
      </div>
    </motion.div>
  );
};

export default StatsCard;
