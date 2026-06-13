import { useState } from 'react';
import { motion } from 'framer-motion';
import { Check, X } from 'lucide-react';
import { emailTemplates } from '../lib/emailTemplates';

export const TemplateSelector = ({ onSelectTemplate, onSkip }) => {
  const [selectedId, setSelectedId] = useState(null);

  const handleSelect = (template) => {
    setSelectedId(template.id);
  };

  const handleConfirm = () => {
    if (selectedId) {
      const template = emailTemplates.find((t) => t.id === selectedId);
      onSelectTemplate(template);
    }
  };

  const handleSkip = () => {
    onSkip();
  };

  return (
    <div className="space-y-4">
      <div className="flex items-center justify-between">
        <div>
          <h2 className="text-lg sm:text-xl text-text-primary mb-1">
            Choose a Template
          </h2>
          <p className="text-text-secondary text-sm">
            Pick a layout to use as a base, or skip to let AI design freely.
          </p>
        </div>
        <button
          onClick={handleSkip}
          className="text-sm text-text-muted hover:text-text-secondary transition-colors flex items-center gap-1"
        >
          <X className="w-4 h-4" />
          Skip
        </button>
      </div>

      <div className="relative">
        <div className="flex gap-4 overflow-x-auto pb-4 snap-x snap-mandatory scrollbar-hide">
          {emailTemplates.map((template) => (
            <motion.div
              key={template.id}
              whileHover={{ scale: 1.02 }}
              whileTap={{ scale: 0.98 }}
              onClick={() => handleSelect(template)}
              className={`flex-shrink-0 w-64 cursor-pointer snap-center ${
                selectedId === template.id ? 'ring-2 ring-accent ring-offset-2 ring-offset-surface' : ''
              }`}
            >
              <div className="relative bg-surface-elevated border border-border rounded-lg overflow-hidden">
                {/* Template preview */}
                <div className="h-40 overflow-hidden bg-gray-100">
                  <iframe
                    srcDoc={template.html}
                    title={template.name}
                    className="w-full h-full border-0 transform scale-[0.4] origin-top-left pointer-events-none"
                    style={{ width: '250%', height: '250%' }}
                  />
                </div>

                {/* Template info */}
                <div className="p-3">
                  <p className="font-medium text-text-primary text-sm">{template.name}</p>
                  <p className="text-xs text-text-muted mt-0.5">{template.description}</p>
                </div>

                {/* Checkmark overlay */}
                {selectedId === template.id && (
                  <motion.div
                    initial={{ scale: 0 }}
                    animate={{ scale: 1 }}
                    className="absolute top-2 right-2 w-6 h-6 bg-accent rounded-full flex items-center justify-center"
                  >
                    <Check className="w-4 h-4 text-surface" strokeWidth={3} />
                  </motion.div>
                )}
              </div>
            </motion.div>
          ))}
        </div>
      </div>

      {selectedId && (
        <div className="flex justify-end">
          <button
            onClick={handleConfirm}
            className="px-4 py-2 bg-accent text-surface text-sm font-medium rounded-lg hover:bg-accent-hover transition-colors"
          >
            Use This Template
          </button>
        </div>
      )}
    </div>
  );
};

export default TemplateSelector;
