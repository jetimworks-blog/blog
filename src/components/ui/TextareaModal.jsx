import { useState, useEffect } from 'react';
import { motion, AnimatePresence } from 'framer-motion';
import { X, Maximize2 } from 'lucide-react';
import { Button } from './Button';

export const TextareaModal = ({ isOpen, value, onSave, onClose, label, placeholder }) => {
  const [text, setText] = useState(value);

  useEffect(() => {
    setText(value);
  }, [value, isOpen]);

  const handleSave = () => {
    onSave(text);
    onClose();
  };

  const handleClose = () => {
    setText(value);
    onClose();
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

          {/* Modal Container */}
          <motion.div
            initial={{ opacity: 0, scale: 0.9 }}
            animate={{ opacity: 1, scale: 1 }}
            exit={{ opacity: 0, scale: 0.9 }}
            transition={{ duration: 0.2 }}
            className="relative w-full max-w-3xl h-[70vh] bg-surface-elevated border border-border shadow-2xl rounded-lg flex flex-col overflow-hidden"
          >
            {/* Header */}
            <div className="flex items-center justify-between p-4 border-b border-border shrink-0">
              <div className="flex items-center gap-3">
                <Maximize2 className="w-5 h-5 text-accent" />
                <h2 className="text-lg font-semibold text-text-primary">{label}</h2>
              </div>
              <button
                onClick={handleClose}
                className="p-2 text-text-muted hover:text-text-primary transition-colors"
              >
                <X className="w-5 h-5" />
              </button>
            </div>

            {/* Content */}
            <div className="flex-1 min-h-0 p-4">
              <textarea
                value={text}
                onChange={(e) => setText(e.target.value)}
                placeholder={placeholder}
                className="w-full h-full bg-surface-input border border-border rounded-lg p-4 text-text-primary placeholder-text-muted resize-none focus:outline-none focus:ring-2 focus:ring-accent/50"
                autoFocus
              />
            </div>

            {/* Footer */}
            <div className="flex items-center justify-end gap-3 p-4 border-t border-border shrink-0">
              <Button variant="ghost" onClick={handleClose}>
                Cancel
              </Button>
              <Button onClick={handleSave}>
                Apply
              </Button>
            </div>
          </motion.div>
        </div>
      )}
    </AnimatePresence>
  );
};

export default TextareaModal;