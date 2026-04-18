import { motion } from 'framer-motion';
import { Loader2 } from 'lucide-react';

export const LoadingSpinner = ({ size = 24, color = 'text-zinc-600' }) => {
  return (
    <motion.div
      animate={{ rotate: 360 }}
      transition={{ duration: 1, repeat: Infinity, ease: 'linear' }}
      className={color}
    >
      <Loader2 size={size} />
    </motion.div>
  );
};

export default LoadingSpinner;
