import * as React from 'react';
import { cn } from '../../lib/utils';

export interface RadioProps extends Omit<React.InputHTMLAttributes<HTMLInputElement>, 'type'> {
  label?: React.ReactNode;
  description?: string;
  error?: boolean;
}

const Radio = React.forwardRef<HTMLInputElement, RadioProps>(
  ({ className, label, description, error, id, checked, onChange, name, ...props }, ref) => {
    const radioId = id || React.useId();

    return (
      <div className="flex items-start gap-2">
        <div className="relative flex items-center justify-center">
          <input
            type="radio"
            id={radioId}
            ref={ref}
            checked={checked}
            onChange={onChange}
            name={name}
            className={cn(
              'peer h-4 w-4 shrink-0 rounded-full border border-primary ring-offset-background focus-visible:outline-none focus-visible:ring-2 focus-visible:ring-ring focus-visible:ring-offset-2 disabled:cursor-not-allowed disabled:opacity-50 appearance-none cursor-pointer',
              error && 'border-destructive',
              className
            )}
            aria-invalid={error || undefined}
            {...props}
          />
          <div className="absolute inset-0 flex items-center justify-center pointer-events-none">
            {checked && <div className="h-2 w-2 rounded-full bg-primary" />}
          </div>
        </div>
        {(label || description) && (
          <div className="space-y-0.5">
            <label htmlFor={radioId} className="text-sm font-medium leading-none cursor-pointer">
              {label}
            </label>
            {description && <p className="text-sm text-muted-foreground">{description}</p>}
          </div>
        )}
      </div>
    );
  }
);
Radio.displayName = 'Radio';

export interface RadioGroupProps {
  options: Array<{
    value: string;
    label: React.ReactNode;
    description?: string;
    disabled?: boolean;
  }>;
  value?: string;
  onChange?: (value: string) => void;
  orientation?: 'horizontal' | 'vertical';
  error?: string;
  className?: string;
  name?: string;
  'aria-label'?: string;
  children?: React.ReactNode;
}

const RadioGroup = React.forwardRef<HTMLDivElement, RadioGroupProps>(
  (
    { className, options, value, onChange, orientation = 'vertical', error, children, name },
    ref
  ) => {
    const isHorizontal = orientation === 'horizontal';

    return (
      <div
        ref={ref}
        className={cn('space-y-2', isHorizontal && 'flex flex-row flex-wrap gap-4', className)}
        role="radiogroup"
      >
        {options.map((option) => (
          <Radio
            key={option.value}
            id={option.value}
            value={option.value}
            checked={value === option.value}
            onChange={(e) => onChange?.(e.target.value)}
            label={option.label}
            description={option.description}
            disabled={option.disabled}
            error={!!error}
            name={name}
          />
        ))}
        {children}
      </div>
    );
  }
);
RadioGroup.displayName = 'RadioGroup';

export { Radio, RadioGroup };
