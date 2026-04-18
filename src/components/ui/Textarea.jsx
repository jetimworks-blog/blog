import { clsx } from 'clsx';
import { forwardRef } from 'react';

export const Textarea = forwardRef(({
  label,
  placeholder,
  error,
  required = false,
  className = '',
  rows = 4,
  maxLength,
  value,
  ...props
}, ref) => {
  const charCount = value?.length || 0;

  return (
    <div className="w-full">
      {label && (
        <label className="block text-sm font-medium text-zinc-700 mb-2">
          {label}
          {required && <span className="text-red-500 ml-1">*</span>}
        </label>
      )}
      <textarea
        ref={ref}
        placeholder={placeholder}
        rows={rows}
        maxLength={maxLength}
        value={value}
        className={clsx(
          'input-field resize-none',
          error && 'input-field-error',
          className
        )}
        {...props}
      />
      <div className="flex justify-between mt-2">
        {error && (
          <p className="text-sm text-red-500">{error}</p>
        )}
        {maxLength && (
          <p className={clsx(
            'text-sm ml-auto',
            charCount > maxLength * 0.9 ? 'text-orange-500' : 'text-zinc-400'
          )}>
            {charCount}/{maxLength}
          </p>
        )}
      </div>
    </div>
  );
});

Textarea.displayName = 'Textarea';

export default Textarea;
