import { useState, useEffect } from 'react';
import { motion, AnimatePresence } from 'framer-motion';
import Editor from '@monaco-editor/react';
import { X, Save, Eye, Code } from 'lucide-react';
import { Button } from './Button';

export const HtmlEditorModal = ({ isOpen, html, onSave, onClose }) => {
  const [editedHtml, setEditedHtml] = useState(html);
  const [showPreview, setShowPreview] = useState(false);

  // Update local state when html prop changes
  useEffect(() => {
    if (html) {
      setEditedHtml(html);
    }
  }, [html]);

  useEffect(() => {
    if (!showPreview) {
      setEditedHtml(html);
    }
  }, [showPreview, html]);

  const handleSave = () => {
    onSave(editedHtml);
    onClose();
  };

  const handleClose = () => {
    setEditedHtml(html);
    setShowPreview(false);
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
            className="relative w-full max-w-5xl h-[80vh] bg-surface-elevated border border-border shadow-2xl rounded-lg flex flex-col overflow-hidden"
          >
            {/* Header */}
            <div className="flex items-center justify-between p-4 border-b border-border shrink-0">
              <div className="flex items-center gap-3">
                <Code className="w-5 h-5 text-accent" />
                <h2 className="text-lg font-semibold text-text-primary">Edit HTML</h2>
              </div>
              <div className="flex items-center gap-2">
                <button
                  onClick={() => setShowPreview(!showPreview)}
                  className={`flex items-center gap-2 px-3 py-2 text-sm border rounded transition-colors ${
                    showPreview
                      ? 'border-accent bg-accent/10 text-accent'
                      : 'border-border text-text-secondary hover:border-text-muted'
                  }`}
                >
                  <Eye className="w-4 h-4" />
                  {showPreview ? 'Hide Preview' : 'Preview'}
                </button>
                <button
                  onClick={handleClose}
                  className="p-2 text-text-muted hover:text-text-primary transition-colors"
                >
                  <X className="w-5 h-5" />
                </button>
              </div>
            </div>

            {/* Content */}
            <div className="flex-1 min-h-0">
              {showPreview ? (
                <div className="h-full p-6 overflow-auto bg-white">
                  <div
                    className="email-preview"
                    dangerouslySetInnerHTML={{ __html: editedHtml }}
                  />
                </div>
              ) : (
                <Editor
                  height="100%"
                  defaultLanguage="html"
                  value={editedHtml}
                  onChange={(value) => setEditedHtml(value || '')}
                  theme="vs-dark"
                  loading={<div className="p-4 text-text-muted">Loading editor...</div>}
                  options={{
                    minimap: { enabled: false },
                    fontSize: 14,
                    lineNumbers: 'on',
                    wordWrap: 'on',
                    scrollBeyondLastLine: false,
                    automaticLayout: true,
                    tabSize: 2,
                    padding: { top: 16, bottom: 16 },
                  }}
                />
              )}
            </div>

            {/* Footer */}
            <div className="flex items-center justify-end gap-3 p-4 border-t border-border shrink-0">
              <Button variant="ghost" onClick={handleClose}>
                Cancel
              </Button>
              <Button onClick={handleSave}>
                <Save className="w-4 h-4 mr-2" />
                Save Changes
              </Button>
            </div>
          </motion.div>
        </div>
      )}
    </AnimatePresence>
  );
};

export default HtmlEditorModal;
