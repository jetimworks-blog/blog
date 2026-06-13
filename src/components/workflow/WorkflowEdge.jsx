import { useId } from 'react';
import { motion as Motion } from 'framer-motion';

/**
 * WorkflowEdge - SVG path connecting two workflow nodes.
 *
 * Renders a dashed base path; when `isActive`, overlays an animated path that
 * draws in via pathLength and (optionally) a traveling dot. Uses a stable
 * useId() so multiple edges on the same page never collide.
 *
 * @param {Object} props
 * @param {number} props.fromX - Starting X position
 * @param {number} props.fromY - Starting Y position
 * @param {number} props.toX - Ending X position
 * @param {number} props.toY - Ending Y position
 * @param {boolean} props.isActive - Whether this edge is active (source step completed)
 * @param {boolean} props.isJustCompleted - Fire a one-shot traveling dot
 * @param {string} props.accent - oklch color string for the active edge
 */
export const WorkflowEdge = ({
  fromX,
  fromY,
  toX,
  toY,
  isActive = false,
  isJustCompleted = false,
  accent = 'oklch(0.7 0.18 250)',
}) => {
  const reactId = useId();
  const gradientId = `edge-grad-${reactId}`;
  const glowId = `edge-glow-${reactId}`;

  // Smooth horizontal bezier with a slight curve.
  const deltaX = toX - fromX;
  const controlOffset = Math.min(Math.abs(deltaX) * 0.4, 24);
  const pathD = `
    M ${fromX} ${fromY}
    C ${fromX + controlOffset} ${fromY},
      ${toX - controlOffset} ${toY},
      ${toX} ${toY}
  `;

  return (
    <svg
      className="absolute inset-0 w-full h-full pointer-events-none"
      style={{ overflow: 'visible' }}
    >
      <defs>
        <linearGradient id={gradientId} x1="0%" y1="0%" x2="100%" y2="0%">
          <stop offset="0%" stopColor={accent} stopOpacity="0.85" />
          <stop offset="100%" stopColor={accent} stopOpacity="0.4" />
        </linearGradient>

        <filter id={glowId} x="-50%" y="-50%" width="200%" height="200%">
          <feGaussianBlur stdDeviation="1.5" result="blur" />
          <feMerge>
            <feMergeNode in="blur" />
            <feMergeNode in="SourceGraphic" />
          </feMerge>
        </filter>
      </defs>

      {/* Base path — always visible, dashed, dim */}
      <path
        d={pathD}
        fill="none"
        stroke="oklch(0.22 0 0)"
        strokeWidth="1.5"
        strokeDasharray="4 4"
        strokeLinecap="round"
      />

      {/* Active overlay — draws in once the source step is complete */}
      {isActive && (
        <Motion.path
          d={pathD}
          fill="none"
          stroke={`url(#${gradientId})`}
          strokeWidth="2"
          strokeLinecap="round"
          filter={`url(#${glowId})`}
          initial={{ pathLength: 0, opacity: 0 }}
          animate={{ pathLength: 1, opacity: 1 }}
          transition={{ pathLength: { duration: 0.4, ease: 'easeOut' }, opacity: { duration: 0.2 } }}
        />
      )}

      {/* One-shot traveling dot when the step was just completed */}
      {isActive && isJustCompleted && (
        <Motion.circle
          r="2.5"
          fill={accent}
          filter={`url(#${glowId})`}
          initial={{ offsetDistance: '0%' }}
          animate={{ offsetDistance: '100%' }}
          transition={{ duration: 0.5, ease: 'easeInOut' }}
          style={{ offsetPath: pathD }}
        />
      )}
    </svg>
  );
};

export default WorkflowEdge;
