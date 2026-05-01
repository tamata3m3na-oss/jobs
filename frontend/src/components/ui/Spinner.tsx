import * as React from 'react';
import { cn } from '../../lib/utils';

export interface SpinnerProps extends React.HTMLAttributes<HTMLDivElement> {
  size?: 'sm' | 'md' | 'lg';
  label?: string;
  fullScreen?: boolean;
}

const sizeClasses = {
  sm: 'h-4 w-4 border-2',
  md: 'h-8 w-8 border-2',
  lg: 'h-12 w-12 border-3',
};

const fullScreenSizeClasses = {
  sm: 'h-6 w-6 border-2',
  md: 'h-10 w-10 border-2',
  lg: 'h-16 w-16 border-4',
};

const Spinner = React.forwardRef<HTMLDivElement, SpinnerProps>(
  ({ className, size = 'md', label, fullScreen = false, ...props }, ref) => {
    const spinnerId = React.useId();

    const containerClass = fullScreen
      ? 'fixed inset-0 z-50 flex items-center justify-center bg-background/80 backdrop-blur-sm'
      : 'inline-flex';

    const spinnerClass = fullScreen ? fullScreenSizeClasses[size] : sizeClasses[size];

    const content = (
      <div
        ref={ref}
        role="status"
        aria-labelledby={label ? `${spinnerId}-label` : undefined}
        aria-label={label || 'Loading'}
        className={cn(containerClass, className)}
        {...props}
      >
        <div
          className={cn(
            'rounded-full border-primary/30 border-t-primary animate-spin',
            spinnerClass
          )}
        >
          <span className="sr-only">{label || 'Loading'}</span>
        </div>
        {label && (
          <span
            id={`${spinnerId}-label`}
            className="ml-3 text-sm font-medium text-muted-foreground"
          >
            {label}
          </span>
        )}
      </div>
    );

    if (fullScreen) {
      return (
        <>
          {content}
          <span className="sr-only" aria-live="polite">
            Loading, please wait
          </span>
        </>
      );
    }

    return content;
  }
);
Spinner.displayName = 'Spinner';

export { Spinner };
