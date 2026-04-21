import { clsx } from 'clsx';
import { forwardRef } from 'react';

export const Input = forwardRef(({
  label,
  type = 'text',
  placeholder,
  error,
  required = false,
  className = '',
  ...props
}, ref) => {
  return (
    <div className="w-full">
      {label && (
        <label className="block text-sm font-medium text-text-secondary mb-2">
          {label}
          {required && <span className="text-error ml-1">*</span>}
        </label>
      )}
      <input
        ref={ref}
        type={type}
        placeholder={placeholder}
        className={clsx(
          'input-field',
          error && 'input-field-error',
          className
        )}
        {...props}
      />
      {error && (
        <p className="mt-2 text-sm text-error">{error}</p>
      )}
    </div>
  );
});

Input.displayName = 'Input';

export default Input;