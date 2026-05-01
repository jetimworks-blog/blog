import { useState, useRef, useCallback } from 'react';
import { X } from 'lucide-react';
import { validateEmail } from '../../lib/validation';

export const ChipInput = ({ label, placeholder, value = [], onChange, error }) => {
  const [inputValue, setInputValue] = useState('');
  const inputRef = useRef(null);

  const addEmails = useCallback((text) => {
    // Split by comma, semicolon, or whitespace
    const emails = text.split(/[,\s;]+/).map(e => e.trim()).filter(e => e);
    const newEmails = [];
    const seen = new Set(value.map(e => e.toLowerCase()));

    for (const email of emails) {
      if (!validateEmail(email)) continue;
      if (seen.has(email.toLowerCase())) continue;
      newEmails.push(email);
      seen.add(email.toLowerCase());
    }

    if (newEmails.length > 0) {
      onChange([...value, ...newEmails]);
    }
  }, [value, onChange]);

  const handleKeyDown = (e) => {
    if (e.key === 'Enter' || e.key === ',') {
      e.preventDefault();
      if (inputValue.trim()) {
        addEmails(inputValue);
        setInputValue('');
      }
    } else if (e.key === 'Backspace' && inputValue === '' && value.length > 0) {
      // Remove last chip when backspacing on empty input
      onChange(value.slice(0, -1));
    }
  };

  const handleChange = (e) => {
    const text = e.target.value;
    setInputValue(text);

    // Detect paste with multiple emails
    if (text.includes(',') || text.includes(';')) {
      // Let paste handler deal with it, don't add here
    }
  };

  const handlePaste = (e) => {
    e.preventDefault();
    const text = e.clipboardData.getData('text');
    addEmails(text);
    setInputValue('');
  };

  const removeChip = (index) => {
    onChange(value.filter((_, i) => i !== index));
  };

  return (
    <div className="mb-4">
      {label && (
        <div className="flex items-center justify-between mb-2">
          <label className="block text-sm font-medium text-text-secondary">
            {label}
            <span className="text-text-muted font-normal ml-1 text-xs">
              (Enter, comma, or paste to add)
            </span>
          </label>
        </div>
      )}

      <div
        className={`
          flex flex-wrap gap-2 p-3 border bg-surface-input
          ${error ? 'border-error' : 'border-border focus-within:border-accent'}
          transition-colors
        `}
        onClick={() => inputRef.current?.focus()}
      >
        {value.map((email, index) => (
          <span
            key={email}
            className={`
              inline-flex items-center gap-1 px-2 py-1 bg-accent/10 border border-accent/30
              text-sm text-text-primary rounded
            `}
          >
            {email}
            <button
              type="button"
              onClick={(e) => {
                e.stopPropagation();
                removeChip(index);
              }}
              className="hover:text-error transition-colors"
            >
              <X className="w-3 h-3" />
            </button>
          </span>
        ))}

        <input
          ref={inputRef}
          type="email"
          value={inputValue}
          onChange={handleChange}
          onKeyDown={handleKeyDown}
          onPaste={handlePaste}
          placeholder={value.length === 0 ? placeholder : ''}
          className="flex-1 min-w-[150px] bg-transparent outline-none text-sm text-text-primary placeholder:text-text-muted"
        />
      </div>

      {error && (
        <p className="mt-1 text-sm text-error">{error}</p>
      )}
    </div>
  );
};

export default ChipInput;