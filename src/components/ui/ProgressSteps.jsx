import { clsx } from 'clsx';

export const ProgressSteps = ({
  steps,
  currentStep,
  className = ''
}) => {
  return (
    <div className={clsx('flex items-center gap-3', className)}>
      {steps.map((step, index) => {
        const isCompleted = index < currentStep;
        const isCurrent = index === currentStep;

        return (
          <div key={index} className="flex items-center">
            <div className="relative">
              {/* Background ring */}
              <div
                className={clsx(
                  'w-10 h-10 rounded-none flex items-center justify-center border',
                  isCurrent ? 'border-accent bg-surface' : isCompleted ? 'border-accent bg-surface' : 'border-border bg-surface'
                )}
              >
                {/* Progress ring SVG */}
                <svg className="absolute w-10 h-10 -rotate-90" viewBox="0 0 40 40">
                  <circle
                    cx="20" cy="20" r="18"
                    fill="none"
                    stroke="currentColor"
                    strokeWidth="2"
                    className={clsx(
                      'transition-all duration-500',
                      isCurrent ? 'text-border' : isCompleted ? 'text-border' : 'text-border'
                    )}
                  />
                  <circle
                    cx="20" cy="20" r="18"
                    fill="none"
                    stroke="currentColor"
                    strokeWidth="2"
                    strokeDasharray={isCompleted ? '113.1 0' : isCurrent ? '56.5 113.1' : '0 113.1'}
                    className={clsx(
                      'transition-all duration-500',
                      isCompleted ? 'text-accent' : isCurrent ? 'text-accent-muted' : 'text-transparent'
                    )}
                  />
                </svg>
                <span className={clsx(
                  'relative z-10 text-sm font-semibold',
                  isCompleted && 'text-accent',
                  isCurrent && 'text-text-primary',
                  !isCompleted && !isCurrent && 'text-text-muted'
                )}>
                  {isCompleted ? (
                    <svg className="w-5 h-5" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                      <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2.5} d="M5 13l4 4L19 7" />
                    </svg>
                  ) : index + 1}
                </span>
              </div>
            </div>

            {index < steps.length - 1 && (
              <div
                className={clsx(
                  'w-8 md:w-12 h-px transition-all duration-500',
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

export default ProgressSteps;