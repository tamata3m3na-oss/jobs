import * as React from 'react';
import { cn } from '../../lib/utils';

export interface ProgressProps extends React.HTMLAttributes<HTMLDivElement> {
  value?: number;
  max?: number;
  size?: 'sm' | 'md' | 'lg';
  variant?: 'default' | 'success' | 'warning' | 'error';
  showValue?: boolean;
  animated?: boolean;
  label?: string;
}

const sizeClasses = {
  sm: 'h-1',
  md: 'h-2',
  lg: 'h-3',
};

const variantClasses = {
  default: 'bg-primary',
  success: 'bg-green-500 dark:bg-green-500',
  warning: 'bg-yellow-500 dark:bg-yellow-500',
  error: 'bg-red-500 dark:bg-red-500',
};

const Progress = React.forwardRef<HTMLDivElement, ProgressProps>(
  (
    {
      className,
      value = 0,
      max = 100,
      size = 'md',
      variant = 'default',
      showValue = false,
      animated = false,
      label,
      ...props
    },
    ref
  ) => {
    const percentage = Math.min(Math.max((value / max) * 100, 0), 100);
    const progressId = React.useId();

    return (
      <div className="w-full">
        {(label || showValue) && (
          <div className="flex justify-between items-center mb-1.5 text-sm">
            {label && (
              <label htmlFor={progressId} className="font-medium text-foreground">
                {label}
              </label>
            )}
            {showValue && (
              <span className="text-muted-foreground font-medium">{Math.round(percentage)}%</span>
            )}
          </div>
        )}
        <div
          ref={ref}
          id={label ? progressId : undefined}
          role="progressbar"
          aria-valuenow={value}
          aria-valuemin={0}
          aria-valuemax={max}
          aria-label={label || `Progress: ${Math.round(percentage)}%`}
          className={cn(
            'relative w-full overflow-hidden rounded-full bg-muted',
            sizeClasses[size],
            className
          )}
          {...props}
        >
          <div
            className={cn(
              'h-full transition-all duration-300 ease-out rounded-full',
              variantClasses[variant],
              animated && 'relative overflow-hidden',
              animated &&
                'after:absolute after:inset-0 after:bg-gradient-to-r after:from-transparent after:via-white/30 after:to-transparent after:animate-progress-shimmer'
            )}
            style={{ width: `${percentage}%` }}
          />
        </div>
      </div>
    );
  }
);
Progress.displayName = 'Progress';

export { Progress };
