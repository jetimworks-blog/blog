import { clsx } from 'clsx';
import { motion } from 'framer-motion';
import { Sun, Moon, Monitor } from 'lucide-react';
import { useTheme } from '../../context/ThemeContext';

const themes = [
  { value: 'light', label: 'Light', Icon: Sun },
  { value: 'dark', label: 'Dark', Icon: Moon },
  { value: 'system', label: 'System', Icon: Monitor },
];

export const ThemeToggle = ({ className = '' }) => {
  const { theme, setTheme, mounted } = useTheme();

  if (!mounted) {
    return (
      <div className={clsx('flex gap-1 p-1 bg-surface-input rounded-none', className)}>
        {themes.map(({ value, label, Icon }) => (
          <div
            key={value}
            className="w-24 h-10 flex items-center justify-center"
          >
            <div className="w-20 h-8 bg-surface-elevated rounded-none animate-pulse" />
          </div>
        ))}
      </div>
    );
  }

  return (
    <div
      className={clsx(
        'flex gap-0 p-0.5 bg-surface-input border border-border',
        className
      )}
    >
      {themes.map(({ value, label, Icon }) => (
        <button
          key={value}
          type="button"
          onClick={() => setTheme(value)}
          className={clsx(
            'relative flex items-center gap-2 px-4 py-2.5 transition-all duration-200',
            'text-sm font-medium rounded-none',
            'focus:outline-none focus-visible:ring-2 focus-visible:ring-accent focus-visible:ring-offset-1 focus-visible:ring-offset-surface',
            theme === value
              ? 'bg-accent text-surface'
              : 'text-text-secondary hover:text-text-primary hover:bg-surface-elevated'
          )}
          aria-label={`${label} theme`}
          aria-pressed={theme === value}
        >
          {theme === value && (
            <motion.div
              layoutId="theme-indicator"
              className="absolute inset-0 bg-accent"
              transition={{ type: 'spring', stiffness: 400, damping: 30 }}
            />
          )}
          <span className="relative z-10 flex items-center gap-2">
            <Icon className="w-4 h-4" />
            <span>{label}</span>
          </span>
        </button>
      ))}
    </div>
  );
};

export default ThemeToggle;