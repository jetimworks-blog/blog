import { useState, useEffect, useMemo } from 'react';
import { motion, AnimatePresence } from 'framer-motion';
import { Sparkles, Loader2 } from 'lucide-react';

const defaultProgressLabels = [
  "Calibrating...",
  "Adding magic...",
  "Polishing pixels...",
  "Summoning words...",
  "Fine-tuning...",
  "Arranging letters...",
  "Unleashing wisdom...",
  "Weaving sentences...",
  "Perfecting prose...",
];

const defaultFunFacts = [
  "The average office worker receives 121 emails per day",
  "Email marketing has an average ROI of $42 for every $1 spent",
  "The first email was sent in 1971 by Ray Tomlinson",
  "45% of email campaigns are opened on mobile devices",
  "Personalized emails improve click rates by 14%",
  "Tuesday is the most popular day to send marketing emails",
  "The subject line is the #1 factor in email open rates",
  "64% of people decide to open an email based on the subject line",
  "Automated emails generate 320% more revenue than manual sends",
];

export const MagicLoader = ({
  title = "Creating magic...",
  subtitle = 'This only takes a moment',
  progressLabels = defaultProgressLabels,
  funFacts = defaultFunFacts,
  labelChangeInterval = 2000,
  factChangeInterval = 4000,
  variant = 'default'
}) => {
  const [currentLabelIndex, setCurrentLabelIndex] = useState(0);
  const [currentFactIndex, setCurrentFactIndex] = useState(0);

  useEffect(() => {
    const interval = setInterval(() => {
      setCurrentLabelIndex(prev => (prev + 1) % progressLabels.length);
    }, labelChangeInterval);

    return () => clearInterval(interval);
  }, [progressLabels.length, labelChangeInterval]);

  useEffect(() => {
    const randomIndex = Math.floor(Math.random() * funFacts.length);
    setCurrentFactIndex(randomIndex);

    const factInterval = setInterval(() => {
      setCurrentFactIndex(prev => (prev + 1) % funFacts.length);
    }, factChangeInterval);

    return () => clearInterval(factInterval);
  }, [funFacts.length, factChangeInterval]);

  const currentLabel = progressLabels[currentLabelIndex];
  const currentFact = funFacts[currentFactIndex];

  return (
    <div className="flex flex-col items-center justify-center py-12 px-4">
      {/* Animated Title */}
      <motion.h2
        className="text-2xl md:text-3xl text-text-primary mb-2 text-center"
        initial={{ opacity: 0, y: 20 }}
        animate={{ opacity: 1, y: 0 }}
        transition={{ duration: 0.5 }}
      >
        {title}
      </motion.h2>

      <motion.p
        className="text-text-muted mb-10"
        initial={{ opacity: 0 }}
        animate={{ opacity: 1 }}
        transition={{ delay: 0.3 }}
      >
        {subtitle}
      </motion.p>

      {/* Main Spinner Container */}
      <div className="relative mb-10">
        {/* Outer ring */}
        <motion.div
          className="w-24 h-24 border border-accent flex items-center justify-center"
          animate={{
            rotate: 360,
          }}
          transition={{
            duration: 3,
            repeat: Infinity,
            ease: 'linear'
          }}
        >
          <motion.div
            animate={{ rotate: -360 }}
            transition={{ duration: 3, repeat: Infinity, ease: 'linear' }}
          >
            <Sparkles className="w-8 h-8 text-accent" />
          </motion.div>
        </motion.div>
      </div>

      {/* Cycling Progress Label */}
      <AnimatePresence mode="wait">
        <motion.div
          key={currentLabel}
          initial={{ opacity: 0, y: 10, scale: 0.95 }}
          animate={{ opacity: 1, y: 0, scale: 1 }}
          exit={{ opacity: 0, y: -10, scale: 0.95 }}
          transition={{ duration: 0.3 }}
          className="mb-8"
        >
          <div className="flex items-center gap-2 px-4 py-2 border border-border">
            <Loader2 className="w-4 h-4 text-accent" />
            <span className="text-text-secondary font-medium">
              {currentLabel}
            </span>
          </div>
        </motion.div>
      </AnimatePresence>

      {/* Fun Facts Section */}
      <AnimatePresence mode="wait">
        <motion.div
          key={currentFact}
          initial={{ opacity: 0, y: 10 }}
          animate={{ opacity: 1, y: 0 }}
          exit={{ opacity: 0, y: -10 }}
          transition={{ duration: 0.4 }}
          className="max-w-md mx-auto w-full"
        >
          <div className="flex items-start gap-3 p-4 border border-border">
            <Sparkles className="w-5 h-5 text-accent flex-shrink-0 mt-0.5" />
            <p className="text-sm text-text-secondary leading-relaxed">
              {currentFact}
            </p>
          </div>
        </motion.div>
      </AnimatePresence>
    </div>
  );
};

export default MagicLoader;