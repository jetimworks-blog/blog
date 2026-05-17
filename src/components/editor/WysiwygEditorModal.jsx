import { useState, useEffect } from 'react';
import { motion, AnimatePresence } from 'framer-motion';
import { X, Save, Eye, Code, Edit3 } from 'lucide-react';
import { Button } from '../ui/Button';
import { EmailWysiwygEditor } from './EmailWysiwygEditor';
import Editor from '@monaco-editor/react';

export const WysiwygEditorModal = ({ isOpen, html, onSave, onClose }) => {
  const [editedHtml, setEditedHtml] = useState(html);
  const [activeTab, setActiveTab] = useState('visual'); // 'visual' | 'code'
  const [wysiwygContent, setWysiwygContent] = useState(html);

  useEffect(() => {
    // Use a timeout to avoid cascading renders
    const timer = setTimeout(() => {
      setEditedHtml(html || '');
      setWysiwygContent(html || '');
    }, 0);
    return () => clearTimeout(timer);
  }, [html]);

  const handleSave = () => {
    const finalHtml = activeTab === 'visual' ? wysiwygContent : editedHtml;
    onSave(finalHtml);
    onClose();
  };

  const handleClose = () => {
    setEditedHtml(html);
    setWysiwygContent(html);
    setActiveTab('visual');
    onClose();
  };

  const handleWysiwygUpdate = (newHtml) => {
    setWysiwygContent(newHtml);
    setEditedHtml(newHtml); // Keep in sync
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
                <Edit3 className="w-5 h-5 text-accent" />
                <h2 className="text-lg font-semibold text-text-primary">Edit Email</h2>
              </div>
              <div className="flex items-center gap-2">
                {/* Tab Switcher */}
                <div className="flex items-center border border-border rounded overflow-hidden mr-2">
                  <button
                    onClick={() => setActiveTab('visual')}
                    className={`flex items-center gap-1.5 px-3 py-1.5 text-sm transition-colors ${
                      activeTab === 'visual'
                        ? 'bg-accent text-white'
                        : 'text-text-secondary hover:bg-accent/10'
                    }`}
                  >
                    <Edit3 className="w-3.5 h-3.5" />
                    Visual
                  </button>
                  <button
                    onClick={() => setActiveTab('code')}
                    className={`flex items-center gap-1.5 px-3 py-1.5 text-sm transition-colors ${
                      activeTab === 'code'
                        ? 'bg-accent text-white'
                        : 'text-text-secondary hover:bg-accent/10'
                    }`}
                  >
                    <Code className="w-3.5 h-3.5" />
                    Code
                  </button>
                </div>
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
              {activeTab === 'visual' ? (
                <div className="h-full overflow-auto bg-white">
                  <EmailWysiwygEditor
                    initialContent={wysiwygContent}
                    onUpdate={handleWysiwygUpdate}
                    className="h-full"
                  />
                </div>
              ) : (
                <Editor
                  height="100%"
                  defaultLanguage="html"
                  value={editedHtml}
                  onChange={(value) => {
                    setEditedHtml(value || '');
                    setWysiwygContent(value || ''); // Keep WYSIWYG in sync
                  }}
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

export default WysiwygEditorModal;