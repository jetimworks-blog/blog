import { forwardRef, useEffect, useRef } from 'react';
import { motion as Motion } from 'framer-motion';
import { clsx } from 'clsx';
import { Check } from 'lucide-react';

/**
 * WorkflowNode - a single lego-brick step in the graph track.
 *
 * Shape: chunky rounded rectangle with a colored "stud" strip across the top,
 * evoking a Lego brick. Each step carries its own accent color.
 *
 * @param {Object} props
 * @param {number} props.stepIndex - 1-based step number for display
 * @param {string} props.label - Step label
 * @param {string} props.icon - Optional lucide icon component
 * @param {'completed' | 'current' | 'visited' | 'pending'} props.status
 * @param {Function} props.onClick - Click handler
 * @param {boolean} props.canNavigate - Whether this node is clickable
 * @param {string} props.accent - oklch color for the brick's stud + accents
 * @param {Function} props.registerNode - (index, el) => void, for scrollIntoView
 * @param {number} props.index - 0-based step index (for registerNode)
 */
export const WorkflowNode = forwardRef(function WorkflowNode(
  {
    stepIndex,
    label,
    icon: Icon,
    status = 'pending',
    onClick,
    canNavigate = false,
    accent = 'oklch(0.7 0.18 250)',
    registerNode,
    index,
  },
  forwardedRef
) {
  const innerRef = useRef(null);
  const isCompleted = status === 'completed';
  const isCurrent = status === 'current';
  const isVisited = status === 'visited';
  const isPending = status === 'pending';

  // Combine the forwarded ref (for scrollIntoView) with the internal ref
  // (so we can pass the element up via registerNode for the hook).
  const setRefs = (el) => {
    innerRef.current = el;
    if (typeof forwardedRef === 'function') forwardedRef(el);
    else if (forwardedRef) forwardedRef.current = el;
    if (registerNode && typeof index === 'number') registerNode(index, el);
  };

  useEffect(() => {
    return () => {
      if (registerNode && typeof index === 'number') registerNode(index, null);
    };
    // eslint-disable-next-line react-hooks/exhaustive-deps
  }, []);

  // Brick body tint: completed/current use accent-tinted backgrounds,
  // visited uses surface-elevated, pending uses surface-input.
  const bodyBg = (() => {
    if (isCompleted) return `color-mix(in oklch, ${accent} 18%, oklch(0.12 0 0))`;
    if (isCurrent) return `color-mix(in oklch, ${accent} 26%, oklch(0.12 0 0))`;
    if (isVisited) return 'oklch(0.12 0 0)';
    return 'oklch(0.08 0 0)';
  })();

  const bodyBorder = (() => {
    if (isCompleted || isCurrent) return `color-mix(in oklch, ${accent} 55%, transparent)`;
    if (isVisited) return 'oklch(0.28 0 0)';
    return 'oklch(0.22 0 0)';
  })();

  // Outer ring color — only visible on current; soft pulsing glow.
  const ringColor = isCurrent
    ? `color-mix(in oklch, ${accent} 90%, transparent)`
    : 'transparent';

  return (
    <Motion.button
      ref={setRefs}
      type="button"
      onClick={canNavigate ? onClick : undefined}
      disabled={!canNavigate}
      aria-label={`Step ${stepIndex}: ${label} (${status})`}
      aria-current={isCurrent ? 'step' : undefined}
      animate={isCurrent ? { y: [0, -2, 0] } : { y: 0 }}
      transition={
        isCurrent
          ? { duration: 2.4, repeat: Infinity, ease: 'easeInOut' }
          : { duration: 0.2, ease: 'easeOut' }
      }
      whileHover={canNavigate ? { y: -4 } : undefined}
      whileTap={canNavigate ? { scale: 0.96 } : undefined}
      className={clsx(
        'group relative flex flex-col items-center gap-2 outline-none',
        'focus-visible:ring-2 focus-visible:ring-offset-2 focus-visible:ring-offset-surface',
        canNavigate ? 'cursor-pointer' : 'cursor-not-allowed'
      )}
      style={{
        // Focus ring uses accent color
        '--tw-ring-color': accent,
      }}
    >
      {/* Outer ring — only rendered for current, layered behind brick */}
      {isCurrent && (
        <Motion.div
          aria-hidden
          className="absolute inset-x-3 top-0 h-[68px] rounded-2xl pointer-events-none"
          style={{
            boxShadow: `0 0 0 2px ${ringColor}, 0 0 24px ${`color-mix(in oklch, ${accent} 50%, transparent)`}`,
          }}
          animate={{ opacity: [0.7, 1, 0.7] }}
          transition={{ duration: 2, repeat: Infinity, ease: 'easeInOut' }}
        />
      )}

      {/* The brick */}
      <div
        className={clsx(
          'relative w-[88px] h-[64px] rounded-2xl flex items-center justify-center gap-2',
          'border-2 overflow-hidden select-none'
        )}
        style={{
          backgroundColor: bodyBg,
          borderColor: bodyBorder,
        }}
      >
        {/* Stud strip — the lego "studs" across the top */}
        <div
          aria-hidden
          className="absolute top-0 left-0 right-0 h-[10px]"
          style={{
            background: `linear-gradient(180deg, ${accent} 0%, color-mix(in oklch, ${accent} 60%, transparent) 100%)`,
            opacity: isCompleted || isCurrent ? 1 : isVisited ? 0.6 : 0.35,
          }}
        />
        {/* Three small "studs" overlay to make the top read as Lego bricks */}
        <div
          aria-hidden
          className="absolute top-[2px] left-0 right-0 flex justify-center gap-[10px]"
        >
          {[0, 1, 2].map((i) => (
            <span
              key={i}
              className="block w-[10px] h-[6px] rounded-sm"
              style={{
                backgroundColor: 'oklch(0 0 0 / 0.35)',
                opacity: isCompleted || isCurrent ? 0.55 : 0.3,
              }}
            />
          ))}
        </div>

        {/* Body content: icon + number/check + label preview */}
        <div className="flex flex-col items-center justify-center pt-3 pb-1 px-1.5 w-full">
          <div className="flex items-center gap-1.5">
            {Icon && (
              <Icon
                size={14}
                strokeWidth={2.2}
                style={{ color: isPending ? 'oklch(0.55 0 0)' : accent }}
              />
            )}
            {isCompleted ? (
              <Check size={16} strokeWidth={3} style={{ color: accent }} />
            ) : (
              <span
                className={clsx(
                  'text-[15px] font-bold leading-none',
                  isCurrent ? 'text-text-primary' : isPending ? 'text-text-muted' : 'text-text-secondary'
                )}
              >
                {stepIndex}
              </span>
            )}
          </div>
          <span
            className={clsx(
              'text-[10px] font-semibold uppercase tracking-wider leading-none mt-1.5 truncate max-w-full',
              isCurrent ? 'text-text-primary' : isCompleted ? 'text-text-secondary' : 'text-text-muted'
            )}
          >
            {label}
          </span>
        </div>
      </div>

      {/* Status pill below the brick — small badge */}
      <span
        className={clsx(
          'text-[9px] font-semibold uppercase tracking-widest transition-colors duration-200',
          isCurrent ? 'text-text-primary' : 'text-text-muted'
        )}
      >
        {isCompleted ? 'Done' : isCurrent ? 'Current' : isVisited ? 'Seen' : 'Pending'}
      </span>
    </Motion.button>
  );
});

export default WorkflowNode;
