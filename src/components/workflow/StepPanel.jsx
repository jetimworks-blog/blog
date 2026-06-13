import { AnimatePresence } from 'framer-motion';
import { motion as Motion } from 'framer-motion';
import { clsx } from 'clsx';

/**
 * StepPanel - animated card wrapping the active step's form content.
 *
 * Crossfades with a small y-translate on step change. The top edge has a
 * thin accent strip matching the current step's color (echoes the brick
 * stud row). Sharp card edges with `rounded-2xl` only on the corners to
 * match the lego brick geometry.
 *
 * @param {Object} props
 * @param {string|number} props.stepKey - unique key for the active step (drives crossfade)
 * @param {string} props.accent - oklch color for the top strip
 * @param {string} props.label - step label rendered in the header
 * @param {number} props.stepNumber - 1-based step number
 * @param {number} props.totalSteps - total step count
 * @param {React.ReactNode} props.children - step content
 */
export const StepPanel = ({
  stepKey,
  accent = 'oklch(0.7 0.18 250)',
  label,
  stepNumber,
  totalSteps,
  children,
  className = '',
}) => {
  return (
    <div
      className={clsx(
        'relative bg-surface-card border border-border rounded-2xl',
        'overflow-hidden',
        className
      )}
    >
      {/* Top accent strip — echoes the brick stud row */}
      <div
        aria-hidden
        className="absolute top-0 left-0 right-0 h-[6px]"
        style={{
          background: `linear-gradient(180deg, ${accent} 0%, color-mix(in oklch, ${accent} 50%, transparent) 100%)`,
        }}
      />

      {/* Header row: step label + counter */}
      {(label || stepNumber) && (
        <div className="flex items-center justify-between px-6 pt-7 pb-3">
          <div className="flex items-center gap-3">
            <span
              className="text-[10px] font-bold uppercase tracking-widest px-2 py-1 rounded"
              style={{
                color: accent,
                backgroundColor: `color-mix(in oklch, ${accent} 12%, transparent)`,
                border: `1px solid color-mix(in oklch, ${accent} 35%, transparent)`,
              }}
            >
              Step {stepNumber} / {totalSteps}
            </span>
            <h2 className="text-base font-semibold text-text-primary">
              {label}
            </h2>
          </div>
        </div>
      )}

      <AnimatePresence mode="wait">
        <Motion.div
          key={stepKey}
          initial={{ opacity: 0, y: 12 }}
          animate={{ opacity: 1, y: 0 }}
          exit={{ opacity: 0, y: -8 }}
          transition={{ duration: 0.22, ease: [0.16, 1, 0.3, 1] }}
          className="px-6 pb-6"
        >
          {children}
        </Motion.div>
      </AnimatePresence>
    </div>
  );
};

export default StepPanel;
