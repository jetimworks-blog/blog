import { useRef } from 'react';
import { Paperclip, X, Check, AlertCircle, Upload, Loader2 } from 'lucide-react';

// Format file size for display
const formatFileSize = (bytes) => {
  if (bytes < 1024) return `${bytes} B`;
  if (bytes < 1024 * 1024) return `${(bytes / 1024).toFixed(1)} KB`;
  return `${(bytes / (1024 * 1024)).toFixed(1)} MB`;
};

// Get icon for file status
const StatusIcon = ({ status }) => {
  switch (status) {
    case 'uploaded':
      return <Check className="w-4 h-4 text-green-500" />;
    case 'error':
      return <AlertCircle className="w-4 h-4 text-red-500" />;
    case 'uploading':
      return <Upload className="w-4 h-4 text-blue-500 animate-pulse" />;
    case 'pending':
      return <Loader2 className="w-4 h-4 text-amber-500 animate-spin" />;
    default:
      return <Paperclip className="w-4 h-4 text-text-muted" />;
  }
};

export const AttachmentInput = ({ attachments = [], onAdd, onRemove, disabled = false }) => {
  const fileInputRef = useRef(null);

  const handleClick = () => {
    if (!disabled) {
      fileInputRef.current?.click();
    }
  };

  const handleFileChange = (e) => {
    const files = Array.from(e.target.files || []);
    if (files.length > 0) {
      onAdd(files);
    }
    // Reset input so same file can be selected again
    e.target.value = '';
  };

  const hasAttachments = attachments.length > 0;

  return (
    <div className="space-y-3">
      <div className="flex items-center gap-2">
        <Paperclip className="w-4 h-4 text-text-muted" />
        <span className="text-sm font-medium text-text-secondary">Attachments (optional)</span>
        {hasAttachments && (
          <span className="text-xs text-text-muted">({attachments.length} file{attachments.length !== 1 ? 's' : ''})</span>
        )}
      </div>

      {/* File input area */}
      <button
        type="button"
        onClick={handleClick}
        disabled={disabled}
        className={`
          w-full py-3 px-4 border-2 border-dashed rounded-lg transition-all
          ${disabled
            ? 'border-border bg-surface-elevated cursor-not-allowed opacity-50'
            : 'border-border hover:border-text-muted hover:bg-surface-elevated cursor-pointer'}
        `}
      >
        <div className="flex flex-col items-center gap-1">
          <span className="text-sm text-text-secondary">Click to attach files</span>
          <span className="text-xs text-text-muted">Max 5MB per file</span>
        </div>
      </button>

      <input
        ref={fileInputRef}
        type="file"
        multiple
        onChange={handleFileChange}
        disabled={disabled}
        className="hidden"
      />

      {/* Attachment list */}
      {hasAttachments && (
        <div className="space-y-2">
          {attachments.map((attachment) => (
            <div
              key={attachment.id}
              className="flex items-center gap-3 p-2 bg-surface-elevated border border-border"
            >
              <StatusIcon status={attachment.status} />

              <div className="flex-1 min-w-0">
                <p className="text-sm text-text-primary truncate">{attachment.filename}</p>
                <p className="text-xs text-text-muted">
                  {attachment.size && formatFileSize(attachment.size)}
                  {attachment.error && (
                    <span className="text-red-500 ml-1">{attachment.error}</span>
                  )}
                </p>
              </div>

              {!disabled && (
                <button
                  type="button"
                  onClick={() => onRemove(attachment.id)}
                  className="p-1 hover:bg-surface-input rounded transition-colors"
                >
                  <X className="w-4 h-4 text-text-muted hover:text-red-500" />
                </button>
              )}
            </div>
          ))}
        </div>
      )}
    </div>
  );
};

export default AttachmentInput;