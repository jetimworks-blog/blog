import { useState, useEffect, useMemo } from 'react';
import { motion, AnimatePresence } from 'framer-motion';
import { Lightbulb, Sparkles, Wand2 } from 'lucide-react';

const defaultProgressLabels = [
  "Doodling...",
  "Calibrating...",
  "Adding magic...",
  "Polishing pixels...",
  "Summoning words...",
  " Brewing inspiration...",
  "Fine-tuning...",
  "Sprinkling stardust...",
  "Arranging letters...",
  "Channeling creativity...",
  "Consulting the oracles...",
  "Unleashing wisdom...",
  "Weaving sentences...",
  "Perfecting prose...",
];

const defaultFunFacts = [
  "The average office worker receives 121 emails per day 📧",
  "Email marketing has an average ROI of $42 for every $1 spent 💰",
  "The first email was sent in 1971 by Ray Tomlinson 📬",
  "45% of email campaigns are opened on mobile devices 📱",
  "Personalized emails improve click rates by 14% 🎯",
  "Tuesday is the most popular day to send marketing emails 📆",
  "The subject line is the #1 factor in email open rates ✨",
  "64% of people decide to open an email based on the subject line 🎪",
  "Emails with visual content get 94% more views 🖼️",
  "The average attention span on an email is 8 seconds ⏱️",
  "A/B testing your emails can increase conversions by 37% 🧪",
  "Automated emails generate 320% more revenue than manual sends 🚀",
  "Email is 40x more effective than Facebook or Twitter for customer acquisition 🌐",
  "The average professional spends 28% of their workday on email ⏰",
  "Welcome emails have 4x more opens and clicks than other campaigns 👋",
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

  // Cycle through progress labels
  useEffect(() => {
    const interval = setInterval(() => {
      setCurrentLabelIndex(prev => (prev + 1) % progressLabels.length);
    }, labelChangeInterval);

    return () => clearInterval(interval);
  }, [progressLabels.length, labelChangeInterval]);

  // Cycle through fun facts (different timing)
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

  // Variant styles
  const variantStyles = useMemo(() => ({
    default: {
      gradient: 'from-primary-600 to-primary-600',
      glow: 'rgba(37, 99, 235, 0.4)',
      accent: 'text-primary-600'
    },
    generating: {
      gradient: 'from-purple-500 to-pink-500',
      glow: 'rgba(168, 85, 247, 0.4)',
      accent: 'text-purple-500'
    },
    sending: {
      gradient: 'from-green-500 to-teal-500',
      glow: 'rgba(34, 197, 94, 0.4)',
      accent: 'text-green-500'
    }
  }), []);

  const styles = variantStyles[variant] || variantStyles.default;

  return (
    <div className="flex flex-col items-center justify-center py-12 px-4 relative">
      {/* Animated Title */}
      <motion.h2 
        className="text-2xl md:text-3xl text-zinc-800 mb-2 text-center"
        initial={{ opacity: 0, y: 20 }}
        animate={{ opacity: 1, y: 0 }}
        transition={{ duration: 0.5 }}
      >
        {title}
      </motion.h2>
      
      <motion.p 
        className="text-zinc-500 mb-10"
        initial={{ opacity: 0 }}
        animate={{ opacity: 1 }}
        transition={{ delay: 0.3 }}
      >
        {subtitle}
      </motion.p>

      {/* Main Spinner Container */}
      <div className="relative mb-10">
        {/* Outer glow ring */}
        <motion.div
          className={`w-24 h-24 rounded-full bg-gradient-to-br ${styles.gradient}`}
          animate={{ 
            rotate: 360,
            scale: [1, 1.05, 1],
          }}
          transition={{ 
            rotate: { duration: 3, repeat: Infinity, ease: 'linear' },
            scale: { duration: 1.5, repeat: Infinity, ease: 'easeInOut' }
          }}
        />
        
        {/* Inner white circle */}
        <motion.div
          className="absolute inset-2 bg-white rounded-full flex items-center justify-center"
          animate={{ 
            boxShadow: [
              `0 0 0 0 ${styles.glow}`,
              `0 0 0 15px rgba(255, 255, 255, 0)`,
              `0 0 0 0 ${styles.glow}`
            ]
          }}
          transition={{ duration: 2, repeat: Infinity }}
        >
          <motion.div
            animate={{ rotate: -360 }}
            transition={{ duration: 3, repeat: Infinity, ease: 'linear' }}
          >
            <Sparkles className={`w-8 h-8 ${styles.accent}`} />
          </motion.div>
        </motion.div>

        {/* Orbiting dots */}
        {[0, 1, 2, 3].map(i => (
          <motion.div
            key={i}
            className={`absolute w-2 h-2 rounded-full bg-gradient-to-br ${styles.gradient}`}
            style={{
              top: '50%',
              left: '50%',
            }}
            animate={{
              rotate: [`${i * 90}deg`, `${i * 90 + 360}deg`],
              scale: [1, 0.5, 1],
              opacity: [0.8, 1, 0.8]
            }}
            transition={{
              rotate: { duration: 4, repeat: Infinity, ease: 'linear' },
              scale: { duration: 1, repeat: Infinity, ease: 'easeInOut', delay: i * 0.25 },
              opacity: { duration: 1, repeat: Infinity, ease: 'easeInOut', delay: i * 0.25 }
            }}
          />
        ))}
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
          <div className="flex items-center gap-2 px-4 py-2 bg-zinc-50 rounded-full border border-zinc-100">
            <Wand2 className={`w-4 h-4 ${styles.accent}`} />
            <span className="text-zinc-700 font-medium">
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
          <div className="flex items-start gap-3 p-4 bg-gradient-to-r from-amber-50 to-orange-50 rounded-xl border border-amber-100">
            <Lightbulb className="w-5 h-5 text-amber-500 flex-shrink-0 mt-0.5" />
            <p className="text-sm text-amber-800 leading-relaxed">
              {currentFact}
            </p>
          </div>
        </motion.div>
      </AnimatePresence>

      {/* Floating Particles */}
      <div className="absolute inset-0 pointer-events-none overflow-hidden">
        {[...Array(6)].map((_, i) => (
          <motion.div
            key={i}
            className="absolute w-2 h-2 bg-primary-600/20 rounded-full"
            initial={{ 
              x: Math.random() * 100 + '%', 
              y: '100%',
              opacity: 0
            }}
            animate={{ 
              y: '-20%',
              opacity: [0, 1, 0]
            }}
            transition={{ 
              duration: 3,
              repeat: Infinity,
              delay: i * 0.5,
              ease: 'easeOut'
            }}
          />
        ))}
      </div>
    </div>
  );
};

export default MagicLoader;
