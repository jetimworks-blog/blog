import { useState } from 'react';
import { motion } from 'framer-motion';
import { Check, X } from 'lucide-react';
import { templates, getTemplateHtml } from '../lib/templates';

export const TemplateSelector = ({ onSelectTemplate, onSkip }) => {
  const [selectedId, setSelectedId] = useState(null);
  const [loadingId, setLoadingId] = useState(null);

  const handleSelect = async (template) => {
    setSelectedId(template.id);
    setLoadingId(template.id);

    try {
      const html = await getTemplateHtml(template.id);
      if (html) {
        const templateWithHtml = { ...template, html };
        onSelectTemplate(templateWithHtml);
      }
    } catch (error) {
      console.error('Error loading template:', error);
    } finally {
      setLoadingId(null);
    }
  };

  const handleSkip = () => {
    setSelectedId(null);
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
          {templates.map((template) => (
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
                {/* Template preview - screenshot */}
                <div className="h-40 overflow-hidden bg-gray-100 flex items-center justify-center">
                  <img
                    src={template.screenshot}
                    alt={template.name}
                    className="w-full h-full object-cover object-top"
                  />
                  {loadingId === template.id && (
                    <div className="absolute inset-0 bg-black/50 flex items-center justify-center">
                      <div className="w-5 h-5 border-2 border-white border-t-transparent rounded-full animate-spin" />
                    </div>
                  )}
                </div>

                {/* Template info */}
                <div className="p-3">
                  <p className="font-medium text-text-primary text-sm">{template.name}</p>
                  <p className="text-xs text-text-muted mt-0.5">{template.description}</p>
                </div>

                {/* Checkmark overlay */}
                {selectedId === template.id && !loadingId && (
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
    </div>
  );
};

export default TemplateSelector;
