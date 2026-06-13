import { AnimatePresence, motion } from 'framer-motion';
import { X, Eye } from 'lucide-react';
import { Button } from '../ui/Button';
import { EmailPreview } from '../ui/EmailPreview';

export const CampaignPreviewModal = ({ isOpen, html, onClose, campaign }) => {
  const handleClose = () => {
    onClose?.();
  };

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

          {/* Modal */}
          <motion.div
            initial={{ opacity: 0, scale: 0.9 }}
            animate={{ opacity: 1, scale: 1 }}
            exit={{ opacity: 0, scale: 0.9 }}
            transition={{ duration: 0.2 }}
            className="relative w-full max-w-5xl h-[80vh] bg-surface-elevated border border-border shadow-2xl rounded-lg flex flex-col overflow-hidden"
          >
            {/* Header */}
            <div className="flex items-center justify-between p-4 border-b border-border shrink-0">
              <div className="flex items-center gap-3">
                <Eye className="w-5 h-5 text-accent" />
                <h2 className="text-lg font-semibold text-text-primary">Email Preview</h2>
                {campaign && (
                  <span className="text-sm text-text-muted">
                    {campaign.subject}
                  </span>
                )}
              </div>
              <button
                onClick={handleClose}
                className="p-2 text-text-muted hover:text-text-primary transition-colors"
              >
                <X className="w-5 h-5" />
              </button>
            </div>

            {/* Content */}
            <div className="relative flex-1 min-h-0 overflow-auto bg-gray-900 p-6">
              <div className="relative w-full h-full min-h-[400px]">
                <EmailPreview html={html || ''} />
              </div>
            </div>

            {/* Footer */}
            <div className="flex items-center justify-end gap-3 p-4 border-t border-border shrink-0">
              <Button variant="ghost" onClick={handleClose}>
                Close
              </Button>
            </div>
          </motion.div>
        </div>
      )}
    </AnimatePresence>
  );
};

export default CampaignPreviewModal;
