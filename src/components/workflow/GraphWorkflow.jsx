import { useEffect, useRef } from 'react';
import { motion } from 'framer-motion';
import { clsx } from 'clsx';
import { WorkflowNode } from './WorkflowNode';

/**
 * GraphWorkflow - horizontal track of lego-brick step nodes with connectors.
 *
 * Pinned at the top of the form. The current step pulses; completed steps
 * show a checkmark. Click any node to navigate (free navigation, no gate).
 *
 * @param {Object} props
 * @param {Array} props.steps - Array of step objects: {id, label, icon, accent}.
 *   `accent` is an oklch color string for the brick.
 * @param {number} props.currentStep - 0-based current step index
 * @param {Set<number>} props.completedSteps - Set of completed step indices
 * @param {Set<number>} props.visitedSteps - Set of visited (but not necessarily completed) indices
 * @param {Function} props.onStepClick - (index) => void
 * @param {Function} props.getStepStatus - (index) => 'completed' | 'current' | 'visited' | 'pending'
 * @param {Function} props.canNavigateTo - (index) => boolean
 * @param {Function} props.registerNode - (index, el) => void, for scrollIntoView
 * @param {Function} props.isEdgeJustCompleted - (fromIndex) => boolean, fires once-shot dot
 * @param {React.RefObject<HTMLDivElement>} props.trackRef - forwarded to outer container
 */
export const GraphWorkflow = ({
  steps,
  currentStep = 0,
  completedSteps = new Set(),
  visitedSteps = new Set(),
  onStepClick,
  getStepStatus,
  canNavigateTo,
  registerNode,
  isEdgeJustCompleted,
  trackRef,
  className = '',
}) => {
  const defaultGetStatus = (i) => {
    if (completedSteps.has(i)) return 'completed';
    if (i === currentStep) return 'current';
    if (visitedSteps.has(i)) return 'visited';
    return 'pending';
  };
  const status = getStepStatus ?? defaultGetStatus;

  const defaultCanNav = () => true;
  const canNav = canNavigateTo ?? defaultCanNav;

  // When currentStep changes, scroll the new current node into view smoothly.
  const localTrackRef = useRef(null);
  const setTrackRef = (el) => {
    localTrackRef.current = el;
    if (typeof trackRef === 'function') trackRef(el);
    else if (trackRef) trackRef.current = el;
  };

  useEffect(() => {
    // Defer to next frame so the new node has finished its layout.
    const id = requestAnimationFrame(() => {
      const track = localTrackRef.current;
      if (!track) return;
      const node = track.querySelector(`[data-step-index="${currentStep}"]`);
      if (node && typeof node.scrollIntoView === 'function') {
        node.scrollIntoView({ behavior: 'smooth', block: 'nearest', inline: 'center' });
      }
    });
    return () => cancelAnimationFrame(id);
  }, [currentStep]);

  // Keyboard nav: ← / → cycle through nodes, Enter activates the focused one.
  const onKeyDown = (e) => {
    if (e.key === 'ArrowRight' && currentStep < steps.length - 1) {
      e.preventDefault();
      onStepClick?.(currentStep + 1);
    } else if (e.key === 'ArrowLeft' && currentStep > 0) {
      e.preventDefault();
      onStepClick?.(currentStep - 1);
    }
  };

  return (
    <div
      ref={setTrackRef}
      role="tablist"
      aria-label="Workflow steps"
      onKeyDown={onKeyDown}
      className={clsx(
        'relative w-full',
        'overflow-x-auto overflow-y-hidden',
        // Hide scrollbar visually but keep functionality
        '[scrollbar-width:none] [&::-webkit-scrollbar]:hidden',
        className
      )}
    >
      <div className="flex items-start justify-center gap-6 md:gap-10 min-w-max px-6 py-6">
        {steps.map((step, index) => {
          const stepStatus = status(index);
          const stepLabel = typeof step === 'string' ? step : step.label;
          const stepIcon = typeof step === 'object' ? step.icon : undefined;
          const stepAccent = typeof step === 'object' && step.accent
            ? step.accent
            : 'oklch(0.7 0.18 250)';
          const isClickable = canNav(index);

          return (
            <div key={step.id ?? index} className="flex items-start">
              <div data-step-index={index} className="flex flex-col items-center">
                <WorkflowNode
                  index={index}
                  stepIndex={index + 1}
                  label={stepLabel}
                  icon={stepIcon}
                  status={stepStatus}
                  accent={stepAccent}
                  canNavigate={isClickable}
                  onClick={() => isClickable && onStepClick?.(index)}
                  registerNode={registerNode}
                />
              </div>

              {/* Edge connector to the next step */}
              {index < steps.length - 1 && (
                <EdgeConnector
                  active={completedSteps.has(index)}
                  justCompleted={isEdgeJustCompleted?.(index) ?? false}
                  accent={stepAccent}
                />
              )}
            </div>
          );
        })}
      </div>
    </div>
  );
};

/**
 * EdgeConnector - dashed line between two bricks. Animates to a solid
 * accent-colored line when active, and (optionally) fires a one-shot
 * traveling dot when the source step was just completed.
 */
const EdgeConnector = ({ active, justCompleted, accent }) => {
  return (
    <div
      aria-hidden
      className="relative w-10 md:w-16 h-[64px] mx-2 self-center shrink-0"
    >
      {/* Base dashed line, vertically centered */}
      <div
        className="absolute left-0 right-0 top-1/2 -translate-y-1/2 h-[1.5px] border-t border-dashed"
        style={{ borderColor: active ? 'transparent' : 'oklch(0.28 0 0)' }}
      />
      {/* Active solid gradient line */}
      {active && (
        <motion.div
          className="absolute left-0 right-0 top-1/2 -translate-y-1/2 h-[2px]"
          style={{
            background: `linear-gradient(90deg, ${accent} 0%, color-mix(in oklch, ${accent} 30%, transparent) 100%)`,
            boxShadow: `0 0 8px color-mix(in oklch, ${accent} 50%, transparent)`,
          }}
          initial={{ scaleX: 0, originX: 0 }}
          animate={{ scaleX: 1 }}
          transition={{ duration: 0.4, ease: 'easeOut' }}
        />
      )}
      {/* One-shot traveling dot */}
      {justCompleted && (
        <motion.span
          className="absolute top-1/2 -translate-y-1/2 w-2 h-2 rounded-full"
          style={{
            backgroundColor: accent,
            boxShadow: `0 0 10px color-mix(in oklch, ${accent} 70%, transparent)`,
            left: 0,
          }}
          initial={{ left: '0%', opacity: 0 }}
          animate={{ left: 'calc(100% - 8px)', opacity: [0, 1, 1, 0] }}
          transition={{ duration: 0.55, ease: 'easeInOut', times: [0, 0.1, 0.85, 1] }}
        />
      )}
    </div>
  );
};

export default GraphWorkflow;
