import { useState, useRef, useCallback, useEffect } from 'react';
import { X } from 'lucide-react';
import { validateEmail } from '../../lib/validation';

export const ChipInput = ({ label, placeholder, value = [], onChange, error, suggestions = [] }) => {
  const [inputValue, setInputValue] = useState('');
  const [filteredSuggestions, setFilteredSuggestions] = useState([]);
  const [showSuggestions, setShowSuggestions] = useState(false);
  const inputRef = useRef(null);
  const containerRef = useRef(null);
  const suggestionsRef = useRef(null);

  // Filter suggestions based on input
  useEffect(() => {
    if (!inputValue.trim() || suggestions.length === 0) {
      setFilteredSuggestions([]);
      setShowSuggestions(false);
      return;
    }
    const query = inputValue.toLowerCase();
    const filtered = suggestions
      .filter(email => !value.map(v => v.toLowerCase()).includes(email.toLowerCase()))
      .filter(email => email.toLowerCase().includes(query))
      .slice(0, 5);
    setFilteredSuggestions(filtered);
    setShowSuggestions(filtered.length > 0);
  }, [inputValue, suggestions, value]);

  // Close suggestions when clicking outside
  useEffect(() => {
    const handleClickOutside = (e) => {
      if (containerRef.current && !containerRef.current.contains(e.target)) {
        setShowSuggestions(false);
      }
    };
    document.addEventListener('mousedown', handleClickOutside);
    return () => document.removeEventListener('mousedown', handleClickOutside);
  }, []);

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
    if (e.key === 'Enter' || e.key === ',' || e.key === ' ') {
      e.preventDefault();
      if (inputValue.trim()) {
        addEmails(inputValue);
        setInputValue('');
        setShowSuggestions(false);
      }
    } else if (e.key === 'Backspace' && inputValue === '' && value.length > 0) {
      // Remove last chip when backspacing on empty input
      onChange(value.slice(0, -1));
    } else if (e.key === 'Escape') {
      setShowSuggestions(false);
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
    setShowSuggestions(false);
  };

  const removeChip = (index) => {
    onChange(value.filter((_, i) => i !== index));
  };

  const handleSuggestionClick = (email) => {
    addEmails(email);
    setInputValue('');
    setShowSuggestions(false);
    inputRef.current?.focus();
  };

  return (
    <div className="mb-4 relative" ref={containerRef}>
      {label && (
        <div className="flex items-center justify-between mb-2">
          <label className="block text-sm font-medium text-text-secondary">
            {label}
            <span className="text-text-muted font-normal ml-1 text-xs">
              (Space, Enter, comma, or paste to add)
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
          onFocus={() => {
            if (filteredSuggestions.length > 0) setShowSuggestions(true);
          }}
          placeholder={value.length === 0 ? placeholder : ''}
          className="flex-1 min-w-[150px] bg-transparent outline-none text-sm text-text-primary placeholder:text-text-muted"
        />
      </div>

      {showSuggestions && filteredSuggestions.length > 0 && (
        <div
          ref={suggestionsRef}
          className="absolute z-50 w-full mt-1 bg-surface-input border border-border rounded-md shadow-lg overflow-hidden"
        >
          {filteredSuggestions.map((email, index) => (
            <button
              key={email}
              type="button"
              onClick={() => handleSuggestionClick(email)}
              className={`
                w-full px-3 py-2 text-left text-sm text-text-primary
                hover:bg-accent/10 transition-colors
                ${index !== filteredSuggestions.length - 1 ? 'border-b border-border' : ''}
              `}
            >
              {email}
            </button>
          ))}
        </div>
      )}

      {error && (
        <p className="mt-1 text-sm text-error">{error}</p>
      )}
    </div>
  );
};

export default ChipInput;