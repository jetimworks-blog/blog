import { clsx } from 'clsx';
import { motion } from 'framer-motion';

export const StepIndicator = ({
  steps,
  currentStep,
  className = ''
}) => {
  return (
    <div className={clsx('flex items-center gap-2 md:gap-4', className)}>
      {steps.map((step, index) => {
        const isCompleted = index < currentStep;
        const isCurrent = index === currentStep;

        return (
          <div key={index} className="flex items-center">
            <div className="relative flex items-center gap-2 md:gap-3">
              {/* Step circle */}
              <div
                className={clsx(
                  'w-8 h-8 md:w-10 md:h-10 rounded-full flex items-center justify-center border-2 transition-all duration-300',
                  isCurrent
                    ? 'border-accent bg-surface text-accent'
                    : isCompleted
                    ? 'border-accent bg-accent text-surface'
                    : 'border-border bg-surface text-text-muted'
                )}
              >
                {isCompleted ? (
                  <svg className="w-4 h-4 md:w-5 md:h-5" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                    <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2.5} d="M5 13l4 4L19 7" />
                  </svg>
                ) : (
                  <span className="text-sm md:text-base font-semibold">{index + 1}</span>
                )}
              </div>

              {/* Step label */}
              <span className={clsx(
                'text-xs md:text-sm font-medium hidden md:block',
                isCurrent && 'text-text-primary',
                isCompleted && 'text-accent',
                !isCurrent && !isCompleted && 'text-text-muted'
              )}>
                {step}
              </span>
            </div>

            {/* Connector line */}
            {index < steps.length - 1 && (
              <div
                className={clsx(
                  'w-8 md:w-12 h-0.5 mx-1 md:mx-2 transition-all duration-300',
                  isCompleted ? 'bg-accent' : 'bg-border'
                )}
              />
            )}
          </div>
        );
      })}
    </div>
  );
};

export default StepIndicator;
