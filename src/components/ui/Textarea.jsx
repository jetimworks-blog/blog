import { clsx } from 'clsx';
import { forwardRef, useState } from 'react';
import { Maximize2 } from 'lucide-react';
import { TextareaModal } from './TextareaModal';

export const Textarea = forwardRef(({
  label,
  placeholder,
  error,
  required = false,
  className = '',
  rows = 4,
  maxLength,
  value,
  expandable = false,
  modal = false,
  onModalSave,
  ...props
}, ref) => {
  const charCount = value?.length || 0;
  const [modalOpen, setModalOpen] = useState(false);

  const handleExpandClick = () => {
    setModalOpen(true);
  };

  const handleModalSave = (newValue) => {
    if (onModalSave) {
      onModalSave(newValue);
    }
    setModalOpen(false);
  };

  return (
    <div className="w-full">
      <div className="flex items-center justify-between mb-2">
        {label && (
          <label className="block text-sm font-medium text-text-secondary">
            {label}
            {required && <span className="text-error ml-1">*</span>}
          </label>
        )}
        {expandable && (
          <button
            type="button"
            onClick={modal ? handleExpandClick : undefined}
            className="p-1 hover:bg-surface-elevated rounded transition-colors text-text-muted hover:text-text-primary"
            title="Expand to full editor"
          >
            <Maximize2 className="w-4 h-4" />
          </button>
        )}
      </div>
      <textarea
        ref={ref}
        placeholder={placeholder}
        rows={rows}
        maxLength={maxLength}
        value={value}
        onInput={(e) => {
          e.target.style.height = 'auto';
          e.target.style.height = Math.min(e.target.scrollHeight, 400) + 'px';
        }}
        className={clsx(
          'input-field min-h-[80px] overflow-auto',
          error && 'input-field-error',
          className
        )}
        style={{ resize: 'vertical' }}
        {...props}
      />
      <div className="flex justify-between mt-2">
        {error && (
          <p className="text-sm text-error">{error}</p>
        )}
        {maxLength && (
          <p className={clsx(
            'text-sm ml-auto',
            charCount > maxLength * 0.9 ? 'text-warning' : 'text-text-muted'
          )}>
            {charCount}/{maxLength}
          </p>
        )}
      </div>

      <TextareaModal
        isOpen={modalOpen}
        value={value}
        onSave={handleModalSave}
        onClose={() => setModalOpen(false)}
        label={label}
        placeholder={placeholder}
      />
    </div>
  );
});

Textarea.displayName = 'Textarea';

export default Textarea;