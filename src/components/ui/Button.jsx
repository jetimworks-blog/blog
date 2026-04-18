import { clsx } from 'clsx';
import { motion } from 'framer-motion';
import { Loader2 } from 'lucide-react';

const variants = {
  primary: 'btn-primary',
  secondary: 'btn-secondary',
  ghost: 'btn-ghost',
  danger: 'btn-danger',
  glow: 'btn-glow',
};

const sizes = {
  sm: 'py-2 px-4 text-sm min-h-10 sm:min-h-0',
  md: 'py-3 px-6 min-h-11 sm:min-h-0',
  lg: 'py-4 px-8 text-lg min-h-12 sm:min-h-0',
};

export const Button = ({
  children,
  variant = 'primary',
  size = 'md',
  loading = false,
  disabled = false,
  className = '',
  type = 'button',
  onClick,
  ...props
}) => {
  return (
    <motion.button
      whileHover={{ scale: disabled || loading ? 1 : 1.02 }}
      whileTap={{ scale: disabled || loading ? 1 : 0.98 }}
      type={type}
      className={clsx(
        variants[variant],
        sizes[size],
        loading && 'cursor-wait',
        className
      )}
      disabled={disabled || loading}
      onClick={onClick}
      {...props}
    >
      {loading ? (
        <span className="flex items-center justify-center gap-2">
          <Loader2 className="w-5 h-5 animate-spin" />
          <span>Loading...</span>
        </span>
      ) : (
        <span className="flex items-center gap-2">{children}</span>
      )}
    </motion.button>
  );
};

export default Button;
