/**
 * WorkflowBackdrop - fixed, full-page dotted grid behind the form.
 *
 * Adds a subtle "blueprint / building surface" feel without distracting from
 * the form. Dots are 1px in the brand-tinted border color at low opacity.
 * Pointer events are disabled so it never intercepts clicks.
 */
export const WorkflowBackdrop = () => {
  // SVG dot pattern: 1.5px circles on a 28px grid, tinted toward the brand hue.
  // Using a <pattern> tile lets the browser repeat it across any size cheaply.
  return (
    <div
      aria-hidden
      className="pointer-events-none fixed inset-0 z-0"
      style={{
        backgroundImage:
          'radial-gradient(circle, oklch(0.7 0.18 250 / 0.08) 1.2px, transparent 1.2px)',
        backgroundSize: '28px 28px',
        backgroundPosition: '0 0',
        // Fade the backdrop out near the top so the track reads as floating
        maskImage:
          'linear-gradient(180deg, transparent 0%, black 18%, black 82%, transparent 100%)',
        WebkitMaskImage:
          'linear-gradient(180deg, transparent 0%, black 18%, black 82%, transparent 100%)',
      }}
    />
  );
};

export default WorkflowBackdrop;
