import * as React from 'react';
import { cn } from '../../lib/utils';

export interface SwitchProps extends Omit<React.InputHTMLAttributes<HTMLInputElement>, 'type'> {
  label?: React.ReactNode;
  description?: string;
  error?: boolean;
}

const Switch = React.forwardRef<HTMLInputElement, SwitchProps>(
  ({ className, label, description, error, id, checked, onChange, ...props }, ref) => {
    const switchId = id || React.useId();

    return (
      <div className="flex items-center gap-3">
        <div className="relative inline-flex items-center cursor-pointer">
          <input
            type="checkbox"
            id={switchId}
            ref={ref}
            checked={checked}
            onChange={onChange}
            role="switch"
            aria-checked={checked}
            className={cn(
              'peer h-6 w-11 shrink-0 cursor-pointer rounded-full border-2 border-transparent bg-input ring-offset-background transition-colors focus-visible:outline-none focus-visible:ring-2 focus-visible:ring-ring focus-visible:ring-offset-2 disabled:cursor-not-allowed disabled:opacity-50 appearance-none',
              error && 'border-destructive',
              className
            )}
            aria-invalid={error}
            {...props}
          />
          <span className="absolute left-0.5 top-0.5 h-5 w-5 rounded-full bg-background shadow-sm transition-transform peer-checked:translate-x-5 pointer-events-none rtl:mirror-horizontal" />
        </div>
        {(label || description) && (
          <div className="space-y-0.5">
            <label htmlFor={switchId} className="text-sm font-medium leading-none cursor-pointer">
              {label}
            </label>
            {description && <p className="text-sm text-muted-foreground">{description}</p>}
          </div>
        )}
      </div>
    );
  }
);
Switch.displayName = 'Switch';

export { Switch };
