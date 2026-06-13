import { useState, useCallback, useMemo, useRef } from 'react';

/**
 * Hook for managing graph-based workflow state.
 *
 * Navigation is fully free: any step can be visited at any time. Validation
 * is the caller's responsibility — typically run on the "Next" button. The
 * hook just tracks which step is current, which are completed, and which
 * have been visited.
 *
 * @param {Object} options
 * @param {string[]} options.steps - Array of step labels
 * @param {number} options.initialStep - Starting step index (default: 0)
 * @param {Function[]} options.validators - Optional array of validation fns, one per step.
 *   Each fn returns null/undefined when valid, or an object of field errors.
 */
export function useGraphWorkflow({
  steps,
  initialStep = 0,
  validators = [],
}) {
  const [currentStep, setCurrentStep] = useState(initialStep);
  const [completedSteps, setCompletedSteps] = useState(new Set());
  const [visitedSteps, setVisitedSteps] = useState(new Set([initialStep]));

  // Hold the last-completed step so the edge between it and the new current
  // step can fire its "just-completed" animation.
  const [lastCompletedAt, setLastCompletedAt] = useState(null);
  const justCompletedRef = useRef(null);

  const completeStep = useCallback((stepIndex) => {
    setCompletedSteps((prev) => {
      if (prev.has(stepIndex)) return prev;
      const next = new Set(prev);
      next.add(stepIndex);
      return next;
    });
    justCompletedRef.current = stepIndex;
    setLastCompletedAt(Date.now());
  }, []);

  // Free navigation — go to any step, no validation gate.
  const goToStep = useCallback(
    (stepIndex) => {
      if (stepIndex < 0 || stepIndex >= steps.length) return false;
      if (stepIndex === currentStep) return true;

      setVisitedSteps((prev) => {
        const next = new Set(prev);
        next.add(stepIndex);
        return next;
      });
      setCurrentStep(stepIndex);
      return true;
    },
    [currentStep, steps.length]
  );

  // Advance after validation. Marks current step complete first.
  const nextStep = useCallback(() => {
    if (currentStep >= steps.length - 1) return false;
    completeStep(currentStep);
    const next = currentStep + 1;
    setVisitedSteps((prev) => {
      const updated = new Set(prev);
      updated.add(next);
      return updated;
    });
    setCurrentStep(next);
    return true;
  }, [currentStep, steps.length, completeStep]);

  const prevStep = useCallback(() => {
    if (currentStep <= 0) return false;
    setCurrentStep(currentStep - 1);
    return true;
  }, [currentStep]);

  // Validate the current step using the caller-supplied validators array.
  // Returns null when valid, or an errors object.
  const validateCurrent = useCallback(() => {
    const fn = validators[currentStep];
    if (typeof fn !== 'function') return null;
    return fn() ?? null;
  }, [validators, currentStep]);

  // Try to advance; on failure, returns the validation errors so the caller
  // can show them. On success, returns null and advances.
  const tryAdvance = useCallback(() => {
    const errors = validateCurrent();
    if (errors) return errors;
    nextStep();
    return null;
  }, [validateCurrent, nextStep]);

  // Scroll the target node into horizontal center of the track. Wire trackRef
  // to the scrollable container; nodes register themselves via `registerNode`.
  const nodeRefs = useRef(new Map());
  const registerNode = useCallback((index, el) => {
    if (el) nodeRefs.current.set(index, el);
    else nodeRefs.current.delete(index);
  }, []);

  const scrollToStep = useCallback(
    (stepIndex) => {
      const el = nodeRefs.current.get(stepIndex);
      if (el && typeof el.scrollIntoView === 'function') {
        el.scrollIntoView({ behavior: 'smooth', block: 'nearest', inline: 'center' });
      }
    },
    []
  );

  const canNavigateTo = useCallback(
    (stepIndex) => stepIndex >= 0 && stepIndex < steps.length,
    [steps.length]
  );

  const getStepStatus = useCallback(
    (stepIndex) => {
      if (completedSteps.has(stepIndex)) return 'completed';
      if (stepIndex === currentStep) return 'current';
      if (visitedSteps.has(stepIndex)) return 'visited';
      return 'pending';
    },
    [completedSteps, currentStep, visitedSteps]
  );

  // Has this edge just been completed? Used to fire the traveling-dot animation
  // exactly once when the source step is completed. lastCompletedAt is in the
  // dep array to force a new identity after each completion, which triggers
  // re-evaluation in the consuming node/edge.
  const isEdgeJustCompleted = useCallback(
    (fromIndex) => {
      return (
        justCompletedRef.current === fromIndex &&
        completedSteps.has(fromIndex) &&
        fromIndex + 1 === currentStep
      );
    },
    // eslint-disable-next-line react-hooks/exhaustive-deps
    [completedSteps, currentStep, lastCompletedAt]
  );

  const canProceed = useMemo(
    () => currentStep < steps.length - 1,
    [currentStep, steps.length]
  );

  const isLastStep = useMemo(
    () => currentStep === steps.length - 1,
    [currentStep, steps.length]
  );

  return {
    currentStep,
    completedSteps,
    visitedSteps,
    completeStep,
    goToStep,
    nextStep,
    prevStep,
    tryAdvance,
    validateCurrent,
    canNavigateTo,
    getStepStatus,
    canProceed,
    isLastStep,
    isEdgeJustCompleted,
    totalSteps: steps.length,
    registerNode,
    scrollToStep,
  };
}

export default useGraphWorkflow;
