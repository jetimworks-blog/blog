import { clsx } from 'clsx';
import { motion } from 'framer-motion';

const variants = {
  default: 'card',
  elevated: 'card border-border',
  bordered: 'card',
};

export const Card = ({
  children,
  variant = 'default',
  className = '',
  title,
  hoverable = false,
  ...props
}) => {
  return (
    <motion.div
      whileHover={hoverable ? { borderColor: 'var(--color-accent)' } : {}}
      className={clsx(
        variants[variant],
        hoverable && 'card-hover cursor-pointer',
        className
      )}
      {...props}
    >
      {title && (
        <h3 className="text-xl font-semibold text-text-primary mb-4">{title}</h3>
      )}
      {children}
    </motion.div>
  );
};

export default Card;