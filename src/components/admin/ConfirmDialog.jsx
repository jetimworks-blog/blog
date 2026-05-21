import { motion } from 'framer-motion';
import { AlertTriangle, X } from 'lucide-react';

export const ConfirmDialog = ({
  isOpen,
  title,
  message,
  confirmLabel = 'Confirm',
  cancelLabel = 'Cancel',
  variant = 'danger',
  onConfirm,
  onCancel,
  loading = false,
}) => {
  if (!isOpen) return null;

  const variantStyles = {
    danger: {
      confirmBtn: 'bg-red-600 hover:bg-red-700 text-white',
      icon: 'text-red-500',
      iconBg: 'bg-red-500/10',
    },
    warning: {
      confirmBtn: 'bg-amber-600 hover:bg-amber-700 text-white',
      icon: 'text-amber-500',
      iconBg: 'bg-amber-500/10',
    },
  };

  const styles = variantStyles[variant] || variantStyles.danger;

  return (
    <motion.div
      initial={{ opacity: 0 }}
      animate={{ opacity: 1 }}
      exit={{ opacity: 0 }}
      className="fixed inset-0 z-50 flex items-center justify-center p-4 bg-black/50 backdrop-blur-sm"
      onClick={onCancel}
    >
      <motion.div
        initial={{ scale: 0.95, opacity: 0 }}
        animate={{ scale: 1, opacity: 1 }}
        exit={{ scale: 0.95, opacity: 0 }}
        className="w-full max-w-md bg-surface-elevated rounded-2xl border border-border shadow-2xl"
        onClick={(e) => e.stopPropagation()}
      >
        <div className="p-6">
          <div className="flex items-start gap-4">
            <div className={`w-12 h-12 rounded-full ${styles.iconBg} flex items-center justify-center flex-shrink-0`}>
              <AlertTriangle className={`w-6 h-6 ${styles.icon}`} />
            </div>
            <div className="flex-1">
              <h3 className="text-lg font-semibold text-text-primary">{title}</h3>
              <p className="mt-2 text-sm text-text-secondary">{message}</p>
            </div>
            <button
              onClick={onCancel}
              className="p-2 rounded-lg text-text-muted hover:bg-surface-card transition-colors"
            >
              <X className="w-5 h-5" />
            </button>
          </div>
        </div>

        <div className="flex items-center justify-end gap-3 px-6 py-4 border-t border-border bg-surface-card/50 rounded-b-2xl">
          <button
            onClick={onCancel}
            disabled={loading}
            className="px-4 py-2 text-sm font-medium text-text-secondary hover:text-text-primary transition-colors"
          >
            {cancelLabel}
          </button>
          <button
            onClick={onConfirm}
            disabled={loading}
            className={`px-4 py-2 text-sm font-medium rounded-xl transition-colors disabled:opacity-50 ${styles.confirmBtn}`}
          >
            {loading ? 'Loading...' : confirmLabel}
          </button>
        </div>
      </motion.div>
    </motion.div>
  );
};

export default ConfirmDialog;