import { useState } from 'react';
import { AnimatePresence, motion } from 'framer-motion';
import { AlertTriangle, Send } from 'lucide-react';
import { Button } from '../ui/Button';

export const SendConfirmDialog = ({
  isOpen,
  campaign,
  contactCount = 0,
  onConfirm,
  onCancel,
}) => {
  const [isSending, setIsSending] = useState(false);
  const [confirmed, setConfirmed] = useState(false);

  const handleSend = async () => {
    setIsSending(true);
    try {
      await onConfirm?.();
    } finally {
      setIsSending(false);
      setConfirmed(false);
    }
  };

  const handleClose = () => {
    setConfirmed(false);
    setIsSending(false);
    onCancel?.();
  };

  if (!campaign) return null;

  return (
    <AnimatePresence>
      {isOpen && (
        <div className="fixed inset-0 z-50 flex items-center justify-center p-4">
          {/* Backdrop */}
          <motion.div
            initial={{ opacity: 0 }}
            animate={{ opacity: 1 }}
            exit={{ opacity: 0 }}
            className="absolute inset-0 bg-black/70 backdrop-blur-sm"
            onClick={handleClose}
          />

          {/* Dialog */}
          <motion.div
            initial={{ opacity: 0, scale: 0.9 }}
            animate={{ opacity: 1, scale: 1 }}
            exit={{ opacity: 0, scale: 0.9 }}
            transition={{ duration: 0.2 }}
            className="relative w-full max-w-md bg-surface-elevated border border-border shadow-2xl rounded-lg overflow-hidden"
          >
            {/* Icon */}
            <div className="flex justify-center pt-8 pb-4">
              <div className="w-16 h-16 rounded-full bg-warning/10 flex items-center justify-center">
                <AlertTriangle className="w-8 h-8 text-warning" />
              </div>
            </div>

            {/* Content */}
            <div className="px-8 pb-6 text-center">
              <h2 className="text-xl font-semibold text-text-primary mb-2">
                Send Campaign?
              </h2>
              <p className="text-text-muted mb-6">
                You are about to send <strong>{campaign.subject}</strong> to{' '}
                <strong>{contactCount} contact{contactCount !== 1 ? 's' : ''}</strong>.
                This action cannot be undone.
              </p>

              {/* Confirmation checkbox */}
              <label className="flex items-start gap-3 text-left p-4 border border-border rounded-lg cursor-pointer hover:bg-surface transition-colors">
                <input
                  type="checkbox"
                  checked={confirmed}
                  onChange={(e) => setConfirmed(e.target.checked)}
                  className="w-4 h-4 mt-1 rounded border-border text-accent focus:ring-accent"
                />
                <span className="text-sm text-text-secondary">
                  I confirm that I want to send this campaign to {contactCount} contact{contactCount !== 1 ? 's' : ''}
                </span>
              </label>
            </div>

            {/* Actions */}
            <div className="flex gap-3 px-8 pb-8">
              <Button
                variant="secondary"
                onClick={handleClose}
                disabled={isSending}
                className="flex-1"
              >
                Cancel
              </Button>
              <Button
                onClick={handleSend}
                disabled={!confirmed || isSending}
                loading={isSending}
                className="flex-1"
              >
                <Send className="w-4 h-4 mr-2" />
                Send Now
              </Button>
            </div>
          </motion.div>
        </div>
      )}
    </AnimatePresence>
  );
};

export default SendConfirmDialog;
