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
                  'w-10 h-10 rounded-full flex items-center justify-center',
                  isCurrent ? 'bg-primary-100' : isCompleted ? 'bg-primary-100' : 'bg-zinc-100'
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
                      isCurrent ? 'text-primary-200' : isCompleted ? 'text-primary-200' : 'text-zinc-200'
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
                      isCompleted ? 'text-primary-600' : isCurrent ? 'text-primary-500' : 'text-transparent'
                    )}
                  />
                </svg>
                <span className={clsx(
                  'relative z-10 text-sm font-semibold',
                  isCompleted && 'text-primary-600',
                  isCurrent && 'text-primary-500',
                  !isCompleted && !isCurrent && 'text-zinc-400'
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
                  'w-8 md:w-12 h-0.5 transition-all duration-500',
                  isCompleted ? 'bg-primary-600' : 'bg-zinc-200'
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
